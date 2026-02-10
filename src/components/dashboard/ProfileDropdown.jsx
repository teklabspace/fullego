'use client';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { getUserProfile } from '@/utils/authApi';
import { clearTokens } from '@/utils/authApi';

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const profile = await getUserProfile();
        setUserProfile(profile);
        console.log('User profile loaded in Navbar:', profile);
      } catch (error) {
        console.error('Failed to fetch user profile in Navbar:', error);
        // Don't show error toast here - it's just for display
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (mounted) {
      fetchUserProfile();
    }
  }, [mounted]);

  // Track previous pathname to detect changes
  const prevPathnameRef = useRef(pathname);
  const [, forceUpdate] = useState(0);
  
  // Listen for route changes and force re-render
  useEffect(() => {
    // Check if pathname actually changed
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      forceUpdate(prev => prev + 1);
    }
    
    const handleRouteChange = () => {
      // Check window.location as fallback
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname.split('?')[0].replace(/\/$/, '') || '/';
        const prevPath = (prevPathnameRef.current || '').split('?')[0].replace(/\/$/, '') || '/';
        
        if (currentPath !== prevPath) {
          prevPathnameRef.current = window.location.pathname;
          forceUpdate(prev => prev + 1);
        }
      }
    };
    
    if (typeof window !== 'undefined') {
      // Listen for popstate (browser back/forward)
      window.addEventListener('popstate', handleRouteChange);
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, [pathname]);

  // Helper function to get current normalized pathname (always reads fresh)
  const getCurrentPath = () => {
    // Always read from the latest pathname or window.location
    let currentPath = pathname;
    if (typeof window !== 'undefined' && (!currentPath || currentPath === window.location.pathname)) {
      currentPath = window.location.pathname;
    }
    
    if (currentPath) {
      // Remove trailing slash and normalize, also handle query params
      const pathWithoutQuery = currentPath.split('?')[0];
      return pathWithoutQuery.replace(/\/$/, '') || '/';
    }
    return '/';
  };

  // Helper function to check if pathname matches href
  const isActive = (href) => {
    const currentPath = getCurrentPath();
    
    // Handle query params in href
    const hrefWithoutQuery = href.split('?')[0];
    const normalizedHref = hrefWithoutQuery.replace(/\/$/, '') || '/';
    
    // For exact match
    if (currentPath === normalizedHref) return true;
    
    // For hrefs with query params, check if base path matches
    if (href.includes('?')) {
      return currentPath === normalizedHref;
    }
    
    return false;
  };

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

  const profileMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '/icons/home.svg',
      href: '/dashboard',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '/icons/user-icon.svg',
      href: '/dashboard/settings?tab=profile',
    },
    {
      id: 'kyc',
      label: 'KYC Verification',
      icon: '/icons/user-check.svg',
      href: '/dashboard/kyc',
    },
    {
      id: 'referral',
      label: 'Referral',
      icon: '/icons/users.svg',
      href: '/dashboard/referral',
    },
  ];

  const handleMenuClick = href => {
    setIsOpen(false);
    router.push(href);
  };

  const handleLogout = () => {
    setIsOpen(false);
    clearTokens();
    localStorage.removeItem('user_info');
    router.push('/login');
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (userProfile) {
      if (userProfile.first_name) {
        return userProfile.first_name;
      }
      if (userProfile.email) {
        return userProfile.email.split('@')[0];
      }
    }
    // Fallback to stored user info
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user_info');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          return user.email?.split('@')[0] || 'User';
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    return 'User';
  };

  // Get user role/subtitle
  const getUserSubtitle = () => {
    // During SSR or before mount, return consistent default
    if (!mounted) {
      return 'User Account';
    }
    
    if (userProfile?.role) {
      return userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1);
    }
    
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user_info');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user.role) {
            return user.role.charAt(0).toUpperCase() + user.role.slice(1);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    return 'User Account';
  };

  if (!mounted) {
    return (
      <div className='relative'>
        {/* Desktop Profile Button */}
        <button className={`hidden md:flex w-[213px] h-[56px] items-center gap-3 px-3 rounded-[40px] shadow-md cursor-pointer ${
          isDarkMode
            ? 'bg-gradient-to-r from-[#222126] to-[#111116] border border-white/10'
            : 'bg-white border border-gray-200'
        }`}>
          <div className='w-10 h-10 rounded-full overflow-hidden bg-[#F1CB68] flex items-center justify-center'>
            <Image
              src='/icons/user-avatar.svg'
              alt='User'
              width={40}
              height={40}
              className='w-full h-full object-cover'
            />
          </div>
          <div className='flex flex-col justify-center gap-[2px] text-left'>
            <p className={`text-[16px] font-semibold leading-[130%] tracking-[-0.02em] font-[Outfit] ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {isLoadingProfile ? 'Loading...' : getUserDisplayName()}
            </p>
            <p className={`text-[16px] font-normal leading-[130%] tracking-[-0.02em] font-[Outfit] ${
              isDarkMode ? 'text-white/60' : 'text-gray-600'
            }`}>
              {getUserSubtitle()}
            </p>
          </div>
        </button>

        {/* Mobile Profile Button (Avatar Only) */}
        <button className='flex md:hidden w-10 h-10 rounded-full overflow-hidden bg-[#F1CB68] items-center justify-center cursor-pointer'>
          <Image
            src='/icons/user-avatar.svg'
            alt='User'
            width={40}
            height={40}
            className='w-full h-full object-cover'
          />
        </button>
      </div>
    );
  }

  return (
    <div className='relative' ref={dropdownRef}>
      {/* Desktop Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`hidden md:flex w-[213px] h-[56px] items-center gap-3 px-3 rounded-[40px] shadow-md hover:opacity-80 transition-opacity cursor-pointer ${
          isDarkMode
            ? 'bg-gradient-to-r from-[#222126] to-[#111116] border border-white/10'
            : 'bg-white border border-gray-200'
        }`}
      >
        <div className='w-10 h-10 rounded-full overflow-hidden bg-[#F1CB68] flex items-center justify-center'>
          <Image
            src='/icons/user-avatar.svg'
            alt='User'
            width={40}
            height={40}
            className='w-full h-full object-cover'
          />
        </div>
        <div className='flex flex-col justify-center gap-[2px] text-left'>
          <p className={`text-[16px] font-semibold leading-[130%] tracking-[-0.02em] font-[Outfit] ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {isLoadingProfile ? 'Loading...' : getUserDisplayName()}
          </p>
          <p className={`text-[16px] font-normal leading-[130%] tracking-[-0.02em] font-[Outfit] ${
            isDarkMode ? 'text-white/60' : 'text-gray-600'
          }`}>
            {getUserSubtitle()}
          </p>
        </div>
      </button>

      {/* Mobile Profile Button (Avatar Only) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex md:hidden w-10 h-10 rounded-full overflow-hidden bg-[#F1CB68] items-center justify-center cursor-pointer'
      >
        <Image
          src='/icons/user-avatar.svg'
          alt='User'
          width={40}
          height={40}
          className='w-full h-full object-cover'
        />
      </button>

      {/* Profile Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className='absolute right-0 md:right-0 mt-3 w-[calc(100vw-2rem)] md:w-[360px] max-w-[360px] rounded-2xl overflow-hidden shadow-2xl z-50'
            style={{
              background: isDarkMode
                ? 'linear-gradient(135deg, rgba(30, 30, 35, 0.98) 0%, rgba(20, 20, 25, 0.98) 100%)'
                : 'rgba(255, 255, 255, 0.98)',
              border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* User Info Header */}
            <div className={`p-6 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <div className='flex items-center gap-4'>
                <div className='w-14 h-14 rounded-full overflow-hidden bg-[#F1CB68] flex items-center justify-center'>
                  <Image
                    src='/icons/user-avatar.svg'
                    alt='User'
                    width={56}
                    height={56}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div>
                  <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {isLoadingProfile ? 'Loading...' : getUserDisplayName()}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                    {getUserSubtitle()}
                  </p>
                  {userProfile?.email && (
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>
                      {userProfile.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className='py-2'>
              {profileMenuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.href)}
                  className={`w-full flex items-center gap-3 px-6 py-3 transition-colors cursor-pointer ${
                    isActive(item.href)
                      ? isDarkMode
                        ? 'text-white bg-white/5'
                        : 'text-gray-900 bg-gray-100'
                      : isDarkMode
                      ? 'text-white hover:bg-white/5'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                  style={
                    isActive(item.href)
                      ? {
                          borderLeft: isDarkMode
                            ? '3px solid #F1CB68'
                            : '3px solid #F1CB68',
                        }
                      : {}
                  }
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={20}
                    height={20}
                    style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'none' }}
                  />
                  <span className='text-[15px]'>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <div className={`border-t p-2 ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <button
                onClick={handleLogout}
                className='w-full flex items-center gap-3 px-6 py-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer'
              >
                <Image
                  src='/icons/logout.svg'
                  alt='Logout'
                  width={20}
                  height={20}
                  style={{
                    filter:
                      'brightness(0) saturate(100%) invert(27%) sepia(89%) saturate(6449%) hue-rotate(351deg) brightness(95%) contrast(94%)',
                  }}
                />
                <span className='text-[15px] font-medium'>Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
