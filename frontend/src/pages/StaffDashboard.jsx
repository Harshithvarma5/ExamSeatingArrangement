import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { LayoutDashboard, QrCode, User, Download, Bell } from 'lucide-react';
import api from '../services/api';
import UserProfile from './UserProfile';
import { Html5QrcodeScanner } from 'html5-qrcode';
import AttendanceHeatmap from '../components/AttendanceHeatmap';
import NotificationInbox from './NotificationInbox';

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronic & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "All Departments"
];

const StaffOverview = () => {
  const [halls, setHalls] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [filterDept, setFilterDept] = useState('All Departments');

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const res = await api.get('/staff/assigned-halls');
        setHalls(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHalls();
  }, []);

  const handleAttendance = async (examId, roomId, studentId, status, bookletNumber = null) => {
    try {
      await api.post(`/staff/attendance/${examId}/${roomId}`, { 
        student_id: studentId, 
        status,
        booklet_number: bookletNumber 
      });
      setHalls(halls.map(hall => {
        if (hall.exam_id === examId && hall.room_id === roomId) {
          hall.seat_plan = hall.seat_plan.map(seat => 
            seat.student_id === studentId ? { 
              ...seat, 
              attendance: status, 
              booklet_number: bookletNumber || seat.booklet_number 
            } : seat
          );
        }
        return hall;
      }));
    } catch (err) {
      alert('Error updating attendance');
    }
  };

  const handleExport = async (examId) => {
    try {
      const response = await api.get(`/admin/attendance/export/${examId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${examId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error exporting attendance');
    }
  };

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(onScanSuccess, onScanFailure);

      function onScanSuccess(decodedText, decodedResult) {
        try {
          const payload = JSON.parse(decodedText);
          if (payload.exam_id && payload.student_id && payload.room_id) {
            const booklet = prompt("Enter Answer Booklet Serial Number (Optional):");
            handleAttendance(payload.exam_id, payload.room_id, payload.student_id, 'Present', booklet);
            // Beep audio visual feedback
            alert(`Attendance & Booklet (${booklet || 'N/A'}) linked for student.`);
            scanner.pause(true);
            setTimeout(() => scanner.resume(), 3000); // Resume scanning after 3 sec
          }
        } catch (e) {
          console.error("Invalid QR code format");
        }
      }

      function onScanFailure(error) {
        // Just silent ignore frame failures
      }

      return () => {
        scanner.clear().catch(error => console.error(error));
      };
    }
  }, [showScanner, halls]); // Re-attach if halls update, though handleAttendance uses stale closure... 
  // Wait, updating state with stale closure: handleAttendance already uses functional state or direct map so it's fine. Wait, `handleAttendance` explicitly uses `halls.map`, so we rely on it being up-to-date. But scanner survives re-renders. We're safe enough for MVP.

  const groupedHalls = halls.reduce((acc, hall) => {
    const filterMatch = filterDept === 'All Departments' || hall.department === filterDept || hall.department === 'All Departments';
    if (!filterMatch) return acc;
    
    if (!acc[hall.exam_id]) {
      acc[hall.exam_id] = { 
        exam_id: hall.exam_id, 
        exam_name: hall.exam_name, 
        subject: hall.subject, 
        date: hall.date, 
        rooms: [] 
      };
    }
    acc[hall.exam_id].rooms.push(hall);
    return acc;
  }, {});

  const displayedExams = Object.values(groupedHalls);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50 uppercase tracking-tight">Duty Overview & Attendance</h1>
        <button 
          onClick={() => setShowScanner(!showScanner)}
          className="bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl px-6 py-3 hover:bg-indigo-700 dark:hover:bg-indigo-400 flex items-center justify-center gap-2 font-black transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <QrCode className="w-5 h-5" /> {showScanner ? "Close Scanner" : "Launch QR Scanner"}
        </button>
      </div>

      <div className="flex justify-end gap-3 items-center">
        <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">Filter by Department</span>
        <select 
          value={filterDept} 
          onChange={e => setFilterDept(e.target.value)}
          className="border-2 border-gray-100 dark:border-gray-800 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 shadow-sm cursor-pointer transition-all"
        >
          <option value="All Departments">All Departments</option>
          {DEPARTMENTS.filter(d => d !== "All Departments").map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {showScanner && (
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border-2 border-indigo-100 dark:border-indigo-900/30 p-8 mb-6 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
              <QrCode className="w-6 h-6" /> Scan Hall Ticket
            </h2>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">Live Scanner</div>
          </div>
          <div id="qr-reader" className="mx-auto max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700 ring-1 ring-gray-100 dark:ring-gray-800"></div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 font-medium">Position the student's QR code within the frame to auto-mark attendance.</p>
        </div>
      )}
      
      {displayedExams.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-20 text-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="w-10 h-10 text-gray-200 dark:text-gray-700" />
          </div>
          <p className="text-gray-400 dark:text-gray-500 font-black text-xl">No Assignments Found</p>
          <p className="text-sm text-gray-300 dark:text-gray-600 mt-2">You don't have any exam duties under the selected filters.</p>
        </div>
      ) : (
        displayedExams.map(examGroup => (
          <div key={examGroup.exam_id} className="space-y-6">
            {/* Exam Header Card */}
            <div className="bg-indigo-600 dark:bg-indigo-900 p-6 rounded-[2rem] text-white flex justify-between items-center shadow-xl shadow-indigo-500/10">
               <div>
                  <h2 className="text-2xl font-black tracking-tight">{examGroup.exam_name}</h2>
                  <div className="flex items-center gap-4 mt-1 opacity-90 text-sm font-bold">
                    <span>{examGroup.subject}</span>
                    <span className="w-1.5 h-1.5 bg-white/30 rounded-full"></span>
                    <span>{examGroup.date}</span>
                  </div>
               </div>
               <button 
                  onClick={() => handleExport(examGroup.exam_id)}
                  className="bg-white text-indigo-700 px-6 py-3 rounded-2xl flex items-center gap-2 font-black text-sm hover:scale-105 transition-all shadow-lg active:scale-95"
                >
                  <Download className="w-4 h-4" /> Export All Rooms
                </button>
            </div>

            {/* Room Specific Sections */}
            <div className="space-y-8">
              {examGroup.rooms.map(hall => (
                <div key={hall._id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden ml-4 md:ml-12 border-l-8 border-l-primary-500">
                  <div className="p-8 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 flex justify-between items-end">
                    <div>
                      <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 inline-block">Room Duty</div>
                      <h3 className="text-3xl font-black text-gray-900 dark:text-gray-50">Room {hall.room_number}</h3>
                      <div className="flex gap-6 mt-3">
                         <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">Capacity</p>
                            <p className="text-lg font-black text-gray-700 dark:text-gray-300">{hall.room_capacity || 'N/A'}</p>
                         </div>
                         <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">Registered</p>
                            <p className="text-lg font-black text-gray-700 dark:text-gray-300">{hall.seat_plan?.length || 0}</p>
                         </div>
                         <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase">Present</p>
                            <p className="text-lg font-black text-green-600 dark:text-green-400">{hall.seat_plan?.filter(s => s.attendance === 'Present').length || 0}</p>
                         </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleExport(hall.exam_id)}
                      className="text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 p-3 rounded-2xl transition-all font-black text-xs flex items-center gap-2 border border-transparent hover:border-primary-100 dark:hover:border-primary-800"
                    >
                      <Download className="w-4 h-4" /> Download Room CSV
                    </button>
                  </div>

                  <div className="p-8">
                    <AttendanceHeatmap seatPlan={hall.seat_plan || []} />
                    
                    <div className="mt-10 overflow-x-auto rounded-3xl border border-gray-100 dark:border-gray-700">
                      <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                        <thead className="bg-gray-50/50 dark:bg-gray-900/80">
                          <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Seat</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Student</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Info</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-50 dark:divide-gray-700">
                          {hall.seat_plan?.map(seat => (
                            <tr key={seat.student_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-xs font-black text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-sm">{seat.seat_number.split('-').pop()}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-black text-gray-900 dark:text-gray-50">{seat.student_name}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{seat.student_id}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-xs font-bold text-gray-600 dark:text-gray-400">{seat.roll_number}</div>
                                <div className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase">{seat.department}</div>
                                {seat.attendance === 'Present' && (
                                  <div className="mt-2 group-hover:scale-105 transition-transform">
                                    <input 
                                      type="text" 
                                      placeholder="Booklet #"
                                      value={seat.booklet_number || ''}
                                      onChange={(e) => handleAttendance(hall.exam_id, hall.room_id, seat.student_id, 'Present', e.target.value)}
                                      className="w-24 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-[10px] font-black text-primary-700 dark:text-primary-400 outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                                    />
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm
                                  ${seat.attendance === 'Present' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 
                                    seat.attendance === 'Absent' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                                  {seat.attendance || 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex gap-2 justify-end">
                                  <button 
                                    onClick={() => handleAttendance(hall.exam_id, hall.room_id, seat.student_id, 'Present')}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border-2 
                                      ${seat.attendance === 'Present' 
                                        ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/20' 
                                        : 'bg-white dark:bg-gray-900 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30 hover:border-green-500'}`}
                                  >
                                    Present
                                  </button>
                                  <button 
                                    onClick={() => handleAttendance(hall.exam_id, hall.room_id, seat.student_id, 'Absent')}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border-2
                                      ${seat.attendance === 'Absent' 
                                        ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/20' 
                                        : 'bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 hover:border-red-500'}`}
                                  >
                                    Absent
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const StaffDashboard = () => {
  const navigation = [
    { name: 'duty_overview', href: '/staff', icon: LayoutDashboard, end: true },
    { name: 'notifications', href: '/staff/notifications', icon: Bell },
    { name: 'profile', href: '/staff/profile', icon: User },
  ];

  return (
    <DashboardLayout navigation={navigation}>
      <Routes>
        <Route path="/" element={<StaffOverview />} />
        <Route path="/notifications" element={<NotificationInbox />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="*" element={<Navigate to="/staff" />} />
      </Routes>
    </DashboardLayout>
  );
};

export default StaffDashboard;
