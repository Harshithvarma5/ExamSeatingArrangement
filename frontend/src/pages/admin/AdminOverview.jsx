import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, DoorOpen, CalendarDays, TrendingUp } from 'lucide-react';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    total_students: 0,
    total_staff: 0,
    total_rooms: 0,
    total_exams: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { name: 'Total Students', value: stats.total_students, icon: Users, color: 'bg-blue-500' },
    { name: 'Total Staff', value: stats.total_staff, icon: TrendingUp, color: 'bg-indigo-500' },
    { name: 'Exam Rooms', value: stats.total_rooms, icon: DoorOpen, color: 'bg-emerald-500' },
    { name: 'Scheduled Exams', value: stats.total_exams, icon: CalendarDays, color: 'bg-amber-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center space-x-4 transition-transform hover:-translate-y-1 hover:shadow-md">
            <div className={`p-4 rounded-xl text-white ${card.color} shadow-inner`}>
              <card.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{card.name}</p>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Activity</h2>
        <div className="text-gray-500 dark:text-gray-400 text-sm italic py-12 text-center bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          No recent activity to show in this demo instance.
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
