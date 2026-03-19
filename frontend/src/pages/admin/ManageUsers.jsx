import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Plus, Trash2, Upload, Download, FileText, CheckCircle2, AlertTriangle, X, Accessibility } from 'lucide-react';

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronic & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "All Departments"
];

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Student', department: '', roll_number: '', needs_accessibility: false });
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [exportRole, setExportRole] = useState('Student');
  const [filterDept, setFilterDept] = useState('All Departments');
  const fileInputRef = useRef(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', form);
      setForm({ name: '', email: '', password: '', role: 'Student', department: '', roll_number: '', needs_accessibility: false });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    }
  };

  // ── Export CSV
  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/admin/users/export?role=${exportRole}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportRole.toLowerCase()}s_export.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed');
    }
  };

  // ── Import CSV
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/admin/users/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImportResult({ ...res.data, type: 'success' });
      fetchUsers();
    } catch (err) {
      setImportResult({ message: err.response?.data?.message || 'Import failed', type: 'error' });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const downloadTemplate = () => {
    const header = 'name,email,password,role,department,roll_number\n';
    const sample = 'John Doe,john@college.edu,pass123,Student,Computer Science,2026CSE001\n';
    const blob = new Blob([header + sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Manage Users</h1>
      </div>

      {/* ── Import / Export Panel ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Import Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Bulk Import Students</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Upload a CSV file to add hundreds of students at once</p>
            </div>
          </div>

          <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleImport} />

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={importing}
              className="flex-1 bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {importing ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Importing...</>
              ) : (
                <><Upload className="w-4 h-4" /> Choose CSV File</>
              )}
            </button>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition text-sm"
            >
              <FileText className="w-4 h-4" /> Template
            </button>
          </div>

          {importResult && (
            <div className={`mt-4 p-4 rounded-xl border flex gap-3 ${
              importResult.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {importResult.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
              <div className="min-w-0">
                <p className="font-bold text-sm">{importResult.message}</p>
                {importResult.errors?.length > 0 && (
                  <ul className="mt-2 text-xs space-y-0.5 font-medium opacity-80 list-disc list-inside">
                    {importResult.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                    {importResult.errors.length > 5 && <li>...and {importResult.errors.length - 5} more</li>}
                  </ul>
                )}
              </div>
              <button onClick={() => setImportResult(null)} className="ml-auto flex-shrink-0"><X className="w-4 h-4" /></button>
            </div>
          )}

          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 font-medium">
            CSV columns required: <code className="bg-gray-100 dark:bg-gray-900 px-1 rounded dark:text-gray-300">name, email, password, role, department, roll_number</code>
          </p>
        </div>

        {/* Export Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Export User Data</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Download a full backup of student or staff records as CSV</p>
            </div>
          </div>

          <div className="flex gap-3">
            <select
              value={exportRole}
              onChange={e => setExportRole(e.target.value)}
              className="flex-1 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Student">All Students</option>
              <option value="Staff">All Staff</option>
              <option value="Admin">All Admins</option>
            </select>
            <button
              onClick={handleExport}
              className="flex-1 bg-green-600 text-white font-bold py-2.5 px-4 rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" /> Download CSV
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-400 font-medium">
            The exported file will include all profile fields except passwords (for security).
          </p>
        </div>
      </div>

      {/* ── Add Single User Form ────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Add Single User</h2>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
            <input type="text" placeholder="Full Name" required className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            <input type="email" placeholder="Email" required className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <input type="password" placeholder="Password" required className="border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            
            <select className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="Student">Student</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
            
            {form.role === 'Student' && (
              <>
                <select 
                  className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500 font-medium text-gray-700 bg-white" 
                  value={form.department} 
                  onChange={e => setForm({...form, department: e.target.value})}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <input type="text" placeholder="Roll Number" className="border rounded-lg px-3 py-2 w-full outline-none focus:ring-2 focus:ring-primary-500" value={form.roll_number} onChange={e => setForm({...form, roll_number: e.target.value})} />
                
                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border dark:border-gray-700">
                  <input 
                    type="checkbox" 
                    checked={form.needs_accessibility} 
                    onChange={e => setForm({...form, needs_accessibility: e.target.checked})}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Accessibility className="w-3 h-3" /> Accessibility Need
                  </span>
                </label>
              </>
            )}
            
            <button type="submit" className="bg-primary-600 text-white rounded-lg px-4 py-2 hover:bg-primary-700 flex items-center justify-center gap-2 font-medium">
              <Plus className="w-4 h-4" /> Add User
            </button>
          </form>
        </div>

        {/* ── Users Table ──────────────────────────────────────────── */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">User List</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Filter Dept:</span>
            <select 
              value={filterDept} 
              onChange={e => setFilterDept(e.target.value)}
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50 dark:bg-gray-900"
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dept / Roll</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
              {users.filter(u => filterDept === 'All Departments' || u.department === filterDept).map(user => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    {user.name}
                    {user.needs_accessibility && (
                      <span className="p-1 bg-blue-100 text-blue-700 rounded-md shadow-sm" title="Needs Accessibility Priority">
                        <Accessibility className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${user.role === 'Admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' : user.role === 'Staff' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.department} {user.roll_number ? `/ ${user.roll_number}` : ''}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-400 font-medium">No users yet. Import a CSV file or add one above.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
