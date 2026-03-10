'use client';
import { useTheme } from '@/context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
} from '@/utils/notificationsApi';

const POLL_INTERVAL_MS = 45 * 1000; // 45 seconds
const UNREAD_COUNT_KEY = 'notifications-unread-count';
const NOTIFICATIONS_LIST_KEY = 'notifications-list';

function useUnreadCount() {
  const { data, mutate, error } = useSWR(
    UNREAD_COUNT_KEY,
    async () => {
      const res = await getUnreadCount();
      const count = res?.data?.count ?? res?.count ?? (Array.isArray(res) ? 0 : res?.unreadCount ?? 0);
      return typeof count === 'number' ? count : 0;
    },
    {
      revalidateOnFocus: true,
      refreshInterval: POLL_INTERVAL_MS,
      dedupingInterval: 5000,
    }
  );
  return { unreadCount: data ?? 0, mutate, error };
}

function useNotificationsList(isOpen) {
  const { data, mutate, error, isLoading } = useSWR(
    isOpen ? NOTIFICATIONS_LIST_KEY : null,
    async () => {
      const res = await getNotifications();
      const list = res?.data ?? (Array.isArray(res) ? res : []);
      return Array.isArray(list) ? list : [];
    },
    {
      revalidateOnFocus: true,
      refreshInterval: isOpen ? POLL_INTERVAL_MS : 0,
      dedupingInterval: 2000,
    }
  );
  return { notifications: Array.isArray(data) ? data : [], mutate, error, isLoading };
}

function formatNotificationTime(createdAt) {
  if (!createdAt) return '';
  const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const { unreadCount, mutate: mutateUnreadCount } = useUnreadCount();
  const { notifications, mutate: mutateList, isLoading } = useNotificationsList(isOpen);

  const filteredNotifications =
    activeTab === 'all'
      ? notifications
      : notifications.filter((n) => !n.read);

  const handleMarkAsRead = useCallback(
    async (notification) => {
      const id = notification?.id ?? notification?.notificationId;
      if (!id) return;
      try {
        await markAsRead(id);
        mutateList(
          notifications.map((n) =>
            (n.id || n.notificationId) === id ? { ...n, read: true } : n
          ),
          { revalidate: false }
        );
        mutateUnreadCount(Math.max(0, unreadCount - 1), { revalidate: false });
      } catch (err) {
        console.warn('[NotificationDropdown] markAsRead failed', err);
      }
    },
    [notifications, unreadCount, mutateList, mutateUnreadCount]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const bellIconSrc = isDarkMode
    ? '/icons/bell.svg'
    : '/icons/belliconslightmode.svg';

  if (!mounted) {
    return (
      <div className="relative">
        <button
          type="button"
          className="flex items-center justify-center rounded-full relative cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Image
            src="/icons/bell.svg"
            alt="Notifications"
            width={55}
            height={55}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-full relative cursor-pointer hover:opacity-80 transition-opacity"
      >
        <Image src={bellIconSrc} alt="Notifications" width={55} height={55} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-black"
            style={{
              background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute -right-15 md:right-0 mt-3 w-[calc(100vw-2rem)] md:w-[400px] max-w-[400px] rounded-2xl overflow-hidden shadow-2xl z-50"
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
            <div
              className={`flex items-center justify-between p-6 border-b ${
                isDarkMode ? 'border-white/10' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-8 rounded-full"
                  style={{
                    background:
                      'linear-gradient(180deg, #FFFFFF 0%, #F1CB68 100%)',
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
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Image
                  src="/icons/close-icon.svg"
                  alt="Close"
                  width={16}
                  height={16}
                  style={{
                    filter: isDarkMode ? 'brightness(0) invert(1)' : 'none',
                  }}
                />
              </button>
            </div>

            <div className="flex items-center gap-3 px-6 pt-4">
              <button
                type="button"
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
                      ? 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)'
                      : 'transparent',
                }}
              >
                All
              </button>
              <button
                type="button"
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
                      ? 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                Unread
              </button>
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-default"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                <Image
                  src="/icons/filter.svg"
                  alt="Filter"
                  width={18}
                  height={18}
                  style={{
                    filter: isDarkMode ? 'brightness(0) invert(1)' : 'none',
                  }}
                />
              </span>
            </div>

            <div className="py-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="px-6 py-8 text-center">
                  <p
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Loading…
                  </p>
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => {
                  const id = notification.id ?? notification.notificationId;
                  const message =
                    notification.message ??
                    notification.title ??
                    notification.body ??
                    '';
                  const isUnread = !notification.read;
                  const time =
                    notification.time ??
                    formatNotificationTime(
                      notification.createdAt ?? notification.created_at
                    );
                  const isWarning =
                    notification.type === 'warning' ||
                    notification.category === 'warning' ||
                    notification.priority === 'high';

                  return (
                    <div
                      key={id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (isUnread) handleMarkAsRead(notification);
                      }}
                      onKeyDown={(e) => {
                        if (
                          (e.key === 'Enter' || e.key === ' ') &&
                          isUnread
                        ) {
                          e.preventDefault();
                          handleMarkAsRead(notification);
                        }
                      }}
                      className={`flex items-start gap-4 px-6 py-4 transition-colors cursor-pointer border-b ${
                        isDarkMode
                          ? 'hover:bg-white/5 border-white/5'
                          : 'hover:bg-gray-100 border-gray-200'
                      } ${isUnread ? (isDarkMode ? 'bg-white/5' : 'bg-gray-50/50') : ''}`}
                    >
                      <div className="flex items-center justify-center shrink-0">
                        <Image
                          src={bellIconSrc}
                          alt=""
                          width={20}
                          height={20}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          {isWarning ? (
                            <Image
                              src="/icons/warning.svg"
                              alt=""
                              width={16}
                              height={16}
                              className="shrink-0"
                            />
                          ) : (
                            <Image
                              src="/icons/check-circle.svg"
                              alt=""
                              width={16}
                              height={16}
                              className="shrink-0"
                            />
                          )}
                          <p
                            className={`text-sm flex-1 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            } ${isUnread ? 'font-medium' : ''}`}
                          >
                            {message}
                          </p>
                        </div>
                        {time && (
                          <p className="text-gray-400 text-xs mt-2">{time}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p
                    className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    No notifications
                  </p>
                </div>
              )}
            </div>

            <div
              className={`p-4 border-t ${
                isDarkMode ? 'border-white/10' : 'border-gray-200'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push('/dashboard/notifications');
                }}
                className="w-full px-6 py-3 rounded-full text-sm font-bold transition-all hover:opacity-90 cursor-pointer"
                style={{
                  background:
                    'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                  color: '#000000',
                }}
              >
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(241, 203, 104, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(241, 203, 104, 0.5);
        }
      `}</style>
    </div>
  );
}
