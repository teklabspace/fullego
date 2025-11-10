'use client';

import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';

const TermsPage = () => {
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
        <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32'>
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
              <span className='text-white'>Terms of</span>{' '}
              <span
                className='text-[#F1CB68]'
                style={{
                  color: '#F1CB68',
                }}
              >
                Service
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
              By using Fullego, you agree to the following common-sense rules:
            </motion.p>
          </motion.div>

          {/* Three Column Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 mt-12 md:mt-16'
          >
            {/* Column 1: What You're Responsible For */}
            <div className='space-y-4'>
              <h2
                className='text-2xl md:text-3xl font-bold text-white mb-6'
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 700,
                }}
              >
                What You&apos;re Responsible For
              </h2>
              <div
                className='space-y-4 text-base md:text-lg text-white leading-relaxed'
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 400,
                }}
              >
                <p>
                  Using real, accurate information about your assets and identity
                </p>
                <p>
                  Keeping your login credentials safe and private
                </p>
                <p>
                  Using Fullego only for legal and ethical purposes
                </p>
              </div>
            </div>

            {/* Column 2: What You Can't Do */}
            <div className='space-y-4'>
              <h2
                className='text-2xl md:text-3xl font-bold text-white mb-6'
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 700,
                }}
              >
                What You Can&apos;t Do
              </h2>
              <div
                className='space-y-4 text-base md:text-lg text-white leading-relaxed'
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 400,
                }}
              >
                <p>
                  Attempt to access accounts or data that aren&apos;t yours
                </p>
                <p>
                  Use bots or unauthorized scripts to extract data or interfere
                  with the platform
                </p>
                <p>
                  Try to clone, copy, or resell Fullego&apos;s core technology
                  without our permission
                </p>
              </div>
            </div>

            {/* Column 3: Availability & Limitations */}
            <div className='space-y-4'>
              <h2
                className='text-2xl md:text-3xl font-bold text-white mb-6'
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 700,
                }}
              >
                Availability & Limitations
              </h2>
              <div
                className='space-y-4 text-base md:text-lg text-white leading-relaxed'
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 400,
                }}
              >
                <p>
                  While we strive for near-perfect uptime and reliability, we
                  can&apos;t guarantee that Fullego will always be available or
                  error-free.
                </p>
                <p>
                  Outages may happen due to system updates or unforeseen issues.
                </p>
                <p>
                  Fullego is not liable for losses related to market changes,
                  incorrect data input, or integration with third-party tools.
                  Use of the platform is at your own risk and should not replace
                  professional financial advice.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsPage;

