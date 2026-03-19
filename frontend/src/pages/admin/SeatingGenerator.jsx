import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Zap, Eye, Globe, EyeOff, AlertTriangle, CheckCircle2, Clock, X } from 'lucide-react';

// ── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    published:   { text: 'Published',   bg: 'bg-green-100 dark:bg-green-900/30',  text_color: 'text-green-800 dark:text-green-300',  border: 'border-green-200 dark:border-green-800',  dot: 'bg-green-500' },
    draft:       { text: 'Draft',        bg: 'bg-yellow-100 dark:bg-yellow-900/30', text_color: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800', dot: 'bg-yellow-500' },
    partial:     { text: 'Partial',      bg: 'bg-blue-100 dark:bg-blue-900/30',   text_color: 'text-blue-800 dark:text-blue-300',   border: 'border-blue-200 dark:border-blue-800',   dot: 'bg-blue-500' },
    not_created: { text: 'Not Created',  bg: 'bg-gray-100 dark:bg-gray-800',   text_color: 'text-gray-600 dark:text-gray-400',   border: 'border-gray-200 dark:border-gray-700',   dot: 'bg-gray-400' },
  };
  const s = map[status] || map['not_created'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${s.bg} ${s.text_color} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.text}
    </span>
  );
};

// ── Confirm Modal ─────────────────────────────────────────────────────────────
const ConfirmModal = ({ open, title, message, onConfirm, onCancel, danger }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 max-w-md w-full mx-4 animate-in fade-in slide-in-from-bottom-2">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
          {danger ? <AlertTriangle className={`w-6 h-6 text-red-600 dark:text-red-400`} /> : <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />}
        </div>
        <h3 className="text-xl font-black text-gray-900 dark:text-gray-50 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850 transition flex items-center justify-center gap-2">
            <X className="w-4 h-4" /> Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 ${danger ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'}`}>
            {danger ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl font-bold text-sm border animate-in slide-in-from-bottom-4 ${toast.type === 'success' ? 'bg-green-600 text-white border-green-500' : 'bg-red-600 text-white border-red-500'}`}>
      {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      {toast.message}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const SeatingGenerator = () => {
  const [statuses, setStatuses] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);
  const [allocating, setAllocating] = useState(null);
  const [preview, setPreview] = useState(null);
  const [modal, setModal] = useState(null); // { examId, action: 'publish'|'unpublish' }
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStatuses = async () => {
    try {
      const res = await api.get('/seating-plans/status');
      setStatuses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchStatuses(); }, []);

  const handleAllocate = async (examId) => {
    setAllocating(examId);
    try {
      const res = await api.post(`/admin/seating/allocate/${examId}`);
      showToast(res.data.message || 'Seating allocated — plan is now in DRAFT.');
      fetchStatuses();
    } catch (err) {
      showToast(err.response?.data?.message || 'Allocation failed', 'error');
    } finally {
      setAllocating(null);
    }
  };

  const handleBulkAllocate = async () => {
    if (selectedExams.length === 0) return;
    setAllocating('bulk');
    try {
      const res = await api.post('/admin/seating/allocate-bulk', { exam_ids: selectedExams });
      showToast(res.data.message);
      setSelectedExams([]);
      fetchStatuses();
    } catch (err) {
      showToast(err.response?.data?.message || 'Bulk allocation failed', 'error');
    } finally {
      setAllocating(null);
    }
  };

  const handlePreview = async (examId) => {
    try {
      const res = await api.get(`/seating-plans/${examId}/preview`);
      setPreview({ examId, ...res.data });
    } catch (err) {
      showToast('Preview failed', 'error');
    }
  };

  const handleConfirmAction = async () => {
    if (!modal) return;
    const { examId, action } = modal;
    setModal(null);
    try {
      const res = await api.patch(`/seating-plans/${examId}/${action}`);
      showToast(res.data.message);
      fetchStatuses();
      // Update preview if open
      if (preview?.examId === examId) handlePreview(examId);
    } catch (err) {
      showToast(err.response?.data?.message || `${action} failed`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <Toast toast={toast} />

      <ConfirmModal
        open={!!modal}
        title={modal?.action === 'publish' ? 'Publish Seating Plan?' : 'Unpublish Seating Plan?'}
        message={modal?.action === 'publish'
          ? 'This will make the seating plan visible to all assigned students immediately.'
          : 'This will hide the seating plan from all students. You can re-publish at any time.'}
        danger={modal?.action === 'unpublish'}
        onConfirm={handleConfirmAction}
        onCancel={() => setModal(null)}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50">Seating Plan Management</h1>
        {selectedExams.length > 0 && (
          <button
            onClick={handleBulkAllocate}
            disabled={allocating === 'bulk'}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-black rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition animate-in zoom-in duration-300"
          >
            {allocating === 'bulk' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
            Bulk Allocate Interleaved ({selectedExams.length})
          </button>
        )}
      </div>

      {/* Exam Status Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">All Exams — Seating Status</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Allocate, preview, and publish seating plans. Students can only view published plans.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead className="bg-white dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" 
                    onChange={(e) => setSelectedExams(e.target.checked ? statuses.map(s => s.exam_id) : [])}
                    checked={selectedExams.length === statuses.length && statuses.length > 0}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exam / Subject</th>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rooms</th>
                <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {statuses.map(exam => (
                <tr key={exam.exam_id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-750/50 transition-colors ${selectedExams.includes(exam.exam_id) ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}>
                  <td className="px-6 py-4">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500" 
                      checked={selectedExams.includes(exam.exam_id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedExams([...selectedExams, exam.exam_id]);
                        else setSelectedExams(selectedExams.filter(id => id !== exam.exam_id));
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">{exam.subject}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{exam.exam_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-medium">{exam.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {exam.total_rooms > 0
                      ? <span className="font-black text-gray-900 dark:text-gray-100">{exam.published_rooms}<span className="text-gray-400 font-medium">/{exam.total_rooms} published</span></span>
                      : <span className="text-gray-400 font-medium">—</span>}
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={exam.status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {/* Allocate */}
                      <button
                        onClick={() => handleAllocate(exam.exam_id)}
                        disabled={allocating === exam.exam_id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                      >
                        {allocating === exam.exam_id ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Zap className="w-3 h-3" />}
                        {exam.status === 'not_created' ? 'Allocate' : 'Re-Allocate'}
                      </button>

                      {/* Preview (only if allocated) */}
                      {exam.status !== 'not_created' && (
                        <button
                          onClick={() => handlePreview(exam.exam_id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-650 transition"
                        >
                          <Eye className="w-3 h-3" /> Preview
                        </button>
                      )}

                      {/* Publish / Unpublish */}
                      {exam.status !== 'not_created' && (
                        exam.status === 'published'
                          ? <button onClick={() => setModal({ examId: exam.exam_id, action: 'unpublish' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-lg hover:bg-red-100 transition">
                              <EyeOff className="w-3 h-3" /> Unpublish
                            </button>
                          : <button onClick={() => setModal({ examId: exam.exam_id, action: 'publish' })} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition">
                              <Globe className="w-3 h-3" /> Publish
                            </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {statuses.length === 0 && (
            <div className="py-16 text-center text-gray-400 font-medium">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
              No exams scheduled yet. Create exams first, then allocate seating.
            </div>
          )}
        </div>
      </div>

      {/* Preview Drawer */}
      {preview && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Preview — Exam ID: <code className="text-xs bg-gray-200 dark:bg-gray-900 px-1.5 py-0.5 rounded dark:text-gray-300">{preview.examId}</code></h2>
              <StatusBadge status={preview.status} />
            </div>
            <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-750 transition"><X className="w-5 h-5" /></button>
          </div>
          {preview.arrangements?.map((arr, idx) => (
            <div key={idx} className="p-6 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-black text-gray-900 dark:text-gray-100">Room {arr.room_number}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{arr.seat_plan?.length} seats allocated</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs divide-y divide-gray-100 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/30">
                    <tr>
                      <th className="px-3 py-2 text-left font-bold text-gray-500 dark:text-gray-400">Seat</th>
                      <th className="px-3 py-2 text-left font-bold text-gray-500 dark:text-gray-400">Student</th>
                      <th className="px-3 py-2 text-left font-bold text-gray-500 dark:text-gray-400">Roll No.</th>
                      <th className="px-3 py-2 text-left font-bold text-gray-500 dark:text-gray-400">Department</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {arr.seat_plan?.slice(0, 20).map((seat, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-3 py-2 font-black text-primary-700 dark:text-primary-400">{seat.seat_number}</td>
                        <td className="px-3 py-2 font-semibold text-gray-900 dark:text-gray-100">{seat.student_name}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{seat.roll_number || '—'}</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{seat.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {arr.seat_plan?.length > 20 && <p className="text-center text-xs text-gray-400 py-3">... and {arr.seat_plan.length - 20} more seats</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeatingGenerator;
