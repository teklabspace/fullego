'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getComplianceDashboard,
  listComplianceTasks,
  getComplianceTask,
  completeComplianceTask,
  reassignComplianceTask,
} from '@/utils/complianceApi';

export default function CompliancePage() {
  const { isDarkMode } = useTheme();
  const [dateRange, setDateRange] = useState('5th Jan - 30th Jan');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingTask, setLoadingTask] = useState(false);
  
  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getComplianceDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
        toast.error('Failed to load compliance dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await listComplianceTasks({ limit: 50 });
        const tasks = response.data || [];
        
        // Transform tasks to match UI format
        const transformedTasks = tasks.map(task => ({
          id: task.id,
          taskName: task.taskName || task.task_name,
          assignee: task.assignee?.name || 'Unassigned',
          assigneeId: task.assignee?.id,
          dueDate: formatDate(task.dueDate || task.due_date),
          status: capitalizeFirst(task.status || 'pending'),
          statusColor: getStatusColor(task.status || 'pending'),
          priority: task.priority || 'medium',
          description: task.description || '',
          category: task.category || '',
        }));
        
        setPendingTasks(transformedTasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        toast.error('Failed to load compliance tasks');
      }
    };

    fetchTasks();
  }, []);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'overdue') return 'text-red-400';
    if (statusLower === 'pending') return 'text-[#F1CB68]';
    if (statusLower === 'completed') return 'text-green-400';
    return 'text-gray-400';
  };

  // Summary cards from dashboard data
  const summaryCards = dashboardData ? [
    {
      title: 'Compliance Score',
      value: `${dashboardData.complianceScore || 0}%`,
      change: dashboardData.complianceScoreChange 
        ? `${dashboardData.complianceScoreChange > 0 ? '+' : ''}${dashboardData.complianceScoreChange}%`
        : 'No change',
      changeColor: dashboardData.complianceScoreChange > 0 ? 'text-green-400' : 'text-gray-400',
      progress: dashboardData.complianceScore || 0,
    },
    {
      title: 'Pending Audits',
      value: `${dashboardData.pendingAuditsCount || 0}`,
      change: '- Unchanged',
      changeColor: 'text-gray-400',
      progress: 60,
    },
    {
      title: 'Open Alerts',
      value: `${dashboardData.openAlertsCount || 0}`,
      change: dashboardData.alertsChange 
        ? `${dashboardData.alertsChange > 0 ? '+' : ''}${dashboardData.alertsChange} since last week`
        : 'No change',
      changeColor: 'text-gray-400',
      progress: 50,
    },
  ] : [
    {
      title: 'Compliance Score',
      value: '0%',
      change: 'Loading...',
      changeColor: 'text-gray-400',
      progress: 0,
    },
    {
      title: 'Pending Audits',
      value: '0',
      change: 'Loading...',
      changeColor: 'text-gray-400',
      progress: 0,
    },
    {
      title: 'Open Alerts',
      value: '0',
      change: 'Loading...',
      changeColor: 'text-gray-400',
      progress: 0,
    },
  ];

  const handleViewTask = async (taskId) => {
    try {
      setLoadingTask(true);
      const taskData = await getComplianceTask(taskId);
      
      // Transform task data for modal
      setSelectedTask({
        id: taskData.id,
        taskName: taskData.taskName || taskData.task_name,
        assignee: taskData.assignee?.name || 'Unassigned',
        assigneeId: taskData.assignee?.id,
        dueDate: taskData.dueDate 
          ? new Date(taskData.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : 'N/A',
        status: capitalizeFirst(taskData.status || 'pending'),
        statusColor: getStatusColor(taskData.status),
        priority: capitalizeFirst(taskData.priority || 'medium'),
        description: taskData.description || 'No description available',
        category: taskData.category || '',
        relatedDocuments: taskData.relatedDocuments || [],
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch task details:', error);
      toast.error('Failed to load task details');
    } finally {
      setLoadingTask(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleReassign = async () => {
    if (!selectedTask) return;
    
    try {
      // For now, just show a message - in a real app, you'd have a user picker
      toast.info('Reassign functionality - select a new assignee');
      // await reassignComplianceTask(selectedTask.id, { assigneeId: newAssigneeId, notes: 'Reassigned' });
      // toast.success('Task reassigned successfully');
      // Refresh tasks list
      // const response = await listComplianceTasks({ limit: 50 });
      // setPendingTasks(response.data || []);
    } catch (error) {
      console.error('Failed to reassign task:', error);
      toast.error('Failed to reassign task');
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!selectedTask) return;
    
    try {
      await completeComplianceTask(selectedTask.id, {
        completionNotes: 'Task completed via Compliance Center',
      });
      toast.success('Task marked as completed');
      handleCloseModal();
      
      // Refresh tasks list
      const response = await listComplianceTasks({ limit: 50 });
      const tasks = response.data || [];
      const transformedTasks = tasks.map(task => ({
        id: task.id,
        taskName: task.taskName || task.task_name,
        assignee: task.assignee?.name || 'Unassigned',
        assigneeId: task.assignee?.id,
        dueDate: formatDate(task.dueDate || task.due_date),
        status: capitalizeFirst(task.status || 'pending'),
        statusColor: getStatusColor(task.status || 'pending'),
        priority: task.priority || 'medium',
        description: task.description || '',
        category: task.category || '',
      }));
      setPendingTasks(transformedTasks);
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Failed to mark task as completed');
    }
  };

  // Show loading state with skeletons
  if (loading) {
    return (
      <DashboardLayout>
        <div className='space-y-6 animate-pulse'>
          {/* Header skeleton */}
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
            <div className='h-8 w-48 rounded-lg bg-gray-700/40' />
            <div className='h-10 w-64 rounded-lg bg-gray-700/40' />
          </div>

          {/* Summary cards skeleton */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`rounded-2xl p-4 md:p-6 border ${
                  isDarkMode
                    ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className='h-4 w-24 mb-4 rounded bg-gray-700/40' />
                <div className='h-8 w-32 mb-3 rounded bg-gray-700/50' />
                <div className='h-3 w-28 mb-4 rounded bg-gray-700/40' />
                <div className='w-full h-1 rounded-full bg-gray-700/30' />
              </div>
            ))}
          </div>

          {/* Table skeleton */}
          <div
            className={`rounded-2xl p-4 md:p-6 border ${
              isDarkMode
                ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className='h-6 w-40 mb-6 rounded bg-gray-700/40' />
            <div className='space-y-4'>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                    isDarkMode ? 'bg-white/5' : 'bg-gray-100'
                  }`}
                >
                  <div className='flex-1'>
                    <div className='h-4 w-40 mb-2 rounded bg-gray-700/40' />
                    <div className='h-3 w-24 rounded bg-gray-700/30' />
                  </div>
                  <div className='flex items-center gap-4'>
                    <div className='h-4 w-24 rounded bg-gray-700/30' />
                    <div className='h-8 w-20 rounded-lg bg-gray-700/40' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
          <h1
            className={`text-3xl md:text-4xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Compliance Center
        </h1>
          <div className='flex items-center gap-3'>
            <span
              className={`text-sm md:text-base ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Last Update
            </span>
            <button
              className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${
                isDarkMode
                  ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                  : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-900'
              }`}
            >
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                className={isDarkMode ? 'text-white' : 'text-gray-900'}
              >
                <rect x='3' y='4' width='18' height='18' rx='2' ry='2' />
                <line x1='16' y1='2' x2='16' y2='6' />
                <line x1='8' y1='2' x2='8' y2='6' />
                <line x1='3' y1='10' x2='21' y2='10' />
              </svg>
              <span className='text-sm md:text-base'>{dateRange}</span>
              <Image
                src='/icons/chevron-down.svg'
                alt='Dropdown'
                width={16}
                height={16}
                className={isDarkMode ? 'brightness-0 invert' : ''}
              />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {summaryCards.map((card, index) => (
            <div
              key={index}
              className={`rounded-2xl p-4 md:p-6 border ${
                isDarkMode
                  ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                  : 'bg-white border-gray-200'
              }`}
            >
              <h3
                className={`text-sm md:text-base mb-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {card.title}
              </h3>
              <p
                className={`text-3xl md:text-4xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {card.value}
              </p>
              <p className={`text-xs md:text-sm mb-4 ${card.changeColor}`}>
                {card.change}
              </p>
              <div className={`w-full h-1 rounded-full overflow-hidden ${
                isDarkMode ? 'bg-white/10' : 'bg-gray-200'
              }`}>
                <div
                  className='h-full bg-[#F1CB68] transition-all'
                  style={{ width: `${card.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Pending Tasks Section */}
        <div
          className={`rounded-2xl p-4 md:p-6 border ${
            isDarkMode
              ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
              : 'bg-white border-gray-200'
          }`}
        >
          <h2
            className={`text-xl md:text-2xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Pending Tasks
          </h2>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr
                  className={`border-b ${
                    isDarkMode ? 'border-white/10' : 'border-gray-200'
                  }`}
                >
                  <th
                    className={`text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Task Name
                  </th>
                  <th
                    className={`text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Assignee
                  </th>
                  <th
                    className={`text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Due Date
                  </th>
                  <th
                    className={`text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Status
                  </th>
                  <th
                    className={`text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold uppercase ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingTasks.map((task, index) => (
                  <tr
                    key={task.id}
                    className={`border-b transition-colors ${
                      isDarkMode
                        ? 'border-white/5 hover:bg-white/5'
                        : 'border-gray-200 hover:bg-gray-50'
                    } ${index === pendingTasks.length - 1 ? 'border-0' : ''}`}
                  >
                    <td
                      className={`px-4 md:px-6 py-4 text-sm md:text-base ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {task.taskName}
                    </td>
                    <td
                      className={`px-4 md:px-6 py-4 text-sm md:text-base ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {task.assignee}
                    </td>
                    <td
                      className={`px-4 md:px-6 py-4 text-sm md:text-base ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {task.dueDate}
                    </td>
                    <td className='px-4 md:px-6 py-4'>
                      <span
                        className={`text-sm md:text-base font-medium ${task.statusColor}`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className='px-4 md:px-6 py-4'>
                      <button
                        onClick={() => handleViewTask(task.id)}
                        disabled={loadingTask}
                        className={`text-sm md:text-base font-medium transition-colors ${
                          isDarkMode
                            ? 'text-[#F1CB68] hover:text-[#E5C158] disabled:opacity-50'
                            : 'text-[#F1CB68] hover:text-[#E5C158] disabled:opacity-50'
                        }`}
                      >
                        {loadingTask ? 'Loading...' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
            className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto'
          >
            <style jsx>{`
              .compliance-modal-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .compliance-modal-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .compliance-modal-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
              }
              .compliance-modal-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.2);
              }
              .compliance-modal-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
              }
            `}</style>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-4xl rounded-2xl border my-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col ${
                isDarkMode
                  ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                  : 'bg-white border-gray-200'
              }`}
            >
              {/* Modal Header */}
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 md:p-6 border-b border-white/10 shrink-0'>
                <h2
                  className={`text-2xl md:text-3xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {selectedTask.taskName}
                </h2>
                <div className='flex items-center gap-3'>
                  <button
                    onClick={handleReassign}
                    className={`px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium transition-all hover:opacity-90 cursor-pointer border border-[#F1CB68] bg-transparent hover:bg-[#F1CB68]/10 ${
                      isDarkMode ? 'text-[#F1CB68]' : 'text-[#F1CB68]'
                    }`}
                  >
                    Reassign
                  </button>
                  <button
                    onClick={handleMarkAsCompleted}
                    className='px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium transition-all hover:opacity-90 cursor-pointer'
                    style={{
                      background:
                        'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                      color: '#000000',
                    }}
                  >
                    Mark as Completed
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode
                        ? 'hover:bg-white/10 text-white'
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <Image
                      src='/icons/close-x.svg'
                      alt='Close'
                      width={20}
                      height={20}
                      className={isDarkMode ? 'brightness-0 invert' : ''}
                    />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className='p-4 md:p-6 overflow-y-auto flex-1 compliance-modal-scrollbar'>
                {/* Key Details - Two Column Layout */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                  {/* Left Column */}
                  <div className='space-y-4'>
                    <div>
                      <label
                        className={`block text-sm md:text-base mb-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Assignee
                      </label>
                      <p
                        className={`text-base md:text-lg ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {selectedTask.assignee}
                      </p>
                    </div>
                    <div>
                      <label
                        className={`block text-sm md:text-base mb-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Status
                      </label>
                      <p
                        className={`text-base md:text-lg font-medium ${selectedTask.statusColor}`}
                      >
                        {selectedTask.status}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className='space-y-4'>
                    <div>
                      <label
                        className={`block text-sm md:text-base mb-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Due Date
                      </label>
                      <p
                        className={`text-base md:text-lg ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {selectedTask.dueDate}
                      </p>
                    </div>
                    <div>
                      <label
                        className={`block text-sm md:text-base mb-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Priority
                      </label>
                      <p
                        className={`text-base md:text-lg ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {selectedTask.priority}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className='pt-6 border-t border-white/10'>
                  <label
                    className={`block text-sm md:text-base mb-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Description
                  </label>
                  <p
                    className={`text-sm md:text-base leading-relaxed ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {selectedTask.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
