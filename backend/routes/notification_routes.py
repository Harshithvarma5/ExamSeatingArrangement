from flask import Blueprint, request, jsonify
from database import Database
from utils.auth import token_required
import datetime
from bson import ObjectId

notification_bp = Blueprint('notifications', __name__)

@notification_bp.route('/broadcast', methods=['POST'])
@token_required(allowed_roles=['Admin'])
def send_broadcast(user_id, role):
    db = Database.get_db()
    data = request.json
    
    msg = {
        'title': data.get('title'),
        'message': data.get('message'),
        'target_dept': data.get('target_dept', 'All Departments'),
        'created_by': ObjectId(user_id),
        'created_at': datetime.datetime.now(datetime.timezone.utc),
        'priority': data.get('priority', 'Normal')
    }
    
    db.notifications.insert_one(msg)
    return jsonify({'message': 'Broadcast message sent successfully'}), 201

@notification_bp.route('/my-notifications', methods=['GET'])
@token_required(allowed_roles=['Student', 'Staff', 'Admin'])
def get_my_notifications(user_id, role):
    db = Database.get_db()
    user = db.users.find_one({'_id': ObjectId(user_id)})
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    dept = user.get('department', 'All Departments')
    
    # Fetch notifications targeted to their dept or All Departments
    query = {'target_dept': {'$in': [dept, 'All Departments']}}
    notifications = list(db.notifications.find(query).sort('created_at', -1))
    
    for n in notifications:
        n['_id'] = str(n['_id'])
        n['created_by'] = str(n['created_by'])
        
    return jsonify(notifications)
