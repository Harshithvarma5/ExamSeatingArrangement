import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, BookOpen, Building2, BarChart3, CheckCircle, Clock, XCircle, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-5`}>
    <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${color}`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-black text-gray-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 font-medium mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AnalyticsReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-400 font-bold animate-pulse">Loading analytics...</div>;
  if (!data) return null;

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4'];
  
  const deptData = data.dept_breakdown || [];
  const attendanceData = [
    { name: 'Present', value: data.attendance?.present || 0, fill: '#10b981' },
    { name: 'Absent', value: data.attendance?.absent || 0, fill: '#ef4444' },
    { name: 'Pending', value: data.attendance?.pending || 0, fill: '#eab308' },
  ];

  return (
    <div className="space-y-7">
      <h1 className="text-2xl font-black text-gray-900">Advanced Analytics</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard icon={Users} label="Total Students" value={data.total_students} color="bg-blue-500" />
        <StatCard icon={Users} label="Total Staff" value={data.total_staff} color="bg-indigo-500" />
        <StatCard icon={Building2} label="Total Rooms" value={data.total_rooms} color="bg-emerald-500" />
        <StatCard icon={BookOpen} label="Total Exams" value={data.total_exams} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students by Department - Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-pink-100 rounded-xl flex items-center justify-center">
              <PieIcon className="w-5 h-5 text-pink-600" />
            </div>
            <h2 className="text-base font-black text-gray-900">Student Distribution</h2>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie 
                  data={deptData} 
                  dataKey="count" 
                  nameKey="department" 
                  cx="50%" cy="50%" 
                  innerRadius={60} 
                  outerRadius={100} 
                  paddingAngle={5}
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Summary - Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-base font-black text-gray-900">Attendance Status</h2>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Status Tracking & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
             <h2 className="text-base font-black text-gray-900 mb-6 flex items-center gap-2">
               <Clock className="w-4 h-4 text-primary-500" /> Exam Pipeline
             </h2>
             <div className="space-y-4">
                {data.exam_by_status?.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-sm font-bold text-gray-600 uppercase tracking-tighter">{s.status}</span>
                    <span className="text-xl font-black text-gray-900">{s.count}</span>
                  </div>
                ))}
             </div>
          </div>
          
          <div className="lg:col-span-2 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
             <div className="relative z-10">
                <h2 className="text-2xl font-black mb-2">System Performance</h2>
                <p className="text-primary-100 text-sm font-medium max-w-md">Your exam seating system is currently processing {data.published_exams} published schedules with {data.total_rooms} rooms utilized.</p>
                <div className="mt-8">
                   <div>
                      <p className="text-[10px] font-black uppercase text-primary-200 tracking-widest">Allocated Students</p>
                      <p className="text-4xl font-black mt-1">{data.total_students}</p>
                   </div>
                </div>
             </div>
             {/* Abstract background shape */}
             <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
             <div className="absolute top-0 right-0 p-4 opacity-20"><TrendingUp className="w-32 h-32" /></div>
          </div>
      </div>
    </div>
  );
};

export default AnalyticsReports;
