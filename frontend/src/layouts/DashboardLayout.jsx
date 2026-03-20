import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const DashboardLayout = ({ children, navigation }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on window resize if it transitions to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-[100dvh] w-full bg-gray-50/50 dark:bg-gray-950 transition-colors overflow-hidden select-none">
      <Sidebar 
        navigation={navigation} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={() => setIsSidebarOpen(prev => !prev)} 
        />
        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto space-y-6 min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
