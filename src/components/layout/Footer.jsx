'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Container from '../ui/Container';

const footerLinks = {
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
    { label: 'Security', href: '/security' },
  ],
  Support: [
    { label: 'Help Center', href: '/help-center' },
    { label: 'Contact Support', href: '/support' },
    { label: 'Status', href: '/status' },
    { label: 'API Documentation', href: '/api-docs' },
  ],
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='relative border-t border-white/5 py-8 sm:py-12 md:py-16 lg:py-20'>
      <Container>
        <div className='relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8'>
          {/* Main Footer Content */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-10 lg:mb-12'>
            {/* Company Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className='text-center sm:text-left'
            >
              <h3
                className='text-white font-medium text-base sm:text-lg mb-4 sm:mb-6'
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Company
              </h3>
              <ul className='space-y-3 sm:space-y-4'>
                {footerLinks.Company.map((link, index) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className='text-white/60 hover:text-white transition-colors duration-300 text-sm sm:text-base'
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Legal Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='text-center sm:text-left'
            >
              <h3
                className='text-white font-medium text-base sm:text-lg mb-4 sm:mb-6'
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Legal
              </h3>
              <ul className='space-y-3 sm:space-y-4'>
                {footerLinks.Legal.map((link, index) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className='text-white/60 hover:text-white transition-colors duration-300 text-sm sm:text-base'
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Support Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className='text-center sm:text-left'
            >
              <h3
                className='text-white font-medium text-base sm:text-lg mb-4 sm:mb-6'
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Support
              </h3>
              <ul className='space-y-3 sm:space-y-4'>
                {footerLinks.Support.map((link, index) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className='text-white/60 hover:text-white transition-colors duration-300 text-sm sm:text-base'
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Follow Us Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className='text-center sm:text-left'
            >
              <h3
                className='text-white font-medium text-base sm:text-lg mb-4 sm:mb-6'
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Follow us
              </h3>

              {/* Social Media Icons */}
              <div className='flex gap-3 sm:gap-4 mb-6 sm:mb-8 justify-center sm:justify-start'>
                <motion.a
                  href='#'
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src='/linkedin-icon.svg' alt='LinkedIn' />
                </motion.a>
                <motion.a
                  href='#'
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src='/twitter-icon.svg' alt='Twitter' />
                </motion.a>
              </div>

              {/* Newsletter Subscription */}
              <div className='max-w-md mx-auto sm:mx-0'>
                <p
                  className='text-white text-sm sm:text-base mb-3 sm:mb-4'
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Subscribe to our newsletter
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className='flex flex-col sm:flex-row gap-2'
                >
                  <input
                    type='email'
                    placeholder='Your email'
                    className='flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-[#1A1A1F] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#F1CB68] transition-colors duration-300 text-sm w-full'
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-black transition-all duration-300 text-sm whitespace-nowrap w-full sm:w-auto'
                    style={{
                      background: '#F1CB68',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    Subscribe
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className=' border-t border-white/5'
          >
            <p
              className='text-white/40 pt-6 text-xs sm:text-sm text-start'
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              © {currentYear} Fullego. All rights reserved.
            </p>
          </motion.div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
