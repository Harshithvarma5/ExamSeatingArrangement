from flask import Blueprint, jsonify
from utils.auth import token_required
from database import Database
from bson import ObjectId

student_bp = Blueprint('student', __name__)

@student_bp.route('/my-exams', methods=['GET'])
@token_required(allowed_roles=['Student'])
def get_my_exams(user_id, role):
    db = Database.get_db()
    my_exams = []
    
    # Efficiently find ONLY arrangements where this student exists
    arrangements = list(db.seating_arrangements.find({"seat_plan.student_id": user_id}))
    
    for arr in arrangements:
        # Find the specific seat for this student in the seat_plan array
        seat = next((s for s in arr.get('seat_plan', []) if s.get('student_id') == user_id), None)
        
        if seat:
            exam = db.exams.find_one({'_id': ObjectId(arr['exam_id'])})
            if exam:
                exam['_id'] = str(exam['_id'])
                my_exams.append({
                    'exam': exam,
                    'room_number': arr.get('room_number'),
                    'room_id': str(arr.get('room_id')),
                    'seat_number': seat.get('seat_number'),
                    'row': seat.get('row'),
                    'col': seat.get('col')
                })
                
    return jsonify(my_exams), 200

