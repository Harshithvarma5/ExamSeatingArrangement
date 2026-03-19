from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import Database

# Import routes
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.staff_routes import staff_bp
from routes.student_routes import student_bp
from routes.seating_routes import seating_bp
from routes.profile_routes import profile_bp
from routes.notification_routes import notification_bp
from routes.ai_routes import ai_bp

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Init DB
    Database.initialize()
    
    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(staff_bp, url_prefix='/api/staff')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(seating_bp, url_prefix='/api')
    app.register_blueprint(profile_bp, url_prefix='/api/user')
    app.register_blueprint(notification_bp, url_prefix='/api/notifications')
    app.register_blueprint(ai_bp, url_prefix='/api/admin/ai')
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'ok', 'message': 'Smart Exam Seating System API is running'})
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=Config.PORT, debug=True)
