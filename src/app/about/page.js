'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Layout from '../../components/layout/Layout';

const AboutPage = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    // Handle form submission
    console.log('Email submitted:', email);
  };

  return (
    <Layout>
      <div className='min-h-screen bg-[#101014] text-white'>
        {/* Background Grid Pattern */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none opacity-20'>
          <div
            className='absolute inset-0'
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className='relative z-10'>
          {/* Hero Section */}
          <section className='pt-20 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-4xl mx-auto text-center space-y-6'>
              {/* Main Title with Gradient */}
              <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight'>
                <span className='text-white'>Building the Future of</span>
                <br />
                <span
                  className='bg-clip-text text-transparent'
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                  }}
                >
                  Digital Innovation
                </span>
              </h1>

              {/* Subtitle */}
              <p className='text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed'>
                Learn more about how fullego is leading the industry in digital
                innovation and transformation.
              </p>

              {/* Email Signup */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className='mx-auto mt-6 rounded-4xl sm:mt-8 flex flex-col sm:flex-row max-w-xl items-center gap-3 sm:gap-2 rounded-pill p-3 sm:p-2'
                style={{
                  background:
                    'linear-gradient(94.02deg, rgba(34, 33, 38, 0.5) 0%, rgba(17, 17, 22, 0.5) 100%)',
                  boxShadow: '0px 4px 4px 0px #00000040',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid #FFFFFF1A',
                  borderBottom: '2px solid #F1CB68',
                }}
              >
                <input
                  type='text'
                  placeholder='Email/Phone Number'
                  className='w-full sm:flex-1 rounded-full bg-transparent px-4 sm:px-4 py-3 text-sm text-brand-white placeholder:text-brand-muted focus:outline-none border border-[#FFFFFF1A] sm:border-0'
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='w-full sm:w-auto rounded-full px-6 sm:px-5 py-3 text-sm font-medium text-black transition-all'
                  style={{
                    background:
                      'linear-gradient(95.36deg, #FFFFFF 1.12%, #F1CB68 53.42%)',
                  }}
                >
                  Sign up
                </motion.button>
              </motion.div>
            </div>
          </section>

          {/* Mission & Vision Section */}
          <section className='py-12 md:py-16 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-4xl mx-auto text-center space-y-6'>
              <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold text-white'>
                Our Mission & Vision
              </h2>
              <div className='text-base sm:text-lg md:text-xl text-white/80 leading-relaxed max-w-3xl mx-auto space-y-4'>
                <p>
                  We are dedicated to revolutionizing the future through
                  technology leadership and a commitment to excellence.
                </p>
                <p>
                  Our mission is to empower businesses and communities by
                  providing innovative solutions that create long-term value and
                  sustainable growth.
                </p>
              </div>
            </div>
          </section>

          {/* Core Values & Long-Term Goals Cards */}
          <section className='py-12 md:py-16 px-4 sm:px-6 lg:px-8 pb-20'>
            <div className='max-w-6xl mx-auto'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8'>
                {/* Core Values Card */}
                <div className='bg-[#1a1a1f] rounded-lg p-6 md:p-8 space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 flex items-center justify-center'>
                      <img src='/coreicon.svg' alt='Core Values' />
                    </div>
                    <h3 className='text-xl md:text-2xl font-bold text-white'>
                      Core Values
                    </h3>
                  </div>
                  <p className='text-white/80 text-sm sm:text-base leading-relaxed'>
                    We believe in collaboration, transparency, and continuous
                    improvement. Our core values guide everything we do and help
                    us build meaningful relationships with clients and partners.
                  </p>
                </div>

                {/* Long-Term Goals Card */}
                <div className='bg-[#1a1a1f] rounded-lg p-6 md:p-8 space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 flex items-center justify-center'>
                      <img src='/longtermgoal.svg' alt='Core Values' />
                    </div>
                    <h3 className='text-xl md:text-2xl font-bold text-white'>
                      Long-Term Goals
                    </h3>
                  </div>
                  <p className='text-white/80 text-sm sm:text-base leading-relaxed'>
                    We aim to drive global change through technological
                    innovation, ensuring we remain at the forefront of our
                    industry while maintaining strong ethical principles and
                    social responsibility.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Meet The Leadership Section */}
          <section className='py-12 md:py-16 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-7xl mx-auto'>
              <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-12 md:mb-16'>
                Meet The Leadership
              </h2>

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12'>
                {/* Stephen Ogu Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className='flex flex-col items-center text-center space-y-4'
                >
                  <div className='relative'>
                    <div>
                      <img src='/leadership.png' alt='Stephen Ogu' />
                    </div>
                  </div>
                  <h3 className='text-xl sm:text-2xl md:text-3xl font-bold text-white'>
                    Stephen Ogu
                  </h3>
                  <p className='text-base sm:text-lg md:text-xl font-bold text-[#F1CB68]'>
                    Chief Operations Officer
                  </p>
                  <p className='text-sm sm:text-base text-white/80 leading-relaxed max-w-xs'>
                    Stephen Ogu brings over 20 years of executive leadership
                    experience in the technology sector, driving innovation and
                    strategic growth.
                  </p>
                </motion.div>

                {/* Maria Gonzales Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className='flex flex-col items-center text-center space-y-4'
                >
                  <div className='relative'>
                    <div className='w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full overflow-hidden bg-white p-1'>
                      <div className='w-full h-full rounded-full bg-white flex items-center justify-center'>
                        <div className='w-full h-full rounded-full bg-white flex items-center justify-center text-4xl sm:text-5xl md:text-6xl'>
                          👩
                        </div>
                      </div>
                    </div>
                  </div>
                  <h3 className='text-xl sm:text-2xl md:text-3xl font-bold text-white'>
                    Maria Gonzales
                  </h3>
                  <p className='text-base sm:text-lg md:text-xl font-bold text-[#F1CB68]'>
                    Chief Operations Officer
                  </p>
                  <p className='text-sm sm:text-base text-white/80 leading-relaxed max-w-xs'>
                    Maria specializes in operational excellence and
                    organizational efficiency to ensure seamless company
                    function.
                  </p>
                </motion.div>

                {/* David Thompson Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className='flex flex-col items-center text-center space-y-4'
                >
                  <div className='relative'>
                    <div className='w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full overflow-hidden bg-white p-1'>
                      <div className='w-full h-full rounded-full bg-white flex items-center justify-center'>
                        <div className='w-full h-full rounded-full bg-white flex items-center justify-center text-4xl sm:text-5xl md:text-6xl'>
                          👨
                        </div>
                      </div>
                    </div>
                  </div>
                  <h3 className='text-xl sm:text-2xl md:text-3xl font-bold text-white'>
                    David Thompson
                  </h3>
                  <p className='text-base sm:text-lg md:text-xl font-bold text-[#F1CB68]'>
                    Chief Technology Officer
                  </p>
                  <p className='text-sm sm:text-base text-white/80 leading-relaxed max-w-xs'>
                    David leads technology strategy and development, ensuring
                    our products remain cutting-edge and impactful.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
