import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { LayoutDashboard, Users, DoorOpen, CalendarDays, Settings, Bell, ClipboardList, ShieldCheck, BarChart3 } from 'lucide-react';

import AdminOverview from './admin/AdminOverview';
import ManageUsers from './admin/ManageUsers';
import ManageRooms from './admin/ManageRooms';
import ManageExams from './admin/ManageExams';
import SeatingGenerator from './admin/SeatingGenerator';
import AdminCommunications from './admin/AdminCommunications';
import SystemSettings from './admin/SystemSettings';
import AnalyticsReports from './admin/AnalyticsReports';
import AuditLogs from './admin/AuditLogs';
import UserProfile from './UserProfile';
import AIAssistant from '../components/AIAssistant';

const AdminDashboard = () => {
  const navigation = [
    { name: 'dashboard', href: '/admin', icon: LayoutDashboard, end: true },
    { name: 'manage_users', href: '/admin/users', icon: Users },
    { name: 'manage_rooms', href: '/admin/rooms', icon: DoorOpen },
    { name: 'manage_exams', href: '/admin/exams', icon: CalendarDays },
    { name: 'seating_generation', href: '/admin/seating', icon: ClipboardList },
    { name: 'analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'audit_logs', href: '/admin/audit', icon: ShieldCheck },
    { name: 'notifications', href: '/admin/notifications', icon: Bell },
    { name: 'profile', href: '/admin/profile', icon: Users },
    { name: 'settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <DashboardLayout navigation={navigation}>
      <AIAssistant />
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/users" element={<ManageUsers />} />
        <Route path="/rooms" element={<ManageRooms />} />
        <Route path="/exams" element={<ManageExams />} />
        <Route path="/seating" element={<SeatingGenerator />} />
        <Route path="/analytics" element={<AnalyticsReports />} />
        <Route path="/audit" element={<AuditLogs />} />
        <Route path="/notifications" element={<AdminCommunications />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/settings" element={<SystemSettings />} />
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
