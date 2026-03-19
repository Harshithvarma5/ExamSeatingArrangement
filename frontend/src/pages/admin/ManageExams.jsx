import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { Plus, ChevronDown, Users, Send, X, Grid, Save } from 'lucide-react';
import VisualSeatGrid from '../../components/VisualSeatGrid';
import { LanguageContext } from '../../context/LanguageContext';

const STATUS_STYLES = {
  Scheduled:  'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
  Ongoing:    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
  Completed:  'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800',
  Cancelled:  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800',
};

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronic & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "All Departments"
];

const ManageExams = () => {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({ name: '', date: '', start_time: '', end_time: '', subject: '', department: '' });
  const [statusMsg, setStatusMsg] = useState('');
  const [filterDept, setFilterDept] = useState('All Departments');
  const [absentees, setAbsentees] = useState([]);
  const [showAbsenteesModal, setShowAbsenteesModal] = useState(false);
  const [showSeatingModal, setShowSeatingModal] = useState(false);
  const [currentSeating, setCurrentSeating] = useState(null);
  const { t } = useContext(LanguageContext);

  const fetchExams = async () => {
    try { const res = await api.get('/admin/exams'); setExams(res.data); }
    catch (err) { console.error(err); }
  };

  useEffect(() => { fetchExams(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/exams', form);
      setForm({ name: '', date: '', start_time: '', end_time: '', subject: '', department: '' });
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating exam');
    }
  };

  const handleStatusChange = async (examId, newStatus) => {
    try {
      await api.patch(`/admin/exams/${examId}/status`, { status: newStatus });
      setStatusMsg(`Exam marked as ${newStatus}`);
      setTimeout(() => setStatusMsg(''), 2500);
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const fetchAbsentees = async (examId) => {
    try {
      const res = await api.get(`/admin/exams/${examId}/absentees`);
      setAbsentees(res.data);
      setShowAbsenteesModal(true);
    } catch (err) {
      alert('Error fetching absentees');
    }
  };

  const [sendingEmails, setSendingEmails] = useState(false);

  const notifyAbsentees = async (examId) => {
    if (!window.confirm("This will send hall tickets to ALL students assigned to this exam. Proceed?")) return;
    
    setSendingEmails(true);
    try {
      const res = await api.post(`/admin/exams/${examId}/notify`);
      alert(`Success: ${res.data.message}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to trigger notifications');
    } finally {
      setSendingEmails(false);
    }
  };

  const openSeatingManager = async (examId) => {
    try {
      const res = await api.get(`/seating-plans/${examId}/details`);
      setCurrentSeating(res.data);
      setShowSeatingModal(true);
    } catch (err) {
      alert('Seating plan not found or not published.');
    }
  };

  const handleSwap = async (seat1, seat2) => {
    if (!currentSeating) return;
    try {
      await api.post('/admin/seating/swap', {
        exam_id: currentSeating.exam_id,
        room_id: currentSeating.room_id,
        seat1: seat1.seat_number,
        seat2: seat2.seat_number
      });
      // Refresh current seating view
      const res = await api.get(`/seating-plans/${currentSeating.exam_id}/details`);
      setCurrentSeating(res.data);
    } catch (err) {
      alert('Swap failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Manage Exams</h1>
        {statusMsg && (
          <div className="bg-green-50 text-green-800 border border-green-200 font-bold text-sm px-4 py-2 rounded-xl">
            ✓ {statusMsg}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">Schedule New Exam</h2>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
            <input type="text" placeholder="Exam Name (e.g. Midterms)" required className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input type="text" placeholder="Subject" required className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
            <select 
              className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 cursor-pointer" 
              value={form.department} 
              onChange={e => setForm({...form, department: e.target.value})}
            >
              <option value="">Target Department (All)</option>
              {DEPARTMENTS.filter(d => d !== "All Departments").map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
              <option value="All Departments">All Departments</option>
            </select>
            <input type="date" required className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
            <input type="time" required className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
            <input type="time" required className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
            <div className="md:col-span-3">
              <button type="submit" className="bg-primary-600 text-white rounded-lg px-5 py-2.5 hover:bg-primary-700 flex items-center gap-2 font-bold transition">
                <Plus className="w-4 h-4" /> Schedule Exam
              </button>
            </div>
          </form>
        </div>

        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Exam List</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase">Filter Dept:</span>
            <select 
              value={filterDept} 
              onChange={e => setFilterDept(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-gray-900 cursor-pointer"
            >
              <option value="All Departments">All Departments</option>
              {DEPARTMENTS.filter(d => d !== "All Departments").map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase">Exam</th>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase">Subject & Dept</th>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase">Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase">Change Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {exams.filter(e => filterDept === 'All Departments' || e.department === filterDept || e.department === 'All Departments').map(exam => (
                <tr key={exam._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{exam.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{exam.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-black text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded uppercase tracking-tighter">
                      {exam.department || 'All Departments'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {exam.date}<br />
                    <span className="text-xs text-gray-500 dark:text-gray-500">{exam.start_time} – {exam.end_time}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs font-black rounded-full ${STATUS_STYLES[exam.status] || 'bg-gray-100 text-gray-700'}`}>
                      {exam.status || 'Scheduled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative inline-block">
                      <select
                        value={exam.status || 'Scheduled'}
                        onChange={e => handleStatusChange(exam._id, e.target.value)}
                        className="appearance-none pl-3 pr-8 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary-400 cursor-pointer"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-2 w-3 h-3 text-gray-400 pointer-events-none" />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => fetchAbsentees(exam._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition" title="View Absentees">
                        <Users className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => notifyAbsentees(exam._id)} 
                        disabled={sendingEmails}
                        className={`p-2 rounded-lg transition ${sendingEmails ? 'text-gray-300' : 'text-gray-400 hover:text-primary-500 hover:bg-primary-50'}`} 
                        title="Email Hall Tickets"
                      >
                        {sendingEmails ? <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openSeatingManager(exam._id)} className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition" title="Manual Seat Override">
                        <Grid className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {exams.length === 0 && <div className="text-center py-10 text-gray-400 font-medium">No exams scheduled yet. Add one above.</div>}
        </div>
      </div>

      {/* ── Seating Override Modal ───────────────────────────────────── */}
      {showSeatingModal && currentSeating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800 scale-in-center">
             <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-gray-50/50 dark:bg-gray-800/30">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100">Manual Seat Override</h2>
                  <p className="text-gray-500 font-medium">{currentSeating.subject} — Room {currentSeating.room?.room_number}</p>
                </div>
                <button onClick={() => setShowSeatingModal(false)} className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"><X className="w-6 h-6" /></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30 dark:bg-gray-900/50">
                <div className="mb-6 flex items-center gap-4 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-2xl border border-primary-100 dark:border-primary-800">
                  <div className="bg-primary-600 p-2 rounded-lg text-white"><X className="w-5 h-5" /></div>
                  <p className="text-sm font-bold text-primary-900 dark:text-primary-300">
                    <span className="font-black">Pro Tip:</span> Drag a student box and drop it onto another seat to swap them instantly.
                  </p>
                </div>

                <VisualSeatGrid 
                  seatPlan={currentSeating.seat_plan || []}
                  rows={currentSeating.room?.rows}
                  cols={currentSeating.room?.cols}
                  adminMode={true}
                  onSwap={handleSwap}
                />
             </div>

             <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex justify-end bg-white dark:bg-gray-900">
                <button 
                  onClick={() => setShowSeatingModal(false)}
                  className="bg-gray-900 dark:bg-gray-100 text-white dark:text-black font-black px-8 py-3 rounded-2xl hover:scale-105 transition shadow-lg flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> Done & Save Changes
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExams;
