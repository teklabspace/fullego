'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  getReferralStats,
  getReferralList,
  getReferralCode,
  generateReferralCode,
} from '@/utils/referralsApi';

export default function ReferralPage() {
  const { isDarkMode } = useTheme();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    activeReferrals: 0,
  });
  const [referrals, setReferrals] = useState([]);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  useEffect(() => {
    fetchAllData();
  }, [page, statusFilter]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchReferralStats(),
        fetchReferralCode(),
        fetchReferralList(),
      ]);
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralStats = async () => {
    try {
      const stats = await getReferralStats();
      const statsData = stats.data || stats;
      setReferralStats({
        totalReferrals: statsData.totalReferrals || statsData.total_referrals || 0,
        completedReferrals: statsData.completedReferrals || statsData.completed_referrals || 0,
        pendingReferrals: statsData.pendingReferrals || statsData.pending_referrals || 0,
        activeReferrals: statsData.completedReferrals || statsData.completed_referrals || 0,
      });
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
    }
  };

  const fetchReferralCode = async () => {
    try {
      const codeData = await getReferralCode();
      const data = codeData.data || codeData;
      const code = data.referralCode || data.referral_code || '';
      const link = data.referralLink || data.referral_link || '';
      setReferralCode(code);
      setReferralLink(
        link.startsWith('http')
          ? link
          : `${typeof window !== 'undefined' ? window.location.origin : 'https://akunuba.com'}${link}`
      );
    } catch (error) {
      console.error('Failed to fetch referral code:', error);
    }
  };

  const fetchReferralList = async () => {
    try {
      const response = await getReferralList({
        page,
        limit: 20,
        statusFilter: statusFilter,
      });
      const responseData = response.data || response;
      const referralsData = Array.isArray(responseData) ? responseData : responseData.data || [];
      
      // Transform API data to match UI format
      const transformedReferrals = referralsData.map((ref) => ({
        id: ref.id,
        name: ref.referredName || ref.referred_name || ref.referredEmail?.split('@')[0] || 'User',
        email: ref.referredEmail || ref.referred_email || '',
        joinedDate: ref.completedAt || ref.completed_at || ref.createdAt || ref.created_at || '',
        status: ref.status === 'completed' ? 'active' : ref.status || 'pending',
        avatar: '/icons/user-avatar.svg',
      }));
      
      setReferrals(transformedReferrals);
      
      if (response.pagination) {
        setPagination({
          total: response.pagination.total || response.total || 0,
          page: response.pagination.page || response.page || 1,
          limit: response.pagination.limit || response.limit || 20,
          totalPages: Math.ceil((response.pagination.total || response.total || 0) / (response.pagination.limit || response.limit || 20)),
        });
      }
    } catch (error) {
      console.error('Failed to fetch referral list:', error);
      toast.error('Failed to load referrals');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy referral code');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy referral link');
    }
  };

  const handleGenerateCode = async () => {
    try {
      await generateReferralCode();
      await fetchReferralCode();
      toast.success('New referral code generated!');
    } catch (error) {
      toast.error('Failed to generate referral code');
    }
  };

  const getStatusBadge = status => {
    if (status === 'active') {
      return (
        <span
          className='px-3 py-1 rounded-full text-xs font-medium'
          style={{
            background: 'rgba(34, 197, 94, 0.2)',
            color: '#22C55E',
          }}
        >
          Active
        </span>
      );
    }
    return (
      <span
        className='px-3 py-1 rounded-full text-xs font-medium'
        style={{
          background: 'rgba(241, 203, 104, 0.2)',
          color: '#F1CB68',
        }}
      >
        Pending
      </span>
    );
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className='min-h-screen'>
        {/* Header */}
        <div className='mb-8'>
          <h1
            className={`text-3xl md:text-4xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Referral Program
          </h1>
          <p
            className={`text-base md:text-lg ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Invite your friends and earn rewards together
          </p>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8'>
          {/* Total Referrals */}
          <div
            className={`rounded-2xl p-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#222126] to-[#111116] border border-white/10'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className='flex items-center justify-between mb-4'>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5' : 'bg-gray-100'
                }`}
              >
                <Image
                  src='/icons/users.svg'
                  alt='Referrals'
                  width={24}
                  height={24}
                  style={{
                    filter: isDarkMode ? 'brightness(0) invert(1)' : 'none',
                  }}
                />
              </div>
            </div>
            <p
              className={`text-sm mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Total Referrals
            </p>
            <h3
              className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {referralStats.totalReferrals}
            </h3>
          </div>

          {/* Active Referrals */}
          <div
            className={`rounded-2xl p-6 ${
              isDarkMode
                ? 'bg-gradient-to-r from-[#222126] to-[#111116] border border-white/10'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className='flex items-center justify-between mb-4'>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5' : 'bg-gray-100'
                }`}
              >
                <Image
                  src='/icons/user-check.svg'
                  alt='Active'
                  width={24}
                  height={24}
                  style={{
                    filter: isDarkMode ? 'brightness(0) invert(1)' : 'none',
                  }}
                />
              </div>
            </div>
            <p
              className={`text-sm mb-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Active Referrals
            </p>
            <h3
              className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {referralStats.activeReferrals}
            </h3>
          </div>
        </div>

        {/* Share Referral Code Section */}
        <div
          className={`rounded-2xl p-6 md:p-8 mb-8 ${
            isDarkMode
              ? 'bg-gradient-to-r from-[#222126] to-[#111116] border border-white/10'
              : 'bg-white border border-gray-200'
          }`}
        >
          <div className='flex items-center gap-3 mb-6'>
            <Image
              src='/icons/users.svg'
              alt='Referral'
              width={24}
              height={24}
              style={{
                filter: isDarkMode ? 'brightness(0) invert(1)' : 'none',
              }}
            />
            <h2
              className={`text-xl md:text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Share Your Referral Code
            </h2>
          </div>

          <div className='space-y-6'>
            {/* Referral Code */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Your Referral Code
              </label>
              <div className='flex items-center gap-3'>
                <div
                  className={`flex-1 px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                >
                  <code className='text-lg font-mono font-bold'>
                    {loading ? (
                      <span className={`inline-block h-5 w-32 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                    ) : (
                      referralCode || 'No code available'
                    )}
                  </code>
                </div>
                <button
                  onClick={handleCopyCode}
                  disabled={!referralCode || loading}
                  className={`px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    copied
                      ? 'bg-green-500 text-white'
                      : isDarkMode
                      ? 'bg-[#F1CB68] text-black'
                      : 'bg-[#F1CB68] text-black'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                {!referralCode && (
                  <button
                    onClick={handleGenerateCode}
                    className={`px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90 cursor-pointer ${
                      isDarkMode
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Generate Code
                  </button>
                )}
              </div>
            </div>

            {/* Referral Link */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Your Referral Link
              </label>
              <div className='flex items-center gap-3'>
                <div
                  className={`flex-1 px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                >
                  <code className='text-sm font-mono break-all'>
                    {loading ? (
                      <span className={`inline-block h-4 w-full rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                    ) : (
                      referralLink || 'No link available'
                    )}
                  </code>
                </div>
                <button
                  onClick={handleCopyLink}
                  disabled={!referralLink || loading}
                  className={`px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    copied
                      ? 'bg-green-500 text-white'
                      : isDarkMode
                      ? 'bg-[#F1CB68] text-black'
                      : 'bg-[#F1CB68] text-black'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div>
              <label
                className={`block text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Share on Social Media
              </label>
              <div className='flex items-center gap-3 flex-wrap'>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:opacity-90 cursor-pointer ${
                    isDarkMode
                      ? 'border-white/10 bg-white/5 hover:bg-white/10'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Image
                    src='/icons/facebook.svg'
                    alt='Facebook'
                    width={20}
                    height={20}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Facebook
                  </span>
                </button>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:opacity-90 cursor-pointer ${
                    isDarkMode
                      ? 'border-white/10 bg-white/5 hover:bg-white/10'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Image
                    src='/icons/twitter.svg'
                    alt='Twitter'
                    width={20}
                    height={20}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Twitter
                  </span>
                </button>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:opacity-90 cursor-pointer ${
                    isDarkMode
                      ? 'border-white/10 bg-white/5 hover:bg-white/10'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Image
                    src='/icons/linkedin.svg'
                    alt='LinkedIn'
                    width={20}
                    height={20}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    LinkedIn
                  </span>
                </button>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:opacity-90 cursor-pointer ${
                    isDarkMode
                      ? 'border-white/10 bg-white/5 hover:bg-white/10'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <Image
                    src='/icons/share-icon.svg'
                    alt='Share'
                    width={20}
                    height={20}
          style={{
                      filter: isDarkMode ? 'brightness(0) invert(1)' : 'none',
                    }}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    More
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

          {/* Referrals List */}
        <div
          className={`rounded-2xl p-6 md:p-8 ${
            isDarkMode
              ? 'bg-gradient-to-r from-[#222126] to-[#111116] border border-white/10'
              : 'bg-white border border-gray-200'
          }`}
        >
          <div className='flex items-center justify-between mb-6'>
            <h2
              className={`text-xl md:text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Your Referrals
            </h2>
            <div className='flex items-center gap-2'>
              {/* Status Filter */}
              <select
                value={statusFilter || 'all'}
                onChange={(e) => {
                  const value = e.target.value;
                  setStatusFilter(value === 'all' ? null : value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                  isDarkMode
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-gray-100 border-gray-200 text-gray-900'
                }`}
              >
                <option value='all'>All Status</option>
                <option value='pending'>Pending</option>
                <option value='completed'>Completed</option>
                <option value='cancelled'>Cancelled</option>
              </select>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 cursor-pointer ${
                  isDarkMode
                    ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    : 'bg-gray-100 border border-gray-200 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Export
              </button>
            </div>
          </div>

          {loading ? (
            // Skeleton Loader for Referrals Table
            <>
              {/* Desktop Table Skeleton */}
              <div className='hidden md:block overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className={`border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                      <th className={`text-left px-6 py-4 text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className={`h-4 w-20 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                      </th>
                      <th className={`text-left px-6 py-4 text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className={`h-4 w-24 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                      </th>
                      <th className={`text-left px-6 py-4 text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div className={`h-4 w-20 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className={`border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-3'>
                            <div className={`w-10 h-10 rounded-full animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                            <div className='space-y-2'>
                              <div className={`h-4 w-32 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                              <div className={`h-3 w-48 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className={`h-4 w-24 rounded animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        </td>
                        <td className='px-6 py-4'>
                          <div className={`h-6 w-20 rounded-full animate-pulse ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile List Skeleton */}
              <div className='md:hidden space-y-4'>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border animate-pulse ${
                      isDarkMode
                        ? 'border-white/10 bg-white/5'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex items-center gap-3'>
                        <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        <div className='space-y-2'>
                          <div className={`h-4 w-24 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                          <div className={`h-3 w-32 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        </div>
                      </div>
                      <div className={`h-6 w-16 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-1'>
                        <div className={`h-3 w-12 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        <div className={`h-4 w-20 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : referrals.length === 0 ? (
            <div className='text-center py-12'>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No referrals found</p>
            </div>
          ) : (
            <>

          {/* Desktop Table */}
          <div className='hidden md:block overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr
                  className={`border-b ${
                    isDarkMode ? 'border-white/10' : 'border-gray-200'
                  }`}
                >
                  <th
                    className={`text-left px-6 py-4 text-xs font-semibold uppercase ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Referral
                  </th>
                  <th
                    className={`text-left px-6 py-4 text-xs font-semibold uppercase ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Joined Date
                  </th>
                  <th
                    className={`text-left px-6 py-4 text-xs font-semibold uppercase ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral, index) => (
                  <tr
                    key={referral.id}
                    className={`border-b transition-colors hover:opacity-80 ${
                      isDarkMode
                        ? 'border-white/5 hover:bg-white/5'
                        : 'border-gray-100 hover:bg-gray-50'
                    } ${index === referrals.length - 1 ? 'border-0' : ''}`}
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-full overflow-hidden bg-[#F1CB68] flex items-center justify-center'>
                          <Image
                            src={referral.avatar}
                            alt={referral.name}
                            width={40}
                            height={40}
                            className='w-full h-full object-cover'
                          />
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {referral.name}
                          </p>
                          <p
                            className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {referral.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <p
                        className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {formatDate(referral.joinedDate)}
                      </p>
                    </td>
                    <td className='px-6 py-4'>{getStatusBadge(referral.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List */}
          <div className='md:hidden space-y-4'>
            {referrals.map(referral => (
              <div
                key={referral.id}
                className={`p-4 rounded-lg border ${
                  isDarkMode
                    ? 'border-white/10 bg-white/5'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className='flex items-start justify-between mb-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full overflow-hidden bg-[#F1CB68] flex items-center justify-center'>
                      <Image
                        src={referral.avatar}
                        alt={referral.name}
                        width={40}
                        height={40}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {referral.name}
                      </p>
                      <p
                        className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {referral.email}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(referral.status)}
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <p
                      className={`text-xs mb-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Joined
                    </p>
                    <p
                      className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {formatDate(referral.joinedDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
            </>
          )}

          {/* Pagination */}
          <div
            className={`flex items-center justify-between mt-6 pt-6 border-t ${
              isDarkMode ? 'border-white/10' : 'border-gray-200'
            }`}
          >
            <p
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Showing {referrals.length > 0 ? (page - 1) * pagination.limit + 1 : 0}-{Math.min(page * pagination.limit, pagination.total)} of {pagination.total}{' '}
              referrals
            </p>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={page >= pagination.totalPages}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? 'bg-[#F1CB68] text-black'
                    : 'bg-[#F1CB68] text-black'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
