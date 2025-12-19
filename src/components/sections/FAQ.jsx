'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import Container from '../ui/Container';

const faqData = {
  General: [
    {
      id: 1,
      question: 'How secure is Akunuba?',
      answer:
        'Akunuba employs bank-level encryption, multi-factor authentication, and regular security audits to ensure your data and assets are protected at all times. Our security protocols exceed industry standards and are continuously updated.',
    },
    {
      id: 2,
      question: 'Can I link accounts from outside my country?',
      answer:
        'Yes, Akunuba supports international account linking from major financial institutions worldwide. We work with banks and brokerages across multiple countries to provide you with a comprehensive view of your global wealth.',
    },
    {
      id: 3,
      question: 'What types of investments can I track?',
      answer:
        'You can track stocks, bonds, mutual funds, ETFs, real estate, cryptocurrencies, collectibles, luxury assets, and alternative investments. Our platform supports a wide range of asset classes to give you a complete financial picture.',
    },
  ],
  Subscription: [
    {
      id: 1,
      question: 'What subscription plans do you offer?',
      answer:
        'We offer three tiers: Basic (free), Premium ($29/month), and Elite ($99/month). Each plan includes different features and support levels tailored to your wealth management needs.',
    },
    {
      id: 2,
      question: 'Can I cancel my subscription anytime?',
      answer:
        "Yes, you can cancel your subscription at any time without penalties. Your access will continue until the end of your current billing period, and you won't be charged again.",
    },
    {
      id: 3,
      question: 'Do you offer annual billing discounts?',
      answer:
        'Yes, we offer a 20% discount on annual subscriptions for Premium and Elite plans. This can save you significant amounts over monthly billing.',
    },
  ],
  Support: [
    {
      id: 1,
      question: 'How can I contact customer support?',
      answer:
        'You can reach our support team 24/7 via live chat, email at support@akunuba.com, or phone at 1-800-AKUNUBA. Premium and Elite members also have access to dedicated account managers.',
    },
    {
      id: 2,
      question: 'What is your response time for support tickets?',
      answer:
        'We aim to respond to all support tickets within 24 hours. Premium members receive priority support with responses within 12 hours, and Elite members get immediate assistance.',
    },
    {
      id: 3,
      question: 'Do you offer onboarding assistance?',
      answer:
        'Yes, all new users receive a personalized onboarding session. Elite members get comprehensive white-glove onboarding with a dedicated specialist to help set up their entire wealth portfolio.',
    },
  ],
};

const FAQ = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [openFaqId, setOpenFaqId] = useState(1);

  const handleTabChange = tab => {
    setActiveTab(tab);
    setOpenFaqId(1); // Open first FAQ of new tab
  };

  const toggleFaq = id => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section
      className='relative py-16 sm:py-20 md:py-24 lg:py-32 bg-brand-bg overflow-hidden'
      style={{
        backgroundImage: 'url(/Faqbackground.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <Container>
        <div className='relative mx-auto w-full max-w-[836px] px-4 sm:px-6 lg:px-8'>
          {/* Left Side Image */}
          <div
            className='absolute hidden lg:block'
            style={{
              left: '-220px',
              top: '138px',
            }}
          >
            <img
              src='/rightsideimagefaq.png'
              alt=''
              className='w-full h-full object-contain'
              style={{
                filter: 'blur(3.5px)',
                transform: 'rotate(1.91deg)',
              }}
            />
          </div>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className='relative z-10 w-full text-start lg:text-start text-center mb-12 sm:mb-16 md:mb-20'
          >
            {/* FAQ Label Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='flex flex-row bg-[#343437] text-nowrap justify-center items-start mb-4 sm:mb-6 py-2 px-6 mx-auto lg:mx-0'
              style={{
                border: '2px solid #444447',
                borderRadius: '40px',
              }}
            >
              <span className='text-white text-sm'>FAQ</span>
            </motion.button>

            {/* Main Heading */}
            <h2
              className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-4'
              style={{
                lineHeight: '1.2',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              Frequently asked <br className='hidden lg:block' />
              <span className='lg:inline'> </span>
              <span className='text-[#F1CB68]'>questions</span>
            </h2>

            {/* Subtitle */}
            <p className='text-white/60 text-base sm:text-lg mt-4 sm:mt-6 max-w-[600px] mx-auto lg:mx-0'>
              All the things you need to know about Akunuba
            </p>
          </motion.div>

          {/* Content and Tabs Layout */}
          <div className='relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-12 items-start'>
            {/* Tabs - Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='w-full lg:w-auto flex flex-row lg:flex-col gap-3 sm:gap-4 justify-center lg:justify-start flex-wrap'
            >
              {Object.keys(faqData).map((tab, index) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className='flex flex-row justify-center items-center transition-all duration-300 hover:scale-105 active:scale-95'
                  style={{
                    boxSizing: 'border-box',
                    padding: '12px 24px',
                    gap: '10px',
                    minWidth: activeTab === tab ? '113px' : '148px',
                    height: '48px',
                    background:
                      activeTab === tab
                        ? 'rgba(255, 255, 255, 0.12)'
                        : 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '40px',
                    flex: 'none',
                    order: index,
                    flexGrow: 0,
                    alignSelf: activeTab === tab ? 'auto' : 'stretch',
                  }}
                >
                  <span
                    className='text-white font-medium text-sm sm:text-base whitespace-nowrap'
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    {tab}
                  </span>
                </button>
              ))}
            </motion.div>

            {/* FAQ Content - Right Side */}
            <div className='w-full lg:flex-1'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className='space-y-4'
                >
                  {faqData[activeTab].map((faq, index) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className='rounded-3xl overflow-hidden'
                      style={{
                        background: 'rgba(49, 48, 53, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      {/* Question */}
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className='w-full flex items-center justify-between p-4 sm:p-6 lg:p-8 text-left transition-colors'
                      >
                        <h3
                          className='text-white font-medium text-base sm:text-lg lg:text-xl pr-4'
                          style={{
                            fontFamily: 'Outfit, sans-serif',
                          }}
                        >
                          {faq.question}
                        </h3>

                        {/* Plus/Minus Icon */}
                        <div
                          className='flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-transform'
                          style={{
                            transform:
                              openFaqId === faq.id
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                          }}
                        >
                          {openFaqId === faq.id ? (
                            <img src='/minus.svg' alt='' />
                          ) : (
                            <img src='/plus.svg' alt='' />
                          )}
                        </div>
                      </button>

                      {/* Answer */}
                      <AnimatePresence initial={false}>
                        {openFaqId === faq.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className='overflow-hidden'
                          >
                            <div className='px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8'>
                              <p
                                className='text-white/60 text-sm sm:text-base lg:text-lg leading-relaxed'
                                style={{
                                  fontFamily: 'Outfit, sans-serif',
                                }}
                              >
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          {/* Right Side Image */}
          <div
            className='absolute hidden lg:block'
            style={{
              right: '-220px',
              top: '340px',
            }}
          >
            <img
              src='/leftsideimagefaq.png'
              alt=''
              className='w-full h-full object-contain'
              style={{
                filter: 'blur(3.5px)',
                transform: 'rotate(360.48deg)',
              }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default FAQ;
