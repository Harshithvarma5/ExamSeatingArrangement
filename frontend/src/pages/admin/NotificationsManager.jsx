import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Send, Bell, Trash2 } from 'lucide-react';

const NotificationsManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('All');
  
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    try {
      await api.post('/admin/notifications', { message, targetRole });
      setMessage('');
      fetchNotifications();
    } catch (err) {
      alert('Failed to send notification');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete notification?')) {
      try {
        await api.delete(`/admin/notifications/${id}`);
        fetchNotifications();
      } catch (err) {}
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Broadcast Notifications</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Compose Global Alert</h2>
          <form className="flex flex-col md:flex-row gap-4 items-start" onSubmit={handleSend}>
            <div className="flex-1 w-full">
              <textarea 
                rows="3"
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Type an announcement to send to students and staff..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              ></textarea>
            </div>
            <div className="w-full md:w-1/4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <select 
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary-500"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
              >
                <option value="All">Everyone</option>
                <option value="Student">Students Only</option>
                <option value="Staff">Staff/Invigilators Only</option>
              </select>
              <button type="submit" className="mt-4 w-full bg-primary-600 text-white font-bold rounded-lg px-4 py-2.5 flex justify-center items-center gap-2 hover:bg-primary-700 transition shadow-sm">
                <Send className="w-4 h-4" /> Broadcast
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Message Log</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Audience</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date/Time</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {notifications.map(n => (
                <tr key={n._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 border-l-4 border-l-primary-500 font-medium">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4 text-primary-500 flex-shrink-0" />
                      {n.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="bg-gray-100 text-gray-800 border border-gray-200 px-3 py-1 rounded-md text-xs font-bold">{n.targetRole || 'All'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{new Date(n.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button onClick={() => handleDelete(n._id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {notifications.length === 0 && <div className="p-12 text-center text-gray-500 font-medium">No broadcasts sent yet. Use the form above to announce something!</div>}
        </div>
      </div>
    </div>
  );
};
export default NotificationsManager;
