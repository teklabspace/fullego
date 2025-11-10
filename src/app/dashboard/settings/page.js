'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

export default function SettingsPage() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyReports: true,
    marketUpdates: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showPortfolio: false,
    twoFactorAuth: true,
  });

  const tabs = [
    { id: 'profile', label: 'Profile Settings' },
    { id: 'linked', label: 'Linked Accounts' },
  ];

  return (
    <DashboardLayout>
      <div className='mb-6'>
        <h1
          className={`text-2xl md:text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Settings
        </h1>
        <p className='text-gray-400'>
          {activeTab === 'profile' && 'Manage your account preferences'}
          {activeTab === 'linked' &&
            'Connect external platforms to manage your assets, payments, or identity.'}
        </p>
      </div>

      {/* Tabs */}
      <div className='flex gap-2 md:gap-4 mb-6 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 md:px-6 py-2.5 md:py-3 rounded-full text-sm md:text-base font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? isDarkMode
                  ? 'bg-[linear-gradient(94.02deg,#222126_0%,#111116_100%)] text-white'
                  : 'bg-gray-200 text-gray-900 border border-gray-300'
                : isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-white/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <ProfileSettings
          isDarkMode={isDarkMode}
          notifications={notifications}
          setNotifications={setNotifications}
          privacy={privacy}
          setPrivacy={setPrivacy}
        />
      )}
      {activeTab === 'linked' && <LinkedAccounts isDarkMode={isDarkMode} />}
    </DashboardLayout>
  );
}

// Profile Settings Tab
function ProfileSettings({
  isDarkMode,
  notifications,
  setNotifications,
  privacy,
  setPrivacy,
}) {
  return (
    <div className='space-y-6'>
      {/* Profile Information */}
      <div
        className={`rounded-2xl p-4 md:p-6 border ${
          isDarkMode
            ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
            : 'bg-white border-gray-200'
        }`}
      >
        <h2
          className={`text-lg font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Profile Information
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
          <div>
            <label className='block text-gray-400 text-sm mb-2'>
              Full Name
            </label>
            <input
              type='text'
              defaultValue='John Doe'
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                isDarkMode
                  ? 'bg-white/5 border-[#FFFFFF14] text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className='block text-gray-400 text-sm mb-2'>Email</label>
            <input
              type='email'
              defaultValue='john.doe@email.com'
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                isDarkMode
                  ? 'bg-white/5 border-[#FFFFFF14] text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className='block text-gray-400 text-sm mb-2'>Phone</label>
            <input
              type='tel'
              defaultValue='+1 (555) 123-4567'
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                isDarkMode
                  ? 'bg-white/5 border-[#FFFFFF14] text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className='block text-gray-400 text-sm mb-2'>Country</label>
            <select
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                isDarkMode
                  ? 'bg-white/5 border-[#FFFFFF14] text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            >
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Australia</option>
            </select>
          </div>
        </div>
        <div className='flex flex-col sm:flex-row gap-3 mt-6'>
          <button className='px-6 py-3 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold hover:bg-[#BF9B30] transition-colors'>
            Save Changes
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold border transition-colors ${
              isDarkMode
                ? 'border-[#FFFFFF14] text-white hover:bg-white/5'
                : 'border-gray-300 text-gray-900 hover:bg-gray-50'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div
        className={`rounded-2xl p-4 md:p-6 border ${
          isDarkMode
            ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
            : 'bg-white border-gray-200'
        }`}
      >
        <h2
          className={`text-lg font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Notifications
        </h2>
        <div className='space-y-4'>
          <ToggleRow
            label='Email Alerts'
            description='Receive important updates via email'
            checked={notifications.emailAlerts}
            onChange={() =>
              setNotifications({
                ...notifications,
                emailAlerts: !notifications.emailAlerts,
              })
            }
            isDarkMode={isDarkMode}
          />
          <ToggleRow
            label='Push Notifications'
            description='Get instant notifications on your device'
            checked={notifications.pushNotifications}
            onChange={() =>
              setNotifications({
                ...notifications,
                pushNotifications: !notifications.pushNotifications,
              })
            }
            isDarkMode={isDarkMode}
          />
          <ToggleRow
            label='Weekly Reports'
            description='Receive weekly portfolio performance reports'
            checked={notifications.weeklyReports}
            onChange={() =>
              setNotifications({
                ...notifications,
                weeklyReports: !notifications.weeklyReports,
              })
            }
            isDarkMode={isDarkMode}
          />
          <ToggleRow
            label='Market Updates'
            description='Stay informed about market trends'
            checked={notifications.marketUpdates}
            onChange={() =>
              setNotifications({
                ...notifications,
                marketUpdates: !notifications.marketUpdates,
              })
            }
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      {/* Privacy & Security */}
      <div
        className={`rounded-2xl p-4 md:p-6 border ${
          isDarkMode
            ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
            : 'bg-white border-gray-200'
        }`}
      >
        <h2
          className={`text-lg font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Privacy & Security
        </h2>
        <div className='space-y-4 mb-6'>
          <ToggleRow
            label='Profile Visible'
            description='Make your profile visible to other users'
            checked={privacy.profileVisible}
            onChange={() =>
              setPrivacy({
                ...privacy,
                profileVisible: !privacy.profileVisible,
              })
            }
            isDarkMode={isDarkMode}
          />
          <ToggleRow
            label='Show Portfolio'
            description='Display your portfolio publicly'
            checked={privacy.showPortfolio}
            onChange={() =>
              setPrivacy({ ...privacy, showPortfolio: !privacy.showPortfolio })
            }
            isDarkMode={isDarkMode}
          />
          <ToggleRow
            label='Two-Factor Authentication'
            description='Add extra security to your account'
            checked={privacy.twoFactorAuth}
            onChange={() =>
              setPrivacy({ ...privacy, twoFactorAuth: !privacy.twoFactorAuth })
            }
            isDarkMode={isDarkMode}
          />
        </div>
        <div
          className={`pt-4 border-t ${
            isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
          }`}
        >
          <button className='text-red-400 hover:text-red-300 text-sm font-medium transition-colors'>
            Change Password
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className={`rounded-2xl p-4 md:p-6 border border-red-500/30 ${
          isDarkMode ? 'bg-[#1A1A1D]' : 'bg-white'
        }`}
      >
        <h2 className='text-lg font-semibold text-red-400 mb-2'>Danger Zone</h2>
        <p className='text-gray-400 text-sm mb-4'>
          These actions cannot be undone
        </p>
        <div className='flex flex-col sm:flex-row gap-3'>
          <button className='px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium'>
            Deactivate Account
          </button>
          <button className='px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium'>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

// Linked Accounts Tab
function LinkedAccounts({ isDarkMode }) {
  const connectedServices = [
    {
      name: 'PayPal',
      status: 'connected',
      linkedDate: 'Feb 12, 2023',
      icon: '💳',
    },
    { name: 'MetaMask', status: 'pending', linkedDate: null, icon: '🦊' },
    { name: 'CoinBase', status: 'error', linkedDate: null, icon: '🪙' },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
        <h2
          className={`text-xl font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Connected Services
        </h2>
        <button className='px-4 py-2.5 bg-[#F1CB68] text-[#101014] rounded-lg font-medium hover:bg-[#BF9B30] transition-colors flex items-center gap-2 justify-center sm:w-auto'>
          <span className='text-lg'>+</span>
          Link New Account
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
        {connectedServices.map((service, index) => (
          <ServiceCard key={index} service={service} isDarkMode={isDarkMode} />
        ))}
      </div>
    </div>
  );
}

// Service Card Component
function ServiceCard({ service, isDarkMode }) {
  return (
    <div
      className={`rounded-2xl p-5 md:p-6  ${
        isDarkMode ? '' : 'bg-white border-gray-200'
      }`}
    >
      {/* Header with Icon, Name/Status, and Link Icon */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${
              isDarkMode ? 'bg-white/5' : 'bg-gray-100'
            }`}
          >
            {service.icon}
          </div>

          {/* Name and Status */}
          <div>
            <h3
              className={`font-semibold text-base ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {service.name}
            </h3>
            {service.status === 'connected' && (
              <span className='inline-block mt-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium'>
                Connected
              </span>
            )}
            {service.status === 'pending' && (
              <span className='inline-block mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium'>
                Pending
              </span>
            )}
            {service.status === 'error' && (
              <span className='inline-block mt-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-medium'>
                Error
              </span>
            )}
          </div>
        </div>

        {/* Link Icon */}
        <button className='text-gray-400 hover:text-gray-300 shrink-0'>
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
          >
            <path
              d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path
              d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'
              strokeWidth='2'
              strokeLinecap='round'
            />
          </svg>
        </button>
      </div>

      {/* Date/Status Info */}
      {service.linkedDate && (
        <p className='text-gray-400 ms-16 text-sm mb-4'>
          Linked on {service.linkedDate}
        </p>
      )}
      {service.status === 'pending' && (
        <p className='text-gray-400 ms-16 text-sm mb-4'>
          Linking in progress...
        </p>
      )}
      {service.status === 'error' && (
        <p className='text-gray-400 ms-16 text-sm mb-4'>Failed to link...</p>
      )}

      {/* Action Buttons */}
      <div className='flex gap-3'>
        <button
          className={`flex-1 px-4  py-2 rounded-lg font-medium border transition-all ${
            isDarkMode
              ? 'border-[#F1CB68] text-white hover:bg-[#F1CB68]/10'
              : 'border-[#F1CB68] text-gray-900 hover:bg-[#F1CB68]/10'
          }`}
        >
          Manage
        </button>
        <button className='px-4 py-2 text-red-400 hover:text-red-300 font-medium transition-colors'>
          Disconnect
        </button>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, isDarkMode }) {
  return (
    <div
      className={`flex items-center justify-between py-3 border-b last:border-0 ${
        isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
      }`}
    >
      <div className='flex-1'>
        <p
          className={`font-medium mb-1 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {label}
        </p>
        <p className='text-gray-400 text-sm'>{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`
          relative w-12 h-6 rounded-full transition-colors shrink-0 ml-4
          ${checked ? 'bg-[#F1CB68]' : 'bg-gray-600'}
        `}
      >
        <span
          className={`
            absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
            ${checked ? 'translate-x-1' : '-translate-x-5'}
          `}
        />
      </button>
    </div>
  );
}
