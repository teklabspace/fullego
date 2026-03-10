'use client';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { getDashboardOverview, getCrmUpdates } from '@/utils/crmApi';
import { getReportStatistics, listReports, generateReport } from '@/utils/reportsApi';
import { toast } from 'react-toastify';

export default function TasksView({ isDarkMode }) {
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [reportStats, setReportStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [overviewResponse, updatesResponse, reportStatsResponse, reportsResponse] = await Promise.allSettled([
          getDashboardOverview(),
          getCrmUpdates({ limit: 24 }).catch(err => {
            if (err.status === 403 || err.status === 401) {
              return { data: [], message: 'Updates not available' };
            }
            throw err;
          }),
          getReportStatistics().catch(() => null),
          listReports({ page: 1, limit: 20 }).catch(() => null),
        ]);

        if (overviewResponse.status === 'fulfilled') {
          setDashboardStats(overviewResponse.value.data || overviewResponse.value);
        }

        if (updatesResponse.status === 'fulfilled') {
          const updatesData = updatesResponse.value.data || updatesResponse.value || [];
          setUpdates(Array.isArray(updatesData) ? updatesData : []);
        } else {
          setUpdates([]);
        }

        if (reportStatsResponse.status === 'fulfilled' && reportStatsResponse.value) {
          setReportStats(reportStatsResponse.value.data || reportStatsResponse.value);
        }

      if (reportsResponse.status === 'fulfilled' && reportsResponse.value) {
        const value = reportsResponse.value;
        const data = value.data || value.reports || [];
        setReports(Array.isArray(data) ? data : []);
      } else {
        setReports([]);
      }
      } catch (error) {
        console.error('Failed to fetch reports data:', error);
        toast.error('Failed to load reports data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart data from API - no fallback dummy data
  const chartData1 = dashboardStats?.totalTasksTrend || dashboardStats?.performanceTrends || [];
  const chartData2 = dashboardStats?.tasksSolvedTrend || dashboardStats?.performanceTrends || [];
  const chartData3 = dashboardStats?.tasksUnresolvedTrend || dashboardStats?.performanceTrends || [];

  // Get stat values from API - no fallback dummy data
  const totalTasks = dashboardStats?.totalTasks ?? dashboardStats?.totalTasksReceived ?? reportStats?.totalReports ?? 0;
  const tasksSolved = dashboardStats?.tasksSolved ?? dashboardStats?.tasksResolved ?? reportStats?.completedReports ?? 0;
  const tasksUnresolved = dashboardStats?.tasksUnresolved ?? dashboardStats?.unresolvedTasks ?? reportStats?.pendingReports ?? 0;
  const totalTasksChange = dashboardStats?.totalTasksChange ?? dashboardStats?.totalTasksReceivedChange ?? reportStats?.totalReportsChange ?? null;
  const tasksSolvedChange = dashboardStats?.tasksSolvedChange ?? dashboardStats?.tasksResolvedChange ?? reportStats?.completedReportsChange ?? null;
  const tasksUnresolvedChange = dashboardStats?.tasksUnresolvedChange ?? dashboardStats?.unresolvedTasksChange ?? reportStats?.pendingReportsChange ?? null;

  // Filter updates
  const pinnedUpdates = updates.filter(u => u.pinned || u.isPinned);
  const ticketUpdates = updates.filter(u => !u.pinned && !u.isPinned);

  const handleGenerateSampleReport = async () => {
    try {
      setGenerating(true);
      const payload = {
        reportType: 'portfolio',
        format: 'pdf',
        dateRange: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        },
      };
      await generateReport(payload);
      toast.success('Report generation started');
      // Refresh reports list
      const res = await listReports({ page: 1, limit: 20 }).catch(() => null);
      if (res) {
        const data = res.data || res.reports || [];
        setReports(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      const msg = error?.data?.detail || error.message || 'Failed to generate report';
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  return (
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

      {/* Updates Section */}
      <div className='space-y-6'>
        <h2
          className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Updates
        </h2>

        {/* Reports Overview */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Reports
            </h3>
            <button
              onClick={handleGenerateSampleReport}
              disabled={generating}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                isDarkMode
                  ? 'bg-[#F1CB68] text-black hover:bg-[#F1CB68]/90 disabled:opacity-50'
                  : 'bg-[#F1CB68] text-black hover:bg-[#F1CB68]/90 disabled:opacity-50'
              }`}
            >
              {generating ? 'Generating…' : 'Generate sample report'}
            </button>
          </div>

          <div
            className={`rounded-2xl border ${
              isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
            }`}
          >
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr
                    className={`border-b ${
                      isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                    }`}
                  >
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-400'>
                      Type
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-400'>
                      Status
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-400'>
                      Format
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-400'>
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length > 0 ? (
                    reports.map((report, idx) => (
                      <tr
                        key={report.id || idx}
                        className={`border-b ${
                          isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                        }`}
                      >
                        <td className='px-4 py-3'>
                          <span
                            className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}
                          >
                            {report.reportType || report.type || 'portfolio'}
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          <span className='text-xs font-medium text-gray-400'>
                            {report.status || 'pending'}
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          <span className='text-xs text-gray-400'>
                            {report.format || 'pdf'}
                          </span>
                        </td>
                        <td className='px-4 py-3'>
                          <span className='text-xs text-gray-500'>
                            {report.createdAt ||
                              report.created_at ||
                              '—'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className='px-4 py-6 text-center text-xs text-gray-400'
                      >
                        {loading ? (
                          <div className='flex items-center justify-center gap-2'>
                            <div className={`h-4 w-4 rounded-full border-2 border-t-transparent animate-spin ${isDarkMode ? 'border-gray-400' : 'border-gray-600'}`} />
                            <span>Loading reports…</span>
                          </div>
                        ) : (
                          'No reports found'
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pinned Section */}
        <div>
          <div className='flex items-center gap-2 mb-4'>
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              className='text-gray-400'
            >
              <path
                d='M12 17v5m-3-2l3 3 3-3M9 5l3-3 3 3m-6 5.5L7.5 9 5 11.5m14-2L16.5 12l2.5 2.5M12 12v5'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Pinned
            </h3>
          </div>

          <div className='space-y-3'>
            {pinnedUpdates.length > 0 ? (
              pinnedUpdates.map((update, index) => {
                const userName = update.user || update.userName || update.actor || 'Unknown User';
                const initials = update.initials || userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const bgColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'];
                const bgColor = update.bgColor || bgColors[index % bgColors.length];
                
                return (
                  <UpdateCard
                    key={update.id || index}
                    user={userName}
                    initials={initials}
                    message={update.message || update.action || 'updated'}
                    description={update.description || update.subtitle || update.body || ''}
                    time={update.time || update.timestamp || update.createdAt || 'Just now'}
                    isRead={!update.isUnread && !update.hasIndicator}
                    bgColor={bgColor}
                    isDarkMode={isDarkMode}
                  />
                );
              })
            ) : (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {loading ? (
                  <div className='space-y-3'>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`p-4 rounded-lg border animate-pulse ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                        <div className='flex items-start gap-3'>
                          <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                          <div className='flex-1 space-y-2'>
                            <div className={`h-4 w-3/4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                            <div className={`h-3 w-1/2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  'No pinned updates'
                )}
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
              className='text-gray-400'
            >
              <path
                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Ticket updates
            </h3>
          </div>

          <div className='space-y-3'>
            {ticketUpdates.length > 0 ? (
              ticketUpdates.map((update, index) => {
                const userName = update.user || update.userName || update.actor || 'Unknown User';
                const initials = update.initials || userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                const bgColors = ['bg-orange-500', 'bg-pink-500', 'bg-blue-500', 'bg-purple-500'];
                const bgColor = update.bgColor || bgColors[index % bgColors.length];
                
                return (
                  <TicketCard
                    key={update.id || index}
                    user={userName}
                    initials={initials}
                    message={update.message || update.action || 'updated'}
                    title={update.title || update.highlight || update.subject || ''}
                    time={update.time || update.timestamp || update.createdAt || 'Just now'}
                    bgColor={bgColor}
                    isDarkMode={isDarkMode}
                  />
                );
              })
            ) : (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {loading ? (
                  <div className='space-y-3'>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`p-4 rounded-lg border animate-pulse ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                        <div className='flex items-start gap-3'>
                          <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                          <div className='flex-1 space-y-2'>
                            <div className={`h-4 w-3/4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                            <div className={`h-3 w-1/2 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  'No ticket updates available'
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
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

// UpdateCard Component
function UpdateCard({
  user,
  initials,
  message,
  description,
  time,
  isRead,
  bgColor,
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
      <div className='flex gap-3'>
        <div
          className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-semibold shrink-0`}
        >
          {initials}
        </div>

        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2 mb-2'>
            <p
              className={`text-sm ${
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
              {message}
            </p>
            {!isRead && (
              <div className='w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5' />
            )}
          </div>

          <p
            className={`text-sm mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {description}
          </p>

          <span className='text-xs text-gray-500'>{time}</span>
        </div>
      </div>
    </div>
  );
}

// TicketCard Component
function TicketCard({ user, initials, message, title, time, bgColor, isDarkMode }) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex gap-3'>
        <div
          className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-semibold shrink-0`}
        >
          {initials}
        </div>

        <div className='flex-1 min-w-0'>
          <p
            className={`text-sm mb-2 ${
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
            {message}
          </p>

          <p
            className={`text-sm mb-2 font-medium ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {title}
          </p>

          <span className='text-xs text-gray-500'>{time}</span>
        </div>
      </div>
    </div>
  );
}

