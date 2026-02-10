'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import AssignmentModal from '@/components/dashboard/AssignmentModal';
import DocumentUploadModal from '@/components/dashboard/DocumentUploadModal';
import { getDashboardOverview, getCrmUpdates } from '@/utils/crmApi';
import { listTickets, assignTicket, uploadTicketDocuments } from '@/utils/supportTicketsApi';
import { getReportStatistics } from '@/utils/reportsApi';
import { toast } from 'react-toastify';

export default function CRMDashboardPage() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUnassigned, setSelectedUnassigned] = useState([]);
  const [selectedAssigned, setSelectedAssigned] = useState([]);
  const [unassignedSort, setUnassignedSort] = useState('lastUpdated');
  const [assignedSort, setAssignedSort] = useState('lastUpdated');
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [updates, setUpdates] = useState([]);

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard overview statistics
        const [overviewResponse, updatesResponse, ticketsResponse] = await Promise.allSettled([
          getDashboardOverview(),
          getCrmUpdates({ limit: 24 }).catch(err => {
            // Handle 403 (Forbidden) or other permission errors gracefully
            if (err.status === 403 || err.status === 401) {
              console.warn('CRM updates endpoint not accessible:', err.status);
              return { data: [], message: 'Updates not available' };
            }
            throw err;
          }),
          listTickets({ status: 'open', limit: 100 }),
        ]);

        if (overviewResponse.status === 'fulfilled') {
          setDashboardStats(overviewResponse.value.data || overviewResponse.value);
        }

        if (updatesResponse.status === 'fulfilled') {
          const updatesData = updatesResponse.value.data || updatesResponse.value || [];
          setUpdates(Array.isArray(updatesData) ? updatesData : []);
        } else if (updatesResponse.status === 'rejected') {
          // If updates fail, use empty array (non-critical feature)
          console.warn('Failed to load updates, using empty array');
          setUpdates([]);
        }

        if (ticketsResponse.status === 'fulfilled') {
          const tickets = ticketsResponse.value.data || ticketsResponse.value || [];
          // Separate unassigned and assigned tickets
          const unassigned = tickets.filter(t => !t.assignee || t.assignee === '-').map(ticket => ({
            id: ticket.id || ticket.ticketId,
            subject: ticket.subject,
            requester: ticket.issuer || ticket.requester,
            channel: ticket.channel || 'Web form',
            type: ticket.category || '-',
            assignee: ticket.assignee || '-',
            date: ticket.created ? new Date(ticket.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-',
            status: ticket.status === 'open' ? 'New' : ticket.status,
            assignedTo: ticket.assignee || null,
            ticketHistory: ticket.history || [],
          }));
          
          const assigned = tickets.filter(t => t.assignee && t.assignee !== '-').map(ticket => ({
            id: ticket.id || ticket.ticketId,
            subject: ticket.subject,
            requester: ticket.issuer || ticket.requester,
            channel: ticket.channel || 'Web form',
            group: ticket.group || '-',
            assignee: ticket.assignee,
            date: ticket.created ? new Date(ticket.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-',
            status: ticket.status === 'open' ? 'Open' : ticket.status,
            assignedTo: ticket.assignee,
            ticketHistory: ticket.history || [],
          }));

          setUnassignedTasks(unassigned);
          setAssignedTasks(assigned);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Initialize with empty arrays - data will come from API
  const [unassignedTasks, setUnassignedTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);

  // Chart data from API - no fallback dummy data
  const chartData1 = dashboardStats?.totalTasksTrend || dashboardStats?.performanceTrends || [];
  const chartData2 = dashboardStats?.tasksSolvedTrend || dashboardStats?.performanceTrends || [];
  const chartData3 = dashboardStats?.tasksUnresolvedTrend || dashboardStats?.performanceTrends || [];

  // Get stat values from API - no fallback dummy data
  const totalTasks = dashboardStats?.totalTasks ?? dashboardStats?.totalTasksReceived ?? 0;
  const tasksSolved = dashboardStats?.tasksSolved ?? dashboardStats?.tasksResolved ?? 0;
  const tasksUnresolved = dashboardStats?.tasksUnresolved ?? dashboardStats?.unresolvedTasks ?? 0;
  const totalTasksChange = dashboardStats?.totalTasksChange ?? dashboardStats?.totalTasksReceivedChange ?? null;
  const tasksSolvedChange = dashboardStats?.tasksSolvedChange ?? dashboardStats?.tasksResolvedChange ?? null;
  const tasksUnresolvedChange = dashboardStats?.tasksUnresolvedChange ?? dashboardStats?.unresolvedTasksChange ?? null;

  const handleAssignTask = async (assignmentData) => {
    if (selectedTask) {
      try {
        // Call API to assign ticket
        await assignTicket(selectedTask.id, {
          userId: assignmentData.userId,
          userName: assignmentData.userName,
          internalNote: assignmentData.internalNote,
        });

        // Update local state
        const taskIndex = unassignedTasks.findIndex(t => t.id === selectedTask.id);
        if (taskIndex !== -1) {
          const updatedTask = {
            ...unassignedTasks[taskIndex],
            assignee: assignmentData.userName,
            assignedTo: assignmentData.userName,
            ticketHistory: [
              ...(unassignedTasks[taskIndex].ticketHistory || []),
              {
                action: 'Task assigned',
                user: assignmentData.userName,
                date: new Date().toISOString(),
                note: assignmentData.internalNote,
              },
            ],
          };
          const newUnassigned = unassignedTasks.filter(t => t.id !== selectedTask.id);
          setUnassignedTasks(newUnassigned);
          setAssignedTasks([...assignedTasks, updatedTask]);
        }
        toast.success('Task assigned successfully!');
      } catch (error) {
        console.error('Failed to assign task:', error);
        const errorMsg = error.data?.detail || error.message || 'Failed to assign task. Please try again.';
        toast.error(errorMsg);
      }
    }
    setSelectedTask(null);
  };

  const handleDocumentUpload = async (uploadData) => {
    if (selectedTask) {
      try {
        const files = uploadData.files.map(f => f.file || f);
        await uploadTicketDocuments(selectedTask.id, files);
        toast.success('Documents uploaded successfully!');
        // Refresh task data or update local state
      } catch (error) {
        console.error('Failed to upload documents:', error);
        const errorMsg = error.data?.detail || error.message || 'Failed to upload documents. Please try again.';
        toast.error(errorMsg);
      }
    }
  };

  const handleOpenAssignment = task => {
    setSelectedTask(task);
    setAssignmentModalOpen(true);
  };

  const handleOpenDocuments = task => {
    setSelectedTask(task);
    setDocumentModalOpen(true);
  };

  const handleUnassignedSelect = id => {
    setSelectedUnassigned(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAssignedSelect = id => {
    setSelectedAssigned(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllUnassigned = () => {
    if (selectedUnassigned.length === unassignedTasks.length) {
      setSelectedUnassigned([]);
    } else {
      setSelectedUnassigned(unassignedTasks.map(task => task.id));
    }
  };

  const handleSelectAllAssigned = () => {
    if (selectedAssigned.length === assignedTasks.length) {
      setSelectedAssigned([]);
    } else {
      setSelectedAssigned(assignedTasks.map(task => task.id));
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'New':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'Open':
        return 'bg-red-500/20 text-red-500';
      case 'Pend':
        return 'bg-orange-500/20 text-orange-500';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6'>
            <div>
              <h1
                className={`text-3xl md:text-4xl font-bold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                CRM Dashboard
              </h1>
              <p className='text-gray-400 text-sm md:text-base'>
                For advisors to manage contacts/tasks
              </p>
            </div>

            {/* Date Range Picker */}
            <div className='flex items-center gap-2'>
              <button
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  isDarkMode
                    ? 'bg-[#1C1C1E] border-[#FFFFFF14] text-gray-300 hover:border-[#FFFFFF28]'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                June 2025 - July 2025
                <svg
                  className='inline-block ml-2 w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className='flex gap-3 mb-8 overflow-x-auto scrollbar-hide pb-2'>
            {/* Overview Tab */}
            {activeTab === 'overview' && isDarkMode ? (
              <div
                className='rounded-full p-px'
                style={{
                  background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                }}
              >
                <button
                  onClick={() => setActiveTab('overview')}
                  className='px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all bg-gradient-to-r from-[#222126] to-[#111116] text-white w-full'
                >
                  Overview
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-gray-200 text-gray-900 border border-gray-300'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Overview
              </button>
            )}

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
                  Tasks {unassignedTasks.length + assignedTasks.length}
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
                  Updates {updates.length}
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
        </div>

        {/* Content */}
        {activeTab === 'overview' ? (
          <>
            {/* Overview Section with Graphs */}
            <div className='mb-8'>
              <h2
                className={`text-xl font-semibold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Overview
              </h2>
              
              {/* Stats Cards */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8'>
                <StatCard
                  title='Total tasks received'
                  value={loading ? '...' : totalTasks.toString()}
                  change={totalTasksChange ? `${totalTasksChange > 0 ? '+' : ''}${totalTasksChange}%` : '-'}
                  changeLabel='from last week'
                  isPositive={totalTasksChange === null ? true : totalTasksChange >= 0}
                  chartData={chartData1}
                  chartColor='#10B981'
                  isDarkMode={isDarkMode}
                />

                <StatCard
                  title='Tasks solved'
                  value={loading ? '...' : tasksSolved.toString()}
                  change={tasksSolvedChange ? `${tasksSolvedChange > 0 ? '+' : ''}${tasksSolvedChange}%` : '-'}
                  changeLabel='from last week'
                  isPositive={tasksSolvedChange === null ? true : tasksSolvedChange >= 0}
                  chartData={chartData2}
                  chartColor='#10B981'
                  isDarkMode={isDarkMode}
                />

                <StatCard
                  title='Tasks unresolved'
                  value={loading ? '...' : tasksUnresolved.toString()}
                  change={tasksUnresolvedChange ? `${tasksUnresolvedChange > 0 ? '+' : ''}${tasksUnresolvedChange}%` : '-'}
                  changeLabel='from last week'
                  isPositive={tasksUnresolvedChange === null ? false : tasksUnresolvedChange <= 0}
                  chartData={chartData3}
                  chartColor='#EF4444'
                  isDarkMode={isDarkMode}
                />
              </div>

              {/* Additional Graphs Section */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
                {/* Performance Chart */}
                <div
                  className={`rounded-xl border p-6 ${
                    isDarkMode
                      ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Task Performance
                  </h3>
                  <div className='h-64'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart data={chartData1}>
                        <Line
                          type='monotone'
                          dataKey='value'
                          stroke='#F1CB68'
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Resolution Rate Chart */}
                <div
                  className={`rounded-xl border p-6 ${
                    isDarkMode
                      ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold mb-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Resolution Rate
                  </h3>
                  <div className='h-64'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart data={chartData2}>
                        <Line
                          type='monotone'
                          dataKey='value'
                          stroke='#10B981'
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'tasks' ? (
          <>
            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8'>
              <StatCard
                title='Total tasks received'
                value={loading ? '...' : totalTasks.toString()}
                change={totalTasksChange ? `${totalTasksChange > 0 ? '+' : ''}${totalTasksChange}%` : '-'}
                changeLabel='from last week'
                isPositive={totalTasksChange === null ? true : totalTasksChange >= 0}
                chartData={chartData1}
                chartColor='#10B981'
                isDarkMode={isDarkMode}
              />

              <StatCard
                title='Tasks solved'
                value={loading ? '...' : tasksSolved.toString()}
                change={tasksSolvedChange ? `${tasksSolvedChange > 0 ? '+' : ''}${tasksSolvedChange}%` : '-'}
                changeLabel='from last week'
                isPositive={tasksSolvedChange === null ? true : tasksSolvedChange >= 0}
                chartData={chartData2}
                chartColor='#10B981'
                isDarkMode={isDarkMode}
              />

              <StatCard
                title='Tasks unresolved'
                value={loading ? '...' : tasksUnresolved.toString()}
                change={tasksUnresolvedChange ? `${tasksUnresolvedChange > 0 ? '+' : ''}${tasksUnresolvedChange}%` : '-'}
                changeLabel='from last week'
                isPositive={tasksUnresolvedChange === null ? false : tasksUnresolvedChange <= 0}
                chartData={chartData3}
                chartColor='#EF4444'
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Tasks Section */}
            <div className='space-y-8'>
              <h2
                className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Tasks
              </h2>

              {/* Unassigned Tasks */}
              <div
                className={`rounded-2xl border overflow-hidden ${
                  isDarkMode
                    ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className='p-6 border-b border-[#FFFFFF14]'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3
                      className={`text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Unassigned ({unassignedTasks.length})
                    </h3>
                    <span
                      className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      ({selectedUnassigned.length}) selected
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <button
                      onClick={() =>
                        setUnassignedSort(
                          unassignedSort === 'lastUpdated'
                            ? 'date'
                            : 'lastUpdated'
                        )
                      }
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        isDarkMode
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Sort Last updated
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr
                        className={`border-b ${
                          isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                        }`}
                      >
                        <th className='px-6 py-4'>
                          <CustomCheckbox
                            checked={
                              selectedUnassigned.length ===
                              unassignedTasks.length
                            }
                            onChange={handleSelectAllUnassigned}
                            isDarkMode={isDarkMode}
                          />
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          ID
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Subject
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Requester
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Channel
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Type
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Assignee
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Date
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {unassignedTasks.map((task, index) => (
                        <tr
                          key={index}
                          className={`border-b ${
                            isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                          } hover:bg-white/5 transition-colors`}
                        >
                          <td className='px-6 py-4'>
                            <CustomCheckbox
                              checked={selectedUnassigned.includes(task.id)}
                              onChange={() => handleUnassignedSelect(task.id)}
                              isDarkMode={isDarkMode}
                            />
                          </td>
                          <td className='px-6 py-4'>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                          </td>
                          <td className='px-6 py-4'>
                            <p
                              className={`text-sm font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {task.id} {task.subject}
                            </p>
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {task.requester}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {task.channel}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {task.type}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {task.assignedTo || task.assignee}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {task.date}
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-2'>
                              <button
                                onClick={() => handleOpenAssignment(task)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                  isDarkMode
                                    ? 'bg-[#F1CB68]/20 text-[#F1CB68] hover:bg-[#F1CB68]/30'
                                    : 'bg-[#F1CB68]/20 text-[#F1CB68] hover:bg-[#F1CB68]/30'
                                }`}
                                title='Assign to CRM user'
                              >
                                Assign
                              </button>
                              <button
                                onClick={() => handleOpenDocuments(task)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  isDarkMode
                                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                                title='Upload documents'
                              >
                                <svg
                                  width='18'
                                  height='18'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                >
                                  <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                                  <path d='M14 2v6h6' />
                                  <path d='M16 13H8' />
                                  <path d='M16 17H8' />
                                  <path d='M10 9H8' />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assigned Tasks */}
              <div
                className={`rounded-2xl border overflow-hidden ${
                  isDarkMode
                    ? 'bg-[#1C1C1E] border-[#FFFFFF14]'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className='p-6 border-b border-[#FFFFFF14]'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3
                      className={`text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Assigned ({assignedTasks.length})
                    </h3>
                  </div>
                  <div className='flex items-center justify-between'>
                    <button
                      onClick={() =>
                        setAssignedSort(
                          assignedSort === 'lastUpdated' ? 'date' : 'lastUpdated'
                        )
                      }
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        isDarkMode
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Sort Last updated
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </button>
                    <div className='flex items-center gap-2'>
                      <button
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-white hover:bg-white/5'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <svg
                          className='w-5 h-5'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 19l-7-7 7-7'
                          />
                        </svg>
                      </button>
                      <span
                        className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        1-{Math.min(6, assignedTasks.length)} out of {assignedTasks.length}
                      </span>
                      <button
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'text-gray-400 hover:text-white hover:bg-white/5'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <svg
                          className='w-5 h-5'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5l7 7-7 7'
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr
                        className={`border-b ${
                          isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                        }`}
                      >
                        <th className='px-6 py-4'>
                          <CustomCheckbox
                            checked={
                              selectedAssigned.length === assignedTasks.length
                            }
                            onChange={handleSelectAllAssigned}
                            isDarkMode={isDarkMode}
                          />
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          ID
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Subject
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Requester
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Channel
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Group
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Assignee
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Date
                        </th>
                        <th
                          className={`text-left px-6 py-4 text-xs font-medium ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignedTasks.map((task, index) => (
                        <tr
                          key={index}
                          className={`border-b ${
                            isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                          } hover:bg-white/5 transition-colors`}
                        >
                          <td className='px-6 py-4'>
                            <CustomCheckbox
                              checked={selectedAssigned.includes(task.id)}
                              onChange={() => handleAssignedSelect(task.id)}
                              isDarkMode={isDarkMode}
                            />
                          </td>
                          <td className='px-6 py-4'>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {task.status}
                            </span>
                          </td>
                          <td className='px-6 py-4'>
                            <p
                              className={`text-sm font-medium ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {task.id} {task.subject}
                            </p>
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {task.requester}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {task.channel}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {task.group}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {task.assignedTo || task.assignee}
                          </td>
                          <td
                            className={`px-6 py-4 text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}
                          >
                            {task.date}
                          </td>
                          <td className='px-6 py-4'>
                            <div className='flex items-center gap-2'>
                              <button
                                onClick={() => handleOpenAssignment(task)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                  isDarkMode
                                    ? 'bg-[#F1CB68]/20 text-[#F1CB68] hover:bg-[#F1CB68]/30'
                                    : 'bg-[#F1CB68]/20 text-[#F1CB68] hover:bg-[#F1CB68]/30'
                                }`}
                                title='Reassign to CRM user'
                              >
                                Reassign
                              </button>
                              <button
                                onClick={() => handleOpenDocuments(task)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  isDarkMode
                                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                                title='Upload documents'
                              >
                                <svg
                                  width='18'
                                  height='18'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                >
                                  <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                                  <path d='M14 2v6h6' />
                                  <path d='M16 13H8' />
                                  <path d='M16 17H8' />
                                  <path d='M10 9H8' />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Stats Cards - Same as Tasks tab */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8'>
              <StatCard
                title='Total tasks received'
                value={loading ? '...' : totalTasks.toString()}
                change={totalTasksChange ? `${totalTasksChange > 0 ? '+' : ''}${totalTasksChange}%` : '-'}
                changeLabel='from last week'
                isPositive={totalTasksChange === null ? true : totalTasksChange >= 0}
                chartData={chartData1}
                chartColor='#10B981'
                isDarkMode={isDarkMode}
              />

              <StatCard
                title='Tasks solved'
                value={loading ? '...' : tasksSolved.toString()}
                change={tasksSolvedChange ? `${tasksSolvedChange > 0 ? '+' : ''}${tasksSolvedChange}%` : '-'}
                changeLabel='from last week'
                isPositive={tasksSolvedChange === null ? true : tasksSolvedChange >= 0}
                chartData={chartData2}
                chartColor='#10B981'
                isDarkMode={isDarkMode}
              />

              <StatCard
                title='Tasks unresolved'
                value={loading ? '...' : tasksUnresolved.toString()}
                change={tasksUnresolvedChange ? `${tasksUnresolvedChange > 0 ? '+' : ''}${tasksUnresolvedChange}%` : '-'}
                changeLabel='from last week'
                isPositive={tasksUnresolvedChange === null ? false : tasksUnresolvedChange <= 0}
                chartData={chartData3}
                chartColor='#EF4444'
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Updates Content */}
            <div className='space-y-6'>
              {/* Pinned Section */}
              <div>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      className={isDarkMode ? 'text-white' : 'text-gray-900'}
                    >
                      <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
                    </svg>
                    <h2
                      className={`text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Pinned
                    </h2>
                  </div>
                  <button
                    className={`p-1 rounded transition-colors ${
                      isDarkMode
                        ? 'hover:bg-white/5 text-gray-400'
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                    >
                      <circle cx='5' cy='12' r='1.5' />
                      <circle cx='12' cy='12' r='1.5' />
                      <circle cx='19' cy='12' r='1.5' />
                    </svg>
                  </button>
                </div>

                <div className='space-y-3'>
                  {updates.filter(u => u.pinned || u.isPinned).length > 0 ? (
                    updates
                      .filter(u => u.pinned || u.isPinned)
                      .map((update, index) => {
                        const userName = update.user || update.userName || update.actor || 'Unknown User';
                        const initials = update.initials || userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                        const bgColors = ['bg-blue-500', 'bg-pink-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'];
                        const bgColor = update.bgColor || bgColors[index % bgColors.length];
                        
                        return (
                          <UpdateCard
                            key={update.id || index}
                            avatar={{
                              initials: initials,
                              bgColor: bgColor,
                            }}
                            user={userName}
                            action={update.action || update.message || 'updated'}
                            highlight={update.highlight || update.title || update.subject || ''}
                            subtitle={update.subtitle || update.description || update.body || ''}
                            time={update.time || update.timestamp || update.createdAt || 'Just now'}
                            hasIndicator={update.hasIndicator || update.isUnread || false}
                            hasMicrophone={update.hasMicrophone || false}
                            isDarkMode={isDarkMode}
                          />
                        );
                      })
                  ) : (
                    <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No pinned updates
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Updates Section */}
              <div>
                <div className='flex items-center gap-2 mb-4'>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    className={isDarkMode ? 'text-white' : 'text-gray-900'}
                  >
                    <path d='M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' />
                  </svg>
                  <h2
                    className={`text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Ticket updates
                  </h2>
                </div>

                <div className='space-y-3'>
                  {updates.filter(u => !u.pinned && !u.isPinned).length > 0 ? (
                    updates
                      .filter(u => !u.pinned && !u.isPinned)
                      .map((update, index) => {
                        const userName = update.user || update.userName || update.actor || 'Unknown User';
                        const initials = update.initials || userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                        const bgColors = ['bg-pink-500', 'bg-gray-600', 'bg-blue-500', 'bg-purple-500', 'bg-green-500'];
                        const bgColor = update.bgColor || bgColors[index % bgColors.length];
                        
                        return (
                          <UpdateCard
                            key={update.id || index}
                            avatar={{
                              bgColor: bgColor,
                              icon: !update.initials,
                              initials: update.initials || initials,
                            }}
                            user={userName}
                            action={update.action || update.message || 'updated'}
                            highlight={update.highlight || update.title || update.subject || ''}
                            subtitle={update.subtitle || update.description || update.body || ''}
                            time={update.time || update.timestamp || update.createdAt || 'Just now'}
                            hasIndicator={update.hasIndicator || update.isUnread || false}
                            isDarkMode={isDarkMode}
                          />
                        );
                      })
                  ) : (
                    <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No ticket updates available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={assignmentModalOpen}
        setIsOpen={setAssignmentModalOpen}
        onAssign={handleAssignTask}
        title='Assign to CRM User'
        itemName='task'
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={documentModalOpen}
        setIsOpen={setDocumentModalOpen}
        onUpload={handleDocumentUpload}
        title='Upload Documents'
        itemType='task'
        itemId={selectedTask?.id}
      />

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

// CustomCheckbox Component
function CustomCheckbox({ checked, onChange, isDarkMode }) {
  return (
    <label className='cursor-pointer inline-block'>
      <input
        type='checkbox'
        checked={checked}
        onChange={onChange}
        className='hidden'
      />
      <div
        className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center relative ${
          checked
            ? isDarkMode
              ? 'bg-gradient-to-r from-white to-[#F1CB68] border-transparent'
              : 'bg-[#F1CB68] border-[#F1CB68]'
            : isDarkMode
            ? 'bg-[#2C2C2E] border-gray-600 hover:border-gray-500'
            : 'bg-white border-gray-300 hover:border-gray-400'
        }`}
      >
        {checked && (
          <svg
            className='w-3 h-3 absolute'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            style={{
              color: checked
                ? isDarkMode
                  ? '#000000'
                  : '#000000'
                : 'transparent',
            }}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={3}
              d='M5 13l4 4L19 7'
            />
          </svg>
        )}
      </div>
    </label>
  );
}

// UpdateCard Component
function UpdateCard({
  avatar,
  user,
  action,
  highlight,
  subtitle,
  time,
  hasIndicator = false,
  hasMicrophone = false,
  isDarkMode,
}) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex items-start gap-3'>
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shrink-0 ${avatar.bgColor}`}
        >
          {avatar.initials ? (
            avatar.initials
          ) : (
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              className='text-white'
            >
              <path d='M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M16 7a4 4 0 11-8 0 4 4 0 018 0z' />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <p
            className={`text-sm mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            <span
              className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {user}
            </span>{' '}
            {action}
          </p>
          <p
            className='text-sm font-semibold mb-1'
            style={{ color: '#F1CB68' }}
          >
            {highlight}
          </p>
          <p
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {subtitle}
          </p>
        </div>

        {/* Right side - Time and indicators */}
        <div className='flex flex-col items-end gap-2 shrink-0'>
          {hasMicrophone && (
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
            >
              <path d='M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z' />
              <path d='M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8' />
            </svg>
          )}
          <div className='flex items-center gap-2'>
            <span
              className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {time}
            </span>
            {hasIndicator && (
              <div
                className='w-2 h-2 rounded-full'
                style={{ backgroundColor: '#F1CB68' }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// StatCard Component
function StatCard({
  title,
  value,
  change,
  changeLabel,
  isPositive,
  chartData,
  chartColor,
  isDarkMode,
}) {
  return (
    <div
      className={`rounded-2xl p-6 border ${
        isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      <h3
        className={`text-sm font-medium mb-4 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {title}
      </h3>

      <div className='flex items-end justify-between mb-4'>
        <div>
          <div
            className={`text-4xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {value}
          </div>
          <div className='flex items-center gap-2'>
            <span
              className={`text-sm font-semibold ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {change}
            </span>
            <span
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {changeLabel}
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className='w-24 h-16'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={chartData}>
              <Line
                type='monotone'
                dataKey='value'
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
