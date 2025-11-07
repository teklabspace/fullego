'use client';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Container from '../../components/ui/Container.jsx';

export default function Concierge() {
  const router = useRouter();

  const handleSignUp = () => {
    router.push('/signup');
  };

  return (
    <div className='min-h-screen bg-[#101014] text-brand-white relative overflow-hidden'>
      <Navbar />

      {/* Hero Section */}
      <section
        id='concierge'
        className='relative min-h-[490px] flex items-center justify-center py-20 md:py-32 overflow-hidden'
      >
        {/* Concierge Background Image */}
        <div
          aria-hidden
          className='pointer-events-none absolute inset-0 z-10'
          style={{
            backgroundImage: 'url(/conciergebackground.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            height: '100%',
            width: '100%',
          }}
        />

        {/* Hero Content */}
        <div className='relative z-10 mt-24 w-full max-w-[889px] mx-auto px-4'>
          <div className='flex flex-col items-center gap-8'>
            {/* Header Content */}
            <div className='relative w-full  text-center'>
              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='relative text-4xl  sm:text-5xl md:text-6xl lg:text-[80px] font-medium leading-[130%] text-center tracking-[-0.02em] text-white mb-4'
                style={{ fontFamily: 'Poppins' }}
              >
                Fullego Concierge
                {/* Border around title */}
                <div
                  className='absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none  md:block'
                  style={{
                    width: 'min(701px, 90vw)',
                    height: '94px',
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                  }}
                />
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className='text-[15px] leading-[19px] text-center text-[#BCBCBC] mb-8'
                style={{ fontFamily: 'Outfit' }}
              >
                Your Personal Advisor in the world of Luxury Assets
              </motion.p>
            </div>

            {/* Input Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className='relative w-full max-w-[480px] h-[66px] border border-white/10 rounded-[24px] backdrop-blur-[2px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] overflow-hidden'
            >
              <input
                type='text'
                placeholder='Email/Phone Number'
                className='w-full h-full bg-transparent px-6 pr-[130px] text-base md:text-[18px] leading-[130%] tracking-[-0.02em] text-white placeholder:text-white/60 focus:outline-none'
                style={{ fontFamily: 'Poppins' }}
              />
              {/* Gold Line Under Input */}
              <div className='absolute bottom-0 left-0 w-full h-[2px] bg-[#F1CB68]' />
              {/* Sign up Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignUp}
                className='absolute right-px top-1/2 transform -translate-y-1/2 flex items-center justify-center px-4 md:px-6 py-[13.5px] rounded-[24px] text-base md:text-[18px] font-medium leading-[130%] tracking-[-0.02em] text-[#101014] border border-white/10'
                style={{
                  background:
                    'linear-gradient(95.36deg, #FFFFFF 1.12%, #D4AF37 53.42%)',
                  fontFamily: 'Poppins',
                }}
              >
                Sign up
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section
        className='relative py-16 sm:py-20 md:py-24 lg:py-32 bg-brand-bg overflow-hidden'
        style={{
          backgroundImage: 'url(/Howgetstartbackgroud.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <Container>
          <div className='relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8'>
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className='relative z-10 w-full text-center mb-12 sm:mb-16 md:mb-20'
            >
              {/* Small Label Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='flex flex-row text-nowrap justify-center items-center mx-auto mb-4 sm:mb-6'
                style={{
                  boxSizing: 'border-box',
                  padding: '8px 16px',
                  gap: '10px',
                  width: '148px',
                  height: '36px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '40px',
                  flex: 'none',
                  order: 0,
                  flexGrow: 0,
                }}
              >
                <span className='text-white text-sm'>How Fullego works</span>
              </motion.button>

              {/* Main Heading */}
              <h2
                className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-white'
                style={{
                  lineHeight: '1.2',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                Our <span className='text-[#D4AF37]'>Process</span>
              </h2>

              {/* Subtitle */}
              <p className='text-white/60 text-base sm:text-lg mt-4 sm:mt-6 max-w-[600px] mx-auto'>
                A streamlined journey to acquiring your next masterpiece.
              </p>
            </motion.div>

            {/* Cards Container */}
            <div
              className='relative z-10 w-full max-w-[1098px] mx-auto mt-12 sm:mt-16 md:mt-20'
              style={{ minHeight: '397px' }}
            >
              <div className='flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-0 lg:justify-between relative'>
                {/* Card 1 - Onboard & Verify */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className='relative w-full max-w-[340px]'
                  style={{
                    width: '340px',
                    height: '324px',
                  }}
                >
                  {/* Number - Positioned absolutely */}
                  <div
                    className='absolute'
                    style={{
                      width: '24px',
                      height: '81px',
                      left: '284px',
                      top: '32px',
                      fontFamily: 'Outfit, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      fontSize: '64px',
                      lineHeight: '81px',
                      color: '#DCDCDC',
                    }}
                  >
                    1
                  </div>

                  {/* Content */}
                  <div
                    className='absolute flex flex-col items-center'
                    style={{
                      padding: '0px',
                      gap: '24px',
                      width: '288px',
                      height: '267px',
                      left: '26px',
                      top: '70px',
                    }}
                  >
                    {/* Wrap */}
                    <div
                      className='flex flex-col items-center'
                      style={{
                        padding: '0px',
                        gap: '12px',
                        width: '288px',
                        height: '111px',
                        flex: 'none',
                        order: 1,
                        alignSelf: 'stretch',
                        flexGrow: 0,
                      }}
                    >
                      {/* Title */}
                      <h3
                        style={{
                          width: '288px',
                          height: '30px',
                          fontFamily: 'Outfit, sans-serif',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          fontSize: '24px',
                          lineHeight: '30px',
                          textAlign: 'center',
                          color: '#FFFFFF',
                          flex: 'none',
                          order: 0,
                          alignSelf: 'stretch',
                          flexGrow: 0,
                        }}
                      >
                        Consultation
                      </h3>

                      {/* Description */}
                      <p
                        style={{
                          width: '288px',
                          height: '69px',
                          fontFamily: 'Outfit, sans-serif',
                          fontStyle: 'normal',
                          fontWeight: 400,
                          fontSize: '18px',
                          lineHeight: '23px',
                          textAlign: 'center',
                          color: 'rgba(255, 255, 255, 0.4)',
                          flex: 'none',
                          order: 1,
                          alignSelf: 'stretch',
                          flexGrow: 0,
                        }}
                      >
                        We begin with a private consultation to understand your
                        unique vision and acquisition goals.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Arrow 1 - Vector 3 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className='hidden lg:block absolute'
                  style={{
                    left: '353.97px',
                    top: '71.27px',
                  }}
                >
                  <img
                    src='/Vector 3.svg'
                    alt=''
                    className='w-full h-full object-contain'
                  />
                </motion.div>

                {/* Card 2 - Link Accounts & Sync Assets */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className='relative w-full max-w-[340px] lg:mt-[60px]'
                  style={{
                    width: '340px',
                    height: '324px',
                  }}
                >
                  {/* Number - Positioned absolutely */}
                  <div
                    className='absolute'
                    style={{
                      width: '36px',
                      height: '81px',
                      left: '272px',
                      top: '32px',
                      fontFamily: 'Outfit, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      fontSize: '64px',
                      lineHeight: '81px',
                      color: '#DCDCDC',
                    }}
                  >
                    2
                  </div>

                  {/* Content */}
                  <div
                    className='absolute flex flex-col items-center'
                    style={{
                      padding: '0px',
                      gap: '24px',
                      width: '288px',
                      height: '277px',
                      left: '26px',
                      top: '70px',
                    }}
                  >
                    {/* Wrap */}
                    <div
                      className='flex flex-col items-center'
                      style={{
                        padding: '0px',
                        gap: '12px',
                        width: '288px',
                        height: '111px',
                        flex: 'none',
                        order: 1,
                        alignSelf: 'stretch',
                        flexGrow: 0,
                      }}
                    >
                      {/* Title */}
                      <h3
                        style={{
                          width: '312px',
                          height: '30px',
                          fontFamily: 'Outfit, sans-serif',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          fontSize: '24px',
                          lineHeight: '30px',
                          textAlign: 'center',
                          color: '#FFFFFF',
                          flex: 'none',
                          order: 0,
                          flexGrow: 0,
                        }}
                      >
                        Curated Selection
                      </h3>

                      {/* Description */}
                      <p
                        style={{
                          width: '288px',
                          height: '69px',
                          fontFamily: 'Outfit, sans-serif',
                          fontStyle: 'normal',
                          fontWeight: 400,
                          fontSize: '18px',
                          lineHeight: '23px',
                          textAlign: 'center',
                          color: 'rgba(255, 255, 255, 0.4)',
                          flex: 'none',
                          order: 1,
                          alignSelf: 'stretch',
                          flexGrow: 0,
                        }}
                      >
                        Leveraging our network, we present a bespoke portfolio
                        of assets tailored to your criteria.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Arrow 2 - Vector 4 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className='hidden lg:block absolute'
                  style={{
                    left: '710px',
                    top: '288px',
                  }}
                >
                  <img
                    src='/Vector 4.svg'
                    alt=''
                    className='w-full h-full object-contain'
                  />
                </motion.div>

                {/* Card 3 - Plan, Trade & Connect with Advisors */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className='relative w-full max-w-[340px]'
                  style={{
                    width: '340px',
                    height: '345px',
                  }}
                >
                  {/* Number - Positioned absolutely */}
                  <div
                    className='absolute'
                    style={{
                      width: '36px',
                      height: '81px',
                      left: '292px',
                      top: '130px',
                      fontFamily: 'Outfit, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      fontSize: '64px',
                      lineHeight: '81px',
                      color: '#DCDCDC',
                    }}
                  >
                    3
                  </div>

                  {/* Content */}
                  <div
                    className='absolute flex flex-col items-center'
                    style={{
                      padding: '0px',
                      gap: '0px',
                      width: '288px',
                      height: '297px',
                      left: '26px',
                      top: '170px',
                    }}
                  >
                    {/* Wrap */}
                    <div
                      className='flex flex-col items-center'
                      style={{
                        padding: '0px',
                        gap: '0px',
                        width: '288px',
                        height: '141px',
                        flex: 'none',
                        order: 1,
                        alignSelf: 'stretch',
                        flexGrow: 0,
                      }}
                    >
                      {/* Title */}
                      <h3
                        style={{
                          width: '288px',
                          height: '60px',
                          fontFamily: 'Outfit, sans-serif',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          fontSize: '24px',
                          lineHeight: '30px',
                          textAlign: 'center',
                          color: '#FFFFFF',
                          flex: 'none',
                          order: 0,
                          alignSelf: 'stretch',
                          flexGrow: 0,
                        }}
                      >
                        Seamless Acquisition
                      </h3>

                      {/* Description */}
                      <p
                        style={{
                          width: '288px',
                          height: '69px',
                          fontFamily: 'Outfit, sans-serif',
                          fontStyle: 'normal',
                          fontWeight: 400,
                          fontSize: '18px',
                          lineHeight: '23px',
                          textAlign: 'center',
                          color: 'rgba(255, 255, 255, 0.4)',
                          flex: 'none',
                          order: 1,
                          alignSelf: 'stretch',
                          flexGrow: 0,
                        }}
                      >
                        We manage every aspect of the transaction with absolute
                        discretion and efficiency.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Client Stories Section */}
      <section className='relative py-16 sm:py-20 md:py-24 lg:py-32 bg-transparent overflow-hidden'>
        <Container>
          <div className='relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8'>
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className='relative z-10 w-full text-center mb-12 sm:mb-16 md:mb-20'
            >
              {/* Main Title */}
              <h2
                className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-white mb-4 sm:mb-6'
                style={{
                  lineHeight: '1.2',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Client{' '}
                <span className='text-[#F5D76E]' style={{ color: '#F5D76E' }}>
                  Stories
                </span>
              </h2>

              {/* Subtitle */}
              <p
                className='text-white/70 text-base sm:text-lg md:text-xl mt-4 sm:mt-6 max-w-[700px] mx-auto'
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Hear from those who have experienced the Fullego difference.
              </p>
            </motion.div>

            {/* Testimonials Container */}
            <div className='relative z-10 w-full max-w-[1200px] mx-auto mt-12 sm:mt-16 md:mt-20'>
              <div className='flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 sm:gap-8 lg:gap-12 relative'>
                {/* Testimonial Card 1 - Isabella Rossi */}
                <motion.div
                  initial={{ opacity: 0, y: 50, x: -20 }}
                  whileInView={{ opacity: 1, y: 0, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className='relative w-full max-w-[500px] lg:max-w-[480px]'
                >
                  <div
                    className='relative rounded-2xl p-6 sm:p-8 backdrop-blur-sm
                    bg-gradient-to-r from-[#121212] to-[#1E1E23]'
                    style={{
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {/* Card Content */}
                    <div className='flex flex-col sm:flex-row gap-4 sm:gap-6'>
                      {/* Avatar */}
                      <div className='shrink-0'>
                        <div
                          className='w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden'
                          style={{
                            background: '#F5E6D3',
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <div
                            className='w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-semibold'
                            style={{ color: '#8B6F47' }}
                          >
                            IR
                          </div>
                        </div>
                      </div>

                      {/* Text Content */}
                      <div className='flex-1'>
                        {/* Name */}
                        <h3
                          className='text-lg sm:text-xl font-semibold text-white mb-1'
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          Isabella Rossi
                        </h3>

                        {/* Title */}
                        <p
                          className='text-sm sm:text-base text-white/60 mb-3 sm:mb-4'
                          style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                          Private Collector
                        </p>

                        {/* Testimonial */}
                        <p
                          className='text-sm sm:text-base leading-relaxed text-white/90'
                          style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                          The Fullego team sourced a vintage timepiece I had
                          been searching for years. Their access and
                          professionalism are simply unparalleled. The entire
                          process was flawless.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Testimonial Card 2 - Alexander Chen */}
                <motion.div
                  initial={{ opacity: 0, y: 50, x: 20 }}
                  whileInView={{ opacity: 1, y: 0, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className='relative w-full max-w-[500px] lg:max-w-[480px] lg:mt-16'
                >
                  <div
                    className='relative rounded-2xl p-6 sm:p-8 backdrop-blur-sm
                    bg-gradient-to-r from-[#121212] to-[#1E1E23]'
                    style={{
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {/* Card Content */}
                    <div className='flex flex-col sm:flex-row gap-4 sm:gap-6'>
                      {/* Avatar */}
                      <div className='shrink-0'>
                        <div
                          className='w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden'
                          style={{
                            background: '#F5E6D3',
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <div
                            className='w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-semibold'
                            style={{ color: '#8B6F47' }}
                          >
                            AC
                          </div>
                        </div>
                      </div>

                      {/* Text Content */}
                      <div className='flex-1'>
                        {/* Name */}
                        <h3
                          className='text-lg sm:text-xl font-semibold text-white mb-1'
                          style={{ fontFamily: 'Poppins, sans-serif' }}
                        >
                          Alexander Chen
                        </h3>

                        {/* Title */}
                        <p
                          className='text-sm sm:text-base text-white/60 mb-3 sm:mb-4'
                          style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                          Entrepreneur
                        </p>

                        {/* Testimonial */}
                        <p
                          className='text-sm sm:text-base leading-relaxed text-white/90'
                          style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                          As a first-time yacht buyer, I was intimidated.
                          Fullego Concierge guided me through every step, from
                          selection to sea trial, with expertise and patience. I
                          couldn&apos;t be happier.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
}

// Process Card Component
function ProcessCard({ number, title, description, position, topOffset = 0 }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: number * 0.2 },
    },
  };

  // Number positioning based on card position
  const numberPositions = {
    left: { right: '229px', top: '-40px' },
    center: { right: '279px', top: '-2px' },
    right: { right: '302px', top: '98px' },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true }}
      className='relative w-full max-w-[340px] mx-auto'
      style={{ marginTop: `${topOffset}px` }}
    >
      {/* Blur Light Effect - Gold for first two, purple for third */}
      <div className='absolute inset-0 w-full h-full pointer-events-none overflow-hidden flex items-center justify-center'>
        <div
          className='absolute w-[116px] h-[116px] rounded-full opacity-60 blur-[100px]'
          style={{
            background: number === 3 ? '#423DC7' : '#F1CB68',
          }}
        />
      </div>

      {/* Card Content */}
      <div className='relative z-10 flex flex-col items-center gap-6 p-6 min-h-[284px]'>
        {/* Number */}
        <div
          className='absolute text-[64px] font-semibold leading-[81px] text-[#DCDCDC] pointer-events-none'
          style={{
            fontFamily: 'Outfit',
            ...numberPositions[position],
          }}
        >
          {number}
        </div>

        {/* Title */}
        <h3
          className='text-[24px] font-medium leading-[30px] text-center text-white mt-8'
          style={{ fontFamily: 'Outfit' }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className='text-[18px] leading-[23px] text-center text-white/40 max-w-[288px]'
          style={{ fontFamily: 'Outfit' }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}
