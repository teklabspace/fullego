'use client';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function TasksView({ isDarkMode }) {
  // Mock data for charts
  const chartData1 = [
    { value: 20 },
    { value: 35 },
    { value: 25 },
    { value: 45 },
    { value: 38 },
    { value: 52 },
  ];

  const chartData2 = [
    { value: 15 },
    { value: 28 },
    { value: 32 },
    { value: 25 },
    { value: 42 },
    { value: 48 },
  ];

  const chartData3 = [
    { value: 45 },
    { value: 38 },
    { value: 32 },
    { value: 28 },
    { value: 18 },
    { value: 12 },
  ];

  const pinnedUpdates = [
    {
      id: 1,
      user: 'Samuel',
      initials: 'S',
      message: 'Mentioned you in',
      description: 'Please review this file for further steps',
      time: 'Yesterday at 9:42 AM',
      isRead: false,
      bgColor: 'bg-blue-500',
    },
    {
      id: 2,
      user: 'Nick Gonzales',
      initials: 'NG',
      message: 'is inviting you to collaborate on',
      description: 'To: Hania Gonzales, Catherine Romero, Samuel',
      time: 'Wednesday, 5:43 PM',
      isRead: false,
      bgColor: 'bg-purple-500',
    },
  ];

  const ticketUpdates = [
    {
      id: 1,
      user: 'Thomas Patel',
      initials: 'TP',
      message: 'Worked on',
      title: 'Ticket 1234 - Unable to process payment',
      time: '2 days ago',
      bgColor: 'bg-orange-500',
    },
    {
      id: 2,
      user: 'Thomas Patel',
      initials: 'TP',
      message: 'Closed',
      title: 'Ticket 5678 - App crash on login',
      time: '2 days ago',
      bgColor: 'bg-orange-500',
    },
    {
      id: 3,
      user: 'Thomas Patel',
      initials: 'TP',
      message: 'Resolved',
      title: 'Ticket 1011 - Feature request: Dark mode',
      time: '2 days ago',
      bgColor: 'bg-orange-500',
    },
  ];

  return (
    <>
      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8'>
        <StatCard
          title='Total tasks received'
          value='164'
          change='+15%'
          changeLabel='from last week'
          isPositive={true}
          chartData={chartData1}
          chartColor='#10B981'
          isDarkMode={isDarkMode}
        />

        <StatCard
          title='Tasks solved'
          value='159'
          change='+32%'
          changeLabel='from last week'
          isPositive={true}
          chartData={chartData2}
          chartColor='#10B981'
          isDarkMode={isDarkMode}
        />

        <StatCard
          title='Tasks unresolved'
          value='5'
          change='-54%'
          changeLabel='from last week'
          isPositive={false}
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
            {pinnedUpdates.map(update => (
              <UpdateCard
                key={update.id}
                user={update.user}
                initials={update.initials}
                message={update.message}
                description={update.description}
                time={update.time}
                isRead={update.isRead}
                bgColor={update.bgColor}
                isDarkMode={isDarkMode}
              />
            ))}
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
            {ticketUpdates.map(update => (
              <TicketCard
                key={update.id}
                user={update.user}
                initials={update.initials}
                message={update.message}
                title={update.title}
                time={update.time}
                bgColor={update.bgColor}
                isDarkMode={isDarkMode}
              />
            ))}
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

