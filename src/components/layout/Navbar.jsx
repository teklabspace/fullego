'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Container from '../ui/Container';

const NAV_ITEMS = [
  { label: 'Marketplace', href: '/marketplace', id: 'marketplace' },
  { label: 'Plans', href: '/plans', id: 'plans' },
  { label: 'Why Akunuba', href: '/', id: 'why-akunuba' },
  { label: 'Concierge', href: '/concierge', id: 'concierge' },
  { label: 'Support', href: '/support', id: 'support' },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('why-akunuba');
  const pathname = usePathname();
  const { isDarkMode } = useTheme();

  // Track previous pathname to detect changes
  const prevPathnameRef = useRef(pathname);
  const [, forceUpdate] = useState(0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Helper function to get current normalized pathname (always reads fresh)
  const getCurrentPath = useCallback(() => {
    // Always read from the latest pathname or window.location
    let currentPath = pathname;
    if (
      typeof window !== 'undefined' &&
      (!currentPath || currentPath === window.location.pathname)
    ) {
      currentPath = window.location.pathname;
    }

    if (currentPath) {
      return currentPath.replace(/\/$/, '') || '/';
    }
    return '/';
  }, [pathname]);

  // Helper function to check if pathname matches href
  const isActive = useCallback(
    href => {
      const currentPath = getCurrentPath();
      const normalizedHref = href.replace(/\/$/, '') || '/';

      // Special case for home page - check if we're on root
      if (href === '/' && currentPath === '/') {
        return true;
      }

      // For other routes, check if pathname matches
      if (href !== '/') {
        return (
          currentPath === normalizedHref ||
          currentPath.startsWith(normalizedHref + '/')
        );
      }

      return false;
    },
    [getCurrentPath]
  );

  // Update active section based on pathname
  useEffect(() => {
    const updateActiveSection = () => {
      const currentPath = getCurrentPath();

      // Find matching nav item based on pathname
      const matchingItem = NAV_ITEMS.find(item => {
        if (item.href === '/') {
          return currentPath === '/';
        }
        return (
          currentPath === item.href.replace(/\/$/, '') ||
          currentPath.startsWith(item.href.replace(/\/$/, '') + '/')
        );
      });

      if (matchingItem) {
        setActiveSection(matchingItem.id);
      } else if (currentPath === '/') {
        // Default to 'why-akunuba' for home page
        setActiveSection('why-akunuba');
      }
    };

    // Use setTimeout to avoid synchronous setState in effect
    const timeoutId = setTimeout(updateActiveSection, 0);
    return () => clearTimeout(timeoutId);
  }, [pathname, getCurrentPath]);

  // Listen for route changes and force re-render
  useEffect(() => {
    const handleRouteChange = () => {
      // Check window.location as fallback
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
        const prevPath =
          (prevPathnameRef.current || '').replace(/\/$/, '') || '/';

        if (currentPath !== prevPath) {
          prevPathnameRef.current = window.location.pathname;
          // Use setTimeout to avoid synchronous setState in effect
          setTimeout(() => {
            forceUpdate(prev => prev + 1);
          }, 0);
        }
      }
    };

    // Check if pathname actually changed
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        forceUpdate(prev => prev + 1);
      }, 0);
    }

    if (typeof window !== 'undefined') {
      // Listen for popstate (browser back/forward)
      window.addEventListener('popstate', handleRouteChange);

      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, [pathname]);

  // Scroll-based active section detection (only for home page with sections)
  useEffect(() => {
    // Only use scroll detection if we're on the home page
    const currentPath = getCurrentPath();
    if (currentPath !== '/') return;

    const handleScroll = () => {
      const sections = NAV_ITEMS.map(item => item.id);
      const scrollPosition = window.scrollY + 100;

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
  }, [pathname, getCurrentPath]);

  return (
    <header className='py-6 relative z-50'>
      <Container>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href='/' className='flex items-center gap-3'>
              <Image
                src={isDarkMode ? '/darkmode_Logo.svg' : '/lightmode_logo.svg'}
                alt='Akunuba Logo'
                width={150}
                height={150}
              />
            </Link>
          </motion.div>

          {/* Center Navigation - Desktop */}
          <nav className='hidden xl:block'>
            <ul
              className='flex items-center gap-2 rounded-[154px] border border-[#FFFFFF1A] px-4 py-2 backdrop-blur-sm'
              style={{
                background:
                  'linear-gradient(94.02deg, rgba(34, 33, 38, 0.5) 0%, rgba(17, 17, 22, 0.5) 100%)',
              }}
            >
              {NAV_ITEMS.map((item, index) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`block rounded-[24px] py-[13px] px-6 text-sm transition-colors ${
                        isActive(item.href) || activeSection === item.id
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

          {/* Right Actions - Desktop */}
          <div className='hidden xl:flex items-center gap-3'>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href='/login'
                className='rounded-3xl border border-[#FFFFFF1A] py-3 px-6 text-sm text-[#FFFFFF] hover:bg-white/5 transition-colors'
              >
                Login
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href='/signup'
                className='rounded-3xl
 border border-[#FFFFFF1A] bg-[#F1CB68] py-3 px-6 text-sm font-medium text-black hover:brightness-105 transition-all'
              >
                Sign up
              </Link>
            </motion.div>
          </div>

          {/* Mobile/Tablet Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleMobileMenu}
            className='xl:hidden relative z-50 flex flex-col items-center justify-center w-10 h-10 rounded-lg border border-[#FFFFFF1A] bg-brand-surface/50 backdrop-blur-sm'
            aria-label='Toggle menu'
          >
            <motion.span
              animate={
                isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }
              }
              className='block w-5 h-0.5 bg-white mb-1'
            />
            <motion.span
              animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className='block w-5 h-0.5 bg-white mb-1'
            />
            <motion.span
              animate={
                isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }
              }
              className='block w-5 h-0.5 bg-white'
            />
          </motion.button>
        </div>
      </Container>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className='fixed inset-0 bg-black/60 backdrop-blur-sm z-40'
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className='fixed top-0 right-0 h-full w-[80%] max-w-sm bg-brand-bg border-l border-[#FFFFFF1A] z-40 overflow-y-auto'
            >
              <div className='p-6 pt-24'>
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
                              isActive(item.href) || activeSection === item.id
                                ? 'bg-brand-tabInactive text-brand-white border border-[#FFFFFF1A]'
                                : 'text-brand-white hover:bg-white/5'
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
                      href='/dashboard'
                      onClick={toggleMobileMenu}
                      className='block w-full text-center rounded-3xl border border-[#FFFFFF1A] py-4 px-6 text-sm text-brand-white hover:bg-white/5 transition-colors'
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Link
                      href='#signup'
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
                    © {new Date().getFullYear()} Akunuba. All rights reserved.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
