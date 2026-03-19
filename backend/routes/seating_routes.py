from flask import Blueprint, request, jsonify
from database import Database
from utils.auth import token_required
from bson import ObjectId
import datetime

seating_bp = Blueprint('seating', __name__)


def _serialize(doc):
    if doc is None:
        return None
    doc['_id'] = str(doc['_id'])
    for key in ('published_at', 'created_at', 'updated_at'):
        if doc.get(key) and hasattr(doc[key], 'isoformat'):
            doc[key] = doc[key].isoformat()
    return doc


# PATCH /api/seating-plans/<exam_id>/publish
@seating_bp.route('/seating-plans/<exam_id>/publish', methods=['PATCH'])
@token_required(allowed_roles=['Admin', 'Staff'])
def publish_plan(user_id, role, exam_id):
    db = Database.get_db()
    now = datetime.datetime.now(datetime.timezone.utc)

    result = db.seating_arrangements.update_many(
        {'exam_id': exam_id},
        {'$set': {'is_published': True, 'published_at': now, 'updated_at': now}}
    )

    if result.matched_count == 0:
        return jsonify({'message': 'No seating arrangement found for this exam'}), 404

    return jsonify({'message': 'Seating plan published. Students can now view it.'}), 200


# PATCH /api/seating-plans/<exam_id>/unpublish
@seating_bp.route('/seating-plans/<exam_id>/unpublish', methods=['PATCH'])
@token_required(allowed_roles=['Admin'])
def unpublish_plan(user_id, role, exam_id):
    db = Database.get_db()
    now = datetime.datetime.now(datetime.timezone.utc)

    result = db.seating_arrangements.update_many(
        {'exam_id': exam_id},
        {'$set': {'is_published': False, 'published_at': None, 'updated_at': now}}
    )

    if result.matched_count == 0:
        return jsonify({'message': 'No seating arrangement found for this exam'}), 404

    return jsonify({'message': 'Seating plan unpublished. Students can no longer view it.'}), 200


# GET /api/seating-plans/<exam_id>/preview  (Admin/Staff see drafts too)
@seating_bp.route('/seating-plans/<exam_id>/preview', methods=['GET'])
@token_required(allowed_roles=['Admin', 'Staff'])
def preview_plan(user_id, role, exam_id):
    db = Database.get_db()
    arrangements = list(db.seating_arrangements.find({'exam_id': exam_id}))

    if not arrangements:
        return jsonify({'status': 'not_created', 'message': 'No seating plan created for this exam yet.', 'arrangements': []}), 200

    serialized = [_serialize(a) for a in arrangements]
    is_published = any(a.get('is_published') for a in serialized)

    return jsonify({
        'status': 'published' if is_published else 'draft',
        'arrangements': serialized
    }), 200


# GET /api/seating-plans/<exam_id>/student  (Students: only if published)
@seating_bp.route('/seating-plans/<exam_id>/student', methods=['GET'])
@token_required(allowed_roles=['Student'])
def student_view_plan(user_id, role, exam_id):
    db = Database.get_db()
    # Efficiently find the specific arrangement and seat using $elemMatch
    arr = db.seating_arrangements.find_one({
        'exam_id': exam_id,
        'is_published': True,
        'seat_plan.student_id': user_id
    })

    if not arr:
        # Check if it was because it's not published or not assigned
        any_arr = db.seating_arrangements.find_one({'exam_id': exam_id})
        if not any_arr:
            return jsonify({'status': 'not_created', 'message': 'Seating plan has not been created yet.'}), 200
        
        is_published = db.seating_arrangements.find_one({'exam_id': exam_id, 'is_published': True})
        if not is_published:
            return jsonify({'status': 'not_published', 'message': 'Seating plan has not been published yet.'}), 200
            
        return jsonify({'status': 'not_assigned', 'message': 'You have not been assigned a seat for this exam.'}), 200

    # Extract the specific seat from the found arrangement
    student_seat = next((s for s in arr.get('seat_plan', []) if s.get('student_id') == user_id), None)
    
    pub_at = arr.get('published_at')
    room_info = {
        'room_number': arr.get('room_number'),
        'room_id': str(arr.get('room_id')),
        'exam_id': arr.get('exam_id'),
        'published_at': pub_at.isoformat() if pub_at and hasattr(pub_at, 'isoformat') else str(pub_at or '')
    }

    return jsonify({'status': 'published', 'seat': student_seat, 'room': room_info}), 200


# GET /api/seating-plans/status  (Admin/Staff: overview of all exams)
@seating_bp.route('/seating-plans/status', methods=['GET'])
@token_required(allowed_roles=['Admin', 'Staff'])
def get_all_statuses(user_id, role):
    db = Database.get_db()
    exams = list(db.exams.find())
    result = []
    for exam in exams:
        exam_id = str(exam['_id'])
        arrangements = list(db.seating_arrangements.find({'exam_id': exam_id}, {'seat_plan': 0}))
        published_count = sum(1 for a in arrangements if a.get('is_published'))
        total = len(arrangements)
        status = (
            'published' if total > 0 and published_count == total else
            'partial'   if published_count > 0 else
            'draft'     if total > 0 else
            'not_created'
        )
        result.append({
            'exam_id': exam_id,
            'exam_name': exam.get('name'),
            'subject': exam.get('subject'),
            'date': exam.get('date'),
            'total_rooms': total,
            'published_rooms': published_count,
            'status': status
        })
    return jsonify(result), 200
