'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Container from '../ui/Container';

const Hero = () => {
  return (
    <section
      id='why-fullego'
      className='relative overflow-hidden min-h-[calc(100vh-120px)] flex items-center'
    >
      {/* Grid Background Image */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 z-10'
        style={{
          backgroundImage: 'url(/Gridbackground.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Decorative Key - Top Left */}
      <motion.div
        initial={{ opacity: 0, x: -50, rotate: -15 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className='absolute -top-20 left-8 md:left-20 w-100 h-100 pointer-events-none'
      >
        <Image
          src='/key-left.png'
          alt=''
          fill
          className='object-contain opacity-80'
        />
      </motion.div>

      {/* Decorative Key - Bottom Right */}
      <motion.div
        initial={{ opacity: 0, x: 50, rotate: 15 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ duration: 1, delay: 0.7 }}
        className='absolute -bottom-10 right-10 md:-right-10 w-100 h-100 pointer-events-none'
      >
        <Image
          src='/key-right.png'
          alt=''
          fill
          className='object-contain opacity-80'
        />
      </motion.div>

      {/* Circular Glow - Center Top */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className='absolute top-10 left-1/2 z-40 transform -translate-x-1/2 w-[100px] h-[100px] md:w-[100px] md:h-[100px] pointer-events-none'
      >
        <div className='w-full h-full rounded-full bg-brand-gold/10 blur-3xl' />
      </motion.div>

      <Container className='py-12 sm:py-16 md:py-20 lg:py-28'>
        <div className='mx-auto max-w-5xl text-center px-4 sm:px-6'>
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='font-bold tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[80px] relative'
            style={{
              lineHeight: '130%',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(to right, #FFFFFF 0%, #D4AF37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Your{' '}
            <span className='relative inline-block'>
              {/* Ellipse Glow on Wealth */}
              <div
                className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full pointer-events-none z-0'
                style={{
                  background: 'rgba(255, 255, 255, 0.068)',
                  backgroundBlendMode: 'plus-lighter',
                  mixBlendMode: 'normal',
                  boxShadow:
                    '-11.1504px -10.392px 48px -12px rgba(0, 0, 0, 0.15), -1.8584px -1.732px 12px -8px rgba(0, 0, 0, 0.15), inset 1.92344px 1.79262px 8.28px rgba(255, 255, 255, 0.126), inset 0.994244px 0.92662px 4.14px rgba(255, 255, 255, 0.126)',
                  backdropFilter: 'blur(3.26px)',
                }}
              />
              <span
                className='relative z-10'
                style={{
                  background:
                    'linear-gradient(to right, #FFFFFF 0%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Wealth.
              </span>
            </span>
            <br />
            <span className='relative inline-block'>
              {/* Border around Unified, Elevated */}
              <div
                className='absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0'
                style={{
                  width: '668px',
                  height: '84px',
                  border: '1.5px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '8px',
                }}
              />
              <span
                className='relative z-10'
                style={{
                  background:
                    'linear-gradient(to right, #FFFFFF 0%, #D4AF37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Unified, Elevated.
              </span>
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='mx-auto mt-4 sm:mt-6 max-w-[462px] text-sm sm:text-base md:text-lg px-4'
            style={{
              color: '#FFFFFF99',
              lineHeight: '130%',
              letterSpacing: '-0.02em',
            }}
          >
            Fullego brings your investments, luxury assets, and financial
            strategy into one intelligent dashboard—crafted for elite
            individuals and family offices.
          </motion.p>

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
              className='w-full sm:flex-1 rounded-full bg-transparent px-4 sm:px-4 py-3 text-sm text-brand-white placeholder:text-white focus:outline-none border border-[#FFFFFF1A] sm:border-0'
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='w-full sm:w-auto rounded-full px-6 sm:px-5 py-3 text-sm font-medium text-black transition-all'
              style={{
                background:
                  'linear-gradient(95.36deg, #FFFFFF 1.12%, #D4AF37 53.42%)',
              }}
            >
              Sign up
            </motion.button>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
