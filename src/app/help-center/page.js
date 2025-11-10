'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import Layout from '../../components/layout/Layout';

const categories = [
  {
    id: 1,
    title: 'Getting Started',
    description: 'Learn the basics and set up your account.',
    icon: (
      <svg
        width='32'
        height='32'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v13'
          stroke='#F1CB68'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Using Our Product',
    description: 'Explore features and best practices.',
    icon: (
      <svg
        width='32'
        height='32'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
          stroke='#F1CB68'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Integrations',
    description: 'Connect with other tools and services.',
    icon: (
      <svg
        width='32'
        height='32'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <path
          d='M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
          stroke='#F1CB68'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'FAQs',
    description: 'Find answers to frequently asked questions.',
    icon: (
      <svg
        width='32'
        height='32'
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <circle cx='12' cy='12' r='10' stroke='#F1CB68' strokeWidth='2' />
        <path
          d='M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01'
          stroke='#F1CB68'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    ),
  },
];

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = e => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <Layout>
      <div className='min-h-screen bg-[#101014] text-white relative'>
        {/* Background Container */}
        <div className='absolute inset-0 z-0 pointer-events-none overflow-hidden'>
          {/* Background Image */}
          <div className='absolute inset-0'>
            <div className='relative w-full h-full'>
              <Image
                src='/securitybg.png'
                alt='Help Center Background'
                fill
                className='object-cover'
                priority
              />
            </div>
            {/* Dark Overlay - More focus on background color but lighter */}
            <div className='absolute inset-0 bg-[#101014]/60' />
          </div>

          {/* Grid Pattern Overlay - Covers entire page */}
          <div
            className='absolute inset-0 opacity-20'
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Ellipse 3020 - Golden - Left Middle of Hero */}
          <div
            className='absolute hidden md:block rounded-full'
            style={{
              width: 'clamp(200px, 370px, 30vw)',
              height: 'clamp(300px, 523px, 40vh)',
              left: 'clamp(-100px, -179px, -10%)',
              top: 'clamp(20px, 41px, 5vh)',
              background: 'rgba(241, 203, 104, 0.18)',
              filter: 'blur(124.4px)',
            }}
          />

          {/* Ellipse 3021 - Light Gray - Bottom Right of Hero */}
          <div
            className='absolute hidden md:block rounded-full'
            style={{
              width: 'clamp(200px, 370px, 30vw)',
              height: 'clamp(300px, 523px, 40vh)',
              left: 'clamp(60vw, 1078px, 90vw)',
              top: 'clamp(300px, 394px, 50vh)',
              background: 'rgba(221, 221, 221, 0.18)',
              filter: 'blur(124.4px)',
            }}
          />
        </div>

        {/* Hero Section */}
        <section className='relative z-10 min-h-[400px] md:min-h-[500px] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 md:py-32'>
          <div className='max-w-4xl mx-auto text-center w-full'>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight'
              style={{
                fontFamily: 'Poppins',
                fontWeight: 700,
              }}
            >
              How can we{' '}
              <span
                className='bg-gradient-to-r from-[#F1CB68] to-[#F1CB68] bg-clip-text text-transparent'
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, #FFFFFF 0%, #F1CB68 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                help?
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed'
              style={{
                fontFamily: 'Outfit',
                fontWeight: 400,
              }}
            >
              Find answers to your questions and get the most out of our
              services.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className='max-w-2xl mx-auto'
            >
              <div className='relative'>
                <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <circle
                      cx='11'
                      cy='11'
                      r='8'
                      stroke='#FFFFFF'
                      strokeWidth='2'
                    />
                    <path
                      d='m21 21-4.35-4.35'
                      stroke='#FFFFFF'
                      strokeWidth='2'
                      strokeLinecap='round'
                    />
                  </svg>
                </div>
                <input
                  type='text'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder='Search for articles...'
                  className='w-full pl-12 pr-4 py-4 rounded-full bg-[#1a1a1f] border border-white/10 text-white placeholder:text-white focus:outline-none focus:border-[#F1CB68]/50 transition-colors'
                  style={{
                    fontFamily: 'Outfit',
                    fontWeight: 400,
                  }}
                />
              </div>
            </motion.form>
          </div>
        </section>

        {/* Browse by Category Section */}
        <section className='relative z-10 py-12 md:py-20 px-4 sm:px-6 lg:px-8'>
          <div className='max-w-7xl mx-auto'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className='text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-12 text-center'
              style={{
                fontFamily: 'Poppins',
                fontWeight: 700,
              }}
            >
              Browse by Category
            </motion.h2>

            {/* Category Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-20'>
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className='text-center'
                >
                  {/* Icon Circle */}
                  <div className='mb-6 flex justify-center'>
                    <div
                      className='w-20 h-20 rounded-full border-2 border-[#F1CB68] flex items-center justify-center bg-[#1a1a1f]/50'
                      style={{ borderColor: '#F1CB68' }}
                    >
                      <div className='text-[#F1CB68]'>{category.icon}</div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className='text-xl md:text-2xl font-bold text-white mb-3'
                    style={{
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                    }}
                  >
                    {category.title}
                  </h3>

                  {/* Description */}
                  <p
                    className='text-base text-white/70 leading-relaxed'
                    style={{
                      fontFamily: 'Outfit',
                      fontWeight: 400,
                    }}
                  >
                    {category.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Section - Can't find what you're looking for */}
        <section className='relative z-10 py-12 md:py-20 px-4 sm:px-6 lg:px-8 pb-20'>
          <div className='max-w-4xl mx-auto text-center'>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className='text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4'
              style={{
                fontFamily: 'Poppins',
                fontWeight: 700,
              }}
            >
              Can&apos;t find what you&apos;re looking for?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className='text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed'
              style={{
                fontFamily: 'Outfit',
                fontWeight: 400,
              }}
            >
              Our support team is here to help you with any questions you may
              have.
            </motion.p>
            {/* Contact Support button removed as requested */}
            <button
              className='px-6 py-3 mt-10 rounded-full  text-black font-medium  transition-colors whitespace-nowrap w-full sm:w-auto'
              style={{
                background:
                  'linear-gradient(95.36deg, #FFFFFF 1.12%, #F1CB68 53.42%)',
              }}
            >
              Contact Support
            </button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HelpCenterPage;
