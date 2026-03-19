import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { User, Phone, Building2, Save, Lock, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronic & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "All Departments"
];

const Toast = ({ msg, type, onClose }) => {
  if (!msg) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl font-bold text-sm text-white animate-in slide-in-from-bottom-4 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
      {msg}
    </div>
  );
};

const UserProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({ name: '', phone: '', department: '' });
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api.get('/user/profile').then(r => {
      setProfile({ name: r.data.name || '', phone: r.data.phone || '', department: r.data.department || '' });
    }).catch(console.error);
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (profile.phone && !/^\d{10}$/.test(profile.phone)) {
      showToast('Phone number must be exactly 10 digits', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.put('/user/profile', { name: profile.name, phone: profile.phone, department: profile.department });
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm) {
      showToast('New passwords do not match', 'error'); return;
    }
    if (pwdForm.new_password.length < 6) {
      showToast('Password must be at least 6 characters', 'error'); return;
    }
    setSaving(true);
    try {
      await api.post('/user/change-password', { current_password: pwdForm.current_password, new_password: pwdForm.new_password });
      showToast('Password changed successfully!');
      setPwdForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Password change failed', 'error');
    } finally { setSaving(false); }
  };

  const initials = profile.name ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  const roleColors = { Admin: 'bg-purple-600', Staff: 'bg-blue-600', Student: 'bg-green-600' };
  const roleColor = roleColors[user?.role] || 'bg-gray-600';

  return (
    <div className="max-w-2xl space-y-6">
      <Toast msg={toast?.msg} type={toast?.type} />
      <h1 className="text-2xl font-black text-gray-900 dark:text-gray-50">My Profile</h1>

      {/* Avatar Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center gap-5">
        <div className={`w-20 h-20 rounded-2xl ${roleColor} flex items-center justify-center text-white text-2xl font-black shadow-lg`}>
          {initials}
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-gray-50">{profile.name || user?.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">{user?.email}</p>
          <span className={`inline-block mt-2 px-3 py-0.5 text-xs font-black rounded-full text-white ${roleColor}`}>{user?.role}</span>
          {user?.roll_number && <span className="ml-2 text-xs font-bold text-gray-500 dark:text-gray-400">Roll: {user.roll_number}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[['profile', 'Edit Profile', User], ['password', 'Change Password', Lock]].map(([id, label, Icon]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors ${activeTab === id ? 'border-b-2 border-primary-500 text-primary-700 dark:text-primary-400 bg-primary-50/40 dark:bg-primary-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900/50'}`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        <div className="p-7">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input type="text" required value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-950 transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <input type="tel" 
                    value={profile.phone} 
                    onChange={e => setProfile({...profile, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    placeholder="10-digit Mobile Number"
                    pattern="\d{10}"
                    maxLength="10"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-950 transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Department</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <select 
                    value={profile.department} 
                    onChange={e => setProfile({...profile, department: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-950 transition appearance-none"
                  >
                    <option value="" className="dark:bg-gray-900">Select Department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept} className="dark:bg-gray-900">{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 transition disabled:opacity-60">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-5">
              {[
                { label: 'Current Password', key: 'current_password', show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                { label: 'New Password', key: 'new_password', show: showNew, toggle: () => setShowNew(!showNew) },
                { label: 'Confirm New Password', key: 'confirm', show: showNew, toggle: () => setShowNew(!showNew) },
              ].map(({ label, key, show, toggle }) => (
                <div key={key}>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input type={show ? 'text' : 'password'} required value={pwdForm[key]}
                      onChange={e => setPwdForm({ ...pwdForm, [key]: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-950 transition" />
                    <button type="button" onClick={toggle} className="absolute right-3.5 top-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <button type="submit" disabled={saving} className="w-full bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white font-black py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-60">
                <Lock className="w-4 h-4" /> {saving ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
