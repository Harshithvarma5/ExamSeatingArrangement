import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, AlertCircle, GraduationCap, Fingerprint, Sparkles, ArrowRight } from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(identifier, password);
      setTimeout(() => {
        if (user.role === 'Admin') navigate('/admin');
        else if (user.role === 'Staff') navigate('/staff');
        else navigate('/student');
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to authenticate');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-600 rounded-full mix-blend-screen filter blur-[128px] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-40 animate-pulse delay-1000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="mx-auto w-16 h-16 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20 shadow-xl mb-6 transform hover:scale-105 transition-transform duration-500">
          <GraduationCap className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
          ExamSpace <span className="text-primary-400 font-light">Pro</span>
        </h2>
        <p className="mt-3 text-sm text-gray-400 font-medium tracking-wide uppercase">
          Intelligent Seating Management
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-xl py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-10 border border-white/10">
          
          {/* Smart Badge */}
          <div className="flex items-center justify-center gap-2 bg-white/5 border border-green-500/30 px-4 py-2.5 rounded-full mb-8 text-xs font-bold text-green-400 tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Smart Auto-Role Detection
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-200 text-sm animate-pulse">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                {error}
              </div>
            )}
            
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-primary-400">
                Email Address or Roll Number
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-12 sm:text-sm bg-gray-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="admin@university.edu or 2026CSE001"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-primary-400">Secure Password</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-12 sm:text-sm bg-gray-900/50 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-xl shadow-2xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-gray-900 overflow-hidden group transition-all"
            >
              <span className={`flex items-center gap-2 transition-all duration-300 ${loading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
                Authenticate Securely <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
