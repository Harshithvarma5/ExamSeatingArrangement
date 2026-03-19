import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ClipboardList, ShieldCheck, ShieldAlert, Wifi, Monitor } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-50 flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-primary-600" /> Security Audit Trail
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Real-time monitoring of all authentication attempts and system updates.
          </p>
        </div>
        <button 
          onClick={fetchLogs}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
        >
          Refresh Feed
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Type</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">User / Identifier</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Location Info</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 h-16"></td>
                  </tr>
                ))
              ) : logs.map(log => (
                <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${log.status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                        {log.status === 'success' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tight">Login Attempt</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-black text-gray-800 dark:text-gray-200">{log.email}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">{log.role || 'Unauthenticated'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter ${log.status === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400">
                      <Wifi className="w-3 h-3" /> {log.ip}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400 mt-1 truncate max-w-[200px]">
                      <Monitor className="w-3 h-3 flex-shrink-0" /> {log.user_agent}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && logs.length === 0 && (
            <div className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest bg-gray-50 dark:bg-gray-900/20">
              No audit logs recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
