'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import Layout from '../../components/layout/Layout';

const CompanyLogo = ({ company, index }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className='flex items-center justify-center p-2'
    >
      {!imageError ? (
        <Image
          src={company.logo}
          alt={company.name}
          width={100}
          height={100}
          className='object-contain'
          onError={() => setImageError(true)}
        />
      ) : (
        <div className='text-white text-xs md:text-sm font-bold'>
          {company.initial || company.name.charAt(0)}
        </div>
      )}
    </motion.div>
  );
};

const featuredIn = [
  { name: 'PlayStation', logo: '/icons/playstation.svg', initial: 'PS' },
  { name: 'Intel', logo: '/icons/intel.svg', initial: 'I' },
  { name: 'Company', logo: '/icons/company.svg', initial: 'C' },
  { name: 'GE', logo: '/icons/ge.svg', initial: 'GE' },
  { name: 'Microsoft', logo: '/icons/microsoft.svg', initial: 'M' },
];

const latestCoverage = [
  {
    id: 1,
    title: 'Company Revolutionizes Data Analytics with New AI Platform',
    source: 'TechCrunch',
    date: 'August 10, 2023',
  },
  {
    id: 2,
    title: 'A New Era of Collaboration: How Company is Changing Teamwork',
    source: 'Forbes',
    date: 'August 05, 2023',
  },
  {
    id: 3,
    title: 'Company Announces $50M Series B Funding to Expand Globally',
    source: 'The Wall Street Journal',
    date: 'August 06, 2023',
  },
  {
    id: 4,
    title: "The Ethical Imperative: Company's Stance on Responsible AI",
    source: 'Wired',
    date: 'August 05, 2023',
  },
];

const PressPage = () => {
  return (
    <Layout>
      <div className='min-h-screen bg-[#101014] text-white relative'>
        {/* Unified Background Container */}
        <div className='absolute inset-0 z-0 pointer-events-none overflow-hidden'>
          {/* Background Image - Hero Section */}
          <div className='absolute inset-0 h-[600px] md:h-[700px]'>
            <Image
              src='/pressbg.png'
              alt='Press Background'
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

          {/* Ellipse 3021 - Light Gray - Bottom Right */}
          <div
            className='absolute hidden md:block rounded-full'
            style={{
              width: '370px',
              height: '523px',
              left: '1078px',
              top: '394px',
              background: 'rgba(221, 221, 221, 0.18)',
              filter: 'blur(124.4px)',
            }}
          />
        </div>

        {/* Hero Section */}
        <section className='relative  min-h-[500px] md:min-h-[400px] flex items-center'>
          <div className='relative z-10 max-w-4xl mx-auto w-full text-center space-y-6'>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent'
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              }}
            >
              Press & Media
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed'
            >
              See what the world is saying about our company.
            </motion.p>
          </div>
        </section>

        {/* As Featured In Section */}
        <section className='relative'>
          <div className='relative z-10 max-w-7xl mx-auto'>
            <div className='flex flex-col md:items-center gap-6 md:gap-12 mb-12'>
              <h2
                className='text-2xl md:text-3xl font-bold text-white whitespace-nowrap'
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                }}
              >
                As Featured In
              </h2>
              <div className='flex flex-wrap items-center gap-4 md:gap-6'>
                {featuredIn.map((company, index) => (
                  <CompanyLogo
                    key={company.name}
                    company={company}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Latest Coverage Section */}
        <section className='relative py-12 md:py-16 px-4 sm:px-6 lg:px-8'>
          <div className='relative z-10 max-w-7xl mx-auto'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8'>
              <h2
                className='text-2xl md:text-3xl font-bold text-white'
                style={{
                  fontFamily: 'Poppins',
                  fontWeight: 500,
                }}
              >
                Latest Coverage
              </h2>
              <button
                className='px-4 py-2 rounded-lg text-black flex items-center gap-2 self-start md:self-auto'
                style={{
                  background:
                    'linear-gradient(95.36deg, #FFFFFF 1.12%, #F1CB68 53.42%)',
                }}
              >
                All
                <svg
                  width='16'
                  height='16'
                  viewBox='0 0 16 16'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M4 6L8 10L12 6'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>
            </div>

            <div className='space-y-4'>
              {latestCoverage.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className='bg-transparent rounded-lg p-6 md:p-8 border-[#999999] border-1 transition-colors'
                >
                  <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                    <div className='flex-1 space-y-2'>
                      <h3
                        className='text-lg md:text-xl font-bold text-white'
                        style={{
                          fontFamily: 'Poppins',
                          fontWeight: 500,
                        }}
                      >
                        {article.title}
                      </h3>
                      <div className='flex flex-wrap gap-4 text-sm text-white/70'>
                        <span
                          style={{
                            fontFamily: 'Outfit',
                            fontWeight: 400,
                          }}
                        >
                          {article.source}
                        </span>
                        <span
                          style={{
                            fontFamily: 'Outfit',
                            fontWeight: 400,
                          }}
                        >
                          {article.date}
                        </span>
                      </div>
                    </div>
                    <button
                      className='text-[#F1CB68]  transition-colors self-start md:self-auto'
                      style={{
                        fontFamily: 'Outfit',
                        fontWeight: 400,
                      }}
                    >
                      Read More
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Media Inquiries Section */}
        <section className='relative py-12 md:py-16 px-4 sm:px-6 lg:px-8 pb-20'>
          <div className='relative z-10 max-w-7xl mx-auto'>
            <div className='bg-transparent rounded-lg p-6 md:p-8 lg:p-12'>
              <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
                <div className='flex-1 space-y-4'>
                  <h2
                    className='text-2xl md:text-3xl font-bold text-white'
                    style={{
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                    }}
                  >
                    Media Inquiries
                  </h2>
                  <p
                    className='text-base text-white/80 leading-relaxed max-w-2xl'
                    style={{
                      fontFamily: 'Outfit',
                      fontWeight: 400,
                    }}
                  >
                    For press inquiries, please contact our media relations
                    team. Access our press kit, view our latest press releases,
                    and discover brand assets.
                  </p>
                  <a
                    href='mailto:press@company.com'
                    className='text-[#F1CB68] transition-colors inline-block'
                    style={{
                      fontFamily: 'Outfit',
                      fontWeight: 400,
                    }}
                  >
                    press@company.com
                  </a>
                </div>
                <button
                  className='px-6 py-3 rounded-full  text-black font-medium  transition-colors whitespace-nowrap w-full sm:w-auto'
                  style={{
                    background:
                      'linear-gradient(95.36deg, #FFFFFF 1.12%, #F1CB68 53.42%)',
                  }}
                >
                  Download Press Kit
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default PressPage;
