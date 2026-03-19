import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/exam_seating_db")
    JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwtkey")
    PORT = int(os.getenv("PORT", 5000))
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
    SENDGRID_FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL", "exams@university.edu")
