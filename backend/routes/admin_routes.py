from flask import Blueprint, request, jsonify, make_response
from database import Database
from utils.auth import token_required, hash_password
from bson import ObjectId
import csv, io, datetime
from utils.mailer import BulkMailer

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@token_required(allowed_roles=['Admin'])
def get_users(user_id, role):
    db = Database.get_db()
    role_filter = request.args.get('role')
    query = {}
    if role_filter:
        query['role'] = role_filter
        
    users = list(db.users.find(query, {'password': 0}))
    for user in users:
        user['_id'] = str(user['_id'])
    return jsonify(users), 200

@admin_bp.route('/users', methods=['POST'])
@token_required(allowed_roles=['Admin'])
def create_user(user_id, role):
    data = request.json
    db = Database.get_db()
    
    if db.users.find_one({'email': data.get('email')}):
        return jsonify({'message': 'Email already exists'}), 400
        
    user = {
        'name': data.get('name'),
        'email': data.get('email'),
        'password': hash_password(data.get('password') or 'password123'),
        'role': data.get('role'),
        'department': data.get('department', ''),
        'roll_number': data.get('roll_number', '')
    }
    
    db.users.insert_one(user)
    return jsonify({'message': 'User created successfully'}), 201

@admin_bp.route('/users/<uid>', methods=['DELETE'])
@token_required(allowed_roles=['Admin'])
def delete_user(user_id, role, uid):
    db = Database.get_db()
    result = db.users.delete_one({'_id': ObjectId(uid)})
    if result.deleted_count:
        return jsonify({'message': 'User deleted'}), 200
    return jsonify({'message': 'User not found'}), 404

# Rooms CRUD
@admin_bp.route('/rooms', methods=['GET'])
@token_required(allowed_roles=['Admin', 'Staff'])
def get_rooms(user_id, role):
    db = Database.get_db()
    rooms = list(db.rooms.find())
    for r in rooms:
        r['_id'] = str(r['_id'])
    return jsonify(rooms), 200

@admin_bp.route('/rooms', methods=['POST'])
@token_required(allowed_roles=['Admin'])
def create_room(user_id, role):
    db = Database.get_db()
    data = request.json
    if db.rooms.find_one({'room_number': data.get('room_number')}):
        return jsonify({'message': 'Room already exists'}), 400
        
    room = {
        'room_number': data.get('room_number'),
        'capacity': int(data.get('capacity', 0)),
        'cols': int(data.get('cols', 0)),
        'rows': int(data.get('rows', 0)),
        'building': data.get('building', ''),
        'floor': data.get('floor', '')
    }
    db.rooms.insert_one(room)
    return jsonify({'message': 'Room created successfully'}), 201

# Exams CRUD
@admin_bp.route('/exams', methods=['GET'])
@token_required(allowed_roles=['Admin', 'Staff'])
def get_exams(user_id, role):
    db = Database.get_db()
    exams = list(db.exams.find())
    for e in exams:
        e['_id'] = str(e['_id'])
    return jsonify(exams), 200

@admin_bp.route('/exams', methods=['POST'])
@token_required(allowed_roles=['Admin'])
def create_exam(user_id, role):
    data = request.json
    db = Database.get_db()
    exam = {
        'name': data.get('name'),
        'date': data.get('date'),
        'start_time': data.get('start_time'),
        'end_time': data.get('end_time'),
        'subject': data.get('subject'),
        'department': data.get('department'),
        'status': 'Scheduled'
    }
    db.exams.insert_one(exam)
    return jsonify({'message': 'Exam created successfully'}), 201

# Analytics (enhanced)
@admin_bp.route('/analytics', methods=['GET'])
@token_required(allowed_roles=['Admin', 'Staff'])
def get_analytics(user_id, role):
    db = Database.get_db()

    # Counts
    total_students = db.users.count_documents({'role': 'Student'})
    total_staff = db.users.count_documents({'role': 'Staff'})
    total_rooms = db.rooms.count_documents({})
    total_exams = db.exams.count_documents({})
    published_exams = db.exams.count_documents({'status': 'Published'})

    # Students per department
    pipeline = [
        {'$match': {'role': 'Student'}},
        {'$group': {'_id': '$department', 'count': {'$sum': 1}}}
    ]
    dept_data = list(db.users.aggregate(pipeline))
    dept_breakdown = [{'department': d['_id'] or 'Unknown', 'count': d['count']} for d in dept_data]

    # Exams per status
    status_pipeline = [
        {'$group': {'_id': '$status', 'count': {'$sum': 1}}}
    ]
    exam_status_data = list(db.exams.aggregate(status_pipeline))
    exam_by_status = [{'status': s['_id'] or 'Unknown', 'count': s['count']} for s in exam_status_data]

    # Attendance summary across all arrangements
    arrangements = list(db.seating_arrangements.find())
    total_seats = sum(len(a.get('seat_plan', [])) for a in arrangements)
    present = sum(1 for a in arrangements for s in a.get('seat_plan', []) if s.get('attendance') == 'Present')
    absent  = sum(1 for a in arrangements for s in a.get('seat_plan', []) if s.get('attendance') == 'Absent')
    pending = total_seats - present - absent

    return jsonify({
        'total_students': total_students,
        'total_staff': total_staff,
        'total_rooms': total_rooms,
        'total_exams': total_exams,
        'published_exams': published_exams,
        'dept_breakdown': dept_breakdown,
        'exam_by_status': exam_by_status,
        'attendance': {'present': present, 'absent': absent, 'pending': pending, 'total': total_seats}
    }), 200

