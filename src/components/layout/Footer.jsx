'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const footerLinks = {
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Security', href: '/security' },
  ],
  Support: [
    { label: 'Help Center', href: '/help-center' },
    { label: 'Status', href: '/status' },
    { label: 'API Documentation', href: '/api-docs' },
  ],
};

const socialLinks = [
  { name: 'LinkedIn', icon: '/icons/linkedin.svg', href: '#' },
  { name: 'Twitter', icon: '/icons/twitter.svg', href: '#' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const handleSubscribe = e => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  return (
    <footer className='relative bg-[#101014] py-8 md:py-12 lg:py-16'>
      <div className='relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8'>
        {/* Footer Links Grid with Follow Us Section */}
        <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8 md:mb-10'>
          {/* Company Column */}
          <div>
            <h3 className='text-white font-medium text-sm md:text-base mb-4'>
              Company
            </h3>
            <ul className='space-y-2.5'>
              {footerLinks.Company.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className='text-white hover:text-[#F1CB68] transition-colors duration-300 text-sm'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className='text-white font-medium text-sm md:text-base mb-4'>
              Legal
            </h3>
            <ul className='space-y-2.5'>
              {footerLinks.Legal.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className='text-white hover:text-[#F1CB68] transition-colors duration-300 text-sm'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className='text-white font-medium text-sm md:text-base mb-4'>
              Support
            </h3>
            <ul className='space-y-2.5'>
              {footerLinks.Support.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className='text-white hover:text-[#F1CB68] transition-colors duration-300 text-sm'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us Section */}
          <div>
            <h3 className='text-white font-medium text-sm md:text-base mb-4'>
              Follow us
            </h3>

            {/* Social Media Icons */}
            <div className='flex items-center gap-3 mb-6'>
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  className='w-10 h-10 flex items-center justify-center rounded-full bg-[#1a1a1f] hover:bg-[#2a2a2f] transition-colors duration-300'
                  aria-label={social.name}
                >
                  <Image
                    src={social.icon}
                    alt={social.name}
                    width={20}
                    height={20}
                    style={{
                      filter:
                        'brightness(0) saturate(100%) invert(88%) sepia(45%) saturate(600%) hue-rotate(5deg) brightness(115%) contrast(95%)',
                    }}
                  />
                </a>
              ))}
            </div>

            {/* Newsletter Subscription */}
            <div className='space-y-3'>
              <p className='text-white text-sm'>Subscribe to our newsletter</p>
              <form onSubmit={handleSubscribe} className='space-y-2'>
                <input
                  type='email'
                  placeholder='Your email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className='w-full px-4 py-2.5 rounded-lg bg-[#1a1a1f] border border-white/10 text-white placeholder:text-white/50 focus:outline-none focus:border-[#F1CB68]/50 transition-colors text-sm'
                  required
                />
                <button
                  type='submit'
                  className='w-full px-4 py-2.5 rounded-lg bg-[#F1CB68] text-black font-medium  transition-colors text-sm'
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className='pt-6 border-t border-white/10'>
          <p className='text-white text-xs'>
            © {currentYear} Fullego. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
