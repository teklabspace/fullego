'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Image from 'next/image';
import { useState } from 'react';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'warning',
      message: 'Lorem ipsum lorem ipsum lorem ipsum',
      time: '2m ago',
      read: false,
      description: 'Your account requires immediate attention.',
    },
    {
      id: 2,
      type: 'success',
      message: 'Lorem ipsum lorem ipsum lorem ipsum',
      time: '2m ago',
      read: true,
      description: 'Transaction completed successfully.',
    },
    {
      id: 3,
      type: 'success',
      message: 'Lorem ipsum lorem ipsum lorem ipsum',
      time: '2m ago',
      read: true,
      description: 'Your document has been verified.',
    },
    {
      id: 4,
      type: 'warning',
      message: 'Lorem ipsum lorem ipsum lorem ipsum',
      time: '5m ago',
      read: false,
      description: 'Please update your profile information.',
    },
  ];

  const filteredNotifications =
    activeTab === 'all' ? notifications : notifications.filter(n => !n.read);

  return (
    <DashboardLayout>
      <div className='min-h-screen'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-white'>Notifications</h1>
          <p className='text-gray-400 mt-2'>
            Stay updated with your latest activities
          </p>
        </div>

        {/* Tabs */}
        <div className='flex items-center gap-3 mb-6'>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-8 py-3 rounded-full text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'all' ? 'text-black font-semibold' : 'bg-transparent text-white'
            }`}
            style={{
              background:
                activeTab === 'all'
                  ? 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
            }}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-8 py-3 rounded-full text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'unread'
                ? 'text-black font-semibold'
                : 'bg-transparent text-white'
            }`}
            style={{
              background:
                activeTab === 'unread'
                  ? 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
            }}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </button>
        </div>

        {/* Notifications List */}
        <div className='space-y-4'>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className='rounded-2xl p-6 hover:scale-[1.01] transition-transform cursor-pointer'
                style={{
                  background:
                    'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className='flex items-start gap-4'>
                  {/* Bell Icon */}
                  <div
                    className='w-12 h-12 rounded-full flex items-center justify-center shrink-0'
                    style={{
                      background: 'rgba(212, 175, 55, 0.2)',
                    }}
                  >
                    <Image src='/Bell.svg' alt='Bell' width={24} height={24} />
                  </div>

                  {/* Content */}
                  <div className='flex-1'>
                    <div className='flex items-start gap-2 mb-2'>
                      {notification.type === 'warning' ? (
                        <Image
                          src='/icons/warning.svg'
                          alt='Warning'
                          width={18}
                          height={18}
                        />
                      ) : (
                        <Image
                          src='/icons/check-circle.svg'
                          alt='Success'
                          width={18}
                          height={18}
                        />
                      )}
                      <p className='text-white font-medium flex-1'>
                        {notification.message}
                      </p>
                    </div>
                    <p className='text-gray-400 text-sm mb-2'>
                      {notification.description}
                    </p>
                    <p className='text-gray-500 text-xs'>{notification.time}</p>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div
                      className='w-3 h-3 rounded-full shrink-0'
                      style={{ background: '#D4AF37' }}
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div
              className='rounded-2xl p-12 text-center'
              style={{
                background:
                  'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p className='text-gray-400'>No notifications to display</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

