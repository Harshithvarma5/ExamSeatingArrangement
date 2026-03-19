import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Bell, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const NotificationInbox = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications/my-notifications')
      .then(res => setNotifications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'High': return 'bg-white dark:bg-gray-800 border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 shadow-red-500/5';
      case 'Low':  return 'bg-white dark:bg-gray-800 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 shadow-blue-500/5';
      default:     return 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High': return AlertTriangle;
      case 'Low':  return Info;
      default:     return Bell;
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-gray-400 font-bold">Loading inbox...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50">Notification Inbox</h1>
        <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-xs font-black uppercase">
          {notifications.length} Messages
        </span>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-700 p-12 text-center">
            <Bell className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 dark:text-gray-500 font-bold">Your inbox is empty</p>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Check back later for important exam updates.</p>
          </div>
        ) : (
          notifications.map(n => {
            const Icon = getPriorityIcon(n.priority);
            const style = getPriorityStyles(n.priority);
            return (
              <div key={n._id} className={`p-5 rounded-2xl border transition-all hover:shadow-lg ${style} group`}>
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${n.priority === 'High' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-300'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-black text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors uppercase tracking-tight">{n.title}</h3>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium leading-relaxed">{n.message}</p>
                    <div className="mt-3 flex items-center gap-2">
                       <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-black px-2 py-0.5 rounded-md uppercase border dark:border-gray-600">From: Admin</span>
                       <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${n.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                         {n.priority} Priority
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationInbox;
