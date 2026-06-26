'use client';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { SearchProvider } from '@/context/SearchContext';
import SecureRoute from '@/components/auth/SecureRoute';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RealtimeNotifications from './RealtimeNotifications';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDarkMode } = useTheme();

  return (
    <SecureRoute>
      {/* Live notification socket (toasts + bell) for both admin and investor. */}
      <RealtimeNotifications />
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDarkMode ? 'bg-[#101014]' : 'bg-[#FAFAFA]'
        }`}
      >
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className='lg:pl-64'>
          <SearchProvider>
            {/* Navbar */}
            <Navbar onMenuClick={() => setSidebarOpen(true)} />

            {/* Page Content */}
            <main className='p-4 sm:p-6 lg:p-8'>{children}</main>
          </SearchProvider>
        </div>
      </div>
    </SecureRoute>
  );
}
