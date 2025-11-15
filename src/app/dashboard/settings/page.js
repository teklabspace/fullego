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
    { id: 'payment', label: 'Payment and billing' },
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
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          {activeTab === 'profile' && 'Manage your account preferences'}
          {activeTab === 'linked' &&
            'Connect external platforms to manage your assets, payments, or identity.'}
          {activeTab === 'payment' &&
            'Manage your payment methods and billing information.'}
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
      {activeTab === 'payment' && <PaymentBilling isDarkMode={isDarkMode} />}
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
            <label
              className={`block text-sm mb-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
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
            <label
              className={`block text-sm mb-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Email
            </label>
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
            <label
              className={`block text-sm mb-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Phone
            </label>
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
            <label
              className={`block text-sm mb-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Country
            </label>
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
        <p
          className={`text-sm mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
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
        <button
          className={`shrink-0 transition-colors ${
            isDarkMode
              ? 'text-gray-400 hover:text-gray-300'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
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
        <p
          className={`ms-16 text-sm mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Linked on {service.linkedDate}
        </p>
      )}
      {service.status === 'pending' && (
        <p
          className={`ms-16 text-sm mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Linking in progress...
        </p>
      )}
      {service.status === 'error' && (
        <p
          className={`ms-16 text-sm mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Failed to link...
        </p>
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

// Payment and Billing Tab
function PaymentBilling({ isDarkMode }) {
  const paymentHistory = [
    {
      date: 'Nov 28, 2023',
      details:
        'Marketing Monthly Plan from Nov 28, 2023 to Dec 28, 2024 Recurring payment',
      total: '49.00 USD',
      invoice: '#',
      status: 'PAID',
    },
    {
      date: 'Oct 28, 2023',
      details:
        'Marketing Monthly Plan from Oct 28, 2023 to Nov 28, 2024 Recurring payment',
      total: '49.00 USD',
      invoice: '#',
      status: 'PAID',
    },
    {
      date: 'Sep 28, 2023',
      details:
        'Marketing Monthly Plan from Sep 28, 2023 to Oct 28, 2024 Recurring payment',
      total: '49.00 USD',
      invoice: '#',
      status: 'PAID',
    },
    {
      date: 'Aug 28, 2023',
      details:
        'Developer Monthly Plan from Aug 28, 2023 to Sep 28, 2024 Recurring payment',
      total: '7.00 USD',
      invoice: '#',
      status: 'PAID',
    },
    {
      date: 'Jul 28, 2023',
      details:
        'Developer Monthly Plan from Jul 28, 2023 to Aug 28, 2024 Recurring payment',
      total: '7.00 USD',
      invoice: '#',
      status: 'PAID',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
        <h2
          className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Billing
        </h2>
        <button className='px-4 py-2.5 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold hover:bg-[#BF9B30] transition-colors flex items-center gap-2 justify-center sm:w-auto'>
          <span className='text-lg'>+</span>
          UPGRADE PLAN
        </button>
      </div>

      {/* Current Plan Section */}
      <div
        className={`rounded-2xl p-4 md:p-6 border ${
          isDarkMode
            ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className='mb-6'>
          <p
            className={`text-base mb-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Plan:{' '}
            <span
              className={`font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Marketing
            </span>
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          {/* Annual Plan */}
          <div>
            <label
              className={`block text-xs font-semibold uppercase mb-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              ANNUAL PLAN
            </label>
            <div className='flex items-center gap-2 mb-2'>
              <span
                className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                49.00 USD estimated,
              </span>
              <button
                className={`text-sm underline ${
                  isDarkMode ? 'text-[#F1CB68]' : 'text-[#BF9B30]'
                } hover:opacity-80 transition-opacity`}
              >
                detail
              </button>
            </div>
            <p
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Next payment Dec 28, 2023
            </p>
          </div>

          {/* Monthly Overage */}
          <div>
            <label
              className={`block text-xs font-semibold uppercase mb-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              MONTHLY OVERAGE
            </label>
            <div className='flex items-center gap-2 mb-2'>
              <span
                className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                0.00 USD estimated
              </span>
            </div>
            <p
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Next payment Dec 28, 2023
            </p>
          </div>
        </div>

        <p
          className={`text-xs mb-6 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}
        >
          This amount is the current amount. The final amount will depend on the
          limits exceeded at the end of the payment period.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Bill To */}
          <div
            className={`rounded-xl p-5 border ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#1A1A1D] to-[#151518] border-[#F1CB68]/20'
                : 'bg-gradient-to-br from-white to-gray-50 border-[#F1CB68]/30'
            }`}
          >
            <div className='flex items-center gap-2 mb-4'>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDarkMode ? 'bg-[#F1CB68]/10' : 'bg-[#F1CB68]/10'
                }`}
              >
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  className='text-[#F1CB68]'
                >
                  <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
                  <circle cx='12' cy='10' r='3' />
                </svg>
              </div>
              <label
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                BILL TO
              </label>
            </div>
            <div
              className={`px-4 py-4 rounded-lg mb-4 ${
                isDarkMode
                  ? 'bg-white/5 border border-[#FFFFFF14]'
                  : 'bg-white/80 border border-gray-200'
              }`}
            >
              <p
                className={`text-sm leading-relaxed ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                <span className='font-semibold'>John Doe</span>
                <br />
                123 Main Street
                <br />
                New York, NY 10001
              </p>
            </div>
            <button
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                isDarkMode
                  ? 'bg-[#F1CB68]/10 text-[#F1CB68] border border-[#F1CB68]/30 hover:bg-[#F1CB68]/20'
                  : 'bg-[#F1CB68]/10 text-[#BF9B30] border border-[#F1CB68]/30 hover:bg-[#F1CB68]/20'
              }`}
            >
              MANAGE BILLING INFO
            </button>
          </div>

          {/* Payment Method */}
          <div
            className={`rounded-xl p-5 border ${
              isDarkMode
                ? 'bg-gradient-to-br from-[#1A1A1D] to-[#151518] border-[#F1CB68]/20'
                : 'bg-gradient-to-br from-white to-gray-50 border-[#F1CB68]/30'
            }`}
          >
            <div className='flex items-center gap-2 mb-4'>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isDarkMode ? 'bg-[#F1CB68]/10' : 'bg-[#F1CB68]/10'
                }`}
              >
                <svg
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  className='text-[#F1CB68]'
                >
                  <rect x='1' y='4' width='22' height='16' rx='2' ry='2' />
                  <line x1='1' y1='10' x2='23' y2='10' />
                </svg>
              </div>
              <label
                className={`text-xs font-bold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                PAYMENT METHOD
              </label>
            </div>
            <div
              className={`px-4 py-4 rounded-lg mb-4 ${
                isDarkMode
                  ? 'bg-white/5 border border-[#FFFFFF14]'
                  : 'bg-white/80 border border-gray-200'
              }`}
            >
              <div className='flex items-center justify-between'>
                <div>
                  <p
                    className={`text-base font-semibold mb-1 tracking-wider ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    .... .... .... 4242
                  </p>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Visa
                    </span>
                    <span
                      className={`text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}
                    >
                      ••••
                    </span>
                  </div>
                </div>
                <div
                  className={`w-12 h-8 rounded flex items-center justify-center ${
                    isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                  }`}
                >
                  <span className='text-lg font-bold text-[#F1CB68]'>V</span>
                </div>
              </div>
            </div>
            <button
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                isDarkMode
                  ? 'bg-[#F1CB68]/10 text-[#F1CB68] border border-[#F1CB68]/30 hover:bg-[#F1CB68]/20'
                  : 'bg-[#F1CB68]/10 text-[#BF9B30] border border-[#F1CB68]/30 hover:bg-[#F1CB68]/20'
              }`}
            >
              MANAGE PAYMENT METHOD
            </button>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div
        className={`rounded-2xl p-4 md:p-6 border ${
          isDarkMode
            ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
            : 'bg-white border-gray-200'
        }`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Payment history
        </h3>

        {/* Table - Desktop */}
        <div className='hidden md:block overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr
                className={`border-b ${
                  isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                }`}
              >
                <th
                  className={`text-left py-3 px-4 text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  CREATION DATE
                </th>
                <th
                  className={`text-left py-3 px-4 text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  DETAILS
                </th>
                <th
                  className={`text-left py-3 px-4 text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  INVOICE TOTAL
                </th>
                <th
                  className={`text-left py-3 px-4 text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  INVOICE
                </th>
                <th
                  className={`text-left py-3 px-4 text-xs font-semibold uppercase ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment, index) => (
                <tr
                  key={index}
                  className={`border-b last:border-0 ${
                    isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                  }`}
                >
                  <td
                    className={`py-4 px-4 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {payment.date}
                  </td>
                  <td
                    className={`py-4 px-4 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {payment.details}
                  </td>
                  <td
                    className={`py-4 px-4 font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {payment.total}
                  </td>
                  <td className='py-4 px-4'>
                    <a
                      href={payment.invoice}
                      className={`inline-flex items-center gap-1 text-sm ${
                        isDarkMode ? 'text-[#F1CB68]' : 'text-[#BF9B30]'
                      } hover:opacity-80 transition-opacity`}
                    >
                      PDF
                      <svg
                        width='14'
                        height='14'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                      >
                        <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
                        <polyline points='15 3 21 3 21 9' />
                        <line x1='10' y1='14' x2='21' y2='3' />
                      </svg>
                    </a>
                  </td>
                  <td className='py-4 px-4'>
                    <span className='inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold'>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className='md:hidden space-y-4'>
          {paymentHistory.map((payment, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                isDarkMode
                  ? 'bg-white/5 border-[#FFFFFF14]'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className='flex justify-between items-start mb-2'>
                <p
                  className={`text-sm font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {payment.date}
                </p>
                <span className='inline-block px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold'>
                  {payment.status}
                </span>
              </div>
              <p
                className={`text-sm mb-3 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {payment.details}
              </p>
              <div className='flex justify-between items-center'>
                <span
                  className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {payment.total}
                </span>
                <a
                  href={payment.invoice}
                  className={`inline-flex items-center gap-1 text-sm ${
                    isDarkMode ? 'text-[#F1CB68]' : 'text-[#BF9B30]'
                  } hover:opacity-80 transition-opacity`}
                >
                  PDF
                  <svg
                    width='14'
                    height='14'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' />
                    <polyline points='15 3 21 3 21 9' />
                    <line x1='10' y1='14' x2='21' y2='3' />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
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
        <p
          className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {description}
        </p>
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
