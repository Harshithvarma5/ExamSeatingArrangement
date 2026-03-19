from flask import Blueprint, request, jsonify
from utils.auth import token_required
from database import Database
from bson import ObjectId
import datetime

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/query', methods=['POST'])
@token_required(allowed_roles=['Admin'])
def handle_ai_query(user_id, role):
    data = request.json
    prompt = data.get('query', '').lower()
    
    if not prompt:
        return jsonify({'message': 'Please provide a query.'}), 400
        
    db = Database.get_db()
    
    # 📝 System Prompt Context (for future LLM integration)
    # This describes the collections: 
    # - users (name, role, department, cgpa)
    # - exams (exam_name, subject, date, status)
    # - seating_arrangements (exam_id, room_id, seat_plan[student_id, attendance])
    
    # 🤖 Smart Fallback Logic (Simulating LLM Intelligence for project demo)
    
    # Example 1: Absent students
    if 'absent' in prompt or 'missed' in prompt:
        absentees = []
        arrangements = list(db.seating_arrangements.find())
        for arr in arrangements:
            exam = db.exams.find_one({'_id': ObjectId(arr['exam_id'])})
            exam_name = exam['exam_name'] if exam else 'Unknown Exam'
            
            for seat in arr.get('seat_plan', []):
                if seat.get('attendance') == 'Absent':
                    absentees.append({
                        'name': seat['student_name'],
                        'roll_number': seat['roll_number'],
                        'exam': exam_name,
                        'room': arr['room_number']
                    })
        
        return jsonify({
            'answer': f"I found {len(absentees)} students who were absent in recent exams.",
            'data': absentees,
            'type': 'table'
        })

    # Example 2: Room capacity
    if 'room' in prompt and ('capacity' in prompt or 'total' in prompt):
        rooms = list(db.rooms.find())
        total_capacity = sum(r.get('capacity', 0) for r in rooms)
        return jsonify({
            'answer': f"The total seating capacity across all {len(rooms)} rooms is {total_capacity} seats.",
            'data': [{'room': r['room_number'], 'capacity': r.get('capacity', 0)} for r in rooms],
            'type': 'list'
        })

    # Generic Fallback (Placeholder for Real LLM API)
    return jsonify({
        'answer': "I understand your query, but for specific complex reports, please ensure the LLM API (Gemini/OpenAI) is configured in System Settings. For now, I can answer about 'absentees' or 'room capacity'.",
        'type': 'text'
    })
