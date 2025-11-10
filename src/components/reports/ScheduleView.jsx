'use client';
import { useState } from 'react';

export default function ScheduleView({ isDarkMode }) {
  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  const events = [
    {
      id: 1,
      title: 'LC Tax filings',
      room: 'Room 01',
      startTime: '09:00',
      endTime: '10:00 AM',
      type: 'Internal',
      attendees: 3,
      position: 0, // 09:00
    },
    {
      id: 2,
      title: 'New Policy Launch',
      room: 'Room 01',
      startTime: '02:00',
      endTime: '04:00 PM',
      type: 'Internal',
      attendees: 3,
      position: 5, // 14:00
    },
  ];

  const [selectedDate, setSelectedDate] = useState(5);
  const [currentMonth, setCurrentMonth] = useState({ month: 5, year: 2025 }); // June 2025

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    // Adjust so Monday is first day (0) and Sunday is last (6)
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { month: prev.month + 1, year: prev.year };
    });
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth.month, currentMonth.year);
    const firstDay = getFirstDayOfMonth(currentMonth.month, currentMonth.year);
    const days = [];

    // Previous month days
    if (firstDay > 0) {
      const prevMonth = currentMonth.month === 0 ? 11 : currentMonth.month - 1;
      const prevYear =
        currentMonth.month === 0 ? currentMonth.year - 1 : currentMonth.year;
      const prevMonthDays = getDaysInMonth(prevMonth, prevYear);

      for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ day: prevMonthDays - i, isCurrentMonth: false });
      }
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }

    return days;
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      {/* Left Side - Schedule */}
      <div className='lg:col-span-2'>
        <div
          className={`rounded-2xl border p-6 ${
            isDarkMode
              ? 'bg-transparent border-[#F1CB68]'
              : 'bg-white border-gray-200'
          }`}
        >
          {/* Time Slots */}
          <div className='relative'>
            {timeSlots.map((time, index) => (
              <div key={time} className='relative'>
                <div className='flex items-center gap-4 py-4'>
                  <span
                    className={`text-sm w-16 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {time}
                  </span>
                  <div
                    className={`flex-1 h-px ${
                      isDarkMode ? 'bg-[#8399A5]' : 'bg-gray-200'
                    }`}
                  />
                </div>

                {/* Event Cards */}
                {events
                  .filter(event => event.position === index)
                  .map(event => (
                    <div
                      key={event.id}
                      className='absolute left-20 right-0 top-2'
                    >
                      <EventCard event={event} isDarkMode={isDarkMode} />
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Profile, Calendar & Upcoming Events */}
      <div className='space-y-6 border-[#F1CB68] border p-2 rounded-2xl'>
        {/* User Profile */}
        <div
          className={`rounded-2xl border p-6 ${
            isDarkMode
              ? 'bg-transparent border-transparent'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className='flex items-center border-b border-[#F3F4F6] pb-4 gap-3'>
            <div className='w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center'>
              <span className='text-white font-semibold text-lg'>O</span>
            </div>
            <div>
              <h3
                className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Olivia
              </h3>
              <p className='text-gray-400 text-sm'>User Account</p>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div
          className={`rounded-2xl border-b border-[#F3F4F6] p-6 ${
            isDarkMode
              ? 'bg-transparent border-transparent'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className='flex items-center justify-between mb-4'>
            <h3
              className={`font-bold text-lg ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {monthNames[currentMonth.month]} {currentMonth.year}
            </h3>
            <div className='flex gap-2'>
              <button
                onClick={goToPreviousMonth}
                className={`transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                >
                  <path
                    d='M15 18l-6-6 6-6'
                    strokeWidth='2'
                    strokeLinecap='round'
                  />
                </svg>
              </button>
              <button
                onClick={goToNextMonth}
                className={`transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                >
                  <path
                    d='M9 18l6-6-6-6'
                    strokeWidth='2'
                    strokeLinecap='round'
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className='space-y-2'>
            {/* Week Days */}
            <div className='grid grid-cols-7 gap-1 mb-2'>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div
                  key={day}
                  className='text-center text-xs text-gray-400 py-1'
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className='grid grid-cols-7 gap-1'>
              {generateCalendarDays().map((dayObj, index) => (
                <button
                  key={index}
                  onClick={() =>
                    dayObj.isCurrentMonth && setSelectedDate(dayObj.day)
                  }
                  className={`aspect-square rounded-lg text-sm flex items-center justify-center transition-all ${
                    dayObj.day === selectedDate && dayObj.isCurrentMonth
                      ? isDarkMode
                        ? 'bg-transparent text-[#F1CB68] font-semibold border-2 border-[#F1CB68]'
                        : 'bg-transparent text-[#F1CB68] font-semibold border-2 border-[#F1CB68]'
                      : dayObj.isCurrentMonth
                      ? isDarkMode
                        ? 'text-white hover:bg-white/5 border-2 border-transparent'
                        : 'text-gray-900 hover:bg-gray-100 border-2 border-transparent'
                      : 'text-gray-600 border-2 border-transparent'
                  }`}
                >
                  {dayObj.day}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <h3
            className={`font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Upcoming events
          </h3>

          <UpcomingEventCard isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
}

// EventCard Component
function EventCard({ event, isDarkMode }) {
  return (
    <div
      className={`relative rounded-2xl z-10 p-3 border ${
        isDarkMode
          ? 'bg-[#FFFF] border-[#FFFFFF14]'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      {/* Title and Internal Badge */}
      <div className='flex items-center justify-between '>
        <div>
          <h4
            className={`font-semibold text-sm ${
              isDarkMode ? 'text-[#F1CB68]' : 'text-[#F1CB68]'
            }`}
          >
            {event.title}
          </h4>
        </div>

        {/* Other Data - Room, Time, Attendees */}
        <div className='space-y-1'>
          <div className='flex items-center gap-1 text-gray-600 text-sm'>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <path
                d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'
                strokeWidth='2'
              />
              <circle cx='12' cy='10' r='3' strokeWidth='2' />
            </svg>
            <span>{event.room}</span>
          </div>

          <div className='flex items-center gap-1 text-gray-600 text-sm'>
            <svg
              width='14'
              height='14'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <circle cx='12' cy='12' r='10' strokeWidth='2' />
              <polyline points='12 6 12 12 16 14' strokeWidth='2' />
            </svg>
            <span>
              {event.startTime} - {event.endTime}
            </span>
          </div>
        </div>
      </div>
      <span className='text-xs px-2 py-0.5 bg-[#F1CB68] text-white rounded'>
        {event.type}
      </span>
      {/* Avatar Images */}
      <div className='flex -space-x-2'>
        <div className='w-8 h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center'>
          <span className='text-xs text-white font-medium'>A</span>
        </div>
        <div className='w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center'>
          <span className='text-xs text-white font-medium'>B</span>
        </div>
        <div className='w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center'>
          <span className='text-xs text-white font-medium'>C</span>
        </div>
      </div>
    </div>
  );
}

// UpcomingEventCard Component
function UpcomingEventCard({ isDarkMode }) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        isDarkMode
          ? 'bg-[#FFFFFF] border-[#FFFFFF14]'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className='flex items-center justify-between'>
        <div className='w-auto px-2 h-8 rounded-full bg-red-500 flex items-center justify-center'>
          <svg
            width='20'
            height='20'
            viewBox='0 0 12 12'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M8.7 4.3776V4.2C8.7 2.709 7.491 1.5 6 1.5C4.509 1.5 3.3 2.709 3.3 4.2V4.3776C3.3 5.2314 2.8458 6.0252 2.1048 6.45C1.7202 6.6708 1.5 6.9264 1.5 7.2C1.5 8.0286 3.5148 8.7 6 8.7C8.4852 8.7 10.5 8.0286 10.5 7.2C10.5 6.9264 10.2798 6.6708 9.8952 6.45C9.1542 6.0258 8.7 5.2314 8.7 4.3776Z'
              stroke='white'
              stroke-width='0.8'
              stroke-miterlimit='10'
              stroke-linecap='round'
              stroke-linejoin='round'
            />
            <path
              d='M7.3754 9.59998C7.1438 10.1298 6.6152 10.5 6.0002 10.5C5.3852 10.5 4.8572 10.1298 4.625 9.60058'
              stroke='white'
              stroke-width='0.8'
              stroke-miterlimit='10'
              stroke-linecap='round'
              stroke-linejoin='round'
            />
          </svg>
          In 10 mins
        </div>
      </div>
      <h4
        className={`font-semibold mb-2 ${
          isDarkMode ? 'text-[#F1CB68]' : 'text-gray-900'
        }`}
      >
        LLC Tax filings
      </h4>
      <div className='flex mb-2 items-center gap-1 text-gray-400 text-sm'>
        <svg
          width='14'
          height='14'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
        >
          <path
            d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'
            strokeWidth='2'
          />
          <circle cx='12' cy='10' r='3' strokeWidth='2' />
        </svg>
        <span className='text-xs'>Room 01</span>
      </div>

      <div className='flex justify-between items-center gap-2 mb-3'>
        <div>
          <span className='text-xs px-2 py-0.5 bg-[#F1CB68] text-white rounded font-medium'>
            Internal
          </span>
        </div>

        <div>
          <div className='flex -space-x-2'>
            <div className='w-6 h-6 rounded-full bg-purple-500 border-2 border-[#1A1A1D] flex items-center justify-center'>
              <span className='text-xs text-white font-medium'>A</span>
            </div>
            <div className='w-6 h-6 rounded-full bg-blue-500 border-2 border-[#1A1A1D] flex items-center justify-center'>
              <span className='text-xs text-white font-medium'>B</span>
            </div>
            <div className='w-6 h-6 rounded-full bg-green-500 border-2 border-[#1A1A1D] flex items-center justify-center'>
              <span className='text-xs text-white font-medium'>C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
