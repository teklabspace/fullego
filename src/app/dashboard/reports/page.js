'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ScheduleView from '@/components/reports/ScheduleView';
import TasksView from '@/components/reports/TasksView';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

export default function ReportsPage() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className='mb-8'>
          <h1
            className={`text-3xl md:text-4xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {activeTab === 'tasks' ? 'Reports' : 'Schedule Management'}
          </h1>
          <p className='text-gray-400 text-sm md:text-base'>
            {activeTab === 'tasks'
              ? 'For advisors to manage contacts/tasks'
              : 'For tracking upcoming activities'}
          </p>
        </div>

        {/* Tabs */}
        <div className='flex gap-3 mb-8 overflow-x-auto scrollbar-hide pb-2'>
          {/* Tasks Tab */}
          {activeTab === 'tasks' && isDarkMode ? (
            <div
              className='rounded-full p-px'
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              }}
            >
              <button
                onClick={() => setActiveTab('tasks')}
                className='px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all bg-gradient-to-r from-[#222126] to-[#111116] text-white w-full'
              >
                Tasks 12
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'tasks'
                  ? 'bg-gray-200 text-gray-900 border border-gray-300'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-white/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Tasks 12
            </button>
          )}

          {/* Updates Tab */}
          {activeTab === 'updates' && isDarkMode ? (
            <div
              className='rounded-full p-px'
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              }}
            >
              <button
                onClick={() => setActiveTab('updates')}
                className='px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all bg-gradient-to-r from-[#222126] to-[#111116] text-white w-full'
              >
                Updates 24
              </button>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('updates')}
              className={`px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'updates'
                  ? 'bg-gray-200 text-gray-900 border border-gray-300'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-white hover:bg-white/5'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Updates 24
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'tasks' ? (
          <TasksView isDarkMode={isDarkMode} />
        ) : (
          <ScheduleView isDarkMode={isDarkMode} />
        )}
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </DashboardLayout>
  );
}
