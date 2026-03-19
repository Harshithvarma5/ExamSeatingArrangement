import React, { useState } from 'react';
import api from '../../services/api';
import { Send, Bell, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';

const AdminCommunications = () => {
  const [form, setForm] = useState({ title: '', message: '', target_dept: 'All Departments', priority: 'Normal' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const DEPARTMENTS = [
    "Computer Science",
    "Information Technology",
    "Electronic & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Business Administration",
    "All Departments"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/notifications/broadcast', form);
      setStatus({ type: 'success', msg: 'Broadcast sent successfully!' });
      setForm({ title: '', message: '', target_dept: 'All Departments', priority: 'Normal' });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to send broadcast' });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Communication Center</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">Broadcast Message</h2>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Send update to students & staff</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Message Title</label>
            <input 
              type="text" required 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})}
              placeholder="e.g. Exam Schedule Update"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-900 bg-gray-50" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Target Department</label>
              <select 
                value={form.target_dept} 
                onChange={e => setForm({...form, target_dept: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-bold text-gray-700 bg-gray-50 appearance-none"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Priority</label>
              <select 
                value={form.priority} 
                onChange={e => setForm({...form, priority: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-bold text-gray-700 bg-gray-50 appearance-none"
              >
                <option value="Normal">Normal</option>
                <option value="High">High (Red Alert)</option>
                <option value="Low">Low (General Info)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Message Content</label>
            <textarea 
              required rows="4"
              value={form.message} 
              onChange={e => setForm({...form, message: e.target.value})}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-900 bg-gray-50 resize-none"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            {loading ? "Sending..." : <><Send className="w-5 h-5" /> Send Broadcast</>}
          </button>

          {status && (
            <div className={`flex items-center gap-2 justify-center font-bold text-sm ${status.type === 'success' ? 'text-green-600' : 'text-red-600'} animate-pulse`}>
              {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              {status.msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminCommunications;
