'use client';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { getTasks, createTask, markTaskComplete } from '@/utils/tasksApi';
import { getReminders, createReminder } from '@/utils/remindersApi';
import { toast } from 'react-toastify';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'notification';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [notifSubTab, setNotifSubTab] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [creatingReminder, setCreatingReminder] = useState(false);

  const tabs = [
    { id: 'basic', label: 'Basics' },
    { id: 'tasks', label: 'Task & Reminders' },
    { id: 'notification', label: 'Notification' },
  ];

  useEffect(() => {
    if (activeTab !== 'tasks') return;

    const fetchData = async () => {
      try {
        setTasksLoading(true);
        const tasksResponse = await getTasks({}, 20, 0);
        const tasksData = tasksResponse?.data || tasksResponse?.tasks || [];
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }

      try {
        setRemindersLoading(true);
        const remindersResponse = await getReminders({}, 20, 0);
        const remindersData =
          remindersResponse?.data || remindersResponse?.reminders || [];
        setReminders(Array.isArray(remindersData) ? remindersData : []);
      } catch (error) {
        console.error('Failed to load reminders:', error);
        setReminders([]);
      } finally {
        setRemindersLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      setCreatingTask(true);
      await createTask({
        title: newTaskTitle.trim(),
      });
      setNewTaskTitle('');
      const tasksResponse = await getTasks({}, 20, 0);
      const tasksData = tasksResponse?.data || tasksResponse?.tasks || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      toast.success('Task created');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task. Please try again.');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await markTaskComplete(taskId);
      const tasksResponse = await getTasks({}, 20, 0);
      const tasksData = tasksResponse?.data || tasksResponse?.tasks || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      toast.success('Task marked as complete');
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Failed to complete task. Please try again.');
    }
  };

  const handleCreateReminder = async () => {
    if (!newReminderTitle.trim() || !newReminderDate) return;

    try {
      setCreatingReminder(true);
      const isoDate = new Date(newReminderDate).toISOString();
      await createReminder({
        title: newReminderTitle.trim(),
        reminderDate: isoDate,
        notificationChannels: ['email'],
      });
      setNewReminderTitle('');
      setNewReminderDate('');
      const remindersResponse = await getReminders({}, 20, 0);
      const remindersData =
        remindersResponse?.data || remindersResponse?.reminders || [];
      setReminders(Array.isArray(remindersData) ? remindersData : []);
      toast.success('Reminder created');
    } catch (error) {
      console.error('Failed to create reminder:', error);
      toast.error('Failed to create reminder. Please try again.');
    } finally {
      setCreatingReminder(false);
    }
  };

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
                border: '1px solid rgba(241, 203, 104, 0.3)',
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
                        ? 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)'
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
                        ? 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  Unread
                </button>
              </div>

              {/* Notifications List */}
              <div className='px-6 pb-6'>
                <p className='text-gray-400 text-sm'>
                  Notifications are managed from the main Notifications page. No sample data is shown here.
                </p>
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
                    defaultValue=''
                    className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white focus:outline-none focus:border-[#F1CB68] transition-colors'
                  />
                </div>

                {/* Email */}
                <div>
                  <label className='block text-gray-400 text-sm mb-2'>
                    EMAIL
                  </label>
                  <input
                    type='email'
                    defaultValue=''
                    className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white focus:outline-none focus:border-[#F1CB68] transition-colors'
                  />
                </div>

                {/* Location */}
                <div>
                  <label className='block text-gray-400 text-sm mb-2'>
                    LOCATION
                  </label>
                  <input
                    type='text'
                    defaultValue=''
                    className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white focus:outline-none focus:border-[#F1CB68] transition-colors'
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className='block text-gray-400 text-sm mb-2'>
                    BIO
                  </label>
                  <textarea
                    rows={4}
                    defaultValue=''
                    className='w-full px-4 py-3 rounded-lg bg-transparent border border-white/10 text-white focus:outline-none focus:border-[#F1CB68] transition-colors resize-none'
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
            <div className='grid gap-6 md:grid-cols-2'>
              {/* Tasks Card */}
              <div
                className='rounded-2xl p-6'
                style={{
                  background:
                    'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h2 className='text-lg font-semibold text-white mb-4'>
                  My Tasks
                </h2>
                <div className='flex items-center gap-2 mb-4'>
                  <input
                    type='text'
                    placeholder='New task title'
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className='flex-1 px-3 py-2 rounded-lg bg-transparent border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#F1CB68]'
                  />
                  <button
                    onClick={handleCreateTask}
                    disabled={creatingTask || !newTaskTitle.trim()}
                    className='px-3 py-2 rounded-lg text-xs font-medium bg-white text-black disabled:opacity-50'
                  >
                    Add
                  </button>
                </div>
                {tasksLoading ? (
                  <div className='space-y-3'>
                    <div className='h-4 bg-white/10 rounded w-3/4 animate-pulse' />
                    <div className='h-4 bg-white/10 rounded w-2/3 animate-pulse' />
                    <div className='h-4 bg-white/10 rounded w-1/2 animate-pulse' />
                  </div>
                ) : tasks && tasks.length > 0 ? (
                  <ul className='space-y-3 max-h-72 overflow-y-auto'>
                    {tasks.map(task => (
                      <li
                        key={task.id}
                        className='border border-white/10 rounded-xl p-3 flex flex-col gap-2'
                      >
                        <div className='flex items-center justify-between'>
                          <p className='text-sm font-medium text-white truncate'>
                            {task.title}
                          </p>
                          <span className='text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-200 capitalize'>
                            {task.status || 'pending'}
                          </span>
                        </div>
                        {task.dueDate || task.due_date ? (
                          <p className='text-xs text-gray-400'>
                            Due:{' '}
                            {new Date(
                              task.dueDate || task.due_date,
                            ).toLocaleString()}
                          </p>
                        ) : null}
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => handleCompleteTask(task.id)}
                            className='self-start mt-1 text-xs text-black bg-white px-2 py-1 rounded-full font-medium'
                          >
                            Mark complete
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-gray-400 text-sm'>
                    You have no tasks yet.
                  </p>
                )}
              </div>

              {/* Reminders Card */}
              <div
                className='rounded-2xl p-6'
                style={{
                  background:
                    'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h2 className='text-lg font-semibold text-white mb-4'>
                  Upcoming Reminders
                </h2>
                <div className='flex flex-col gap-2 mb-4'>
                  <input
                    type='text'
                    placeholder='New reminder title'
                    value={newReminderTitle}
                    onChange={(e) => setNewReminderTitle(e.target.value)}
                    className='w-full px-3 py-2 rounded-lg bg-transparent border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#F1CB68]'
                  />
                  <input
                    type='datetime-local'
                    value={newReminderDate}
                    onChange={(e) => setNewReminderDate(e.target.value)}
                    className='w-full px-3 py-2 rounded-lg bg-transparent border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#F1CB68]'
                  />
                  <button
                    onClick={handleCreateReminder}
                    disabled={
                      creatingReminder ||
                      !newReminderTitle.trim() ||
                      !newReminderDate
                    }
                    className='self-start px-3 py-2 rounded-lg text-xs font-medium bg-white text-black disabled:opacity-50'
                  >
                    Add Reminder
                  </button>
                </div>
                {remindersLoading ? (
                  <div className='space-y-3'>
                    <div className='h-4 bg-white/10 rounded w-3/4 animate-pulse' />
                    <div className='h-4 bg-white/10 rounded w-2/3 animate-pulse' />
                    <div className='h-4 bg-white/10 rounded w-1/2 animate-pulse' />
                  </div>
                ) : reminders && reminders.length > 0 ? (
                  <ul className='space-y-3 max-h-72 overflow-y-auto'>
                    {reminders.map(reminder => (
                      <li
                        key={reminder.id}
                        className='border border-white/10 rounded-xl p-3 flex flex-col gap-1'
                      >
                        <p className='text-sm font-medium text-white truncate'>
                          {reminder.title}
                        </p>
                        {reminder.reminderDate || reminder.reminder_date ? (
                          <p className='text-xs text-gray-400'>
                            At:{' '}
                            {new Date(
                              reminder.reminderDate || reminder.reminder_date,
                            ).toLocaleString()}
                          </p>
                        ) : null}
                        {reminder.status && (
                          <p className='text-xs text-gray-500 capitalize'>
                            Status: {reminder.status}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='text-gray-400 text-sm'>
                    You have no reminders yet.
                  </p>
                )}
              </div>
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
            border: 1px solid rgba(241, 203, 104, 0.3) !important;
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

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
