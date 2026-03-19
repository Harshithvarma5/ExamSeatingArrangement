import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, GraduationCap } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';

const Sidebar = ({ navigation }) => {
  const { logout, user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col hidden md:flex transition-colors">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <GraduationCap className="h-8 w-8 text-primary-600 mr-2" />
        <span className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight">ExamSeat</span>
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="mb-6 px-2 text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.2em]">
          {user?.role} Menu
        </div>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm ring-1 ring-primary-100 dark:ring-primary-900/50'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${item.iconColor || ''}`} aria-hidden="true" />
            {t(item.name)}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-700 dark:hover:text-red-400 transition-all group border border-transparent hover:border-red-100 dark:hover:border-red-900/20"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
          {t('logout')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