from utils.seat_allocation import allocate_seats

# Exam Status Control
@admin_bp.route('/exams/<exam_id>/status', methods=['PATCH'])
@token_required(allowed_roles=['Admin'])
def update_exam_status(user_id, role, exam_id):
    db = Database.get_db()
    data = request.json
    new_status = data.get('status')
    allowed_statuses = ['Scheduled', 'Ongoing', 'Completed', 'Cancelled']
    if new_status not in allowed_statuses:
        return jsonify({'message': f'Status must be one of: {allowed_statuses}'}), 400
    db.exams.update_one(
        {'_id': ObjectId(exam_id)},
        {'$set': {'status': new_status, 'updated_at': datetime.datetime.now(datetime.timezone.utc)}}
    )
    return jsonify({'message': f'Exam status updated to {new_status}'}), 200


# Attendance Report Export (CSV)
@admin_bp.route('/attendance/export/<exam_id>', methods=['GET'])
@token_required(allowed_roles=['Admin', 'Staff'])
def export_attendance(user_id, role, exam_id):
    db = Database.get_db()
    exam = db.exams.find_one({'_id': ObjectId(exam_id)})
    if not exam:
        return jsonify({'message': 'Exam not found'}), 404

    arrangements = list(db.seating_arrangements.find({'exam_id': exam_id}))
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Seat', 'Student Name', 'Roll Number', 'Department', 'Room', 'Attendance'])

    for arr in arrangements:
        for seat in arr.get('seat_plan', []):
            writer.writerow([
                seat.get('seat_number', ''),
                seat.get('student_name', ''),
                seat.get('roll_number', ''),
                seat.get('department', ''),
                arr.get('room_number', ''),
                seat.get('attendance', 'Pending')
            ])

    output.seek(0)
    subject = exam.get('subject', 'exam').replace(' ', '_')
    response = make_response(output.getvalue())
    response.headers['Content-Disposition'] = f'attachment; filename=attendance_{subject}.csv'
    response.headers['Content-Type'] = 'text/csv'
    return response


@admin_bp.route('/seating/allocate/<exam_id>', methods=['POST'])
@token_required(allowed_roles=['Admin'])
def allocate_exam_seating(user_id, role, exam_id):
    result = allocate_seats([exam_id], created_by=user_id, creator_role=role)
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400

@admin_bp.route('/seating/allocate-bulk', methods=['POST'])
@token_required(allowed_roles=['Admin'])
def allocate_bulk_seating(user_id, role):
    data = request.json
    exam_ids = data.get('exam_ids', [])
    if not exam_ids:
        return jsonify({'success': False, 'message': 'No exams selected'}), 400
        
    result = allocate_seats(exam_ids, created_by=user_id, creator_role=role)
    if result['success']:
        return jsonify(result), 200
    return jsonify(result), 400

@admin_bp.route('/seating/<exam_id>', methods=['GET'])
@token_required(allowed_roles=['Admin', 'Staff'])
def get_seating(user_id, role, exam_id):
    db = Database.get_db()
    arrangements = list(db.seating_arrangements.find({'exam_id': exam_id}))
    for arr in arrangements:
        arr['_id'] = str(arr['_id'])
    return jsonify(arrangements), 200

import datetime

@admin_bp.route('/notifications', methods=['GET'])
@token_required(allowed_roles=['Admin'])
def get_notifications(user_id, role):
    db = Database.get_db()
    nots = list(db.notifications.find().sort('created_at', -1))
    for n in nots:
        n['_id'] = str(n['_id'])
    return jsonify(nots), 200

@admin_bp.route('/notifications', methods=['POST'])
@token_required(allowed_roles=['Admin'])
def create_notification(user_id, role):
    data = request.json
    db = Database.get_db()
    db.notifications.insert_one({
        'message': data.get('message'),
        'targetRole': data.get('targetRole', 'All'),
        'created_at': datetime.datetime.now(datetime.timezone.utc)
    })
    return jsonify({'message': 'Sent'}), 201

