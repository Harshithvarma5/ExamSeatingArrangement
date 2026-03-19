from pymongo import MongoClient
from config import Config
import logging

class Database:
    client = None
    db = None

    @classmethod
    def initialize(cls):
        try:
            # Increase maxPoolSize for high concurrency (5000+ users)
            cls.client = MongoClient(
                Config.MONGO_URI, 
                serverSelectionTimeoutMS=5000,
                maxPoolSize=200, 
                minPoolSize=10
            )
            cls.db = cls.client.get_database()
            
            # Ensure indexes
            cls.db.users.create_index("email", unique=True)
            cls.db.users.create_index("roll_number", sparse=True)
            cls.db.rooms.create_index("room_number", unique=True)
            
            # CRITICAL: Multikey index for fast student seating lookups
            cls.db.seating_arrangements.create_index("seat_plan.student_id")
            
            cls.db.audit_logs.create_index("timestamp")
            cls.db.audit_logs.create_index("email")
            logging.info("MongoDB connected successfully with high-concurrency settings.")
        except Exception as e:
            logging.error(f"Failed to connect to MongoDB: {e}")

    @classmethod
    def get_db(cls):
        if cls.db is None:
            cls.initialize()
        return cls.db

db_instance = Database()
