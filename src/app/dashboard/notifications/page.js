'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'react-toastify';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '@/utils/notificationsApi';

export default function NotificationsPage() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications and unread count
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (activeTab === 'all') {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [activeTab]);

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
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.isRead) {
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

  const filteredNotifications =
    activeTab === 'all' ? notifications : notifications.filter(n => !n.isRead);

  return (
    <DashboardLayout>
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
        {notifications.length > 0 && unreadCount > 0 && (
          <div className='mb-4 flex justify-end'>
            <button
              onClick={handleMarkAllAsRead}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 ${
                isDarkMode
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
            >
              Mark All as Read
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
            filteredNotifications.map(notification => {
              const notificationType = getNotificationType(notification.notificationType || notification.notification_type);
              return (
                <div
                  key={notification.id}
                  className='rounded-2xl p-6 hover:scale-[1.01] transition-transform cursor-pointer'
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className='flex items-start gap-4'>
                    {/* Bell Icon */}
                    <div
                      className='w-12 h-12 rounded-full flex items-center justify-center shrink-0'
                      style={{
                        background: 'rgba(241, 203, 104, 0.2)',
                      }}
                    >
                      <Image src='/Bell.svg' alt='Bell' width={24} height={24} />
                    </div>

                    {/* Content */}
                    <div className='flex-1'>
                      <div className='flex items-start gap-2 mb-2'>
                        {notificationType === 'warning' ? (
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
                        <p className={`font-medium flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {notification.title || notification.message || 'Notification'}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className='text-gray-400 hover:text-red-400 transition-colors'
                        >
                          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                            <path d='M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
                          </svg>
                        </button>
                      </div>
                      <p className='text-gray-400 text-sm mb-2'>
                        {notification.message || notification.description || ''}
                      </p>
                      <p className='text-gray-500 text-xs'>
                        {formatTimeAgo(notification.createdAt || notification.created_at)}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div
                        className='w-3 h-3 rounded-full shrink-0'
                        style={{ background: '#F1CB68' }}
                      />
                    )}
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
    </DashboardLayout>
  );
}