@admin_bp.route('/notifications/<nid>', methods=['DELETE'])
@token_required(allowed_roles=['Admin'])
def delete_notification(user_id, role, nid):
    db = Database.get_db()
    db.notifications.delete_one({'_id': ObjectId(nid)})
    return jsonify({'message': 'Deleted'}), 200

# System Settings
@admin_bp.route('/settings', methods=['GET'])
@token_required(allowed_roles=['Admin'])
def get_settings(user_id, role):
    db = Database.get_db()
    settings = db.settings.find_one({'type': 'global'})
    if not settings:
        settings = {
            'type': 'global',
            'requireAlphanumeric': True,
            'minLength': 8,
            'mfaEnabled': False,
            'defaultExamDuration': 180,
            'timezone': 'UTC',
            'primaryColor': '#0f172a',
            'secondaryColor': '#2563eb',
            'institutionName': 'Smart University',
            'logoUrl': ''
        }
        db.settings.insert_one(settings)
    settings['_id'] = str(settings['_id'])
    return jsonify(settings), 200

@admin_bp.route('/settings', methods=['POST'])
@token_required(allowed_roles=['Admin'])
def update_settings(user_id, role):
    data = request.json
    db = Database.get_db()
    
    update_data = {
        'requireAlphanumeric': data.get('requireAlphanumeric', True),
        'minLength': data.get('minLength', 8),
        'mfaEnabled': data.get('mfaEnabled', False),
        'defaultExamDuration': data.get('defaultExamDuration', 180),
        'timezone': data.get('timezone', 'UTC'),
        'primaryColor': data.get('primaryColor', '#0f172a'),
        'secondaryColor': data.get('secondaryColor', '#2563eb'),
        'institutionName': data.get('institutionName', 'Smart University'),
        'logoUrl': data.get('logoUrl', ''),
        'allowedIpRange': data.get('allowedIpRange', '')
    }
    
    db.settings.update_one(
        {'type': 'global'},
        {'$set': update_data},
        upsert=True
    )
    return jsonify({'message': 'Settings saved successfully'}), 200

@admin_bp.route('/settings/branding', methods=['GET'])
def get_branding():
    db = Database.get_db()
    settings = db.settings.find_one({'type': 'global'}, {
        'primaryColor': 1, 'secondaryColor': 1, 'institutionName': 1, 'logoUrl': 1
    })
    if not settings:
        return jsonify({
            'primaryColor': '#0f172a',
            'secondaryColor': '#2563eb',
            'institutionName': 'Smart University',
            'logoUrl': ''
        }), 200
    settings['_id'] = str(settings['_id'])
    return jsonify(settings), 200


@admin_bp.route('/audit-logs', methods=['GET'])
@token_required(allowed_roles=['Admin'])
def get_audit_logs(user_id, role):
    db = Database.get_db()
    logs = list(db.audit_logs.find().sort('timestamp', -1).limit(500))
    for log in logs:
        log['_id'] = str(log['_id'])
    return jsonify(logs), 200


# ── CSV Export ─────────────────────────────────────────────────────────────
@admin_bp.route('/users/export', methods=['GET'])
@token_required(allowed_roles=['Admin'])
def export_users(user_id, role):
    db = Database.get_db()
    role_filter = request.args.get('role', 'Student')
    users = list(db.users.find({'role': role_filter}, {'password': 0}))

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['name', 'email', 'roll_number', 'department', 'role'])
    for u in users:
        writer.writerow([
            u.get('name', ''),
            u.get('email', ''),
            u.get('roll_number', ''),
            u.get('department', ''),
            u.get('role', '')
        ])

    output.seek(0)
    response = make_response(output.getvalue())
    response.headers['Content-Disposition'] = f'attachment; filename={role_filter.lower()}s_export.csv'
    response.headers['Content-Type'] = 'text/csv'
    return response


# ── CSV Import ─────────────────────────────────────────────────────────────
@admin_bp.route('/users/import', methods=['POST'])
@token_required(allowed_roles=['Admin'])
def import_users(user_id, role):
    if 'file' not in request.files:
        return jsonify({'message': 'No file uploaded'}), 400

    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({'message': 'Only CSV files are accepted'}), 400

    stream = io.StringIO(file.stream.read().decode('utf-8'))
    reader = csv.DictReader(stream)

    db = Database.get_db()
    inserted, skipped = 0, 0
    errors = []

    for i, row in enumerate(reader, start=2):
        email = row.get('email', '').strip()
        name = row.get('name', '').strip()
        if not email or not name:
            errors.append(f'Row {i}: missing name or email')
            skipped += 1
            continue
        if db.users.find_one({'email': email}):
            errors.append(f'Row {i}: {email} already exists')
            skipped += 1
            continue

        db.users.insert_one({
            'name': name,
            'email': email,
            'password': hash_password(row.get('password', 'password123').strip()),
            'role': row.get('role', 'Student').strip(),
            'department': row.get('department', '').strip(),
            'roll_number': row.get('roll_number', '').strip()
        })
        inserted += 1

    return jsonify({
        'message': f'Import complete: {inserted} added, {skipped} skipped.',
        'inserted': inserted,
        'skipped': skipped,
        'errors': errors
    }), 200

