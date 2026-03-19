from database import Database
from config import Config
from utils.auth import hash_password

def seed_db():
    print("Connecting to DB...")
    Database.initialize()
    db = Database.get_db()
    
    print("Clearing old data...")
    db.users.delete_many({})
    db.rooms.delete_many({})
    db.exams.delete_many({})
    db.seating_arrangements.delete_many({})
    
    print("Creating Admin...")
    db.users.insert_one({
        'name': 'System Admin',
        'email': 'admin@university.edu',
        'password': hash_password('admin123'),
        'role': 'Admin'
    })
    
    print("Creating Staff...")
    for i in range(1, 4):
        db.users.insert_one({
            'name': f'Professor {i}',
            'email': f'staff{i}@university.edu',
            'password': hash_password('staff123'),
            'role': 'Staff',
            'department': 'Computer Science'
        })
        
    print("Creating Students...")
    departments = ['Computer Science', 'Information Technology', 'Civil Engineering']
    for i in range(1, 61):
        dept = departments[i % 3]
        db.users.insert_one({
            'name': f'Student {i}',
            'email': f'student{i}@university.edu',
            'password': hash_password('student123'),
            'role': 'Student',
            'department': dept,
            'roll_number': f'2026{dept[:2].upper()}{i:03d}'
        })
        
    print("Creating Rooms...")
    db.rooms.insert_many([
        {'room_number': '101', 'capacity': 30, 'rows': 5, 'cols': 6, 'building': 'Main Block', 'floor': '1'},
        {'room_number': '102', 'capacity': 30, 'rows': 5, 'cols': 6, 'building': 'Main Block', 'floor': '1'},
        {'room_number': '201', 'capacity': 40, 'rows': 8, 'cols': 5, 'building': 'Science Block', 'floor': '2'}
    ])
    
    print("Creating Exams...")
    db.exams.insert_many([
        {'name': 'Midterm 2026', 'subject': 'Data Structures', 'department': 'Computer Science', 'date': '2026-05-10', 'start_time': '10:00', 'end_time': '13:00', 'status': 'Scheduled'},
        {'name': 'Midterm 2026', 'subject': 'Database Systems', 'department': 'Information Technology', 'date': '2026-05-12', 'start_time': '14:00', 'end_time': '17:00', 'status': 'Scheduled'}
    ])
    
    print("Database seeded successfully!")
    print("Login Credentials:")
    print("Admin: admin@university.edu / admin123")
    print("Staff: staff1@university.edu / staff123")
    print("Student: student1@university.edu / student123")

if __name__ == '__main__':
    seed_db()
