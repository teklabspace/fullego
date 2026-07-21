'use client';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'react-toastify';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '@/utils/notificationsApi';

// "nadia nazar" / "NADIA NAZAR" → "Nadia Nazar"
const titleCase = (s) =>
  (s || '').toString().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default function NotificationsPage() {
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  // Initial load only — no polling. Live updates arrive over the socket below
  // (so the page never re-fetches and flashes the skeleton on its own).
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [activeTab]);

  // Prepend new notifications pushed over the WebSocket (broadcast by
  // RealtimeNotifications) instantly — no API recall, no skeleton.
  useEffect(() => {
    const onNew = (e) => {
      const msg = e.detail;
      if (!msg) return;
      console.log('[notifications page] live update', msg.type, msg.notification_id);
      const code = msg.asset_code ? ` on ${msg.asset_code}` : '';
      const title =
        msg.type === 'appraisal_created'
          ? `New appraisal request${code}`
          : `New message${code}`;
      const realId = msg.notification_id;
      const item = {
        id: realId || `live-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
        notificationId: realId,
        type: msg.type,
        title,
        preview: msg.preview,
        author_name: msg.author_name,
        asset_code: msg.asset_code,
        asset_name: msg.asset_name,
        appraisal_id: msg.appraisal_id,
        created_at: msg.created_at || new Date().toISOString(),
        read: false,
        isRead: false,
      };
      setNotifications((prev) => {
        if (realId && prev.some((n) => (n.id || n.notificationId) === realId)) {
          return prev; // already in the list
        }
        return [item, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    };
    window.addEventListener('app:notification', onNew);
    return () => window.removeEventListener('app:notification', onNew);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications({
        unreadOnly: activeTab === 'unread',
      });
      const notificationsData = response.data || response || [];
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.count || response.data?.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    // Optimistically flip everything to read — the per-item CSS transition fades
    // the unread highlight out. This animation IS the loading (no skeleton); we
    // load fresh data in the background while it plays.
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
    try {
      await markAllAsRead();
      try {
        const response = await getNotifications({ unreadOnly: activeTab === 'unread' });
        setNotifications(response.data || response || []);
      } catch {
        /* keep the optimistic read state */
      }
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !(notification.isRead ?? notification.read)) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get notification type icon
  const getNotificationType = (notificationType) => {
    const typeMap = {
      order_filled: 'success',
      order_cancelled: 'warning',
      offer_received: 'success',
      offer_accepted: 'success',
      listing_approved: 'success',
      payment_received: 'success',
      kyc_approved: 'success',
      support_reply: 'info',
      general: 'info',
    };
    return typeMap[notificationType] || 'info';
  };

  // The API layer normalizes the read flag onto `.read`; optimistic local
  // updates set both. Hedge across the two so the Unread filter never treats
  // an already-read item as unread (`!undefined` was previously true).
  const filteredNotifications =
    activeTab === 'all'
      ? notifications
      : notifications.filter(n => !(n.isRead ?? n.read ?? false));

  return (
    <>
      <div className='min-h-screen'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h1>
          <p className='text-gray-400 mt-2'>
            Stay updated with your latest activities
          </p>
        </div>

        {/* Tabs */}
        <div className='flex items-center gap-3 mb-6'>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-8 py-3 rounded-full text-sm font-medium transition-all cursor-pointer ${
              activeTab === 'all' ? 'text-black font-semibold' : isDarkMode ? 'bg-transparent text-white' : 'bg-transparent text-gray-900'
            }`}
            style={{
              background:
                activeTab === 'all'
                  ? 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)'
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
                : isDarkMode ? 'bg-transparent text-white' : 'bg-transparent text-gray-900'
            }`}
            style={{
              background:
                activeTab === 'unread'
                  ? 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
            }}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Mark All as Read Button */}
        {notifications.length > 0 && (unreadCount > 0 || markingAll) && (
          <div className='mb-4 flex justify-end'>
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                markingAll
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:opacity-90'
              } ${
                isDarkMode
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {markingAll ? 'Marking…' : 'Mark All as Read'}
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className='space-y-4'>
          {loading ? (
            // Skeleton Loader for Notifications
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className='rounded-2xl p-6 animate-pulse'
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className='flex items-start gap-4'>
                    {/* Bell Icon Skeleton */}
                    <div
                      className='w-12 h-12 rounded-full shrink-0'
                      style={{
                        background: 'rgba(241, 203, 104, 0.2)',
                      }}
                    />
                    {/* Content Skeleton */}
                    <div className='flex-1 space-y-3'>
                      <div className='flex items-start gap-2'>
                        <div className={`h-4 w-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        <div className={`h-5 flex-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        <div className={`h-4 w-4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                      </div>
                      <div className={`h-4 w-3/4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                      <div className={`h-3 w-1/4 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                    </div>
                    {/* Unread Indicator Skeleton */}
                    <div className={`w-3 h-3 rounded-full shrink-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                  </div>
                </div>
              ))}
            </>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, idx) => {
              const authorName = notification.authorName ?? notification.author_name;
              const assetCode = notification.assetCode ?? notification.asset_code;
              const appraisalId = notification.appraisalId ?? notification.appraisal_id;
              const isRead = notification.isRead ?? notification.read ?? false;
              const message =
                notification.preview ??
                notification.message ??
                notification.description ??
                '';
              const openThread = (e) => {
                e.stopPropagation();
                if (!isRead) handleMarkAsRead(notification.id);
                if (appraisalId) {
                  router.push(`/dashboard/concierge?appraisal=${appraisalId}`);
                }
              };
              return (
                <div
                  key={notification.id}
                  className='rounded-2xl p-4 transition-colors cursor-pointer'
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  onClick={() => {
                    if (!isRead) handleMarkAsRead(notification.id);
                  }}
                >
                  <div className='flex items-start gap-3'>
                    {/* Larger bell icon (with its built-in dot) */}
                    <Image src='/icons/bell.svg' alt='' width={44} height={44} className='shrink-0' />

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      {/* Top row: tag + code, then time + delete */}
                      <div className='flex items-center justify-between gap-2 mb-1.5'>
                        <div className='flex items-center gap-2 min-w-0'>
                          {authorName && (
                            <span className='text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F1CB68]/15 text-[#F1CB68] truncate max-w-[180px]'>
                              {titleCase(authorName)}
                            </span>
                          )}
                          {assetCode && (
                            <span className='text-[11px] font-mono text-gray-400 shrink-0'>
                              {assetCode}
                            </span>
                          )}
                        </div>
                        <div className='flex items-center gap-2 shrink-0'>
                          <span className='text-[11px] text-gray-400'>
                            {formatTimeAgo(notification.createdAt || notification.created_at)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification.id);
                            }}
                            aria-label='Delete'
                            className='text-gray-400 hover:text-red-400 transition-colors'
                          >
                            <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                              <path d='M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {notification.title && (
                        <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {notification.title}
                        </p>
                      )}

                      {/* Message in a background box; click opens the thread */}
                      <button
                        onClick={openThread}
                        style={{ transitionDelay: markingAll ? `${idx * 70}ms` : '0ms' }}
                        className={`inline-flex max-w-full text-left items-center gap-2 rounded-xl px-3 py-1.5 transition-colors duration-500 ${
                          !isRead ? 'bg-[#F1CB68]/10 hover:bg-[#F1CB68]/15' : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className={`min-w-0 text-sm line-clamp-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} ${!isRead ? 'font-medium' : ''}`}>
                          {message}
                        </span>
                        {appraisalId && (
                          <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='shrink-0 text-gray-400'>
                            <path d='M9 18l6-6-6-6' />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
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
    </>
  );
}

