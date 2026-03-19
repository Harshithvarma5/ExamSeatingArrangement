import requests
import sys
sys.path.append('d:\\ExamSeatingArrangement\\backend')
from utils.auth import generate_token
from pymongo import MongoClient

def test():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['exam_seating_db']
    admin = db.users.find_one({'role': 'Admin'})
    if not admin:
        print("Admin not found")
        return

    token = generate_token(str(admin['_id']), 'Admin')
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    try:
        print("Testing GET...")
        r1 = requests.get('http://localhost:5000/api/admin/settings', headers=headers)
        print("GET:", r1.status_code, r1.text)
        
        print("Testing POST...")
        r2 = requests.post('http://localhost:5000/api/admin/settings', headers=headers, json={"mfaEnabled": True})
        print("POST:", r2.status_code, r2.text)
    except Exception as e:
        print("Request failed:", e)

test()
