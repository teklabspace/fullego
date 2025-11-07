'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Container from '../ui/Container';

const NAV_ITEMS = [
  { label: 'Marketplace', href: '/marketplace', id: 'marketplace' },
  { label: 'Plans', href: '/plans', id: 'plans' },
  { label: 'Why Fullego', href: '/', id: 'why-fullego' },
  { label: 'Concierge', href: '/concierge', id: 'concierge' },
  { label: 'Support', href: '/support', id: 'support' },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('why-fullego');
  const [scrolled, setScrolled] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = id => {
    setActiveSection(id);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_ITEMS.map(item => item.id);
      const scrollPosition = window.scrollY + 100;
      
      // Update navbar background on scroll
      setScrolled(window.scrollY > 20);

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`sticky top-0 z-50 backdrop-blur-lg transition-all duration-500 w-full ${
          scrolled
            ? 'py-3 sm:py-4 lg:py-5 bg-[#101014]/95 shadow-lg shadow-black/20'
            : 'py-4 sm:py-5 lg:py-6 bg-[#101014]/80'
        }`}
      >
        <div className='w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16'>
          <div className='grid grid-cols-3 items-center w-full max-w-[1920px] mx-auto'>
            {/* Logo - Left */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, -5, 0] }}
              whileTap={{ scale: 0.95 }}
              className='flex justify-start'
            >
              <Link href='/' className='flex items-center gap-2 sm:gap-3'>
                <Image
                  src='/Logo.svg'
                  alt='Fullego Logo'
                  width={100}
                  height={100}
                  className='w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 transition-all duration-300'
                />
              </Link>
            </motion.div>

            {/* Center Navigation - Desktop */}
            <motion.nav
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className='hidden lg:flex justify-center'
            >
              <motion.ul
                className='flex items-center gap-2 rounded-[154px] border border-[#FFFFFF1A] px-4 py-2 backdrop-blur-sm relative overflow-hidden'
                style={{
                  background:
                    'linear-gradient(94.02deg, rgba(34, 33, 38, 0.5) 0%, rgba(17, 17, 22, 0.5) 100%)',
                }}
                whileHover={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}
                transition={{ duration: 0.3 }}
              >
                {/* Animated background glow */}
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-[#F1CB68]/0 via-[#F1CB68]/10 to-[#F1CB68]/0 rounded-[154px]'
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'linear',
                  }}
                />
                {NAV_ITEMS.map((item, index) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 0.4 + index * 0.1,
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => handleNavClick(item.id)}
                      className='relative'
                    >
                      <motion.div
                        whileHover={{
                          scale: 1.08,
                          y: -2,
                          transition: { duration: 0.2 },
                        }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative block rounded-[24px] py-[13px] px-6 text-sm transition-all duration-300 overflow-hidden ${
                          activeSection === item.id
                            ? 'bg-brand-tabInactive text-[#FFFFFF] border border-[#FFFFFF1A] shadow-lg shadow-[#F1CB68]/20'
                            : 'text-[#FFFFFF] hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        {/* Active indicator glow */}
                        {activeSection === item.id && (
                          <motion.div
                            className='absolute inset-0 bg-gradient-to-r from-[#F1CB68]/20 via-[#F1CB68]/30 to-[#F1CB68]/20 rounded-[24px]'
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: [0.5, 1, 0.5],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        )}
                        {/* Hover glow effect */}
                        <motion.div
                          className='absolute inset-0 bg-gradient-to-r from-[#F1CB68]/0 via-[#F1CB68]/30 to-[#F1CB68]/0 rounded-[24px]'
                          initial={{ x: '-100%', opacity: 0 }}
                          whileHover={{ x: '100%', opacity: 1 }}
                          transition={{ duration: 0.6 }}
                        />
                        <span className='relative z-10'>{item.label}</span>
                      </motion.div>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.nav>

            {/* Right Actions - Desktop */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className='hidden lg:flex items-center gap-3 justify-end'
            >
              <motion.div
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link
                  href='/login'
                  className='relative rounded-3xl border border-[#FFFFFF1A] py-3 px-6 text-sm text-[#FFFFFF] hover:bg-white/10 transition-all duration-300 overflow-hidden group'
                >
                  <motion.div
                    className='absolute inset-0 bg-gradient-to-r from-[#F1CB68]/0 via-[#F1CB68]/20 to-[#F1CB68]/0'
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className='relative z-10'>Login</span>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{
                  scale: 1.08,
                  y: -2,
                  boxShadow: '0 10px 30px rgba(241, 203, 104, 0.3)',
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link
                  href='/signup'
                  className='relative rounded-3xl border border-[#FFFFFF1A] bg-[#F1CB68] py-3 px-6 text-sm font-medium text-black overflow-hidden group'
                >
                  <motion.div
                    className='absolute inset-0 bg-gradient-to-r from-[#F1CB68] via-[#D4AF37] to-[#F1CB68]'
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.span
                    className='relative z-10'
                    whileHover={{ color: '#000' }}
                  >
                    Sign up
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Mobile/Tablet Menu Button - Right side on mobile */}
            <div className='lg:hidden flex justify-end col-start-3'>
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{
                  scale: 1.1,
                  rotate: [0, -5, 5, -5, 0],
                  transition: { duration: 0.5 },
                }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMobileMenu();
                }}
                className='relative z-[80] flex flex-col items-center justify-center w-10 h-10 rounded-lg border border-[#FFFFFF1A] bg-brand-surface/50 backdrop-blur-sm overflow-hidden group'
                aria-label='Toggle menu'
                type='button'
              >
              <motion.div
                className='absolute inset-0 bg-gradient-to-r from-[#F1CB68]/0 via-[#F1CB68]/30 to-[#F1CB68]/0'
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'linear',
                }}
              />
              <motion.span
                animate={
                  isMobileMenuOpen
                    ? { rotate: 45, y: 6, backgroundColor: '#F1CB68' }
                    : { rotate: 0, y: 0, backgroundColor: '#FFFFFF' }
                }
                transition={{ duration: 0.3 }}
                className='block w-5 h-0.5 mb-1 relative z-10'
              />
              <motion.span
                animate={
                  isMobileMenuOpen
                    ? { opacity: 0, scale: 0 }
                    : { opacity: 1, scale: 1 }
                }
                transition={{ duration: 0.2 }}
                className='block w-5 h-0.5 bg-white mb-1 relative z-10'
              />
              <motion.span
                animate={
                  isMobileMenuOpen
                    ? { rotate: -45, y: -6, backgroundColor: '#F1CB68' }
                    : { rotate: 0, y: 0, backgroundColor: '#FFFFFF' }
                }
                transition={{ duration: 0.3 }}
                className='block w-5 h-0.5 relative z-10'
              />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu - Rendered outside header for proper z-index stacking */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className='fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]'
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className='fixed top-0 right-0 h-full w-[80%] max-w-sm bg-[#101014] border-l border-[#FFFFFF1A] z-[110] overflow-y-auto shadow-2xl'
            >
              <div className='p-6 pt-20'>
                {/* Close Button */}
                <div className='flex justify-end mb-6'>
                  <button
                    onClick={toggleMobileMenu}
                    className='p-2 rounded-lg hover:bg-white/10 transition-colors'
                    aria-label='Close menu'
                  >
                    <svg
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#FFFFFF'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <line x1='18' y1='6' x2='6' y2='18' />
                      <line x1='6' y1='6' x2='18' y2='18' />
                    </svg>
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className='mb-8'>
                  <ul className='space-y-2'>
                    {NAV_ITEMS.map((item, index) => (
                      <motion.li
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => {
                            handleNavClick(item.id);
                            toggleMobileMenu();
                          }}
                        >
                          <motion.div
                            whileTap={{ scale: 0.95 }}
                            className={`block rounded-xl py-4 px-6 text-base transition-colors ${
                              activeSection === item.id
                                ? 'bg-brand-tabInactive text-[#FFFFFF] border border-[#FFFFFF1A]'
                                : 'text-[#FFFFFF] hover:bg-white/5'
                            }`}
                          >
                            {item.label}
                          </motion.div>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                {/* Auth Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className='space-y-3'
                >
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Link
                      href='/login'
                      onClick={toggleMobileMenu}
                      className='block w-full text-center rounded-3xl border border-[#FFFFFF1A] py-4 px-6 text-sm text-[#FFFFFF] hover:bg-white/5 transition-colors'
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Link
                      href='/signup'
                      onClick={toggleMobileMenu}
                      className='block w-full text-center rounded-3xl border border-[#FFFFFF1A] bg-[#F1CB68] py-4 px-6 text-sm font-medium text-black hover:brightness-105 transition-all'
                    >
                      Sign up
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Decorative Element */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className='mt-8 pt-8 border-t border-[#FFFFFF1A]'
                >
                  <p className='text-xs text-brand-muted text-center'>
                    © {new Date().getFullYear()} Fullego. All rights reserved.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
