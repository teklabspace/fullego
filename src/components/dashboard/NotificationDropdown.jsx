'use client';
import { useTheme } from '@/context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { isDarkMode } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Notification data
  const notifications = [
    {
      id: 1,
      type: 'warning',
      message: 'Lorem ipsum lorem ipsum lorem ipsum',
      time: '2m ago',
      read: false,
    },
    {
      id: 2,
      type: 'success',
      message: 'Lorem ipsum lorem ipsum lorem ipsum',
      time: '2m ago',
      read: true,
    },
    {
      id: 3,
      type: 'success',
      message: 'Lorem ipsum lorem ipsum lorem ipsum',
      time: '2m ago',
      read: true,
    },
  ];

  const filteredNotifications =
    activeTab === 'all' ? notifications : notifications.filter(n => !n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!mounted) {
    return (
      <div className='relative'>
        <button className='flex items-center justify-center rounded-full relative cursor-pointer hover:opacity-80 transition-opacity'>
          <Image
            src='/icons/bell.svg'
            alt='Notifications'
            width={55}
            height={55}
          />
        </button>
      </div>
    );
  }

  const bellIconSrc = isDarkMode
    ? '/icons/bell.svg'
    : '/icons/belliconslightmode.svg';

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-center rounded-full relative cursor-pointer hover:opacity-80 transition-opacity'
      >
        <Image src={bellIconSrc} alt='Notifications' width={55} height={55} />
      </button>

      {/* Notification Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className='absolute -right-15 md:right-0 mt-3 w-[calc(100vw-2rem)] md:w-[400px] max-w-[400px] rounded-2xl overflow-hidden shadow-2xl z-50'
            style={{
              background: isDarkMode
                ? 'linear-gradient(135deg, rgba(30, 30, 35, 0.98) 0%, rgba(20, 20, 25, 0.98) 100%)'
                : 'rgba(255, 255, 255, 0.98)',
              border: isDarkMode
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between p-6 border-b ${
                isDarkMode ? 'border-white/10' : 'border-gray-200'
              }`}
            >
              <div className='flex items-center gap-3'>
                <div
                  className='w-2 h-8 rounded-full'
                  style={{
                    background:
                      'linear-gradient(180deg, #FFFFFF 0%, #D4AF37 100%)',
                  }}
                />
                <h3
                  className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Notification
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className='w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer'
              >
                <Image
                  src='/icons/close-icon.svg'
                  alt='Close'
                  width={16}
                  height={16}
                  style={{
                    filter: isDarkMode ? 'brightness(0) invert(1)' : 'none',
                  }}
                />
              </button>
            </div>

            {/* Tabs */}
            <div className='flex items-center gap-3 px-6 pt-4'>
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-6 py-3 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'text-black font-semibold'
                    : isDarkMode
                    ? 'bg-transparent text-white'
                    : 'bg-transparent text-gray-900'
                }`}
                style={{
                  background:
                    activeTab === 'all'
                      ? 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)'
                      : 'transparent',
                }}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 px-6 py-3 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'unread'
                    ? 'text-black font-semibold'
                    : isDarkMode
                    ? 'bg-transparent text-white'
                    : 'bg-transparent text-gray-900'
                }`}
                style={{
                  background:
                    activeTab === 'unread'
                      ? 'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                Unread
              </button>
              <button
                className='w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors'
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <Image
                  src='/icons/filter.svg'
                  alt='Filter'
                  width={18}
                  height={18}
                  style={{
                    filter: isDarkMode ? 'brightness(0) invert(1)' : 'none',
                  }}
                />
              </button>
            </div>

            {/* Notifications List */}
            <div className='py-4 max-h-[400px] overflow-y-auto custom-scrollbar'>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 px-6 py-4 transition-colors cursor-pointer border-b ${
                      isDarkMode
                        ? 'hover:bg-white/5 border-white/5'
                        : 'hover:bg-gray-100 border-gray-200'
                    }`}
                  >
                    {/* Bell Icon */}
                    <div className=' flex items-center justify-center shrink-0'>
                      <Image
                        src={bellIconSrc}
                        alt='Bell'
                        width={20}
                        height={20}
                      />
                    </div>

                    {/* Notification Content */}
                    <div className='flex-1'>
                      <div className='flex items-start gap-2'>
                        {notification.type === 'warning' ? (
                          <Image
                            src='/icons/warning.svg'
                            alt='Warning'
                            width={16}
                            height={16}
                          />
                        ) : (
                          <Image
                            src='/icons/check-circle.svg'
                            alt='Success'
                            width={16}
                            height={16}
                          />
                        )}
                        <p
                          className={`text-sm flex-1 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {notification.message}
                        </p>
                      </div>
                      <p className='text-gray-400 text-xs mt-2'>
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center py-8'>
                  <p className='text-gray-400 text-sm'>No notifications</p>
                </div>
              )}
            </div>

            {/* Footer Button */}
            <div
              className={`p-4 border-t ${
                isDarkMode ? 'border-white/10' : 'border-gray-200'
              }`}
            >
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/settings?tab=notification');
                }}
                className='w-full px-6 py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 cursor-pointer'
                style={{
                  background:
                    'linear-gradient(90deg, #FFFFFF 0%, #D4AF37 100%)',
                  color: '#000000',
                }}
              >
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.5);
        }
      `}</style>
    </div>
  );
}
