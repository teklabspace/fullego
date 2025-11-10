'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import Layout from '../../components/layout/Layout';

const jobs = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote',
    description:
      'We are seeking a highly skilled frontend engineer to join our innovative development team.',
    departmentIcon: '⚙️',
    locationIcon: '🌐',
  },
  {
    id: 2,
    title: 'Product Marketing Manager',
    department: 'Marketing',
    location: 'New York, NY',
    description:
      'Help shape marketing strategy and collaborate with cross-functional teams to drive brand awareness.',
    departmentIcon: '🏷️',
    locationIcon: '📍',
  },
  {
    id: 3,
    title: 'UX/UI Designer',
    department: 'Design',
    location: 'Hybrid',
    description:
      'Join our creative design team to craft intuitive, user-centered digital experiences.',
    departmentIcon: '🎨',
    locationIcon: '🏢',
  },
];

const CareersPage = () => {
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const handleSubmit = e => {
    e.preventDefault();
    console.log('Email submitted:', email);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation =
      locationFilter === 'All' || job.location === locationFilter;
    const matchesDepartment =
      departmentFilter === 'All' || job.department === departmentFilter;
    return matchesSearch && matchesLocation && matchesDepartment;
  });

  return (
    <Layout>
      <div className='min-h-screen bg-[#101014] text-white relative'>
        {/* Unified Background Container - Merged for both sections */}
        <div className='absolute inset-0 z-0 pointer-events-none overflow-hidden'>
          {/* Background Image - Hero Section Only */}
          <div className='absolute inset-0 h-[600px] md:h-[700px]'>
            <Image
              src='/carrerbackground.png'
              alt='Careers Background'
              fill
              className='object-cover'
              priority
            />
          </div>

          {/* Grid Pattern Overlay - Covers entire page continuously */}
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

          {/* Dashboard Image - Current Openings Section */}
          <div
            className='absolute'
            style={{
              width: 'clamp(300px, 1200px, 90vw)',
              height: 'clamp(200px, 751px, 60vh)',
              left: 'clamp(10px, 40px, 5%)',
              top: 'clamp(500px, 700px, 60vh)',
              opacity: 0.1,
            }}
          >
            <div className='w-full h-full bg-gradient-to-br from-[#F1CB68]/10 to-transparent rounded-lg' />
          </div>

          {/* Ellipse 2984 - Golden - Top Left (Current Openings) */}
          <div
            className='absolute rounded-full'
            style={{
              width: 'clamp(150px, 420px, 50vw)',
              height: 'clamp(150px, 420px, 50vw)',
              left: 'clamp(10px, 40px, 5%)',
              top: 'clamp(450px, 640px, 55vh)',
              background: '#F1CB68',
              filter: 'blur(300px)',
            }}
          />

          {/* Ellipse 2985 - Blue/Purple - Top Right (Current Openings) */}
          <div
            className='absolute rounded-full'
            style={{
              width: 'clamp(150px, 420px, 50vw)',
              height: 'clamp(150px, 420px, 50vw)',
              left: 'clamp(calc(50vw - 210px), 740px, calc(100% - 420px - 40px))',
              top: 'clamp(450px, 640px, 55vh)',
              background: '#423DC7',
              filter: 'blur(300px)',
            }}
          />

          {/* Line 505 */}
          <svg
            className='absolute'
            style={{
              width: 'clamp(100px, 252px, 30vw)',
              height: '1px',
              left: '0px',
              top: 'clamp(430px, 630px, 50vh)',
              transform: 'rotate(90deg)',
              transformOrigin: 'center',
            }}
            viewBox='0 0 252 1'
            preserveAspectRatio='none'
          >
            <defs>
              <linearGradient
                id='line505-gradient'
                x1='0%'
                y1='0%'
                x2='100%'
                y2='0%'
              >
                <stop offset='0%' stopColor='#F1CB68' stopOpacity='0' />
                <stop offset='52%' stopColor='#F1CB68' stopOpacity='1' />
                <stop offset='100%' stopColor='#F1CB68' stopOpacity='0' />
              </linearGradient>
            </defs>
            <line
              x1='0'
              y1='0.5'
              x2='252'
              y2='0.5'
              stroke='url(#line505-gradient)'
              strokeWidth='1'
            />
          </svg>

          {/* Line 506 */}
          <div
            className='absolute bg-white/10'
            style={{
              width: 'clamp(100px, 252px, 30vw)',
              height: '1px',
              right: 'clamp(-50px, -248px, -10%)',
              top: 'clamp(550px, 773px, 65vh)',
              transform: 'rotate(90deg)',
            }}
          />
        </div>

        {/* Hero Section */}
        <section className='relative pt-20 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 min-h-[500px] md:min-h-[600px] flex items-center'>
          <div className='relative z-10 max-w-4xl mx-auto w-full text-center space-y-6'>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white'
            >
              Find Your Next Opportunity
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed'
            >
              Explore new roles and grow your career with a company that
              prioritizes professional growth and innovation.
            </motion.p>

            <button
              className='px-6 py-3 rounded-full  text-black font-medium  transition-colors whitespace-nowrap w-full sm:w-auto'
              style={{
                background:
                  'linear-gradient(95.36deg, #FFFFFF 1.12%, #F1CB68 53.42%)',
              }}
            >
              View Open Roles
            </button>

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

        <section className='relative py-12 md:py-16 px-4 sm:px-6 lg:px-8'>
          {/* Current Openings Section */}

          <div className='relative z-10 max-w-7xl mx-auto'>
            {/* Section Title */}
            <h2
              className='text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 md:mb-12'
              style={{
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '36px',
                lineHeight: '130%',
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
              }}
            >
              Current Openings
            </h2>

            {/* Search and Filters */}
            <div className='mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center'>
              {/* Search Bar */}
              <div className='relative flex-1'>
                <div className='absolute left-4 top-1/2 transform -translate-y-1/2 z-10'>
                  <svg
                    width='32'
                    height='32'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z'
                      stroke='#FFFFFF'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    <path
                      d='M21 21L16.65 16.65'
                      stroke='#FFFFFF'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
                <input
                  type='text'
                  placeholder='Search by the job title or keyword...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='w-full pl-14 pr-4 py-4 rounded-[24px] bg-transparent text-white placeholder:text-white/50 focus:outline-none transition-colors'
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    filter: 'drop-shadow(0px 3px 5px #000000)',
                    backdropFilter: 'blur(4.65px)',
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '130%',
                    letterSpacing: '-0.02em',
                  }}
                />
              </div>

              {/* Filter Buttons */}
              <div className='flex flex-row md:flex-wrap gap-3 md:flex-nowrap'>
                <button
                  className='rounded-full font-medium transition-colors flex items-center  px-10 py-4 justify-center gap-2'
                  style={{
                    background:
                      'linear-gradient(95.36deg, #FFFFFF 1.12%, #F1CB68 53.42%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',

                    color: '#101014',
                    textShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  Location
                  <svg
                    width='8'
                    height='13'
                    viewBox='0 0 8 13'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    style={{ transform: 'matrix(0, 1, 1, 0, 0, 0)' }}
                  >
                    <path
                      d='M1 1L6.5 6.5L1 12'
                      stroke='#000000'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
                <button
                  className='rounded-full font-medium transition-colors flex items-center px-10 py-4 justify-center gap-2'
                  style={{
                    background:
                      'linear-gradient(95.36deg, #FFFFFF 1.12%, #F1CB68 53.42%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                    fontSize: '18px',
                    lineHeight: '130%',
                    letterSpacing: '-0.02em',
                    color: '#101014',
                    textShadow: '0px 4px 5px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  Department
                  <svg
                    width='8'
                    height='13'
                    viewBox='0 0 8 13'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    style={{ transform: 'matrix(0, 1, 1, 0, 0, 0)' }}
                  >
                    <path
                      d='M1 1L6.5 6.5L1 12'
                      stroke='#000000'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Job Listings */}
            <div className='space-y-6'>
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className='rounded-[24px] p-6 md:p-8 hover:border-[#F1CB68]/50 transition-colors'
                  style={{
                    background:
                      'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                    border: '1px solid #F1CB68',
                    boxSizing: 'border-box',
                  }}
                >
                  <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
                    {/* Job Info */}
                    <div className='flex-1 space-y-4'>
                      <h3
                        style={{
                          fontFamily: 'Poppins',
                          fontWeight: 500,
                          fontSize: '20px',
                          lineHeight: '130%',
                          letterSpacing: '-0.02em',
                          color: '#FFFFFF',
                        }}
                      >
                        {job.title}
                      </h3>

                      <div className='flex flex-wrap gap-4'>
                        <span
                          style={{
                            fontFamily: 'Outfit',
                            fontWeight: 400,
                            fontSize: '13px',
                            lineHeight: '130%',
                            letterSpacing: '-0.02em',
                            color: '#A0A0A0',
                          }}
                        >
                          {job.department}
                        </span>
                        <span
                          className='flex items-center'
                          style={{
                            fontFamily: 'Outfit',
                            fontWeight: 400,
                            fontSize: '13px',
                            lineHeight: '130%',
                            letterSpacing: '-0.02em',
                            color: '#A0A0A0',
                          }}
                        >
                          <img
                            src='/locationicon.svg'
                            alt='Location Icon'
                            className='me-2'
                          />
                          {job.location}
                        </span>
                      </div>

                      <p
                        style={{
                          fontFamily: 'Outfit',
                          fontWeight: 400,
                          fontSize: '15px',
                          lineHeight: '130%',
                          letterSpacing: '-0.02em',
                          color: '#FEFEFE',
                        }}
                      >
                        {job.description}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-col sm:flex-row gap-3 lg:flex justify-center items-center'>
                      <button
                        className='hover:opacity-80 transition-opacity'
                        style={{
                          fontFamily: 'Outfit',
                          fontWeight: 400,
                          fontSize: '16px',
                          lineHeight: '130%',
                          letterSpacing: '-0.02em',
                          color: '#F1CB68',
                        }}
                      >
                        View Details
                      </button>
                      <button
                        className='rounded-[24px] transition-colors'
                        style={{
                          width: '166px',
                          height: '38px',
                          background: 'rgba(0, 0, 0, 0.001)',
                          border: '1px solid #F1CB68',
                          fontFamily: 'Outfit',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '130%',
                          letterSpacing: '-0.02em',
                          color: '#FFFFFF',
                        }}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Perks & Benefits Section */}
        <section className='relative py-12 md:py-16 px-4 sm:px-6 lg:px-8'>
          <div className='relative z-10 max-w-7xl mx-auto'>
            {/* Section Title */}
            <h2
              className='text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-12 md:mb-16'
              style={{
                fontFamily: 'Poppins',
                fontWeight: 500,
                fontSize: '36px',
                lineHeight: '130%',
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
              }}
            >
              Perks & Benefits
            </h2>

            {/* Benefits Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8'>
              {/* Generous PTO */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className='flex flex-col items-center text-center space-y-4'
              >
                <div
                  className='w-16 h-16 rounded-full flex items-center justify-center'
                  style={{
                    border: '2px solid #F1CB68',
                  }}
                >
                  <img src='/ptopercicon.svg' alt='PTO Icon' />
                </div>
                <h3
                  className='text-xl md:text-2xl font-bold text-white'
                  style={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                  }}
                >
                  Generous PTO
                </h3>
                <p
                  className='text-sm sm:text-base text-white/80 leading-relaxed max-w-xs'
                  style={{
                    fontFamily: 'Outfit',
                    fontWeight: 400,
                  }}
                >
                  Flexible time-off policies to support work-life balance.
                </p>
              </motion.div>

              {/* Wellness Programs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className='flex flex-col items-center text-center space-y-4'
              >
                <div
                  className='w-16 h-16 rounded-full flex items-center justify-center'
                  style={{
                    border: '2px solid #F1CB68',
                  }}
                >
                  <img src='/wellnesspercicon.svg' alt='Wellness Icon' />
                </div>
                <h3
                  className='text-xl md:text-2xl font-bold text-white'
                  style={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                  }}
                >
                  Wellness Programs
                </h3>
                <p
                  className='text-sm sm:text-base text-white/80 leading-relaxed max-w-xs'
                  style={{
                    fontFamily: 'Outfit',
                    fontWeight: 400,
                  }}
                >
                  Access fitness resources, wellness perks, and more.
                </p>
              </motion.div>

              {/* 401(k) Matching */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className='flex flex-col items-center text-center space-y-4'
              >
                <div
                  className='w-16 h-16 rounded-full flex items-center justify-center'
                  style={{
                    border: '2px solid #F1CB68',
                  }}
                >
                  <img src='/401kpercicon.svg' alt='401(k) Icon' />
                </div>
                <h3
                  className='text-xl md:text-2xl font-bold text-white'
                  style={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                  }}
                >
                  401(k) Matching
                </h3>
                <p
                  className='text-sm sm:text-base text-white/80 leading-relaxed max-w-xs'
                  style={{
                    fontFamily: 'Outfit',
                    fontWeight: 400,
                  }}
                >
                  We invest in your long-term financial wellness.
                </p>
              </motion.div>

              {/* Health Plans */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className='flex flex-col items-center text-center space-y-4'
              >
                <div
                  className='w-16 h-16 rounded-full flex items-center justify-center'
                  style={{
                    border: '2px solid #F1CB68',
                  }}
                >
                  <img src='/healthpercicon.svg' alt='Health Icon' />
                </div>
                <h3
                  className='text-xl md:text-2xl font-bold text-white'
                  style={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                  }}
                >
                  Health Plans
                </h3>
                <p
                  className='text-sm sm:text-base text-white/80 leading-relaxed max-w-xs'
                  style={{
                    fontFamily: 'Outfit',
                    fontWeight: 400,
                  }}
                >
                  Comprehensive medical, dental, and vision coverage.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default CareersPage;
