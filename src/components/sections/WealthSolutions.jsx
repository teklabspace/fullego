'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Container from '../ui/Container';

const WealthSolutions = () => {
  return (
    <section
      className='relative py-12 sm:py-16 md:py-20 lg:py-32 bg-brand-bg overflow-hidden'
      style={{
        backgroundImage: 'url(/backgroundWealthsoultions.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Container>
        <div className='relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8'>
          {/* Decorative Spot Image - Top Left */}
          <div className='absolute  w-[826.45px] h-[826.45px] -left-[280px] -top-[106px]'>
            <img
              src='/Oursectionrightside.svg'
              alt=''
              className='w-full h-full object-contain'
              style={{ filter: 'blur(3.5px)', transform: 'rotate(10.18deg)' }}
            />
          </div>

          {/* Decorative Spot Image - Bottom Right */}
          <div className='absolute w-[826.45px] h-[826.45px] -right-[280px] -bottom-[106px] '>
            <img
              src='/Oursectionleftside.svg'
              alt=''
              className='w-full h-full object-contain'
              style={{ filter: 'blur(3.5px)', transform: 'rotate(10.59deg)' }}
            />
          </div>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className='relative z-10 w-full max-w-[1000px] mx-auto text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24'
          >
            {/* Our Solutions Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='flex flex-row items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-[14px] w-[140px] sm:w-[158px] h-[50px] sm:h-[56px] mx-auto mb-6 sm:mb-8 md:mb-10'
              style={{
                background: '#313035',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                backdropFilter: 'blur(2px)',
                borderRadius: '99px',
              }}
            >
              <img
                src='/StarIcon.svg'
                alt=''
                className='w-4 h-4 sm:w-5 sm:h-5'
              />

              <span
                className='text-white text-nowrap font-medium text-sm sm:text-base'
                style={{ lineHeight: '22px' }}
              >
                Our Solutions
              </span>
            </motion.button>

            {/* Heading */}
            <h2
              className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[64px] font-medium text-white mx-auto max-w-[810px] px-4'
              style={{
                lineHeight: '1.3',
                fontFamily: 'Outfit, sans-serif',
                filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
              }}
            >
              We Provide{' '}
              <span
                style={{
                  background:
                    'linear-gradient(to right, #FFFFFF 0%, #F1CB68 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Wealth Solutions
              </span>{' '}
              to Our Clients
            </h2>
          </motion.div>

          {/* First Card - Unified Wealth Snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='relative z-10 w-full max-w-[1000px] mx-auto mb-16 sm:mb-20 md:mb-24 lg:mb-32'
          >
            <div className='flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12'>
              {/* Left Content */}
              <div className='flex flex-col gap-4 sm:gap-6 w-full lg:w-[486px]'>
                {/* Number */}
                <p
                  className='text-white flex items-center justify-start lg:justify-end'
                  style={{
                    width: '27px',
                    height: '22px',
                    fontFamily: 'Outfit, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '22px',
                    textAlign: 'right',
                    color: '#FFFFFF',
                    flex: 'none',
                    order: 0,
                    flexGrow: 0,
                  }}
                >
                  001
                </p>

                {/* Title */}
                <h3
                  className='text-white font-medium text-xl sm:text-2xl md:text-3xl lg:text-[32px]'
                  style={{ lineHeight: '1.25' }}
                >
                  Unified Wealth Snapshot
                </h3>

                {/* Description */}
                <p
                  className='text-white/70 font-normal text-base sm:text-lg md:text-xl'
                  style={{ lineHeight: '1.4' }}
                >
                  Access a single, real-time dashboard that consolidates your
                  traditional investments, real estate, collectibles, and luxury
                  assets, all under one roof.
                </p>

                {/* Key Features */}
                <div className='flex flex-col gap-4 sm:gap-6'>
                  <h4
                    className='text-white font-medium text-lg sm:text-xl md:text-2xl'
                    style={{ lineHeight: '24px' }}
                  >
                    Key Features:
                  </h4>
                  <ul className='flex flex-col gap-3 sm:gap-4'>
                    <li
                      className='text-white/70 font-normal text-base sm:text-lg md:text-xl flex items-center'
                      style={{ lineHeight: '1.4' }}
                    >
                      • Real-time net worth calculation
                    </li>
                    <li
                      className='text-white/70 font-normal text-base sm:text-lg md:text-xl flex items-center'
                      style={{ lineHeight: '1.4' }}
                    >
                      • Aggregated holdings across banks, brokerages, and
                      private assets
                    </li>
                    <li
                      className='text-white/70 font-normal text-base sm:text-lg md:text-xl flex items-center'
                      style={{ lineHeight: '1.4' }}
                    >
                      • Insightful asset breakdowns for smarter decisions
                    </li>
                  </ul>
                </div>

                {/* View More Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-[18px] w-[110px] sm:w-[124px] h-[50px] sm:h-[58px] mt-2 sm:mt-4'
                  style={{
                    background: '#313035',
                    border: '1px solid #FFFFFF',
                    borderRadius: '100px',
                  }}
                >
                  <span
                    className='text-white text-nowrap font-medium text-sm sm:text-base text-center capitalize'
                    style={{ lineHeight: '22px' }}
                  >
                    View More
                  </span>
                </motion.button>
              </div>

              {/* Right Image */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className='relative w-full max-w-[445px] h-[280px] sm:h-[320px] md:h-[361px]'
                style={{
                  filter:
                    'drop-shadow(0px 109px 43px rgba(0, 0, 0, 0.01)) drop-shadow(0px 61px 37px rgba(0, 0, 0, 0.05)) drop-shadow(0px 27px 27px rgba(0, 0, 0, 0.09)) drop-shadow(0px 7px 15px rgba(0, 0, 0, 0.1))',
                }}
              >
                <div
                  className='relative w-full h-full overflow-hidden'
                  style={{
                    border: '5px sm:border-[7.44574px] solid #FFFFFF',
                    borderRadius: '24px sm:rounded-[32px]',
                  }}
                >
                  <Image
                    src='/unifiedwealth.png'
                    alt='Unified Wealth Dashboard'
                    fill
                    className='object-cover'
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Second Card - Smart Portfolio Intelligence */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='relative z-10 w-full max-w-[1000px] mx-auto mb-12 sm:mb-16 md:mb-20'
          >
            <div className='flex flex-col lg:flex-row-reverse items-center justify-between gap-8 lg:gap-12'>
              {/* Right Content */}
              <div className='flex flex-col gap-4 sm:gap-6 w-full lg:w-[514px]'>
                {/* Number */}
                <p
                  className='text-white flex items-center justify-start lg:justify-end'
                  style={{
                    width: '30px',
                    height: '22px',
                    fontFamily: 'Outfit, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '22px',
                    textAlign: 'right',
                    color: '#FFFFFF',
                    flex: 'none',
                    order: 0,
                    flexGrow: 0,
                  }}
                >
                  002
                </p>

                {/* Title */}
                <h3
                  className='text-white font-medium text-xl sm:text-2xl md:text-3xl lg:text-[32px]'
                  style={{ lineHeight: '1.25' }}
                >
                  Smart Portfolio Intelligence
                </h3>

                {/* Description */}
                <p
                  className='text-white/70 font-normal text-base sm:text-lg md:text-xl'
                  style={{ lineHeight: '1.4' }}
                >
                  Let Fullego's AI anticipate market shifts, rebalance your
                  portfolios, and surface personalized recommendations to meet
                  your financial goals.
                </p>

                {/* Key Features */}
                <div className='flex flex-col gap-4 sm:gap-6'>
                  <h4
                    className='text-white font-medium text-lg sm:text-xl md:text-2xl'
                    style={{ lineHeight: '24px' }}
                  >
                    Key Features:
                  </h4>
                  <ul className='flex flex-col gap-3 sm:gap-4'>
                    <li
                      className='text-white/70 font-normal text-base sm:text-lg md:text-xl flex items-center'
                      style={{ lineHeight: '1.4' }}
                    >
                      • Predictive insights and rebalancing triggers
                    </li>
                    <li
                      className='text-white/70 font-normal text-base sm:text-lg md:text-xl flex items-center'
                      style={{ lineHeight: '1.4' }}
                    >
                      • Goal-based strategy suggestions
                    </li>
                    <li
                      className='text-white/70 font-normal text-base sm:text-lg md:text-xl flex items-center'
                      style={{ lineHeight: '1.4' }}
                    >
                      • AI-powered risk alerts
                    </li>
                  </ul>
                </div>

                {/* View More Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-[18px] w-[110px] sm:w-[124px] h-[50px] sm:h-[58px] mt-2 sm:mt-4'
                  style={{
                    background: '#313035',
                    border: '1px solid #FFFFFF',
                    borderRadius: '100px',
                  }}
                >
                  <span
                    className='text-white text-nowrap font-medium text-sm sm:text-base text-center capitalize'
                    style={{ lineHeight: '22px' }}
                  >
                    View More
                  </span>
                </motion.button>
              </div>

              {/* Left Image */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className='flex flex-col justify-center items-center w-full max-w-[445px] h-[280px] sm:h-[320px] md:h-[361px]'
                style={{
                  filter:
                    'drop-shadow(0px 109px 43px rgba(0, 0, 0, 0.01)) drop-shadow(0px 61px 37px rgba(0, 0, 0, 0.05)) drop-shadow(0px 27px 27px rgba(0, 0, 0, 0.09)) drop-shadow(0px 7px 15px rgba(0, 0, 0, 0.1))',
                }}
              >
                <div
                  className='relative w-full h-full overflow-hidden flex-none self-stretch'
                  style={{
                    boxSizing: 'border-box',
                    border: '7.44574px solid #FFFFFF',
                    borderRadius: '32px',
                    order: 0,
                    flexGrow: 1,
                  }}
                >
                  <Image
                    src='/smartportfolio.png'
                    alt='Smart Portfolio Intelligence'
                    fill
                    className='object-cover'
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default WealthSolutions;
