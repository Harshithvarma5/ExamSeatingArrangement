import jwt
import bcrypt
from functools import wraps
from flask import request, jsonify
from config import Config
import datetime
from database import Database
from bson import ObjectId

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def generate_token(user_id, role):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow(),
        'sub': str(user_id),
        'role': role
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')

def token_required(allowed_roles=None):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                if auth_header.startswith('Bearer '):
                    token = auth_header.split(" ")[1]
            
            if not token:
                return jsonify({'message': 'Token is missing!'}), 401
            
            try:
                data = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
                current_user_id = data['sub']
                user_role = data['role']
                
                if allowed_roles and user_role not in allowed_roles:
                    return jsonify({'message': 'Unauthorized access!'}), 403
                    
            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token has expired!'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Invalid token!'}), 401
            except Exception as e:
                return jsonify({'message': str(e)}), 401
                
            return f(current_user_id, user_role, *args, **kwargs)
        return decorated
    return decorator
