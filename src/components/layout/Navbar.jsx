'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (id) => {
    setActiveSection(id);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_ITEMS.map((item) => item.id);
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
  }, []);

  return (
    <header className="py-6 relative z-50">
      <Container>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/" className="flex items-center gap-3">
              <Image src="/Logo.svg" alt="Fullego Logo" width={100} height={100} />
            </Link>
          </motion.div>

          {/* Center Navigation - Desktop */}
          <nav className="hidden xl:block">
            <ul
              className="flex items-center gap-2 rounded-[154px] border border-[#FFFFFF1A] px-4 py-2 backdrop-blur-sm"
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
                  <Link href={item.href} onClick={() => handleNavClick(item.id)}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`block rounded-[24px] py-[13px] px-6 text-sm transition-colors ${activeSection === item.id
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

          {/* Right Actions - Desktop */}
          <div className="hidden xl:flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/dashboard"
              className="rounded-3xl border border-[#FFFFFF1A] py-3 px-6 text-sm text-brand-white hover:bg-white/5 transition-colors"
            >
              Login
            </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="#signup"
                className="rounded-3xl
 border border-[#FFFFFF1A] bg-[#F1CB68] py-3 px-6 text-sm font-medium text-black hover:brightness-105 transition-all"
              >
                Sign up
              </Link>
            </motion.div>
          </div>

          {/* Mobile/Tablet Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleMobileMenu}
            className="xl:hidden relative z-50 flex flex-col items-center justify-center w-10 h-10 rounded-lg border border-[#FFFFFF1A] bg-brand-surface/50 backdrop-blur-sm"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              className="block w-5 h-0.5 bg-white mb-1"
            />
            <motion.span
              animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-5 h-0.5 bg-white mb-1"
            />
            <motion.span
              animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              className="block w-5 h-0.5 bg-white"
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-brand-bg border-l border-[#FFFFFF1A] z-40 overflow-y-auto"
            >
              <div className="p-6 pt-24">
                {/* Navigation Links */}
                <nav className="mb-8">
                  <ul className="space-y-2">
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
                            className={`block rounded-xl py-4 px-6 text-base transition-colors ${activeSection === item.id
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
                  className="space-y-3"
                >
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/dashboard"
                      onClick={toggleMobileMenu}
                      className="block w-full text-center rounded-3xl border border-[#FFFFFF1A] py-4 px-6 text-sm text-brand-white hover:bg-white/5 transition-colors"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Link
                      href="#signup"
                      onClick={toggleMobileMenu}
                      className="block w-full text-center rounded-3xl border border-[#FFFFFF1A] bg-[#F1CB68] py-4 px-6 text-sm font-medium text-black hover:brightness-105 transition-all"
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
                  className="mt-8 pt-8 border-t border-[#FFFFFF1A]"
                >
                  <p className="text-xs text-brand-muted text-center">
                    © {new Date().getFullYear()} Fullego. All rights reserved.
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
