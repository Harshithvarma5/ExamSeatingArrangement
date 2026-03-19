import React, { useState, useEffect } from 'react';
import { Save, Shield, Server, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('Security');
  const [settings, setSettings] = useState({
    requireAlphanumeric: true,
    minLength: 8,
    mfaEnabled: false,
    defaultExamDuration: 180,
    timezone: 'UTC'
  });
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        setSettings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaveStatus('Saving...');
      await api.post('/admin/settings', settings);
      setSaveStatus('Saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus('Error saving preferences');
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="p-6 text-gray-500 font-medium animate-pulse">Loading system preferences...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Preferences</h1>
        {saveStatus && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-2 rounded-lg font-bold text-sm shadow-sm animate-pulse">
            <CheckCircle2 className="w-5 h-5" /> {saveStatus}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-2 px-4 pt-2" aria-label="Tabs">
            <div 
              onClick={() => setActiveTab('Security')}
              className={`py-4 px-4 text-sm font-bold flex items-center gap-2 transition-all cursor-pointer rounded-t-xl ${activeTab === 'Security' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-b-2 border-transparent'}`}
            >
              <Shield className="w-5 h-5" /> Security Protocol
            </div>
            <div 
              onClick={() => setActiveTab('Branding')}
              className={`py-4 px-4 text-sm font-bold flex items-center gap-2 transition-all cursor-pointer rounded-t-xl ${activeTab === 'Branding' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-b-2 border-transparent'}`}
            >
              <Server className="w-5 h-5" /> Institutional Branding
            </div>
            <div 
              onClick={() => setActiveTab('App')}
              className={`py-4 px-4 text-sm font-bold flex items-center gap-2 transition-all cursor-pointer rounded-t-xl ${activeTab === 'App' ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 border-b-2 border-transparent'}`}
            >
              <Server className="w-5 h-5" /> Application Defaults
            </div>
          </nav>
        </div>

        <div className="p-8 space-y-8 min-h-[400px]">
          {activeTab === 'Security' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <h3 className="text-xl font-bold text-gray-900">Password Standards</h3>
              <p className="text-sm text-gray-500 mb-6">Enforce minimum standards for all student and staff authentications.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div 
                  className="flex items-center gap-4 bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-primary-300 transition-colors" 
                  onClick={() => handleChange('requireAlphanumeric', !settings.requireAlphanumeric)}
                >
                  <input type="checkbox" checked={settings.requireAlphanumeric} readOnly className="w-5 h-5 text-primary-600 rounded cursor-pointer" />
                  <label className="text-sm font-bold text-gray-700 cursor-pointer">Require Alphanumeric Combination</label>
                </div>
                <div className="flex items-center justify-between gap-4 bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm focus-within:border-primary-400 transition-colors">
                  <label className="text-sm font-bold text-gray-700">Minimum Password Length</label>
                  <input type="number" min="4" max="32" value={settings.minLength} onChange={(e) => handleChange('minLength', parseInt(e.target.value))} className="w-20 border border-gray-300 rounded-lg p-2 text-center font-black text-gray-900 outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 mt-8">
                <h3 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 mb-6">Deploy multi-factor authentication for administrative actions.</p>
                <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between border-2 p-6 rounded-2xl transition-all duration-300 ${settings.mfaEnabled ? 'bg-primary-50 border-primary-300 shadow-md' : 'bg-white border-gray-200'}`}>
                  <div className="mb-4 sm:mb-0 max-w-lg">
                    <h4 className={`text-base font-black ${settings.mfaEnabled ? 'text-primary-900' : 'text-gray-900'}`}>System Admin MFA Protocol</h4>
                    <p className={`text-sm mt-1.5 leading-relaxed font-medium ${settings.mfaEnabled ? 'text-primary-700' : 'text-gray-500'}`}>
                      {settings.mfaEnabled 
                        ? 'Status: ONLINE. The system will dispatch OTP codes to Admins logging in from novel IP addresses and unrecognized devices.' 
                        : 'Status: OFFLINE. Enabling MFA prevents unauthorized administrative access.'}
                    </p>
                  </div>
                <button 
                    onClick={() => handleChange('mfaEnabled', !settings.mfaEnabled)} 
                    className={`flex-shrink-0 px-8 py-3 text-sm font-bold rounded-xl shadow-sm transition-all border ${settings.mfaEnabled ? 'bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:shadow-red-500/10' : 'bg-primary-600 text-white border-primary-500 hover:bg-primary-700 hover:shadow-primary-600/20'}`}
                  >
                    {settings.mfaEnabled ? 'Disable Protocol' : 'Initialize Protocol'}
                  </button>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 mt-8">
                <h3 className="text-xl font-bold text-gray-900">Network Gateway Control</h3>
                <p className="text-sm text-gray-500 mb-6">Restrict student logins to dedicated college Wi-Fi or local networks.</p>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <label className="block text-sm font-bold text-gray-800 mb-2">Allowed College IP Ranges (CSV)</label>
                  <input 
                    type="text" 
                    value={settings.allowedIpRange || ''} 
                    onChange={(e) => handleChange('allowedIpRange', e.target.value)} 
                    className="w-full bg-white border border-gray-300 rounded-xl p-3.5 text-gray-900 font-mono text-sm outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                    placeholder="e.g. 192.168.1.1, 10.0.0.1"
                  />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-3 leading-relaxed">
                    Leave empty to allow logins from any network. Student logins will be rejected with a 403 Forbidden error if they originate from an IP not listed here (except localhost/::1).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Branding' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Institutional Identity</h3>
                <p className="text-sm text-gray-500">Customize how your institution appears across the platform.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">Institution Name</label>
                  <input type="text" value={settings.institutionName || ''} onChange={(e) => handleChange('institutionName', e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3.5 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-primary-500 shadow-sm" placeholder="e.g. Smart University" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">Logo Image URL</label>
                  <input type="text" value={settings.logoUrl || ''} onChange={(e) => handleChange('logoUrl', e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3.5 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-primary-500 shadow-sm" placeholder="https://example.com/logo.png" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">Primary Theme Color</label>
                  <div className="flex gap-4 items-center">
                    <input type="color" value={settings.primaryColor || '#0f172a'} onChange={(e) => handleChange('primaryColor', e.target.value)} className="w-16 h-12 rounded-lg border-0 cursor-pointer p-0" />
                    <input type="text" value={settings.primaryColor || '#0f172a'} onChange={(e) => handleChange('primaryColor', e.target.value)} className="flex-1 bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 font-mono font-bold outline-none focus:ring-2 focus:ring-primary-500 shadow-sm" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Applied to buttons, headers, and active states</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">Secondary Accent Color</label>
                  <div className="flex gap-4 items-center">
                    <input type="color" value={settings.secondaryColor || '#2563eb'} onChange={(e) => handleChange('secondaryColor', e.target.value)} className="w-16 h-12 rounded-lg border-0 cursor-pointer p-0" />
                    <input type="text" value={settings.secondaryColor || '#2563eb'} onChange={(e) => handleChange('secondaryColor', e.target.value)} className="flex-1 bg-gray-50 border border-gray-300 rounded-xl p-3 text-gray-900 font-mono font-bold outline-none focus:ring-2 focus:ring-primary-500 shadow-sm" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Applied to links and secondary UI elements</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'App' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Global Application Limits</h3>
                <p className="text-sm text-gray-500 mb-6">Define macro limits for new schedules and generation logic.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">Default Exam Duration (Minutes)</label>
                  <input type="number" step="10" value={settings.defaultExamDuration} onChange={(e) => handleChange('defaultExamDuration', parseInt(e.target.value))} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3.5 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-shadow shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">Localization Timezone</label>
                  <select value={settings.timezone} onChange={(e) => handleChange('timezone', e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3.5 text-gray-900 font-bold outline-none focus:ring-2 focus:ring-primary-500 transition-shadow shadow-sm">
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                    <option value="PST">PST (Pacific Standard Time)</option>
                    <option value="IST">IST (India Standard Time)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-gray-100 mt-8 flex justify-end">
             <button onClick={handleSave} className="bg-gray-900 text-white shadow-xl shadow-gray-900/20 font-extrabold px-10 py-3.5 rounded-xl flex items-center gap-3 hover:bg-black transition-all hover:scale-[1.02]">
                <Save className="w-5 h-5" /> Commit Settings
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SystemSettings;
