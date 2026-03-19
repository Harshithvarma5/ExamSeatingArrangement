from database import Database
from bson import ObjectId

def setup():
    db = Database.get_db()
    result = db.users.update_many(
        {'role': 'Student'},
        {'$set': {'cgpa': 8.5, 'past_neighbors': []}}
    )
    print(f"Updated {result.modified_count} students with initial CGPA and Neighbor History.")

if __name__ == "__main__":
    setup()
