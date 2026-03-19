from flask import Blueprint, jsonify, request
from utils.auth import token_required
from database import Database
from bson import ObjectId

staff_bp = Blueprint('staff', __name__)

@staff_bp.route('/assigned-halls', methods=['GET'])
@token_required(allowed_roles=['Staff'])
def get_assigned_halls(user_id, role):
    db = Database.get_db()
    arrangements = list(db.seating_arrangements.find())
    
    result = []
    # Enhance with exam data
    for arr in arrangements:
        arr['_id'] = str(arr['_id'])
        exam = db.exams.find_one({'_id': ObjectId(arr['exam_id'])})
        if exam:
            arr['exam_name'] = exam.get('name')
            arr['subject'] = exam.get('subject')
            arr['date'] = exam.get('date')
            arr['start_time'] = exam.get('start_time')
        result.append(arr)
        
    return jsonify(result), 200

@staff_bp.route('/attendance/<exam_id>/<room_id>', methods=['POST'])
@token_required(allowed_roles=['Staff'])
def mark_attendance(user_id, role, exam_id, room_id):
    db = Database.get_db()
    data = request.json
    student_id = data.get('student_id')
    status = data.get('status')
    booklet_number = data.get('booklet_number')
    
    arrangement = db.seating_arrangements.find_one({'exam_id': exam_id, 'room_id': room_id})
    if arrangement:
        updated_plan = []
        for seat in arrangement['seat_plan']:
            if seat['student_id'] == student_id:
                seat['attendance'] = status
                if booklet_number is not None:
                    seat['booklet_number'] = booklet_number
            updated_plan.append(seat)
            
        db.seating_arrangements.update_one(
            {'_id': arrangement['_id']},
            {'$set': {'seat_plan': updated_plan}}
        )
        return jsonify({'message': 'Attendance updated successfully'}), 200
        
    return jsonify({'message': 'Arrangement not found'}), 404

