# Smart Exam Seating Arrangement System

A premium full-stack web application designed for colleges and universities to digitally manage exam seating arrangements, securely handling roles for Students, Faculty (Staff), and Administrators.

## Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, Lucide-React, jsPDF
- **Backend**: Python, Flask, Flask-CORS, PyMongo, PyJWT, bcrypt
- **Database**: MongoDB

## 🚀 Advanced Features (v2 - v7 Updates)

The system has evolved into a comprehensive institutional-scale platform with deep AI integration:

### 1. 🤖 Artificial Intelligence & Logic
- **Intelligent Seating v3**: An AI that uses **Historical Neighbor Avoidance** and **GPA Interleaving** to ensure students who sat together before or have similar grades are never seated adjacently.
- **Clash Management (Multi-Exam)**: Interleave students from different subjects (e.g., Java and Python) in the same room to eliminate copying.
- **Accessibility-Aware Seating**: Automatically prioritizes students with health/disability needs to seats near entrances.

### 2. 🛡️ Advanced Security & Integrity
- **IP-Based Access Control**: Restrict student logins to the college Wi-Fi network by specifying allowed IP ranges.
- **Digital Audit Trail**: A complete security log viewer tracking all login attempts, IP addresses, and system events.
- **Answer Booklet Linking**: Digitally link physical answer booklet serial numbers to student attendance records during QR scans.
- **Visual Seat Override**: A 2D room grid with **Drag & Drop** re-assignment for manual seat adjustments.

### 3. 🏤 Institutional Scaling & Branding
- **Dynamic Whitelabeling**: Customize the platform's primary/secondary colors and institution logo from the settings panel.
- **PWA & Mobile Ready**: Full **Progressive Web App** support for offline scanning and **Capacitor** integration for native Android/iOS builds.
- **High-Concurrency Scaling**: Optimized for **5,000+ simultaneous students** using Gunicorn (Gevent) and optimized MongoDB indexing.
- **Automated Communication**: Mass email hall tickets and notifications via **SendGrid API**.

### 4. 📊 Analytics & Reporting
- **Interactive Dashboards**: Professional charts (Recharts) for student distribution and attendance metrics.
- **Attendance Heatmaps**: Visual room grids (Green/Red) for staff to monitor occupancy at a glance.
- **Multi-Language Support**: Complete interface translation for **English**, **Hindi**, and **Telugu**.
- **Dark Mode**: Premium high-contrast dark theme available globally.

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB instance running locally on `localhost:27017`

### 1. Initialize Backend
Open a new terminal shell and run:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Seed Database
Run the initial data seeder to create students, staff, admin, rooms, and upcoming exams:
```powershell
python seed.py
```
**Login Credentials generated:**
- **Admin**: `admin@university.edu` / `admin123`
- **Staff**: `staff1@university.edu` / `staff123`
- **Student**: `student1@university.edu` / `student123`

### 3. Start Backend API
```powershell
python app.py
```
*(The backend runs on `http://localhost:5000`)*

### 4. Start Frontend
Open a **second terminal shell** and run:
```powershell
cd frontend
npm run dev
```
*(The React application runs at `http://localhost:5173`)*

Enjoy the premium design and feature-rich examination management system!

## 🚀 Scaling for 5,000+ Concurrent Students
When deploying for a real exam with thousands of students logging in simultaneously, follow these production-readiness steps:

### 1. Backend Optimization (Applied)
- **Database Indexing**: A multikey index on `seat_plan.student_id` is automatically created on startup to ensure instant seating lookups.
- **Connection Pooling**: The system is configured with a `maxPoolSize` of 200 to handle high database traffic.
- **Route Optimization**: Student seating queries use targeted `$elemMatch` instead of full collection scans.

### 2. Production Server (Gunicorn + Gevent)
Do **not** use `python app.py` in production. Instead, use Gunicorn with asynchronous workers:
```bash
cd backend
# Install production requirements
pip install -r requirements.txt
# Run with optimized config
gunicorn -c gunicorn_config.py wsgi:app
```

### 3. Frontend Production Build
To ensure the frontend is fast and secure:
```bash
cd frontend
npm run build
```
The resulting `dist` folder should be served by a high-performance web server like **Nginx**.

### 4. Database (MongoDB)
For 5,000+ users, ensure your MongoDB instance has at least **4GB RAM** and **2 CPUs** to handle the concurrent connections.
