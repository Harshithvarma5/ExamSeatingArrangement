from flask import Blueprint, request, jsonify, make_response
from database import Database
from utils.auth import token_required, hash_password, check_password
from bson import ObjectId
import csv, io, datetime, re

profile_bp = Blueprint('profile', __name__)


# ── GET current user profile ────────────────────────────────────────────────
@profile_bp.route('/profile', methods=['GET'])
@token_required(allowed_roles=['Admin', 'Staff', 'Student'])
def get_profile(user_id, role):
    db = Database.get_db()
    user = db.users.find_one({'_id': ObjectId(user_id)}, {'password': 0})
    if not user:
        return jsonify({'message': 'User not found'}), 404
    user['_id'] = str(user['_id'])
    return jsonify(user), 200


# ── UPDATE profile (name, phone, department) ────────────────────────────────
@profile_bp.route('/profile', methods=['PUT'])
@token_required(allowed_roles=['Admin', 'Staff', 'Student'])
def update_profile(user_id, role):
    db = Database.get_db()
    data = request.json
    
    phone = data.get('phone')
    if phone and not re.match(r'^\d{10}$', phone):
        return jsonify({'message': 'Phone number must be exactly 10 digits'}), 400

    allowed = ['name', 'phone', 'department', 'photo_url']
    update = {k: v for k, v in data.items() if k in allowed}
    update['updated_at'] = datetime.datetime.now(datetime.timezone.utc)
    db.users.update_one({'_id': ObjectId(user_id)}, {'$set': update})
    return jsonify({'message': 'Profile updated successfully'}), 200


# ── CHANGE PASSWORD ─────────────────────────────────────────────────────────
@profile_bp.route('/change-password', methods=['POST'])
@token_required(allowed_roles=['Admin', 'Staff', 'Student'])
def change_password(user_id, role):
    db = Database.get_db()
    data = request.json
    current = data.get('current_password')
    new_pwd = data.get('new_password')

    if not current or not new_pwd:
        return jsonify({'message': 'Both current and new password are required'}), 400
    if len(new_pwd) < 6:
        return jsonify({'message': 'New password must be at least 6 characters'}), 400

    user = db.users.find_one({'_id': ObjectId(user_id)})
    if not user or not check_password(current, user['password']):
        return jsonify({'message': 'Current password is incorrect'}), 401

    db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {
            'password': hash_password(new_pwd),
            'updated_at': datetime.datetime.now(datetime.timezone.utc)
        }}
    )
    return jsonify({'message': 'Password changed successfully'}), 200
