import math
from database import Database
from bson import ObjectId
import datetime

def allocate_seats(exam_ids, created_by=None, creator_role=None):
    if isinstance(exam_ids, str):
        exam_ids = [exam_ids]
        
    db = Database.get_db()
    
    all_exam_students = []
    exams_data = []
    
    for eid in exam_ids:
        exam = db.exams.find_one({'_id': ObjectId(eid)})
        if not exam:
            continue
        exams_data.append(exam)
        target_dept = exam.get('department')
        query = {'role': 'Student'}
        if target_dept:
            query['department'] = target_dept
        
        # AI v3 Upgrade: Fetch students with CGPA and Neighbor History
        # We sort by accessibility, then CGPA (to interleave performance), then roll_number
        students = list(db.users.find(query).sort([
            ('needs_accessibility', -1), 
            ('cgpa', -1), 
            ('roll_number', 1)
        ]))
        all_exam_students.append(students)
    
    if not any(all_exam_students):
        return {'success': False, 'message': 'No students found for the selected exams.'}
        
    # AI Interleaving for Clash Management & Neighbor Avoidance:
    mixed_students = []
    max_stu = max(len(s) for s in all_exam_students) if all_exam_students else 0
    
    # We use a greedy approach to ensure neighbors are different
    for i in range(max_stu):
        for student_list in all_exam_students:
            if i < len(student_list):
                student = student_list[i]
                
                # Check if this student was a neighbor of the last added student in the past
                if mixed_students:
                    last_student = mixed_students[-1]
                    past_neighbors = student.get('past_neighbors', [])
                    if str(last_student['_id']) in past_neighbors:
                        # If a clash is found, we try to swap with the next available in the list
                        # Search for a non-clashing student in the same list if possible
                        found_swap = False
                        for j in range(i + 1, len(student_list)):
                            potential_swap = student_list[j]
                            if str(last_student['_id']) not in potential_swap.get('past_neighbors', []):
                                student_list[i], student_list[j] = student_list[j], student_list[i]
                                student = student_list[i]
                                found_swap = True
                                break
                
                mixed_students.append(student)
                
    rooms = list(db.rooms.find())
    if not rooms:
        return {'success': False, 'message': 'No rooms available'}
        
    student_index = 0
    allocations = []
    now = datetime.datetime.now(datetime.timezone.utc)
    
    for room in rooms:
        if student_index >= len(mixed_students):
            break
            
        rows = room.get('rows', 5)
        cols = room.get('cols', 5)
        room_capacity = room.get('capacity', rows * cols)
        
        seat_plan = []
        seats_filled = 0
        
        for r in range(rows):
            for c in range(cols):
                if student_index >= len(mixed_students) or seats_filled >= room_capacity:
                    break
                    
                student = mixed_students[student_index]
                
                # Find which exam this student belongs to (needed for the arrangement record)
                # In multi-exam rooms, we'll tag the seat with the specific exam_id
                student_exam_id = None
                for idx, slist in enumerate(all_exam_students):
                    if any(str(s['_id']) == str(student['_id']) for s in slist):
                        student_exam_id = exam_ids[idx]
                        break

                seat = {
                    'row': r + 1,
                    'col': c + 1,
                    'seat_number': f"R{r+1}C{c+1}",
                    'student_id': str(student['_id']),
                    'student_name': student['name'],
                    'roll_number': student.get('roll_number', ''),
                    'department': student.get('department', ''),
                    'exam_id': student_exam_id, # Link seat to its specific exam
                    'attendance': 'Pending',
                    'needs_accessibility': student.get('needs_accessibility', False)
                }
                seat_plan.append(seat)
                student_index += 1
                seats_filled += 1
                
        if seat_plan:
            # For multi-exam rooms, we use a special 'clash' record or replicate for each exam
            # For now, we'll store it under the first exam_id but record all exams involved
            arrangement = {
                'exam_id': str(exam_ids[0]),
                'involved_exams': [str(e) for e in exam_ids],
                'room_id': str(room['_id']),
                'room_number': room['room_number'],
                'seat_plan': seat_plan,
                'is_published': False,
                'published_at': None,
                'created_by': created_by,
                'creator_role': creator_role,
                'created_at': now,
                'updated_at': now,
            }
            db.seating_arrangements.update_one(
                {'exam_id': str(exam_ids[0]), 'room_id': str(room['_id'])},
                {'$set': arrangement},
                upsert=True
            )
            allocations.append(arrangement)
            
    # Check for unallocated students across ALL exams
    all_stu_ids = []
    for slist in all_exam_students:
        for s in slist:
            all_stu_ids.append(str(s['_id']))
            
    allocated_ids = []
    for a in allocations:
        for s in a['seat_plan']:
            allocated_ids.append(s['student_id'])
            
    unallocated_count = len([sid for sid in all_stu_ids if sid not in allocated_ids])
    
    if unallocated_count > 0:
        return {'success': False, 'message': f'Insufficient room capacity. {unallocated_count} students could not be seated.'}
        
    # AI v3: Update neighbor history so the system "remembers" for next time
    try:
        update_neighbor_history(db, allocations)
    except Exception as e:
        print(f"Failed to update neighbor history: {e}")
        
    return {'success': True, 'message': f'Intelligent AI seating (v3) allocated successfully for {len(exam_ids)} subjects.'}

def update_neighbor_history(db, allocations):
    """Updates the past_neighbors list for each student based on the new seating."""
    for room in allocations:
        seat_plan = room.get('seat_plan', [])
        # Group by row to find horizontal neighbors
        rows = {}
        for seat in seat_plan:
            r = seat['row']
            if r not in rows: rows[r] = []
            rows[r].append(seat)
            
        for r in rows:
            # Sort by column to find true neighbors
            row_seats = sorted(rows[r], key=lambda x: x['col'])
            for i in range(len(row_seats)):
                current_stu_id = row_seats[i]['student_id']
                neighbors = []
                if i > 0: neighbors.append(row_seats[i-1]['student_id']) # Left
                if i < len(row_seats) - 1: neighbors.append(row_seats[i+1]['student_id']) # Right
                
                if neighbors:
                    db.users.update_one(
                        {'_id': ObjectId(current_stu_id)},
                        {'$addToSet': {'past_neighbors': {'$each': neighbors}}}
                    )
