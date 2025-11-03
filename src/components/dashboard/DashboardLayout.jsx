'use client';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-[#101014]' : 'bg-[#FAFAFA]'
      }`}
    >
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className='lg:pl-64'>
        {/* Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className='p-4 sm:p-6 lg:p-8'>{children}</main>
      </div>
    </div>
  );
}
