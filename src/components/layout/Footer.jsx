'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const footerLinks = {
  Investments: [
    { label: 'Private Equity', href: '/private-equity' },
    { label: 'Real Estate', href: '/real-estate' },
    { label: 'Private Credit', href: '/private-credit' },
    { label: 'Alternatives', href: '/alternatives' },
    { label: 'Funds', href: '/funds' },
  ],
  Resources: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'Reports', href: '/reports' },
    { label: 'Research', href: '/research' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Team', href: '/team' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
    { label: 'Press', href: '/press' },
  ],
  Legal: [
    { label: 'Terms', href: '/terms' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Disclosures', href: '/disclosures' },
    { label: 'Licenses', href: '/licenses' },
  ],
};

const socialLinks = [
  { name: 'Twitter', icon: '/icons/twitter.svg', href: '#' },
  { name: 'LinkedIn', icon: '/icons/linkedin.svg', href: '#' },
  { name: 'Instagram', icon: '/icons/instagram.svg', href: '#' },
  { name: 'Facebook', icon: '/icons/facebook.svg', href: '#' },
  { name: 'YouTube', icon: '/icons/youtube.svg', href: '#' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='relative bg-[#101014] py-8 md:py-12 lg:py-16'>
      <div className='relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8'>
        {/* Logo and Tagline */}
        <div className='mb-8 md:mb-10'>
          <div className='flex items-center gap-2 mb-4'>
            <div
              className='w-6 h-6 rounded-full flex items-center justify-center text-black font-bold text-sm'
              style={{ background: '#F1CB68' }}
            >
              F
            </div>
            <span className='text-white text-xl font-semibold'>Fullego</span>
          </div>
          <p className='text-gray-400 text-sm max-w-xs leading-relaxed'>
            Exclusive investment opportunities for sophisticated investors.
            Access alternative assets and private markets.
          </p>
        </div>

        {/* Footer Links Grid */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-8 md:mb-10'>
          {/* Investments Column */}
          <div>
            <h3 className='text-white font-medium text-sm md:text-base mb-4'>
              Investments
            </h3>
            <ul className='space-y-2.5'>
              {footerLinks.Investments.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className='text-gray-400 hover:text-white transition-colors duration-300 text-sm'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className='text-white font-medium text-sm md:text-base mb-4'>
              Resources
            </h3>
            <ul className='space-y-2.5'>
              {footerLinks.Resources.map(link => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className='text-gray-400 hover:text-white transition-colors duration-300 text-sm'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

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
                    className='text-gray-400 hover:text-white transition-colors duration-300 text-sm'
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
                    className='text-gray-400 hover:text-white transition-colors duration-300 text-sm'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className='flex items-center gap-4 mb-8'>
          {socialLinks.map(social => (
            <a
              key={social.name}
              href={social.href}
              className='w-8 h-8 flex items-center justify-center rounded hover:opacity-70 transition-opacity'
              aria-label={social.name}
            >
              <Image
                src={social.icon}
                alt={social.name}
                width={20}
                height={20}
                style={{ filter: 'brightness(0) invert(0.4)' }}
              />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className='pt-6 border-t border-white/10'>
          <p className='text-gray-500 text-xs'>
            © {currentYear} Fullego Financial Technologies Ltd. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
