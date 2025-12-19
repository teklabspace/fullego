'use client';

import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout';

const SecurityPage = () => {
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
              <span
                className='text-white'
                style={{
                  background:
                    'linear-gradient(180deg, #FFFFFF 0%, #F1CB68 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Security
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
              We take your security seriously. Akunuba is designed to safeguard
              your data and protect you from unauthorized access.
            </motion.p>
          </motion.div>

          {/* Three Column Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 mt-12 md:mt-16 mb-16 md:mb-20'
          >
            {/* Column 1: What We Do */}
            <div className='space-y-4'>
              <h2
                className='text-2xl md:text-3xl font-bold text-white mb-6'
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 700,
                }}
              >
                What We Do
              </h2>
              <div
                className='space-y-4 text-base md:text-lg text-white leading-relaxed'
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 400,
                }}
              >
                <p>
                  Encrypt all sensitive data – both in transit and at rest
                </p>
                <p>
                  Require multi-factor authentication (MFA) for account access
                </p>
                <p>
                  Monitor systems 24/7 for unusual activity or potential threats
                </p>
                <p>
                  Perform regular security audits and penetration testing
                </p>
              </div>
            </div>

            {/* Column 2: What You Can Do */}
            <div className='space-y-4'>
              <h2
                className='text-2xl md:text-3xl font-bold text-white mb-6'
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 700,
                }}
              >
                What You Can Do
              </h2>
              <div
                className='space-y-4 text-base md:text-lg text-white leading-relaxed'
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 400,
                }}
              >
                <p>
                  Create strong, unique passwords and change them periodically
                </p>
                <p>
                  Report anything suspicious to{' '}
                  <a
                    href='mailto:security@akunuba.com'
                    className='text-[#F1CB68] hover:text-[#F1CB68] transition-colors duration-300 underline'
                    style={{
                      color: '#F1CB68',
                    }}
                  >
                    security@akunuba.com
                  </a>{' '}
                  right away
                </p>
                <p>Log out of shared devices after use</p>
              </div>
            </div>

            {/* Column 3: Secure */}
            <div className='space-y-4'>
              <h2
                className='text-2xl md:text-3xl font-bold text-white mb-6'
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 700,
                }}
              >
                Secure
              </h2>
              <div
                className='space-y-4 text-base md:text-lg text-white leading-relaxed'
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 400,
                }}
              >
                <p>
                  While we do everything possible to secure your information, no
                  platform is 100% immune to risk. By using Akunuba, you
                  acknowledge that no system can guarantee absolute protection
                  and agree to use it at your discretion.
                </p>
                <p>
                  If you ever feel something&apos;s off, contact our security team
                  immediately. We&apos;re here to help.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Important Note Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='max-w-4xl mx-auto mt-16 md:mt-20 pt-12 md:pt-16 border-t border-white/10'
          >
            <h2
              className='text-3xl md:text-4xl font-bold mb-6'
              style={{
                fontFamily: 'Poppins',
                fontWeight: 700,
              }}
            >
              <span className='text-white'>Important</span>{' '}
              <span
                className='text-[#F1CB68]'
                style={{
                  color: '#F1CB68',
                }}
              >
                Note
              </span>
            </h2>
            <p
              className='text-base md:text-lg text-white leading-relaxed'
              style={{
                fontFamily: 'Outfit',
                fontWeight: 400,
              }}
            >
              This content does not constitute legal, financial, or investment
              advice. Akunuba is a wealth management platform intended to
              support – not replace – the advice of qualified professionals. By
              using Akunuba, you agree that you are solely responsible for your
              financial decisions and that Akunuba and its team are not liable
              for losses, damages, or regulatory issues resulting from your use
              of the platform.
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default SecurityPage;
