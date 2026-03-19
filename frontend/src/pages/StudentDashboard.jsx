import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { LayoutDashboard, Download, MapPin, Clock, AlertCircle, User, Bell } from 'lucide-react';
import api from '../services/api';
import jspdf from 'jspdf';
import QRCode from 'qrcode';
import { AuthContext } from '../context/AuthContext';
import UserProfile from './UserProfile';
import NotificationInbox from './NotificationInbox';
import VisualSeatGrid from '../components/VisualSeatGrid';

// ── Empty / Gated State Component ─────────────────────────────────────────────
const SeatingEmptyState = ({ status, examName }) => {
  const configs = {
    not_published: {
      icon: '🔒',
      title: 'Seating Plan Not Published Yet',
      description: 'The exam committee is finalizing the seating arrangement for this exam. You will be able to view your assigned room and seat once it is officially published.',
      accent: 'border-yellow-200 dark:border-yellow-900/50 bg-yellow-50 dark:bg-yellow-900/20',
      badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    },
    not_created: {
      icon: '📋',
      title: 'Seating Plan Not Created',
      description: 'A seating plan has not been created for this exam yet. Please check back closer to the exam date.',
      accent: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30',
      badge: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
    },
    not_assigned: {
      icon: '🪑',
      title: 'No Seat Assigned',
      description: 'A seating plan exists for this exam, but you have not been assigned a seat. Please contact the exam administration office.',
      accent: 'border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20',
      badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    }
  };
  const cfg = configs[status] || configs['not_created'];
  return (
    <div className={`rounded-2xl border-2 ${cfg.accent} p-10 text-center`}>
      <div className="text-5xl mb-4">{cfg.icon}</div>
      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border mb-4 ${cfg.badge}`}>{examName}</span>
      <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-2">{cfg.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium max-w-md mx-auto leading-relaxed">{cfg.description}</p>
    </div>
  );
};

// ── Student Overview Page ─────────────────────────────────────────────────────
const StudentOverview = () => {
  const [exams, setExams] = useState([]);
  const [seatData, setSeatData] = useState({});
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/student/my-exams');
        setExams(res.data);
        // For each exam check published seating
        for (const info of res.data) {
          try {
            const seatRes = await api.get(`/seating-plans/${info.exam._id}/student`);
            setSeatData(prev => ({ ...prev, [info.exam._id]: seatRes.data }));
          } catch (e) {
            setSeatData(prev => ({ ...prev, [info.exam._id]: { status: 'not_created', message: 'Seating plan has not been created yet.' } }));
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchExams();
  }, []);

  const downloadSlip = async (info, seat, room) => {
    const doc = new jspdf();
    doc.setFontSize(22); doc.setTextColor(16, 185, 129);
    doc.text("Smart University", 105, 20, { align: "center" });
    doc.setFontSize(14); doc.setTextColor(50, 50, 50);
    doc.text("Hall Ticket & Seating Slip", 105, 30, { align: "center" });
    doc.setDrawColor(200, 200, 200); doc.line(20, 35, 190, 35);

    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.text("Student Name:", 20, 50);
    doc.setFont("helvetica", "normal"); doc.text(user.name, 60, 50);
    doc.setFont("helvetica", "bold"); doc.text("Roll Number:", 20, 60);
    doc.setFont("helvetica", "normal"); doc.text(user.roll_number || 'N/A', 60, 60);
    doc.setFont("helvetica", "bold"); doc.text("Department:", 20, 70);
    doc.setFont("helvetica", "normal"); doc.text(user.department || 'N/A', 60, 70);

    doc.setDrawColor(16, 185, 129); doc.setFillColor(236, 253, 245);
    doc.rect(20, 85, 170, 70, "FD");
    doc.setFont("helvetica", "bold"); doc.text("Exam Name:", 25, 100);
    doc.setFont("helvetica", "normal"); doc.text(info.exam.name, 65, 100);
    doc.setFont("helvetica", "bold"); doc.text("Subject:", 25, 110);
    doc.setFont("helvetica", "normal"); doc.text(info.exam.subject, 65, 110);
    doc.setFont("helvetica", "bold"); doc.text("Date & Time:", 25, 120);
    doc.setFont("helvetica", "normal"); doc.text(`${info.exam.date} | ${info.exam.start_time} to ${info.exam.end_time}`, 65, 120);
    doc.setFont("helvetica", "bold"); doc.text("Room Assigned:", 25, 140);
    doc.setFont("helvetica", "normal"); doc.setTextColor(220, 38, 38);
    doc.text(room.room_number?.toString(), 65, 140);
    doc.setFont("helvetica", "bold"); doc.setTextColor(50, 50, 50);
    doc.text("Seat / Bench No:", 105, 140);
    doc.setFont("helvetica", "normal"); doc.setTextColor(220, 38, 38);
    doc.text(seat.seat_number, 145, 140);

    try {
      const qrPayload = JSON.stringify({ student_id: user._id || user.id, exam_id: info.exam._id, room_id: room.room_id });
      const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 150, margin: 1 });
      doc.addImage(qrDataUrl, 'PNG', 145, 38, 45, 45);
      doc.setFontSize(8); doc.setTextColor(150, 150, 150);
      doc.text("Scan for Verification", 167.5, 85, { align: "center" });
    } catch (e) {}

    doc.setTextColor(50, 50, 50); doc.setFontSize(10);
    doc.text("Instructions:", 20, 170);
    doc.text("1. Please bring your college ID card.", 20, 180);
    doc.text("2. Be present at the exam hall 15 minutes before time.", 20, 190);
    doc.text("3. Electronic devices are strictly prohibited.", 20, 200);
    doc.save(`Seat_Slip_${info.exam.subject.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50">My Exam Seating</h1>

      {exams.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-16 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">No Exams Scheduled</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">You have not been enrolled in any upcoming exams.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((info, idx) => {
            const sd = seatData[info.exam._id];
            const published = sd?.status === 'published';

            return (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                {/* Accent Bar */}
                <div className={`w-full h-1.5 ${published ? 'bg-green-500' : 'bg-yellow-400'}`} />
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">{info.exam.subject}</h3>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">{info.exam.name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">{info.exam.date}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${published ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'}`}>
                        {published ? '✓ Published' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium mb-5">
                    <Clock className="w-4 h-4" />
                    {info.exam.start_time} — {info.exam.end_time}
                  </div>

                  {/* Seating Info or Gate */}
                  {published && sd?.seat && sd?.room ? (
                    <>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 mb-5 border border-gray-200 dark:border-gray-700 flex justify-between shadow-inner">
                        <div className="text-center w-1/2 border-r border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold mb-1">Room</p>
                          <p className="text-3xl font-black text-gray-900 dark:text-gray-100">{sd.room.room_number}</p>
                        </div>
                        <div className="text-center w-1/2">
                          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest font-bold mb-1">Seat</p>
                          <p className="text-3xl font-black text-primary-600 dark:text-primary-400">{sd.seat.seat_number}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-medium mb-5">
                        <MapPin className="w-3 h-3" />
                        Row {sd.seat.row}, Col {sd.seat.col}
                      </div>

                      <button
                        onClick={() => downloadSlip(info, sd.seat, sd.room)}
                        className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition shadow-sm gap-2 mb-4"
                      >
                        <Download className="w-4 h-4" /> Download Hall Ticket (PDF)
                      </button>

                      <div className="mt-4">
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Room Layout</p>
                        <VisualSeatGrid 
                          seatPlan={sd.seat_plan || []} 
                          rows={sd.room.rows} 
                          cols={sd.room.cols} 
                          currentStudentId={user.id || user._id}
                        />
                      </div>
                    </>
                  ) : (
                    <SeatingEmptyState
                      status={sd?.status || 'not_created'}
                      examName={info.exam.subject}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Dashboard Wrapper ─────────────────────────────────────────────────────────
const StudentDashboard = () => {
  const navigation = [
    { name: 'my_exams', href: '/student', icon: LayoutDashboard, end: true },
    { name: 'notifications', href: '/student/notifications', icon: Bell },
    { name: 'profile', href: '/student/profile', icon: User },
  ];
  return (
    <DashboardLayout navigation={navigation}>
      <Routes>
        <Route path="/" element={<StudentOverview />} />
        <Route path="/notifications" element={<NotificationInbox />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="*" element={<Navigate to="/student" />} />
      </Routes>
    </DashboardLayout>
  );
};

export default StudentDashboard;
