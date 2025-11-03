'use client';
import NewTicketModal from '@/components/dashboard/NewTicketModal';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'notification';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [notifSubTab, setNotifSubTab] = useState('all');
  const [ticketFilter, setTicketFilter] = useState('all');
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  const tabs = [
    { id: 'basic', label: 'Basics' },
    { id: 'tasks', label: 'Task & Reminders' },
    { id: 'notification', label: 'Notification' },
    { id: 'payment', label: 'Payment' },
    { id: 'support', label: 'Support Ticket' },
  ];

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
      open: { bg: 'rgba(212, 175, 55, 0.2)', color: '#D4AF37', text: 'Open' },
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

  const notifications = [
    {
      id: 1,
      icon: '/icons/Frame2121453925.svg',

      message: 'Your asset increased by 5% in the past 24 hours.',
      time: '2m ago',
    },
    {
      id: 2,
      icon: '/icons/document-notification.svg',

      message: 'A new document has been shared with you.',
      time: '2m ago',
    },
    {
      id: 3,
      icon: '/icons/Frame2121453925.svg',

      message: 'ETH is now $2400.34.',
      time: '24hrs ago',
    },
    {
      id: 4,
      icon: '/icons/Frame2121453925.svg',

      message: 'AAPL Trade at $458,060.97 was successful.',
      time: '7days ago',
    },
    {
      id: 5,
      icon: '/icons/Frame2121453925.svg',
      iconColor: '#D4AF37',
      message: 'BTC Halving will take place in 4 days.',
      time: '7days ago',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'notification':
        return (
          <div>
            {/* Header */}
            <div className='flex items-center justify-between mb-8'>
              <h1 className='text-3xl font-bold text-white'>All</h1>
              <button className='w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors'>
                <Image
                  src='/icons/search.svg'
                  alt='Search'
                  width={20}
                  height={20}
                />
              </button>
            </div>

            {/* Notification Content Card */}
            <div
              className='rounded-2xl overflow-hidden'
              style={{
                background:
                  'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
              }}
            >
              {/* Tabs */}
              <div className='flex items-center gap-3 p-6 pb-4'>
                <button
                  onClick={() => setNotifSubTab('all')}
                  className={`flex-1 px-8 py-3 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    notifSubTab === 'all'
                      ? 'text-black font-semibold'
                      : 'bg-transparent text-white'
                  }`}
                  style={{
                    background:
                      notifSubTab === 'all'
                        ? 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  All
                </button>
                <button
                  onClick={() => setNotifSubTab('unread')}
                  className={`flex-1 px-8 py-3 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    notifSubTab === 'unread'
                      ? 'text-black font-semibold'
                      : 'bg-transparent text-white'
                  }`}
                  style={{
                    background:
                      notifSubTab === 'unread'
                        ? 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  Unread
                </button>
              </div>

              {/* Notifications List */}
              <div className='px-6 pb-6'>
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 py-5 ${
                      index !== notifications.length - 1
                        ? 'border-b border-white/5'
                        : ''
                    }`}
                  >
                    {/* Icon */}
                    <div>
                      <Image
                        src={notification.icon}
                        alt='Icon'
                        width={50}
                        height={20}
                      />
                    </div>

                    {/* Content */}
                    <div className='flex-1'>
                      <p className='text-white text-sm mb-2'>
                        {notification.message}
                      </p>
                      <p className='text-gray-400 text-xs'>
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'basic':
        return (
          <div>
            {/* Header */}
            <div className='flex items-center gap-2 mb-6 md:mb-8'>
              <Image
                src='/icons/user-icon.svg'
                alt='Profile'
                width={20}
                height={20}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <h1 className='text-xl md:text-2xl font-bold text-white'>
                Profile information
              </h1>
            </div>

            {/* Profile Form */}
            <div
              className='rounded-2xl p-4 md:p-8'
              style={{
                background:
                  'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Profile Picture */}
              <div className='flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 md:mb-8'>
                <div className='w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-[#F1CB68] flex items-center justify-center shrink-0'>
                  <Image
                    src='/icons/user-avatar.svg'
                    alt='Profile'
                    width={80}
                    height={80}
                  />
                </div>
                <div className='flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto'>
                  <button
                    className='px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all hover:opacity-90 cursor-pointer whitespace-nowrap'
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white',
                    }}
                  >
                    + Upload new picture
                  </button>
                  <button className='text-gray-400 text-xs md:text-sm hover:text-white transition-colors cursor-pointer'>
                    Remove
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className='space-y-6'>
                {/* Name */}
                <div>
                  <label className='block text-gray-400 text-sm mb-2'>
                    NAME
                  </label>
                  <input
                    type='text'
                    defaultValue='Olivia Benson'
                    className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white focus:outline-none focus:border-[#D4AF37] transition-colors'
                  />
                </div>

                {/* Email */}
                <div>
                  <label className='block text-gray-400 text-sm mb-2'>
                    EMAIL
                  </label>
                  <input
                    type='email'
                    defaultValue='hello@gmail.com'
                    className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white focus:outline-none focus:border-[#D4AF37] transition-colors'
                  />
                </div>

                {/* Location */}
                <div>
                  <label className='block text-gray-400 text-sm mb-2'>
                    LOCATION
                  </label>
                  <input
                    type='text'
                    defaultValue='United States'
                    className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white focus:outline-none focus:border-[#D4AF37] transition-colors'
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className='block text-gray-400 text-sm mb-2'>
                    BIO
                  </label>
                  <textarea
                    rows={4}
                    defaultValue='Lorem ipsum dolor sit amet, consectetur'
                    className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-none'
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div>
            <h1 className='text-3xl font-bold text-white mb-6'>
              Task & Reminders
            </h1>
            <div
              className='rounded-2xl p-8'
              style={{
                background:
                  'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p className='text-gray-400'>
                Task & Reminders content coming soon...
              </p>
            </div>
          </div>
        );

      case 'support':
        return (
          <div>
            {/* Header */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8'>
              <div>
                <h1 className='text-2xl md:text-3xl font-bold text-white mb-2'>
                  Support Ticket Center
                </h1>
                <p className='text-gray-400 text-xs md:text-sm'>
                  Manage your requests and support conversations.
                </p>
              </div>
              <button
                onClick={() => setIsNewTicketModalOpen(true)}
                className='px-4 md:px-6 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all hover:opacity-90 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap'
                style={{
                  background:
                    'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)',
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
                  />
                </div>
                <input
                  type='text'
                  placeholder='Search by keyword or ticket ID'
                  className='w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 rounded-lg text-sm bg-transparent border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-colors'
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
                        : 'text-gray-400'
                    }`}
                    style={{
                      background:
                        ticketFilter === filter.id
                          ? 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)'
                          : 'transparent',
                      border:
                        ticketFilter === filter.id
                          ? 'none'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tickets Table - Desktop */}
            <div
              className='hidden md:block rounded-2xl overflow-hidden'
              style={{
                background:
                  'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr
                      className='border-b border-white/10'
                      style={{ background: 'rgba(255, 255, 255, 0.02)' }}
                    >
                      <th className='text-left px-6 py-4 text-gray-400 text-xs font-semibold uppercase'>
                        Subject
                      </th>
                      <th className='text-left px-6 py-4 text-gray-400 text-xs font-semibold uppercase'>
                        Status
                      </th>
                      <th className='text-left px-6 py-4 text-gray-400 text-xs font-semibold uppercase'>
                        Created
                      </th>
                      <th className='text-left px-6 py-4 text-gray-400 text-xs font-semibold uppercase'>
                        Updated
                      </th>
                      <th className='text-left px-6 py-4 text-gray-400 text-xs font-semibold uppercase'>
                        ID
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket, index) => (
                      <tr
                        key={ticket.id}
                        className={`border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${
                          index === filteredTickets.length - 1 ? 'border-0' : ''
                        }`}
                      >
                        <td className='px-6 py-4'>
                          <div>
                            <p className='text-white font-medium mb-1'>
                              {ticket.subject}
                            </p>
                            <p className='text-gray-400 text-sm'>
                              {ticket.description}
                            </p>
                          </div>
                        </td>
                        <td className='px-6 text-nowrap py-4'>
                          {getStatusBadge(ticket.status)}
                        </td>
                        <td className='px-6 py-4 text-gray-400 text-sm'>
                          {ticket.created}
                        </td>
                        <td className='px-6 py-4 text-gray-400 text-sm'>
                          {ticket.updated}
                        </td>
                        <td className='px-6 py-4 text-gray-400 text-sm font-mono'>
                          {ticket.id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className='flex items-center justify-between px-6 py-4 border-t border-white/10'>
                <p className='text-gray-400 text-sm'>
                  Showing 1-6 of 24 tickets
                </p>
                <div className='flex items-center gap-2'>
                  <button className='px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer'>
                    Previous
                  </button>
                  <button
                    className='px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer'
                    style={{
                      background: 'rgba(212, 175, 55, 0.2)',
                      color: '#D4AF37',
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
                  className='rounded-2xl p-4 cursor-pointer hover:opacity-90 transition-opacity'
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className='flex items-start justify-between gap-3 mb-3'>
                    <h3 className='text-white font-medium text-sm flex-1'>
                      {ticket.subject}
                    </h3>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <p className='text-gray-400 text-xs mb-3'>
                    {ticket.description}
                  </p>
                  <div className='flex items-center justify-between text-xs'>
                    <div className='flex items-center gap-3'>
                      <span className='text-gray-500'>
                        Created:{' '}
                        <span className='text-gray-400'>{ticket.created}</span>
                      </span>
                    </div>
                    <span className='text-gray-400 font-mono'>{ticket.id}</span>
                  </div>
                </div>
              ))}

              {/* Pagination - Mobile */}
              <div className='flex items-center justify-between pt-4'>
                <p className='text-gray-400 text-xs'>Showing 1-6 of 24</p>
                <div className='flex items-center gap-2'>
                  <button className='px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors cursor-pointer'>
                    Previous
                  </button>
                  <button
                    className='px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer'
                    style={{
                      background: 'rgba(212, 175, 55, 0.2)',
                      color: '#D4AF37',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div>
            <h1 className='text-3xl font-bold text-white mb-6'>
              Payment Settings
            </h1>
            <div
              className='rounded-2xl p-8'
              style={{
                background:
                  'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p className='text-gray-400'>
                Payment settings content coming soon...
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-[#101014] text-white'>
      <div className='max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8'>
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className='mb-6 w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer'
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Image
            src='/icons/arrow-left.svg'
            alt='Back'
            width={20}
            height={20}
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </button>

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6'>
          {/* Tabs - Mobile (Top) / Desktop (Left Sidebar) */}
          <div className='flex lg:flex-col gap-0 lg:gap-3 overflow-x-auto lg:overflow-x-visible scrollbar-hide border-b border-white/10 lg:border-b-0'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`settings-tab relative px-4 lg:px-6 py-3 lg:py-4 lg:rounded-2xl text-sm lg:text-base font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 lg:w-full text-left ${
                  activeTab === tab.id
                    ? 'text-white settings-tab-active'
                    : 'text-gray-400 settings-tab-inactive'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Content Area */}
          <div>{renderContent()}</div>
        </div>
      </div>

      {/* New Ticket Modal */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        setIsOpen={setIsNewTicketModalOpen}
      />

      {/* Global Styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Mobile Tab Styles */
        @media (max-width: 1023px) {
          .settings-tab-active {
            border-bottom: 2px solid #ffffff;
          }
          .settings-tab-inactive {
            border-bottom: 2px solid transparent;
          }
        }

        /* Desktop Tab Styles */
        @media (min-width: 1024px) {
          .settings-tab-active {
            background: linear-gradient(
              135deg,
              rgba(30, 30, 35, 0.8) 0%,
              rgba(20, 20, 25, 0.9) 100%
            ) !important;
            border: 1px solid rgba(212, 175, 55, 0.3) !important;
          }
          .settings-tab-inactive {
            background: transparent !important;
            border: 1px solid transparent !important;
          }
        }
      `}</style>
    </div>
  );
}
