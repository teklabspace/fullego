'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import useFormValidation from '@/hooks/useFormValidation';
import { COMMON_SPECS, KIND } from '@/utils/validation';

const CONTACT_SPECS = {
  firstName: { ...COMMON_SPECS.firstName, required: false },
  lastName: COMMON_SPECS.lastName,
  email: COMMON_SPECS.email,
  phone: { ...COMMON_SPECS.phone, required: true },
  message: {
    kind: KIND.TEXTAREA,
    label: 'Message',
    maxLen: 5000,
    minLen: 10,
    required: true,
  },
};

const CONTACT_INITIAL = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
};

const ContactPage = () => {
  const form = useFormValidation(CONTACT_SPECS, CONTACT_INITIAL);
  const formData = form.values;

  const fieldCls = key =>
    `w-full px-4 py-3 rounded-lg bg-[#1a1a1f] border text-white placeholder:text-white/50 focus:outline-none focus:border-[#F1CB68]/50 transition-colors ${
      form.errorFor(key) ? 'border-red-500' : 'border-white/10'
    }`;

  const fieldMsg = key =>
    form.errorFor(key) ? (
      <p className='mt-1.5 text-xs text-red-400'>{form.errorFor(key)}</p>
    ) : null;

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.validateAll()) return;
    // TODO: there is no contact endpoint in API_ENDPOINTS yet, so this stays a
    // client-side form. The fields are validated and ready to POST.
    console.log('Form submitted:', form.values);
  };

  return (
    <Layout>
      <div className='min-h-screen bg-[#101014] text-white relative'>
        {/* Unified Background Container */}
        <div className='absolute inset-0 z-0 pointer-events-none overflow-hidden'>
          {/* Background Image - Whole Page */}
          <div className='absolute inset-0 '>
            <Image
              src='/securitybg.png'
              alt=' Background'
              fill
              className='object-cover'
              priority
            />
          </div>

          {/* Ellipse 3021 - Light Gray - Bottom Right of Hero */}
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
        <section className='relative pt-20 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 min-h-[400px] md:min-h-[300px] flex items-center'>
          <div className='relative z-10 max-w-4xl mx-auto w-full text-center space-y-6'>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight'
            >
              <span className='text-white'>Get in</span>

              <span
                className='bg-clip-text text-transparent'
                style={{
                  backgroundImage:
                    'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                }}
              >
                Touch
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed'
            >
              We&apos;d love to hear from you. Fill out the form below or use
              our contact details to reach out with any questions or inquiries.
            </motion.p>
          </div>
        </section>

        {/* Contact Form and Details Section */}
        <section className='relative py-12 md:py-16 px-4 sm:px-6 lg:px-8 pb-20'>
          <div className='relative z-10 max-w-7xl mx-auto'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative'>
              {/* Line 95 - Vertical Divider */}
              <div
                className='absolute hidden md:block pointer-events-none z-0'
                style={{
                  width: '588px',
                  height: '1px',
                  left: 'calc(50% - 294px)',
                  top: '80px',
                  transform: 'rotate(90deg)',
                  transformOrigin: 'top center',
                }}
              >
                <svg
                  width='588'
                  height='1'
                  viewBox='0 0 588 1'
                  preserveAspectRatio='none'
                >
                  <defs>
                    <linearGradient
                      id='line95-gradient'
                      x1='0%'
                      y1='0%'
                      x2='100%'
                      y2='0%'
                    >
                      <stop offset='0%' stopColor='#FFFFFF' stopOpacity='0' />
                      <stop offset='50%' stopColor='#FFFFFF' stopOpacity='1' />
                      <stop offset='100%' stopColor='#FFFFFF' stopOpacity='0' />
                    </linearGradient>
                  </defs>
                  <line
                    x1='0'
                    y1='0.5'
                    x2='588'
                    y2='0.5'
                    stroke='url(#line95-gradient)'
                    strokeWidth='1'
                  />
                </svg>
              </div>

              {/* Left Column - Send us a message */}
              <div className='space-y-6 relative z-10'>
                <h2
                  className='text-2xl md:text-3xl font-bold text-white mb-6'
                  style={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                  }}
                >
                  Send us a message
                </h2>

                <form onSubmit={handleSubmit} className='space-y-4'>
                  {/* First Name and Last Name Row */}
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <div>
                      <input
                        type='text'
                        {...form.fieldProps('firstName')}
                        placeholder='John'
                        className={fieldCls('firstName')}
                        style={{
                          fontFamily: 'Outfit',
                          fontWeight: 400,
                        }}
                      />
                      {fieldMsg('firstName')}
                    </div>
                    <div>
                      <input
                        type='text'
                        {...form.fieldProps('lastName')}
                        placeholder='Last Name*'
                        className={fieldCls('lastName')}
                        style={{
                          fontFamily: 'Outfit',
                          fontWeight: 400,
                        }}
                      />
                      {fieldMsg('lastName')}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <input
                      type='email'
                      {...form.fieldProps('email')}
                      placeholder='Email*'
                      className={fieldCls('email')}
                      style={{
                        fontFamily: 'Outfit',
                        fontWeight: 400,
                      }}
                    />
                      {fieldMsg('email')}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <input
                      type='tel'
                      {...form.fieldProps('phone')}
                      placeholder='Phone Number*'
                      className={fieldCls('phone')}
                      style={{
                        fontFamily: 'Outfit',
                        fontWeight: 400,
                      }}
                    />
                      {fieldMsg('phone')}
                  </div>

                  {/* Message Textarea */}
                  <div>
                    <textarea
                      {...form.fieldProps('message')}
                      placeholder='Your message...'
                      rows={6}
                      className={`${fieldCls('message')} resize-none`}
                      style={{
                        fontFamily: 'Outfit',
                        fontWeight: 400,
                      }}
                    />
                      {fieldMsg('message')}
                  </div>

                  {/* Submit Button */}
                  <button
                    type='submit'
                    className='w-full px-6 py-3 rounded-lg font-medium transition-colors'
                    style={{
                      background: '#F1CB68',
                      color: '#FFFFFF',
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                    }}
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Right Column - Other ways to connect */}
              <div className='space-y-8 md:pt-20 md:ps-20 relative z-10'>
                <h2
                  className='text-2xl md:text-3xl font-bold text-white mb-6'
                  style={{
                    fontFamily: 'Poppins',
                    fontWeight: 500,
                  }}
                >
                  Other ways to connect
                </h2>

                <div className='space-y-8'>
                  {/* Office Information */}
                  <div className='space-y-3'>
                    <div className='flex items-center gap-3'>
                      <div
                        className='w-6 h-6 flex items-center justify-center'
                        style={{ color: '#F1CB68' }}
                      >
                        <svg
                          width='24'
                          height='24'
                          viewBox='0 0 24 24'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'
                            fill='#F1CB68'
                          />
                        </svg>
                      </div>
                      <h3
                        className='text-xl font-bold text-white'
                        style={{
                          fontFamily: 'Poppins',
                          fontWeight: 500,
                        }}
                      >
                        Our Office
                      </h3>
                    </div>
                    <p
                      className='text-base text-white/70 pl-9'
                      style={{
                        fontFamily: 'Outfit',
                        fontWeight: 400,
                      }}
                    >
                      123 Modern Avenue, Suite 500, Tech City, TX 78701
                    </p>
                  </div>

                  {/* Email Information */}
                  <div className='space-y-3'>
                    <div className='flex items-center gap-3'>
                      <div
                        className='w-6 h-6 flex items-center justify-center'
                        style={{ color: '#F1CB68' }}
                      >
                        <svg
                          width='24'
                          height='24'
                          viewBox='0 0 24 24'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'
                            fill='#F1CB68'
                          />
                        </svg>
                      </div>
                      <h3
                        className='text-xl font-bold text-white'
                        style={{
                          fontFamily: 'Poppins',
                          fontWeight: 500,
                        }}
                      >
                        Email
                      </h3>
                    </div>
                    <a
                      href='mailto:info@akunuba.io'
                      className='text-base text-white/70 hover:text-[#F1CB68] transition-colors pl-9 inline-block'
                      style={{
                        fontFamily: 'Outfit',
                        fontWeight: 400,
                      }}
                    >
                      info@akunuba.io
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ContactPage;
