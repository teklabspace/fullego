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

// "nadia nazar" / "NADIA NAZAR" → "Nadia Nazar"
const titleCase = (s) =>
  (s || '').toString().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

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
          className="flex items-center justify-center rounded-full relative cursor-pointer hover:opacity-80 transition-opacity w-11 h-11 md:w-14 md:h-14"
        >
          <Image src="/icons/bell.svg" alt="Notifications" width={56} height={56} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-full relative cursor-pointer hover:opacity-80 transition-opacity w-11 h-11 md:w-14 md:h-14"
      >
        {/* Rounded bell icon (matches the message icon) */}
        <Image src={bellIconSrc} alt="Notifications" width={56} height={56} />
        {/* Conditional dot — only when there is something unread */}
        {unreadCount > 0 && (
          <span
            className="absolute top-2 right-2.5 md:top-2.5 md:right-3 w-2.5 h-2.5 rounded-full"
            style={{
              background: '#F1CB68',
              boxShadow: `0 0 0 2px ${isDarkMode ? '#101014' : '#ffffff'}`,
            }}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute -right-15 md:right-0 mt-3 w-[calc(100vw-2rem)] md:w-[400px] max-w-[400px] max-h-[80vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl z-50"
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
              className={`shrink-0 flex items-center justify-between p-6 border-b ${
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

            <div className="shrink-0 flex items-center gap-3 px-6 pt-4">
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

            <div className="flex-1 min-h-0 py-2 overflow-y-auto custom-scrollbar">
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
                    notification.preview ??
                    notification.message ??
                    notification.title ??
                    notification.body ??
                    '';
                  const authorName =
                    notification.authorName ?? notification.author_name;
                  const appraisalId =
                    notification.appraisalId ?? notification.appraisal_id;
                  const assetCode =
                    notification.assetCode ?? notification.asset_code;
                  const isUnread = !notification.read;
                  const time =
                    notification.time ??
                    formatNotificationTime(
                      notification.createdAt ?? notification.created_at
                    );

                  const openThread = (e) => {
                    e.stopPropagation();
                    if (isUnread) handleMarkAsRead(notification);
                    setIsOpen(false);
                    if (appraisalId) {
                      router.push(`/dashboard/concierge?appraisal=${appraisalId}`);
                    }
                  };

                  return (
                    <div
                      key={id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (isUnread) handleMarkAsRead(notification);
                      }}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && isUnread) {
                          e.preventDefault();
                          handleMarkAsRead(notification);
                        }
                      }}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
                        isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                      }`}
                    >
                      {/* Larger bell icon (with its built-in dot) */}
                      <Image src={bellIconSrc} alt="" width={40} height={40} className="shrink-0" />

                      <div className="flex-1 min-w-0">
                        {/* Top row: username tag + code, time on the right */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            {authorName && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F1CB68]/15 text-[#F1CB68] truncate max-w-[130px]">
                                {titleCase(authorName)}
                              </span>
                            )}
                            {assetCode && (
                              <span className="text-[11px] font-mono text-gray-400 shrink-0">
                                {assetCode}
                              </span>
                            )}
                          </div>
                          {time && (
                            <span className="text-[10px] text-gray-400 shrink-0">{time}</span>
                          )}
                        </div>

                        {/* Message in a background box; click opens the thread */}
                        <button
                          type="button"
                          onClick={openThread}
                          className={`inline-flex max-w-full text-left items-center gap-2 rounded-xl px-3 py-1.5 transition-colors ${
                            isUnread
                              ? 'bg-[#F1CB68]/10 hover:bg-[#F1CB68]/15'
                              : isDarkMode
                              ? 'bg-white/5 hover:bg-white/10'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <span
                            className={`min-w-0 text-sm line-clamp-2 ${
                              isDarkMode ? 'text-gray-200' : 'text-gray-800'
                            } ${isUnread ? 'font-medium' : ''}`}
                          >
                            {message}
                          </span>
                          {appraisalId && (
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          )}
                        </button>
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
              className={`shrink-0 p-4 border-t ${
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
