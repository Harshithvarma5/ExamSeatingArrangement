import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { LanguageContext } from '../context/LanguageContext';
import { Bell, User, Sun, Moon, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const { user } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { lang, setLang, t } = useContext(LanguageContext);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-6 shrink-0 shadow-sm z-10 transition-colors">
      <div className="text-xl font-black text-gray-800 dark:text-gray-100 hidden sm:block tracking-tight">
        {t('dashboard')} <span className="text-primary-600 font-black">SmartExam</span>
      </div>
      <div className="flex items-center space-x-3 ml-auto">
        {/* Language Switcher */}
        <button 
          onClick={() => {
            const langs = ['en', 'hi', 'te'];
            const nextIdx = (langs.indexOf(lang) + 1) % langs.length;
            setLang(langs[nextIdx]);
          }}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500 flex items-center gap-1.5 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          title="Switch Language"
        >
          <Languages className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-tighter">{lang}</span>
        </button>

        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <Link 
          to={`/${user?.role?.toLowerCase()}/notifications`}
          className="text-gray-500 hover:text-primary-600 relative p-2 rounded-xl hover:bg-primary-50 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-primary-100 dark:hover:border-gray-700"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900 animate-pulse" />
        </Link>

        <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-4 py-1">
          <div className="h-9 w-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-black border border-primary-200 dark:border-primary-800 shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-black text-gray-800 dark:text-gray-200 leading-tight">
              {user?.name}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
