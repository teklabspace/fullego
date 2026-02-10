'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getUserProfile,
  updateUserProfile,
  getNotificationPreferences,
  updateNotificationPreferences,
  getPrivacyPreferences,
  updatePrivacyPreferences,
  get2FAStatus,
  setup2FA,
  verify2FA,
  toggle2FA,
  changePassword,
  deactivateAccount,
  deleteAccount,
  clearTokens,
} from '@/utils/authApi';
import {
  getBankAccounts,
  unlinkBankAccount,
  getBankTransactions,
} from '@/utils/bankingApi';
import {
  getPaymentMethods,
  getPaymentHistory,
  listInvoices,
} from '@/utils/paymentsApi';
import {
  getCurrentSubscription,
  getSubscriptionLimits,
} from '@/utils/subscriptionsApi';

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
    twoFactorAuth: false,
    twoFactorAuthVerified: false,
  });

  const [loadingPreferences, setLoadingPreferences] = useState(true);

  // Fetch notification and privacy preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoadingPreferences(true);
        
        // Fetch notification preferences
        const notifPrefs = await getNotificationPreferences();
        setNotifications({
          emailAlerts: notifPrefs.email_alerts ?? true,
          pushNotifications: notifPrefs.push_notifications ?? false,
          weeklyReports: notifPrefs.weekly_reports ?? true,
          marketUpdates: notifPrefs.market_updates ?? true,
        });

        // Fetch privacy preferences
        const privacyPrefs = await getPrivacyPreferences();
        setPrivacy({
          profileVisible: privacyPrefs.profile_visible ?? true,
          showPortfolio: privacyPrefs.show_portfolio ?? false,
          twoFactorAuth: privacyPrefs.two_factor_auth_enabled ?? false,
          twoFactorAuthVerified: privacyPrefs.two_factor_auth_verified ?? false,
        });
      } catch (err) {
        console.error('Error fetching preferences:', err);
        // Use defaults on error
      } finally {
        setLoadingPreferences(false);
      }
    };

    fetchPreferences();
  }, []);

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
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    country: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Notification preferences state
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState(null);
  const [notificationSuccess, setNotificationSuccess] = useState(false);
  
  // Privacy preferences state
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [privacyError, setPrivacyError] = useState(null);
  const [privacySuccess, setPrivacySuccess] = useState(false);
  
  // 2FA state
  const [twoFactorStatus, setTwoFactorStatus] = useState({
    enabled: false,
    verified: false,
  });
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  // Modals state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Change password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Account deletion form
  const [deleteForm, setDeleteForm] = useState({
    password: '',
    confirmationText: '',
  });
  
  // Deactivate form
  const [deactivateForm, setDeactivateForm] = useState({
    reason: '',
    password: '',
  });

  // Fetch user profile and 2FA status on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch profile
        const profile = await getUserProfile();
        setProfileData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          country: profile.country || '',
        });
        
        // Fetch 2FA status
        try {
          const status = await get2FAStatus();
          setTwoFactorStatus({
            enabled: status.enabled || false,
            verified: status.verified || false,
          });
        } catch (err) {
          console.error('Error fetching 2FA status:', err);
          // Check if it's a backend library error
          const errorMessage = err.message || err.detail || '';
          if (errorMessage.includes('pyotp') || errorMessage.includes('qrcode') || errorMessage.includes('not available')) {
            setTwoFactorError(
              '2FA is currently unavailable. The backend requires pyotp and qrcode libraries to be installed.'
            );
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle input changes
  const handleChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear success message on change
    if (success) setSuccess(false);
    if (error) setError(null);
  };

  // Handle save changes
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Prepare data for API (use snake_case for backend)
      const updateData = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        phone: profileData.phone,
        country: profileData.country,
      };

      await updateUserProfile(updateData);
      
      setSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel (reset to original values)
  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);
      const profile = await getUserProfile();
      
      setProfileData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        country: profile.country || '',
      });
      setSuccess(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle notification preference change
  const handleNotificationChange = async (field, value) => {
    const updated = { ...notifications, [field]: value };
    setNotifications(updated);
    
    try {
      setSavingNotifications(true);
      setNotificationError(null);
      await updateNotificationPreferences({
        email_alerts: updated.emailAlerts,
        push_notifications: updated.pushNotifications,
        weekly_reports: updated.weeklyReports,
        market_updates: updated.marketUpdates,
      });
      setNotificationSuccess(true);
      setTimeout(() => setNotificationSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating notifications:', err);
      setNotificationError(err.message || 'Failed to update notification preferences');
      // Revert on error
      setNotifications(notifications);
    } finally {
      setSavingNotifications(false);
    }
  };

  // Handle privacy preference change
  const handlePrivacyChange = async (field, value) => {
    const updated = { ...privacy, [field]: value };
    setPrivacy(updated);
    
    try {
      setSavingPrivacy(true);
      setPrivacyError(null);
      
      if (field === 'twoFactorAuth') {
        // Handle 2FA toggle separately
        await handle2FAToggle(value);
        return;
      }
      
      await updatePrivacyPreferences({
        profile_visible: updated.profileVisible,
        show_portfolio: updated.showPortfolio,
      });
      setPrivacySuccess(true);
      setTimeout(() => setPrivacySuccess(false), 3000);
    } catch (err) {
      console.error('Error updating privacy:', err);
      setPrivacyError(err.message || 'Failed to update privacy preferences');
      // Revert on error
      setPrivacy(privacy);
    } finally {
      setSavingPrivacy(false);
    }
  };

  // Handle 2FA setup
  const handle2FASetup = async () => {
    try {
      setTwoFactorError(null);
      setVerificationSuccess(false);
      setTwoFactorCode('');
      setShowManualEntry(false);
      const setup = await setup2FA();
      setTwoFactorSetup(setup);
      setShow2FASetup(true);
    } catch (err) {
      console.error('Error setting up 2FA:', err);
      
      // Check for backend library error
      const errorMessage = err.message || err.detail || '';
      if (errorMessage.includes('pyotp') || errorMessage.includes('qrcode') || errorMessage.includes('not available')) {
        setTwoFactorError(
          '2FA is currently unavailable. The backend requires pyotp and qrcode libraries to be installed. Please contact your administrator.'
        );
      } else {
        setTwoFactorError(errorMessage || 'Failed to setup 2FA. Please try again.');
      }
    }
  };

  // Handle 2FA verification
  const handle2FAVerify = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setTwoFactorError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setTwoFactorError(null);
      await verify2FA(twoFactorCode);
      
      // Store backup codes from setup
      if (twoFactorSetup && twoFactorSetup.backup_codes) {
        setBackupCodes(twoFactorSetup.backup_codes);
        setShowBackupCodes(true);
      }
      
      setVerificationSuccess(true);
      setTwoFactorCode('');
      
      // Refresh 2FA status
      const status = await get2FAStatus();
      setTwoFactorStatus({
        enabled: status.enabled || false,
        verified: status.verified || false,
      });
      setPrivacy({ ...privacy, twoFactorAuth: status.enabled || false });
      
      setPrivacySuccess(true);
      setTimeout(() => setPrivacySuccess(false), 3000);
    } catch (err) {
      console.error('Error verifying 2FA:', err);
      setTwoFactorError(err.message || 'Invalid verification code. Please try again.');
    }
  };

  // Copy secret to clipboard
  const handleCopySecret = async () => {
    if (twoFactorSetup?.secret) {
      try {
        await navigator.clipboard.writeText(twoFactorSetup.secret);
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Copy backup codes to clipboard
  const handleCopyBackupCodes = async () => {
    if (backupCodes.length > 0) {
      try {
        await navigator.clipboard.writeText(backupCodes.join('\n'));
        setCopiedCodes(true);
        setTimeout(() => setCopiedCodes(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // Download backup codes as file
  const handleDownloadBackupCodes = () => {
    if (backupCodes.length > 0) {
      const content = backupCodes.join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'backup-codes.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Handle 2FA toggle
  const handle2FAToggle = async (enabled) => {
    if (enabled && !twoFactorStatus.verified) {
      // Need to setup first
      await handle2FASetup();
      return;
    }

    try {
      setTwoFactorError(null);
      await toggle2FA(enabled);
      
      // Refresh 2FA status
      const status = await get2FAStatus();
      setTwoFactorStatus({
        enabled: status.enabled || false,
        verified: status.verified || false,
      });
      
      setPrivacySuccess(true);
      setTimeout(() => setPrivacySuccess(false), 3000);
    } catch (err) {
      console.error('Error toggling 2FA:', err);
      
      // Check for backend library error
      const errorMessage = err.message || err.detail || '';
      if (errorMessage.includes('pyotp') || errorMessage.includes('qrcode') || errorMessage.includes('not available')) {
        setTwoFactorError(
          '2FA is currently unavailable. The backend requires pyotp and qrcode libraries to be installed. Please contact your administrator.'
        );
      } else {
        setTwoFactorError(errorMessage || 'Failed to toggle 2FA. Please try again.');
      }
      
      // Revert on error
      setPrivacy({ ...privacy, twoFactorAuth: !enabled });
    }
  };

  // Handle change password
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setError(null);
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      setShowChangePasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.message || 'Failed to change password. Please try again.');
    }
  };

  // Handle deactivate account
  const handleDeactivateAccount = async () => {
    if (!deactivateForm.password) {
      setError('Please enter your password to confirm');
      return;
    }

    try {
      setError(null);
      await deactivateAccount(deactivateForm.reason, deactivateForm.password);
      clearTokens();
      router.push('/login');
    } catch (err) {
      console.error('Error deactivating account:', err);
      setError(err.message || 'Failed to deactivate account. Please try again.');
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (!deleteForm.password) {
      setError('Please enter your password to confirm');
      return;
    }

    if (deleteForm.confirmationText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    try {
      setError(null);
      await deleteAccount(deleteForm.password, deleteForm.confirmationText);
      clearTokens();
      router.push('/login');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err.message || 'Failed to delete account. Please try again.');
    }
  };

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

        {/* Success Message */}
        {success && (
          <div className='mb-4 p-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm'>
            Profile updated successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className='mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm'>
            {error}
          </div>
        )}

        {loading ? (
          <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading profile...
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
            <div>
              <label
                className={`block text-sm mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                First Name
              </label>
              <input
                type='text'
                value={profileData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                  isDarkMode
                    ? 'bg-white/5 border-[#FFFFFF14] text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
                placeholder='Enter first name'
              />
            </div>
            <div>
              <label
                className={`block text-sm mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Last Name
              </label>
              <input
                type='text'
                value={profileData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                  isDarkMode
                    ? 'bg-white/5 border-[#FFFFFF14] text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
                placeholder='Enter last name'
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
                value={profileData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                  isDarkMode
                    ? 'bg-white/5 border-[#FFFFFF14] text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
                placeholder='Enter email'
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
                value={profileData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                  isDarkMode
                    ? 'bg-white/5 border-[#FFFFFF14] text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
                placeholder='Enter phone number'
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
              <input
                type='text'
                value={profileData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                  isDarkMode
                    ? 'bg-white/5 border-[#FFFFFF14] text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
                placeholder='Enter country'
              />
            </div>
          </div>
        )}

        <div className='flex flex-col sm:flex-row gap-3 mt-6'>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className={`px-6 py-3 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold hover:bg-[#BF9B30] transition-colors ${
              saving || loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving || loading}
            className={`px-6 py-3 rounded-lg font-semibold border transition-colors ${
              isDarkMode
                ? 'border-[#FFFFFF14] text-white hover:bg-white/5'
                : 'border-gray-300 text-gray-900 hover:bg-gray-50'
            } ${saving || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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

        {/* Success Message */}
        {notificationSuccess && (
          <div className='mb-4 p-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm'>
            Notification preferences updated successfully!
          </div>
        )}

        {/* Error Message */}
        {notificationError && (
          <div className='mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm'>
            {notificationError}
          </div>
        )}

        <div className='space-y-4'>
          <ToggleRow
            label='Email Alerts'
            description='Receive important updates via email'
            checked={notifications.emailAlerts}
            onChange={() => handleNotificationChange('emailAlerts', !notifications.emailAlerts)}
            isDarkMode={isDarkMode}
            disabled={savingNotifications}
          />
          <ToggleRow
            label='Push Notifications'
            description='Get instant notifications on your device'
            checked={notifications.pushNotifications}
            onChange={() => handleNotificationChange('pushNotifications', !notifications.pushNotifications)}
            isDarkMode={isDarkMode}
            disabled={savingNotifications}
          />
          <ToggleRow
            label='Weekly Reports'
            description='Receive weekly portfolio performance reports'
            checked={notifications.weeklyReports}
            onChange={() => handleNotificationChange('weeklyReports', !notifications.weeklyReports)}
            isDarkMode={isDarkMode}
            disabled={savingNotifications}
          />
          <ToggleRow
            label='Market Updates'
            description='Stay informed about market trends'
            checked={notifications.marketUpdates}
            onChange={() => handleNotificationChange('marketUpdates', !notifications.marketUpdates)}
            isDarkMode={isDarkMode}
            disabled={savingNotifications}
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

        {/* Success Message */}
        {privacySuccess && (
          <div className='mb-4 p-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm'>
            Privacy preferences updated successfully!
          </div>
        )}

        {/* Error Message */}
        {privacyError && (
          <div className='mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm'>
            {privacyError}
          </div>
        )}

        {/* 2FA Error */}
        {twoFactorError && (
          <div className='mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm'>
            {twoFactorError}
          </div>
        )}

        <div className='space-y-4 mb-6'>
          <ToggleRow
            label='Profile Visible'
            description='Make your profile visible to other users'
            checked={privacy.profileVisible}
            onChange={() => handlePrivacyChange('profileVisible', !privacy.profileVisible)}
            isDarkMode={isDarkMode}
            disabled={savingPrivacy}
          />
          <ToggleRow
            label='Show Portfolio'
            description='Display your portfolio publicly'
            checked={privacy.showPortfolio}
            onChange={() => handlePrivacyChange('showPortfolio', !privacy.showPortfolio)}
            isDarkMode={isDarkMode}
            disabled={savingPrivacy}
          />
          <div className='py-3 border-b last:border-0'>
            <div className='flex items-center justify-between'>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-1'>
                  <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Two-Factor Authentication
                  </p>
                  {twoFactorStatus.enabled && twoFactorStatus.verified && (
                    <span className='px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium'>
                      Active
                    </span>
                  )}
                  {twoFactorStatus.enabled && !twoFactorStatus.verified && (
                    <span className='px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium'>
                      Setup Required
                    </span>
                  )}
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {twoFactorStatus.verified
                    ? 'Your account is protected with two-factor authentication'
                    : twoFactorStatus.enabled
                    ? 'Please complete the setup to enable 2FA'
                    : 'Add an extra layer of security to your account'}
                </p>
              </div>
              <button
                onClick={() => handlePrivacyChange('twoFactorAuth', !privacy.twoFactorAuth)}
                disabled={savingPrivacy}
                className={`
                  relative w-12 h-6 rounded-full transition-colors shrink-0 ml-4
                  ${privacy.twoFactorAuth ? 'bg-[#F1CB68]' : 'bg-gray-600'}
                  ${savingPrivacy ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <span
                  className={`
                    absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                    ${privacy.twoFactorAuth ? 'translate-x-1' : '-translate-x-5'}
                  `}
                />
              </button>
            </div>
            {twoFactorStatus.enabled && !twoFactorStatus.verified && (
              <button
                onClick={handle2FASetup}
                className='mt-3 px-4 py-2 bg-[#F1CB68] text-[#101014] rounded-lg text-sm font-medium hover:bg-[#BF9B30] transition-colors'
              >
                Complete Setup
              </button>
            )}
          </div>
        </div>
        <div
          className={`pt-4 border-t ${
            isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
          }`}
        >
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className='text-red-400 hover:text-red-300 text-sm font-medium transition-colors'
          >
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
          <button
            onClick={() => setShowDeactivateModal(true)}
            className='px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium'
          >
            Deactivate Account
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className='px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium'
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {show2FASetup && twoFactorSetup && !verificationSuccess && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'>
          <div
            className={`rounded-2xl p-6 max-w-2xl w-full my-8 ${
              isDarkMode ? 'bg-[#1A1A1D] border border-[#FFFFFF14]' : 'bg-white border border-gray-200'
            }`}
          >
            <div className='flex items-center justify-between mb-6'>
              <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Setup Two-Factor Authentication
              </h3>
              <button
                onClick={() => {
                  setShow2FASetup(false);
                  setTwoFactorCode('');
                  setTwoFactorSetup(null);
                  setTwoFactorError(null);
                  setShowManualEntry(false);
                }}
                className={`p-2 rounded-lg hover:bg-white/5 transition-colors ${
                  isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
              </button>
            </div>
            
            {twoFactorError && (
              <div className='mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm'>
                {twoFactorError}
              </div>
            )}

            {/* Step 1: QR Code */}
            <div className='mb-6'>
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-8 h-8 rounded-full bg-[#F1CB68] text-[#101014] flex items-center justify-center font-bold text-sm'>
                  1
                </div>
                <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Scan QR Code
                </h4>
              </div>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Open Google Authenticator (or any authenticator app) and scan this QR code:
              </p>
              <div className='flex justify-center p-4 bg-white rounded-lg border-2 border-gray-200 mb-4'>
                <img 
                  src={twoFactorSetup.qr_code_url} 
                  alt='2FA QR Code' 
                  className='w-64 h-64 max-w-full'
                  onError={(e) => {
                    e.target.style.display = 'none';
                    setTwoFactorError('Failed to load QR code. Please use manual entry.');
                  }}
                />
              </div>
              
              {/* Manual Entry Toggle */}
              <button
                onClick={() => setShowManualEntry(!showManualEntry)}
                className={`w-full p-3 rounded-lg border transition-colors text-sm font-medium ${
                  isDarkMode
                    ? 'border-[#FFFFFF14] text-gray-400 hover:text-white hover:bg-white/5'
                    : 'border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {showManualEntry ? '▼ Hide' : '▶ Show'} Manual Entry Option
              </button>

              {/* Manual Entry Section */}
              {showManualEntry && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  isDarkMode ? 'bg-white/5 border-[#FFFFFF14]' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Can't scan? Enter this secret manually in your authenticator app:
                  </p>
                  <div className='flex items-center gap-2 p-3 rounded bg-white/5 border border-[#FFFFFF14]'>
                    <code className={`flex-1 text-sm font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {twoFactorSetup.secret}
                    </code>
                    <button
                      onClick={handleCopySecret}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        copiedSecret
                          ? 'bg-green-500/20 text-green-400'
                          : isDarkMode
                          ? 'bg-white/10 text-white hover:bg-white/20'
                          : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                      }`}
                    >
                      {copiedSecret ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    In Google Authenticator: Tap "+" → "Enter a setup key" → Account: Your email, Key: {twoFactorSetup.secret}, Type: Time-based
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Verification */}
            <div className='mb-6'>
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-8 h-8 rounded-full bg-[#F1CB68] text-[#101014] flex items-center justify-center font-bold text-sm'>
                  2
                </div>
                <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Enter Verification Code
                </h4>
              </div>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Enter the 6-digit code from your authenticator app:
              </p>
              <input
                type='text'
                inputMode='numeric'
                pattern='[0-9]{6}'
                value={twoFactorCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setTwoFactorCode(value);
                  setTwoFactorError(null);
                }}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] text-center text-2xl font-mono tracking-widest ${
                  isDarkMode
                    ? 'bg-white/5 border-[#FFFFFF14] text-white focus:border-[#F1CB68]'
                    : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-[#F1CB68]'
                }`}
                placeholder='000000'
                maxLength={6}
                autoFocus
                autoComplete='one-time-code'
              />
            </div>

            <div className='flex gap-3'>
              <button
                onClick={handle2FAVerify}
                disabled={twoFactorCode.length !== 6}
                className={`flex-1 px-6 py-3 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold hover:bg-[#BF9B30] transition-colors ${
                  twoFactorCode.length !== 6 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Verify & Enable 2FA
              </button>
              <button
                onClick={() => {
                  setShow2FASetup(false);
                  setTwoFactorCode('');
                  setTwoFactorSetup(null);
                  setTwoFactorError(null);
                  setShowManualEntry(false);
                }}
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
        </div>
      )}

      {/* Backup Codes Modal */}
      {showBackupCodes && backupCodes.length > 0 && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'>
          <div
            className={`rounded-2xl p-6 max-w-2xl w-full my-8 ${
              isDarkMode ? 'bg-[#1A1A1D] border border-[#FFFFFF14]' : 'bg-white border border-gray-200'
            }`}
          >
            <div className='text-center mb-6'>
              <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center'>
                <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='text-green-400'>
                  <polyline points='20 6 9 17 4 12' />
                </svg>
              </div>
              <h3 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                2FA Enabled Successfully!
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Your account is now protected with two-factor authentication.
              </p>
            </div>

            <div className={`p-6 rounded-lg border-2 mb-6 ${
              isDarkMode 
                ? 'bg-yellow-500/10 border-yellow-500/30' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className='flex items-start gap-3 mb-4'>
                <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='text-yellow-500 mt-0.5'>
                  <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
                  <line x1='12' y1='9' x2='12' y2='13' />
                  <line x1='12' y1='17' x2='12.01' y2='17' />
                </svg>
                <div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                    Save Your Backup Codes
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-yellow-300/80' : 'text-yellow-700'}`}>
                    These codes can be used to access your account if you lose your authenticator device. Each code can only be used once.
                  </p>
                </div>
              </div>

              <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 ${
                isDarkMode ? 'bg-[#1A1A1D]' : 'bg-white'
              } p-4 rounded-lg border ${isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'}`}>
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border text-center ${
                      isDarkMode
                        ? 'bg-white/5 border-[#FFFFFF14]'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <code className={`text-sm font-mono font-bold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {code}
                    </code>
                  </div>
                ))}
              </div>

              <div className='flex flex-col sm:flex-row gap-3'>
                <button
                  onClick={handleCopyBackupCodes}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium border transition-colors ${
                    copiedCodes
                      ? 'bg-green-500/20 border-green-500/50 text-green-400'
                      : isDarkMode
                      ? 'bg-white/10 border-[#FFFFFF14] text-white hover:bg-white/20'
                      : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {copiedCodes ? '✓ Copied!' : 'Copy All Codes'}
                </button>
                <button
                  onClick={handleDownloadBackupCodes}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium border transition-colors ${
                    isDarkMode
                      ? 'bg-white/10 border-[#FFFFFF14] text-white hover:bg-white/20'
                      : 'bg-gray-100 border-gray-300 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Download as File
                </button>
              </div>

              <p className={`text-xs mt-4 text-center ${isDarkMode ? 'text-yellow-300/60' : 'text-yellow-700/80'}`}>
                ⚠️ Store these codes securely. We won't show them again.
              </p>
            </div>

            <button
              onClick={() => {
                setShowBackupCodes(false);
                setShow2FASetup(false);
                setTwoFactorSetup(null);
                setBackupCodes([]);
                setVerificationSuccess(false);
                setShowManualEntry(false);
              }}
              className='w-full px-6 py-3 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold hover:bg-[#BF9B30] transition-colors'
            >
              I've Saved These Codes
            </button>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div
            className={`rounded-2xl p-6 max-w-md w-full ${
              isDarkMode ? 'bg-[#1A1A1D]' : 'bg-white'
            }`}
          >
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Change Password
            </h3>

            {error && (
              <div className='mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm'>
                {error}
              </div>
            )}

            <div className='space-y-4 mb-4'>
              <div>
                <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Current Password
                </label>
                <input
                  type='password'
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                    isDarkMode
                      ? 'bg-white/5 border-[#FFFFFF14] text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  New Password
                </label>
                <input
                  type='password'
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                    isDarkMode
                      ? 'bg-white/5 border-[#FFFFFF14] text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Confirm New Password
                </label>
                <input
                  type='password'
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                    isDarkMode
                      ? 'bg-white/5 border-[#FFFFFF14] text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className='flex gap-3'>
              <button
                onClick={handleChangePassword}
                className='flex-1 px-4 py-2 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold hover:bg-[#BF9B30] transition-colors'
              >
                Change Password
              </button>
              <button
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setError(null);
                }}
                className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
                  isDarkMode
                    ? 'border-[#FFFFFF14] text-white hover:bg-white/5'
                    : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div
            className={`rounded-2xl p-6 max-w-md w-full ${
              isDarkMode ? 'bg-[#1A1A1D]' : 'bg-white'
            }`}
          >
            <h3 className={`text-xl font-semibold mb-2 text-red-400 ${isDarkMode ? '' : ''}`}>
              Deactivate Account
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Your account will be deactivated but can be reactivated by an admin. You will not be able to log in after deactivation.
            </p>

            {error && (
              <div className='mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm'>
                {error}
              </div>
            )}

            <div className='space-y-4 mb-4'>
              <div>
                <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Reason (optional)
                </label>
                <textarea
                  value={deactivateForm.reason}
                  onChange={(e) => setDeactivateForm({ ...deactivateForm, reason: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                    isDarkMode
                      ? 'bg-white/5 border-[#FFFFFF14] text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Password
                </label>
                <input
                  type='password'
                  value={deactivateForm.password}
                  onChange={(e) => setDeactivateForm({ ...deactivateForm, password: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                    isDarkMode
                      ? 'bg-white/5 border-[#FFFFFF14] text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            <div className='flex gap-3'>
              <button
                onClick={handleDeactivateAccount}
                className='flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-semibold'
              >
                Deactivate
              </button>
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setDeactivateForm({ reason: '', password: '' });
                  setError(null);
                }}
                className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
                  isDarkMode
                    ? 'border-[#FFFFFF14] text-white hover:bg-white/5'
                    : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div
            className={`rounded-2xl p-6 max-w-md w-full ${
              isDarkMode ? 'bg-[#1A1A1D]' : 'bg-white'
            }`}
          >
            <h3 className={`text-xl font-semibold mb-2 text-red-400 ${isDarkMode ? '' : ''}`}>
              Delete Account
            </h3>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              This action cannot be undone. All your data will be permanently deleted.
            </p>

            {error && (
              <div className='mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm'>
                {error}
              </div>
            )}

            <div className='space-y-4 mb-4'>
              <div>
                <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Password
                </label>
                <input
                  type='password'
                  value={deleteForm.password}
                  onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                    isDarkMode
                      ? 'bg-white/5 border-[#FFFFFF14] text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Type <span className='font-bold'>DELETE</span> to confirm
                </label>
                <input
                  type='text'
                  value={deleteForm.confirmationText}
                  onChange={(e) => setDeleteForm({ ...deleteForm, confirmationText: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F1CB68] ${
                    isDarkMode
                      ? 'bg-white/5 border-[#FFFFFF14] text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                  placeholder='DELETE'
                />
              </div>
            </div>

            <div className='flex gap-3'>
              <button
                onClick={handleDeleteAccount}
                className='flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors font-semibold'
              >
                Delete Account
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteForm({ password: '', confirmationText: '' });
                  setError(null);
                }}
                className={`px-4 py-2 rounded-lg font-semibold border transition-colors ${
                  isDarkMode
                    ? 'border-[#FFFFFF14] text-white hover:bg-white/5'
                    : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Linked Accounts Tab
function LinkedAccounts({ isDarkMode }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getBankAccounts();
        const data = Array.isArray(response) ? response : response.data || [];
        setAccounts(data);
      } catch (err) {
        console.error('Error fetching linked accounts:', err);
        setError(err.message || 'Failed to load linked accounts.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleDisconnect = async (accountId) => {
    try {
      await unlinkBankAccount(accountId);
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      if (selectedAccountId === accountId) {
        setSelectedAccountId(null);
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error disconnecting account:', err);
    }
  };

  const handleViewTransactions = async (accountId) => {
    if (selectedAccountId === accountId) {
      setSelectedAccountId(null);
      setTransactions([]);
      setTransactionsError(null);
      return;
    }

    try {
      setSelectedAccountId(accountId);
      setLoadingTransactions(true);
      setTransactionsError(null);
      const response = await getBankTransactions(accountId, { limit: 10 });
      const data = response.transactions || response.data || [];
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTransactionsError(err.message || 'Failed to load transactions.');
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
        <h2
          className={`text-xl font-semibold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Linked Accounts
        </h2>
        <p className={isDarkMode ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>
          Manage your connected banking accounts. Linking new accounts is handled via Plaid in a separate flow.
        </p>
      </div>

      {error && (
        <div className='rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400'>
          {error}
        </div>
      )}

      {loading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
          {[1, 2].map(i => (
            <div
              key={i}
              className={`rounded-2xl p-5 md:p-6 border animate-pulse ${
                isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
              }`}
            >
              <div className='flex items-center gap-3 mb-4'>
                <div className={`w-12 h-12 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                <div className='space-y-2'>
                  <div className={`h-4 w-32 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                  <div className={`h-3 w-24 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
                </div>
              </div>
              <div className='h-8 w-full rounded-lg mt-2 border-dashed border' />
            </div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div
          className={`rounded-2xl p-6 border text-sm ${
            isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14] text-gray-400' : 'bg-white border-gray-200 text-gray-600'
          }`}
        >
          No linked accounts found.
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
          {accounts.map(account => (
            <ServiceCard
              key={account.id}
              account={account}
              isDarkMode={isDarkMode}
              selected={selectedAccountId === account.id}
              loadingTransactions={loadingTransactions && selectedAccountId === account.id}
              transactions={transactions}
              transactionsError={transactionsError}
              onViewTransactions={() => handleViewTransactions(account.id)}
              onDisconnect={() => handleDisconnect(account.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Service Card Component
function ServiceCard({
  account,
  isDarkMode,
  selected,
  loadingTransactions,
  transactions,
  transactionsError,
  onViewTransactions,
  onDisconnect,
}) {
  const status = account.isActive === false ? 'inactive' : 'connected';

  return (
    <div
      className={`rounded-2xl p-5 md:p-6 border ${
        isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
      }`}
    >
      {/* Header with Icon, Name/Status, and Link Icon */}
      <div className='flex items-start justify-between mb-4'>
        <div className='flex items-center gap-3'>
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold uppercase shrink-0 ${
              isDarkMode ? 'bg-white/5 text-white' : 'bg-gray-100 text-gray-900'
            }`}
          >
            {(account.institutionName || account.institution_name || 'BA')
              .toString()
              .slice(0, 2)}
          </div>

          {/* Name and Status */}
          <div>
            <h3
              className={`font-semibold text-base ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {account.accountName || account.account_name || 'Linked Account'}
            </h3>
            {status === 'connected' && (
              <span className='inline-block mt-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium'>
                Connected
              </span>
            )}
            {status === 'inactive' && (
              <span className='inline-block mt-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full font-medium'>
                Inactive
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

      {/* Account Info */}
      <p
        className={`ms-16 text-sm mb-4 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {account.institutionName || account.institution_name || 'Bank'} ·{' '}
        {account.maskedNumber || account.accountNumber || account.account_number || '••••'}
      </p>

      {/* Action Buttons */}
      <div className='flex flex-wrap gap-3'>
        <button
          onClick={onViewTransactions}
          className={`flex-1 min-w-[150px] px-4 py-2 rounded-lg font-medium border transition-all ${
            isDarkMode
              ? 'border-[#F1CB68] text-white hover:bg-[#F1CB68]/10'
              : 'border-[#F1CB68] text-gray-900 hover:bg-[#F1CB68]/10'
          }`}
        >
          {selected ? 'Hide Transactions' : 'View Recent Transactions'}
        </button>
        <button
          onClick={onDisconnect}
          className='px-4 py-2 text-red-400 hover:text-red-300 font-medium transition-colors'
        >
          Disconnect
        </button>
      </div>

      {/* Transactions */}
      {selected && (
        <div className='mt-4 ms-16 border-t border-dashed border-gray-600/40 pt-3'>
          {loadingTransactions ? (
            <p
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Loading transactions...
            </p>
          ) : transactionsError ? (
            <p className='text-sm text-red-400'>{transactionsError}</p>
          ) : transactions.length === 0 ? (
            <p
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              No recent transactions available.
            </p>
          ) : (
            <ul className='space-y-2 text-sm'>
              {transactions.map(tx => (
                <li
                  key={tx.id || `${tx.transactionDate || tx.transaction_date}-${tx.amount}`}
                  className={`flex justify-between gap-3 rounded-lg px-3 py-2 ${
                    isDarkMode ? 'bg-white/5' : 'bg-gray-50'
                  }`}
                >
                  <div>
                    <p
                      className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {tx.description || 'Transaction'}
                    </p>
                    <p
                      className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {tx.transactionDate || tx.transaction_date}
                    </p>
                  </div>
                  <p
                    className={`font-semibold ${
                      (tx.amount || 0) < 0
                        ? 'text-red-400'
                        : isDarkMode
                        ? 'text-green-400'
                        : 'text-green-600'
                    }`}
                  >
                    {tx.amount != null ? `${tx.amount} ${tx.currency || ''}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// Payment and Billing Tab
function PaymentBilling({ isDarkMode }) {
  const [subscription, setSubscription] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const [
          subRes,
          methodsRes,
          historyRes,
          invoicesRes,
          limitsRes,
        ] = await Promise.allSettled([
          getCurrentSubscription(),
          getPaymentMethods(),
          getPaymentHistory(),
          listInvoices(),
          getSubscriptionLimits(),
        ]);

        if (subRes.status === 'fulfilled') {
          setSubscription(subRes.value.data || subRes.value.subscription || null);
        }

        if (methodsRes.status === 'fulfilled') {
          const pmData = methodsRes.value.data || methodsRes.value.paymentMethods || [];
          setPaymentMethods(pmData);
        }

        if (historyRes.status === 'fulfilled') {
          const histData = historyRes.value.data || historyRes.value || [];
          setPaymentHistory(histData);
        }

        if (invoicesRes.status === 'fulfilled') {
          const invData = invoicesRes.value.data || invoicesRes.value || [];
          setInvoices(invData);
        }

        if (limitsRes.status === 'fulfilled') {
          setUsage(limitsRes.value.data || limitsRes.value || null);
        }

        if (
          subRes.status === 'rejected' &&
          methodsRes.status === 'rejected' &&
          historyRes.status === 'rejected' &&
          invoicesRes.status === 'rejected'
        ) {
          setError('Failed to load payment and billing data.');
        }
      } catch (err) {
        console.error('Error loading payment & billing:', err);
        setError(err.message || 'Failed to load payment and billing data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

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
        {/* Plan change will be wired via subscriptions APIs in a later step if needed */}
      </div>

      {error && (
        <div className='rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-400'>
          {error}
        </div>
      )}

      {/* Current Plan Section */}
      <div
        className={`rounded-2xl p-4 md:p-6 border ${
          isDarkMode
            ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className='mb-6'>
          {loading ? (
            <div className='animate-pulse space-y-3'>
              <div className={`h-4 w-40 rounded ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className={`h-16 rounded ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
                <div className={`h-16 rounded ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`} />
              </div>
            </div>
          ) : subscription ? (
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
                {subscription.plan || subscription.planName || subscription.plan_name}
              </span>{' '}
              · Status:{' '}
              <span className='font-semibold text-green-400'>
                {subscription.status}
              </span>
            </p>
          ) : (
            <p
              className={`text-base mb-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              No active subscription.
            </p>
          )}
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
            {subscription ? (
              <>
                <div className='flex items-center gap-2 mb-2'>
                  <span
                    className={`text-lg font-semibold ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {subscription.amount
                      ? `${subscription.amount} ${subscription.currency || 'USD'}`
                      : '—'}{' '}
                    estimated
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Next payment{' '}
                  {subscription.currentPeriodEnd ||
                    subscription.current_period_end ||
                    '—'}
                </p>
              </>
            ) : (
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Subscribe to a plan to see billing details.
              </p>
            )}
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
            <p
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Overage charges will appear here when applicable.
            </p>
          </div>
        </div>

        {usage && (
          <p
            className={`text-xs mb-6 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-500'
            }`}
          >
            Usage this period: accounts {usage.usage?.accounts?.used ?? 0}/
            {usage.limits?.accounts ?? '—'}, assets {usage.usage?.assets?.used ?? 0}/
            {usage.limits?.assets ?? '—'}.
          </p>
        )}

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
                Billing contact information is managed on your account profile.
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
              {loading ? (
                <div className='animate-pulse h-6 w-40 rounded bg-white/10' />
              ) : paymentMethods.length === 0 ? (
                <p
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  No saved payment methods.
                </p>
              ) : (
                <div className='space-y-2'>
                  {paymentMethods.map(method => (
                    <div
                      key={method.id}
                      className='flex items-center justify-between'
                    >
                      <div>
                        <p
                          className={`text-base font-semibold mb-1 tracking-wider ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {method.type === 'card' && method.card
                            ? `•••• •••• •••• ${method.card.last4}`
                            : method.type}
                        </p>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`text-xs ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {method.type === 'card' && method.card
                              ? method.card.brand
                              : method.type}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          method.isDefault || method.is_default
                            ? 'bg-green-500/20 text-green-400'
                            : isDarkMode
                            ? 'bg-white/10 text-gray-300'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {method.isDefault || method.is_default ? 'Default' : 'Saved'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                isDarkMode
                  ? 'bg-[#F1CB68]/10 text-[#F1CB68] border border-[#F1CB68]/30 hover:bg-[#F1CB68]/20'
                  : 'bg-[#F1CB68]/10 text-[#BF9B30] border border-[#F1CB68]/30 hover:bg-[#F1CB68]/20'
              }`}
            >
              Manage payment methods
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

        {loading && (
          <p
            className={`text-sm mb-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Loading payments...
          </p>
        )}

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
              {paymentHistory.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className={`py-6 px-4 text-center text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    No payments found.
                  </td>
                </tr>
              ) : (
                paymentHistory.map((payment, index) => (
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
                      {payment.createdAt || payment.created_at || payment.date}
                    </td>
                    <td
                      className={`py-4 px-4 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {payment.description || payment.details}
                    </td>
                    <td
                      className={`py-4 px-4 font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {payment.amount != null
                        ? `${payment.amount} ${payment.currency || 'USD'}`
                        : ''}
                    </td>
                    <td className='py-4 px-4'>
                      <a
                        href={payment.invoiceUrl || payment.invoice_url || '#'}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className='md:hidden space-y-4'>
          {paymentHistory.length === 0 && !loading ? (
            <p
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              No payments found.
            </p>
          ) : (
            paymentHistory.map((payment, index) => (
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
                    {payment.createdAt || payment.created_at || payment.date}
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
                {payment.description || payment.details}
              </p>
              <div className='flex justify-between items-center'>
                <span
                  className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {payment.amount != null
                    ? `${payment.amount} ${payment.currency || 'USD'}`
                    : ''}
                </span>
                <a
                    href={payment.invoiceUrl || payment.invoice_url || '#'}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange, isDarkMode, disabled = false }) {
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
        disabled={disabled}
        className={`
          relative w-12 h-6 rounded-full transition-colors shrink-0 ml-4
          ${checked ? 'bg-[#F1CB68]' : 'bg-gray-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
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
