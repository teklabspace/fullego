'use client';

import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';

const PrivacyPage = () => {
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
              <span className='text-white'>Privacy</span>{' '}
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
              We value your trust. At Akunuba, protecting your privacy isn&apos;t
              just a compliance box — it&apos;s core to how we do business. This
              policy explains what we collect, why we collect it, and how you can
              control your information.
            </motion.p>
          </motion.div>

          {/* Three Column Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 mt-12 md:mt-16'
          >
            {/* Column 1: What We Collect */}
            <div className='space-y-4'>
              <h2
                className='text-2xl md:text-3xl font-bold text-white mb-6'
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 700,
                }}
              >
                What We Collect
              </h2>
              <div
                className='space-y-4 text-base md:text-lg text-white leading-relaxed'
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 400,
                }}
              >
                <p>
                  Details you give us, like your name, email, phone number, and
                  documents you upload
                </p>
                <p>
                  Data about your financial assets, portfolio preferences, and
                  usage patterns
                </p>
                <p>
                  Cookies that help us personalize your experience and improve
                  performance
                </p>
              </div>
            </div>

            {/* Column 2: How We Use It */}
            <div className='space-y-4'>
              <h2
                className='text-2xl md:text-3xl font-bold text-white mb-6'
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 700,
                }}
              >
                How We Use It:
              </h2>
              <div
                className='space-y-4 text-base md:text-lg text-white leading-relaxed'
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 400,
                }}
              >
                <p>
                  To help you organize and track your assets securely
                </p>
                <p>
                  To improve your experience with personalized recommendations and
                  dashboard updates
                </p>
                <p>
                  To comply with financial and legal obligations
                </p>
              </div>
            </div>

            {/* Column 3: Your Rights */}
            <div className='space-y-4'>
              <h2
                className='text-2xl md:text-3xl font-bold text-white mb-6'
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 700,
                }}
              >
                Your Rights
              </h2>
              <div
                className='space-y-4 text-base md:text-lg text-white leading-relaxed'
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 400,
                }}
              >
                <p>
                  You can access, edit, or delete your personal data anytime
                </p>
                <p>
                  You can opt out of promotional communications or data sharing
                </p>
                <p>
                  You can request complete deletion of your profile and stored data
                </p>
                <p>
                  We do not sell your data to third parties. Ever.
                </p>
                <p>
                  If you&apos;re unsure about how your data is handled, email us at{' '}
                  <a
                    href='mailto:privacy@akunuba.com'
                    className='text-[#F1CB68] hover:text-[#F1CB68] transition-colors duration-300 underline'
                    style={{
                      color: '#F1CB68',
                    }}
                  >
                    privacy@akunuba.com
                  </a>{' '}
                  and we&apos;ll clarify.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPage;