@admin_bp.route('/exams/<exam_id>/absentees', methods=['GET'])
@token_required(allowed_roles=['Admin', 'Staff'])
def get_absentees(user_id, role, exam_id):
    db = Database.get_db()
    # Find all seating arrangements for this exam where attendance is 'Absent'
    arrangements = list(db.seating_arrangements.find({'exam_id': exam_id}))
    absentees = []
    
    for arr in arrangements:
        for seat in arr.get('seat_plan', []):
            if seat.get('attendance') == 'Absent':
                absentees.append({
                    'student_name': seat.get('student_name'),
                    'roll_number': seat.get('roll_number'),
                    'department': seat.get('department', 'N/A'),
                    'room_number': arr.get('room_number'),
                    'seat_number': seat.get('seat_number')
                })
                
    return jsonify(absentees)

@admin_bp.route('/seating/swap', methods=['POST'])
@token_required(allowed_roles=['Admin'])
def swap_seats(user_id, role):
    data = request.json
    exam_id = data.get('exam_id')
    room_id = data.get('room_id')
    seat1_num = data.get('seat1')
    seat2_num = data.get('seat2')
    
    db = Database.get_db()
    arrangement = db.seating_arrangements.find_one({'exam_id': exam_id, 'room_id': room_id})
    if not arrangement:
        return jsonify({'message': 'Arrangement not found'}), 404
        
    plan = arrangement.get('seat_plan', [])
    idx1 = next((i for i, s in enumerate(plan) if s['seat_number'] == seat1_num), -1)
    idx2 = next((i for i, s in enumerate(plan) if s['seat_number'] == seat2_num), -1)
    
    if idx1 == -1 or idx2 == -1:
        return jsonify({'message': 'Seats not found'}), 400
        
    # Swap student data but keep seat numbers and coordinates
    s1 = plan[idx1]
    s2 = plan[idx2]
    
    # Swap identities (including attendance status)
    plan[idx1]['student_id'], plan[idx2]['student_id'] = s2.get('student_id'), s1.get('student_id')
    plan[idx1]['student_name'], plan[idx2]['student_name'] = s2.get('student_name'), s1.get('student_name')
    plan[idx1]['roll_number'], plan[idx2]['roll_number'] = s2.get('roll_number'), s1.get('roll_number')
    plan[idx1]['department'], plan[idx2]['department'] = s2.get('department'), s1.get('department')
    plan[idx1]['attendance'], plan[idx2]['attendance'] = s2.get('attendance'), s1.get('attendance')

    db.seating_arrangements.update_one(
        {'_id': arrangement['_id']},
        {'$set': {'seat_plan': plan}}
    )
    
    return jsonify({'message': 'Seats swapped successfully'})


@admin_bp.route('/exams/<exam_id>/notify', methods=['POST'])
@token_required(allowed_roles=['Admin'])
def notify_students(user_id, role, exam_id):
    db = Database.get_db()
    exam = db.exams.find_one({'_id': ObjectId(exam_id)})
    if not exam:
        return jsonify({'message': 'Exam not found'}), 404

    # Collect all student IDs and their seating data for this exam
    arrangements = list(db.seating_arrangements.find({'exam_id': exam_id}))
    if not arrangements:
        return jsonify({'message': 'No seating arrangements found for this exam'}), 400

    student_data = []
    # Identify unique student IDs to fetch emails in bulk
    student_ids = []
    for arr in arrangements:
        for seat in arr.get('seat_plan', []):
            if seat.get('student_id'):
                student_ids.append(ObjectId(seat['student_id']))

    # Fetch user emails in one query
    users = {str(u['_id']): u for u in db.users.find({'_id': {'$in': student_ids}})}

    for arr in arrangements:
        for seat in arr.get('seat_plan', []):
            sid = seat.get('student_id')
            user = users.get(str(sid))
            if user and user.get('email'):
                student_data.append({
                    'email': user['email'],
                    'name': user.get('name', 'Student'),
                    'seat_number': seat.get('seat_number'),
                    'room_number': arr.get('room_number')
                })

    if not student_data:
        return jsonify({'message': 'No students with valid emails found for this exam'}), 400

    # Trigger background mailing
    BulkMailer.send_hall_tickets(exam.get('name'), student_data)

    return jsonify({
        'message': f'Notification process started for {len(student_data)} students.',
        'count': len(student_data)
    }), 200


