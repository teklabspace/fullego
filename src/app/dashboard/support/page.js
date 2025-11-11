'use client';
import NewTicketModal from '@/components/dashboard/NewTicketModal';
import Navbar from '@/components/dashboard/Navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function SupportPage() {
  const { isDarkMode } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const tickets = [
        {
      id: 'TKT-2023-8762',
      subject: 'Payment issue with recent subscription renewal',
          description:
        'I was charged twice for my subscription renewal this month.',
      status: 'open',
      created: 'Nov 15, 2023',
      updated: 'Nov 18, 2023',
        },
        {
      id: 'TKT-2023-8721',
      subject: 'Cannot access premium features after upgrade',
          description:
        "I upgraded to the Business plan yesterday, but I still don't have access.",
      status: 'inprogress',
      created: 'Nov 12, 2023',
      updated: 'Nov 16, 2023',
        },
        {
      id: 'TKT-2023-8695',
      subject: 'Request for custom integration documentation',
      description: 'My development team needs more detailed API documentation.',
      status: 'inprogress',
      created: 'Nov 10, 2023',
      updated: 'Nov 15, 2023',
        },
        {
      id: 'TKT-2023-8674',
      subject: 'Issues with data export functionality',
          description:
        'When I try to export my report data to CSV, some of the data is missing.',
      status: 'resolved',
      created: 'Nov 7, 2023',
      updated: 'Nov 12, 2023',
    },
        {
      id: 'TKT-2023-8642',
      subject: 'Account login verification problems',
          description:
        "I'm not receiving the SMS verification code when trying to log in.",
      status: 'closed',
      created: 'Nov 4, 2023',
      updated: 'Nov 9, 2023',
        },
        {
      id: 'TKT-2023-8621',
      subject: 'Feature request: Dark mode for dashboard',
          description:
        'Would it be possible to implement a dark mode for the main dashboard?',
      status: 'closed',
      created: 'Nov 2, 2023',
      updated: 'Nov 8, 2023',
    },
  ];

  const filteredTickets =
    ticketFilter === 'all'
      ? tickets
      : tickets.filter(t => t.status === ticketFilter);

  const getStatusBadge = status => {
    const statusConfig = {
      open: { bg: 'rgba(241, 203, 104, 0.2)', color: '#F1CB68', text: 'Open' },
      inprogress: {
        bg: 'rgba(59, 130, 246, 0.2)',
        color: '#3B82F6',
        text: 'In Progress',
      },
      resolved: {
        bg: 'rgba(34, 197, 94, 0.2)',
        color: '#22C55E',
        text: 'Resolved',
      },
      closed: {
        bg: 'rgba(107, 114, 128, 0.2)',
        color: '#6B7280',
        text: 'Closed',
      },
    };
    const config = statusConfig[status] || statusConfig.open;
    return (
      <span
        className='px-3 py-1 rounded-full text-xs font-medium'
        style={{ background: config.bg, color: config.color }}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div
      className={`flex h-screen ${isDarkMode ? 'bg-brand-bg' : 'bg-gray-50'}`}
    >
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <div className='flex-1 flex flex-col overflow-hidden lg:ml-64'>
        {/* Navbar */}
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Page Content */}
        <main className='flex-1 overflow-y-auto'>
      <div className='p-4 md:p-6 lg:p-8'>
            {/* Header */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8'>
              <div>
          <h1
                  className={`text-2xl md:text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
                  Support Ticket Center
          </h1>
                <p
                  className={`text-xs md:text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Manage your requests and support conversations.
                </p>
        </div>
              <button
                onClick={() => setIsNewTicketModalOpen(true)}
                className='px-4 md:px-6 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all hover:opacity-90 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap'
                style={{
                  background:
                    'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                  color: '#000000',
                }}
              >
                <span className='text-base md:text-lg'>+</span>
                New Ticket
              </button>
            </div>

            {/* Search and Filters */}
            <div className='mb-6 space-y-4'>
              {/* Search Bar */}
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none'>
                  <Image
                    src='/icons/search.svg'
                    alt='Search'
                    width={18}
                    height={18}
                    style={{
                      filter: isDarkMode
                        ? 'brightness(0) invert(1)'
                        : 'brightness(0.5)',
                    }}
                  />
                </div>
                <input
                  type='text'
                  placeholder='Search by keyword or ticket ID'
                  className={`w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 rounded-lg text-sm border transition-colors ${
                    isDarkMode
                      ? 'bg-transparent border-white/10 text-white placeholder-gray-500 focus:border-[#F1CB68]'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#F1CB68]'
                  } focus:outline-none`}
                />
              </div>

              {/* Filter Tabs */}
              <div className='flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide'>
                {[
                  { id: 'all', label: 'All Tickets' },
                  { id: 'open', label: 'Open' },
                  { id: 'inprogress', label: 'In Progress' },
                  { id: 'resolved', label: 'Resolved' },
                  { id: 'closed', label: 'Closed' },
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setTicketFilter(filter.id)}
                    className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      ticketFilter === filter.id
                        ? 'text-black'
                        : isDarkMode
                        ? 'text-gray-400'
                        : 'text-gray-600'
                    }`}
                    style={{
                      background:
                        ticketFilter === filter.id
                          ? 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)'
                          : 'transparent',
                      border:
                        ticketFilter === filter.id
                          ? 'none'
                          : isDarkMode
                          ? '1px solid rgba(255, 255, 255, 0.1)'
                          : '1px solid rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tickets Table - Desktop */}
            <div
              className={`hidden md:block rounded-2xl overflow-hidden ${
                isDarkMode
                  ? 'bg-gradient-to-br from-[#1E1E23] to-[#141419] border border-white/10'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr
                      className={`border-b ${
                        isDarkMode
                          ? 'border-white/10 bg-white/5'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <th
                        className={`text-left px-6 py-4 text-xs font-semibold uppercase ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Subject
                      </th>
                      <th
                        className={`text-left px-6 py-4 text-xs font-semibold uppercase ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Status
                      </th>
                      <th
                        className={`text-left px-6 py-4 text-xs font-semibold uppercase ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Created
                      </th>
                      <th
                        className={`text-left px-6 py-4 text-xs font-semibold uppercase ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Updated
                      </th>
                      <th
                        className={`text-left px-6 py-4 text-xs font-semibold uppercase ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        ID
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket, index) => (
                      <tr
                        key={ticket.id}
                        className={`border-b transition-colors cursor-pointer ${
                          isDarkMode
                            ? 'border-white/5 hover:bg-white/5'
                            : 'border-gray-200 hover:bg-gray-50'
                        } ${index === filteredTickets.length - 1 ? 'border-0' : ''}`}
                      >
                        <td className='px-6 py-4'>
                          <div>
                            <p
                              className={`font-medium mb-1 ${
                                isDarkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {ticket.subject}
                            </p>
                            <p
                              className={`text-sm ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              {ticket.description}
                            </p>
                          </div>
                        </td>
                        <td className='px-6 text-nowrap py-4'>
                          {getStatusBadge(ticket.status)}
                        </td>
                        <td
                          className={`px-6 py-4 text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {ticket.created}
                        </td>
                        <td
                          className={`px-6 py-4 text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {ticket.updated}
                        </td>
                        <td
                          className={`px-6 py-4 text-sm font-mono ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}
                        >
                          {ticket.id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
      </div>

              {/* Pagination */}
              <div
                className={`flex items-center justify-between px-6 py-4 border-t ${
                  isDarkMode ? 'border-white/10' : 'border-gray-200'
                }`}
              >
                <p
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Showing 1-6 of 24 tickets
                </p>
                <div className='flex items-center gap-2'>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
      }`}
    >
                    Previous
                  </button>
                  <button
                    className='px-4 py-2 rounded-lg text-sm font-medium transition-all'
                    style={{
                      background: 'rgba(241, 203, 104, 0.2)',
                      color: '#F1CB68',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
      </div>

            {/* Tickets List - Mobile */}
            <div className='md:hidden space-y-3'>
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  className={`rounded-2xl p-4 cursor-pointer hover:opacity-90 transition-opacity ${
                    isDarkMode
                      ? 'bg-gradient-to-br from-[#1E1E23] to-[#141419] border border-white/10'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className='flex items-start justify-between gap-3 mb-3'>
      <h3
                      className={`font-medium text-sm flex-1 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
      >
                      {ticket.subject}
      </h3>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <p
                    className={`text-xs mb-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {ticket.description}
                  </p>
                  <div className='flex items-center justify-between text-xs'>
                    <div className='flex items-center gap-3'>
                      <span
                        className={
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }
                      >
                        Created:{' '}
                        <span
                          className={
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }
                        >
                          {ticket.created}
                        </span>
                      </span>
                    </div>
                    <span
                      className={`font-mono ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {ticket.id}
                    </span>
                  </div>
                </div>
              ))}

              {/* Pagination - Mobile */}
              <div className='flex items-center justify-between pt-4'>
                <p
                  className={`text-xs ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
                  Showing 1-6 of 24
                </p>
                <div className='flex items-center gap-2'>
                  <button
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    className='px-3 py-1.5 rounded-lg text-xs font-medium transition-all'
                    style={{
                      background: 'rgba(241, 203, 104, 0.2)',
                      color: '#F1CB68',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* New Ticket Modal */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        setIsOpen={setIsNewTicketModalOpen}
      />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
