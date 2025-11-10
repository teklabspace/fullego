'use client';

import { motion } from 'framer-motion';
import Container from '../ui/Container';

const HowToGetStarted = () => {
  return (
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
              How to get{' '}
              <span
              className='text-[#F1CB68]'
              >
                Started
              </span>
            </h2>

            {/* Subtitle */}
            <p className='text-white/60 text-base sm:text-lg mt-4 sm:mt-6 max-w-[600px] mx-auto'>
              Begin your journey with a seamless setup process.
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
                    top: '40px',
                  }}
                >
                  {/* Icon */}
                  <div className='flex items-center justify-center'>
                    <img
                      src='/FirstcardIcon.svg'
                      alt='Onboard & Verify'
                      className='w-8 h-8'
                    />
                  </div>

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
                      Onboard & Verify
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
                      Complete our secure verification process designed
                      specifically for high-net-worth individuals.
                    </p>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='flex flex-row justify-center items-center'
                    style={{
                      boxSizing: 'border-box',
                      padding: '12px 24px',
                      gap: '10px',
                      width: '141px',
                      height: '48px',
                      background: '#313035',
                      border: '1px solid #FFFFFF',
                      borderRadius: '40px',
                      flex: 'none',
                      order: 2,
                      flexGrow: 0,
                    }}
                  >
                    <span
                      style={{
                        width: '93px',
                        height: '23px',
                        fontFamily: 'Outfit, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        fontSize: '18px',
                        lineHeight: '23px',
                        color: '#FFFFFF',
                        flex: 'none',
                        order: 0,
                        flexGrow: 0,
                      }}
                    >
                      Learn more
                    </span>
                  </motion.button>
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
                    top: '40px',
                  }}
                >
                  {/* Icon */}
                  <div
                    className='flex items-center justify-center'
                    style={{
                      width: '70px',
                      height: '70px',
                      flex: 'none',
                      order: 0,
                      flexGrow: 0,
                    }}
                  >
                    <img
                      src='/SecodcardIcon.svg'
                      alt='Link Accounts & Sync Assets'
                      className='w-full h-full'
                    />
                  </div>

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
                      Link Accounts & Sync Assets
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
                      Connect your financial accounts and register your
                      alternative assets for a complete wealth overview.
                    </p>
                  </div>

                  {/* CTA Button - Gradient */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='flex flex-row justify-center items-center'
                    style={{
                      padding: '12px 24px',
                      gap: '10px',
                      width: '141px',
                      height: '48px',
                      background:
                        'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                      borderRadius: '40px',
                      flex: 'none',
                      order: 2,
                      flexGrow: 0,
                    }}
                  >
                    <span
                      style={{
                        width: '93px',
                        height: '23px',
                        fontFamily: 'Outfit, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        fontSize: '18px',
                        lineHeight: '23px',
                        color: '#101014',
                        flex: 'none',
                        order: 0,
                        flexGrow: 0,
                      }}
                    >
                      Learn more
                    </span>
                  </motion.button>
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
                  3
                </div>

                {/* Content */}
                <div
                  className='absolute flex flex-col items-center'
                  style={{
                    padding: '0px',
                    gap: '24px',
                    width: '288px',
                    height: '297px',
                    left: '26px',
                    top: '40px',
                  }}
                >
                  {/* Icon */}
                  <div
                    className='flex items-center justify-center'
                    style={{
                      width: '60px',
                      height: '60px',
                      flex: 'none',
                      order: 0,
                      flexGrow: 0,
                    }}
                  >
                    <img
                      src='/thirdcardicons.svg'
                      alt='Plan, Trade & Connect with Advisors'
                      className='w-full h-full'
                    />
                  </div>

                  {/* Wrap */}
                  <div
                    className='flex flex-col items-center'
                    style={{
                      padding: '0px',
                      gap: '12px',
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
                      Plan, Trade & Connect with Advisors
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
                      Utilize our platform to manage your wealth and connect
                      with our network of trusted advisors.
                    </p>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='flex flex-row justify-center items-center'
                    style={{
                      boxSizing: 'border-box',
                      padding: '12px 24px',
                      gap: '10px',
                      width: '141px',
                      height: '48px',
                      background: '#313035',
                      border: '1px solid #FFFFFF',
                      borderRadius: '40px',
                      flex: 'none',
                      order: 2,
                      flexGrow: 0,
                    }}
                  >
                    <span
                      style={{
                        width: '93px',
                        height: '23px',
                        fontFamily: 'Outfit, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 500,
                        fontSize: '18px',
                        lineHeight: '23px',
                        color: '#FFFFFF',
                        flex: 'none',
                        order: 0,
                        flexGrow: 0,
                      }}
                    >
                      Learn more
                    </span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HowToGetStarted;
