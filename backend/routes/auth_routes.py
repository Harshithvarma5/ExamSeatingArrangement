from flask import Blueprint, request, jsonify
from database import Database
from utils.auth import hash_password, check_password, generate_token, token_required
from bson import ObjectId
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    db = Database.get_db()
    
    if db.users.find_one({'email': data.get('email')}):
        return jsonify({'message': 'Email already exists'}), 400
        
    user = {
        'name': data.get('name'),
        'email': data.get('email'),
        'password': hash_password(data.get('password')),
        'role': data.get('role', 'Student'), # default role
        'department': data.get('department'),
        'roll_number': data.get('roll_number')
    }
    
    db.users.insert_one(user)
    return jsonify({'message': 'User created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    db = Database.get_db()
    
    identifier = data.get('identifier') or data.get('email')
    
    # Auto-detect user by email or roll number — no role required
    user = db.users.find_one({
        '$or': [{'email': identifier}, {'roll_number': identifier}]
    })

    if not user or not check_password(data.get('password'), user['password']):
        db.audit_logs.insert_one({
            'email': identifier,
            'status': 'failed',
            'reason': 'invalid_credentials',
            'timestamp': datetime.datetime.now(datetime.timezone.utc),
            'ip': request.remote_addr,
            'user_agent': request.headers.get('User-Agent')
        })
        return jsonify({'message': 'Invalid credentials. Please check your ID and password.'}), 401
    
    # IP-Based Access Control for Students
    if user['role'] == 'Student':
        settings = db.settings.find_one()
        allowed_range = settings.get('allowedIpRange') if settings else None
        
        if allowed_range and allowed_range.strip():
            client_ip = request.remote_addr
            # Simple check: if client_ip is not in the comma-separated list
            # For a production app, we'd use ipaddress module for CIDR
            allowed_list = [ip.strip() for ip in allowed_range.split(',')]
            
            # Allow localhost for development
            if client_ip not in allowed_list and client_ip not in ['127.0.0.1', 'localhost', '::1']:
                db.audit_logs.insert_one({
                    'user_id': str(user['_id']),
                    'email': user['email'],
                    'role': user['role'],
                    'status': 'failed',
                    'reason': 'ip_restricted',
                    'timestamp': datetime.datetime.now(datetime.timezone.utc),
                    'ip': client_ip,
                    'user_agent': request.headers.get('User-Agent')
                })
                return jsonify({'message': 'Access restricted. You must be on the college network to log in.'}), 403

    db.audit_logs.insert_one({
        'user_id': str(user['_id']),
        'email': user['email'],
        'role': user['role'],
        'status': 'success',
        'timestamp': datetime.datetime.now(datetime.timezone.utc),
        'ip': request.remote_addr,
        'user_agent': request.headers.get('User-Agent')
    })
        
    token = generate_token(str(user['_id']), user['role'])
    
    return jsonify({
        'token': token,
        'user': {
            'id': str(user['_id']),
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
@token_required()
def get_me(user_id, role):
    db = Database.get_db()
    user = db.users.find_one({'_id': ObjectId(user_id)}, {'password': 0})
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    user['_id'] = str(user['_id'])
    return jsonify({'user': user}), 200
