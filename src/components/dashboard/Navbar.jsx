'use client';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar({ onMenuClick }) {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const router = useRouter();

  return (
    <nav
      className={`sticky top-0 z-30 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#101014] border-b border-[#FFFFFF14]'
          : 'bg-white border-b border-gray-200'
      }`}
    >
      <div className='px-4 md:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16 md:h-20'>
          {/* Left Section - Logo */}
          <div className='flex md:hidden items-center gap-4'>
            {/* Logo */}
            <div className='flex items-center gap-2'>
              <img src='/Dashboardlogo.svg' alt='Fullego' className='h-8' />
            </div>
          </div>

          {/* Center Section - Search Bar */}
          <div className='flex-1 max-w-md mx-4 hidden sm:block'>
            <div className='relative w-full lg:w-[260px]'>
              <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                <img
                  src='/icons/search.svg'
                  alt='Search'
                  className='text-gray-500'
                  style={{
                    filter: isDarkMode ? 'none' : 'brightness(0.5)',
                  }}
                />
              </div>
              <input
                type='text'
                placeholder='Search...'
                className={`
                  w-full pl-11 pr-4 py-2 lg:py-3
                  border rounded-full text-sm lg:text-base
                  focus:outline-none focus:border-[#F1CB68]
                  transition-all
                  ${
                    isDarkMode
                      ? 'bg-transparent border-[#2B2B30] text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-200 text-[#101014] placeholder-gray-400'
                  }
                `}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className='flex items-center gap-2'>
            {/* Theme Toggle - Desktop Only */}
            <div
              className={`hidden lg:flex w-[110px] h-[56px] items-center justify-between px-[10px] rounded-[40px] transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gradient-to-r from-[#222126] to-[#111116] border border-white/10'
                  : 'bg-gray-100 border border-gray-200'
              }`}
            >
              {/* Moon (Dark Mode) */}
              <button
                onClick={() => setIsDarkMode(true)}
                className={`w-[36px] h-[36px] flex items-center justify-center transition-all duration-300 
    ${isDarkMode ? 'bg-white rounded-full' : 'bg-transparent'}`}
              >
                <Image
                  src='/icons/moon.svg'
                  alt='Dark Mode'
                  width={18}
                  height={18}
                  style={{
                    filter: isDarkMode ? 'none' : 'brightness(0.3)',
                  }}
                />
              </button>

              {/* Sun (Light Mode) */}
              <button
                onClick={() => setIsDarkMode(false)}
                className={`w-[36px] h-[36px] flex items-center justify-center transition-all duration-300
    ${!isDarkMode ? 'bg-[#F1CB68] rounded-full' : 'bg-transparent'}`}
              >
                <Image
                  src='/icons/sun.svg'
                  alt='Light Mode'
                  width={36}
                  height={36}
                  style={{
                    filter: !isDarkMode
                      ? 'brightness(0) saturate(100%) invert(8%) sepia(6%) saturate(1097%) hue-rotate(202deg) brightness(95%) contrast(93%)'
                      : 'brightness(0.5)',
                  }}
                />
              </button>
            </div>

            {/* Vertical Divider Line */}
            <div
              className={`hidden lg:block w-[30px] h-0 border-t rotate-90 transition-colors duration-300 ${
                isDarkMode ? 'border-white/10' : 'border-gray-200'
              }`}
            ></div>

            {/* Messages/Support */}
            <button
              onClick={() => router.push('/dashboard/support-dashboard')}
              className='flex items-center justify-center rounded-full relative cursor-pointer hover:opacity-80 transition-opacity'
            >
              <Image
                src={
                  isDarkMode
                    ? '/icons/message.svg'
                    : '/icons/messageiconslightmode.svg'
                }
                alt='Messages'
                width={56}
                height={56}
              />
            </button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* User Profile */}
            <ProfileDropdown />

            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className={`flex lg:hidden transition-colors ${
                isDarkMode
                  ? 'text-white hover:text-gray-300'
                  : 'text-gray-900 hover:text-gray-600'
              }`}
            >
              <img
                src='/icons/hamburger.svg'
                alt='Menu'
                className={`w-10 h-10 ${
                  isDarkMode ? 'brightness-0 invert' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Below Main Navbar */}
        <div className='sm:hidden pb-3 pt-1'>
          <div className='relative w-full'>
            <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
              <img
                src='/icons/search.svg'
                alt='Search'
                className='text-gray-500 w-4 h-4'
              />
            </div>
            <input
              type='text'
              placeholder='Search...'
              className={`
                w-full pl-10 pr-4 py-2
                border rounded-full text-sm
                focus:outline-none focus:border-fullego-gold
                transition-all
                ${
                  isDarkMode
                    ? 'bg-transparent border-[#2B2B30] text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-200 text-[#101014] placeholder-gray-400'
                }
              `}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
