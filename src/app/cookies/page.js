'use client';

import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';

const CookiesPage = () => {
  return (
    <Layout>
      <div className='min-h-screen bg-[#000000] text-white relative'>
        {/* Background decorative elements */}
        <div className='absolute inset-0 z-0 pointer-events-none overflow-hidden'>
          {/* Grid Pattern Overlay */}
          <div
            className='absolute inset-0 opacity-10'
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Golden glow effects */}
          <div
            className='absolute hidden md:block rounded-full'
            style={{
              width: 'clamp(200px, 400px, 30vw)',
              height: 'clamp(200px, 400px, 30vw)',
              left: '10%',
              top: '20%',
              background: 'rgba(241, 203, 104, 0.15)',
              filter: 'blur(100px)',
            }}
          />
          <div
            className='absolute hidden md:block rounded-full'
            style={{
              width: 'clamp(200px, 300px, 25vw)',
              height: 'clamp(200px, 300px, 25vw)',
              right: '15%',
              bottom: '20%',
              background: 'rgba(241, 203, 104, 0.12)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        {/* Main Content */}
        <div className='relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32'>
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center mb-12 md:mb-16'
          >
            <h1
              className='text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight'
              style={{
                fontFamily: 'Poppins',
                fontWeight: 700,
              }}
            >
              <span className='text-white'>Cookie</span>{' '}
              <span
                className='text-[#F1CB68]'
                style={{
                  color: '#F1CB68',
                }}
              >
                Policy
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='text-base sm:text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed'
              style={{
                fontFamily: 'Outfit',
                fontWeight: 400,
              }}
            >
              Akunuba uses cookies to make your experience better. Here&apos;s what
              that means:
            </motion.p>
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='max-w-3xl mx-auto space-y-8'
          >
            {/* Section Heading */}
            <h2
              className='text-2xl md:text-3xl font-bold text-white mb-8'
              style={{
                fontFamily: 'Poppins',
                fontWeight: 700,
              }}
            >
              Types of Cookies We Use:
            </h2>

            {/* Cookie Types List */}
            <div
              className='space-y-6 text-base md:text-lg text-white leading-relaxed'
              style={{
                fontFamily: 'Outfit',
                fontWeight: 400,
              }}
            >
              <div>
                <span
                  className='text-[#F1CB68] font-semibold'
                  style={{
                    color: '#F1CB68',
                  }}
                >
                  Essential Cookies:
                </span>{' '}
                <span>These keep the platform running properly</span>
              </div>

              <div>
                <span
                  className='text-[#F1CB68] font-semibold'
                  style={{
                    color: '#F1CB68',
                  }}
                >
                  Analytics Cookies:
                </span>{' '}
                <span>
                  These help us understand how users interact with the site
                </span>
              </div>

              <div>
                <span
                  className='text-[#F1CB68] font-semibold'
                  style={{
                    color: '#F1CB68',
                  }}
                >
                  Preference Cookies:
                </span>{' '}
                <span>
                  These remember your layout, themes, or region settings
                </span>
              </div>
            </div>

            {/* Concluding Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className='text-base md:text-lg text-white leading-relaxed mt-8'
              style={{
                fontFamily: 'Outfit',
                fontWeight: 400,
              }}
            >
              You can manage or block cookies through your browser settings.
              Just note that turning off essential cookies might impact the way
              Akunuba works for you.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default CookiesPage;

