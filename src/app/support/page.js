'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

const supportCategories = [
  {
    title: 'Help Center',
    icon: '📚',
    topics: [
      { name: 'Getting Started Guide', description: 'Learn the basics of using Fullego' },
      { name: 'Video Tutorials', description: 'Step-by-step video guides' },
      { name: 'FAQ', description: 'Frequently asked questions' }
    ]
  },
  {
    title: 'Account',
    icon: '👤',
    topics: [
      { name: 'Account Settings', description: 'Manage your account preferences' },
      { name: 'Security & Privacy', description: 'Keep your account secure' },
      { name: 'Profile Management', description: 'Update your profile information' }
    ]
  },
  {
    title: 'Request/KYC Reviews',
    icon: '📋',
    topics: [
      { name: 'KYC Verification', description: 'Identity verification process' },
      { name: 'Document Submission', description: 'Submit required documents' },
      { name: 'Review Status', description: 'Check your verification status' }
    ]
  },
  {
    title: 'Trading',
    icon: '📈',
    topics: [
      { name: 'Trade in Your Trading', description: 'Execute buy and sell orders' },
      { name: 'Trading Best for Every Situation', description: 'Optimize your trading strategy' },
      { name: 'Market Analysis', description: 'Understand market trends' }
    ]
  },
  {
    title: 'Platform',
    icon: '⚙️',
    topics: [
      { name: 'Dashboard Overview', description: 'Navigate the platform' },
      { name: 'Mobile App', description: 'Use Fullego on mobile' },
      { name: 'API Documentation', description: 'Integrate with our API' }
    ]
  }
];

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-brand-bg text-brand-white">
      <Navbar />
      
      {/* Hero Section */}
      <section id="support" className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/Grid.svg)',
            backgroundRepeat: 'repeat',
            backgroundSize: '50px 50px'
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a24]/80 via-[#0f0f18]/90 to-[#1a1a24]/80" />
        
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Support
                <br />
                <span className="text-[#F1CB68]">Center</span>
              </h1>
              
              <p className="text-brand-muted text-lg md:text-xl max-w-xl">
                Get help with your wealth management and lifestyle needs. 
                <span className="text-[#F1CB68]"> Search our resources or contact our team.</span>
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-full bg-[#F1CB68] px-8 py-4 text-black font-semibold hover:brightness-110 transition-all"
              >
                Learn more
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </motion.div>

            {/* Right Content - Support Preview Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-[#1a1a24]/60 backdrop-blur-xl rounded-2xl border border-[#FFFFFF1A] p-6 md:p-8 shadow-2xl">
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#0f0f18] border border-[#FFFFFF1A] rounded-xl px-4 py-3 pl-12 text-white placeholder-brand-muted focus:outline-none focus:border-[#F1CB68] transition-colors"
                    />
                    <svg 
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Quick Access Categories */}
                <div className="space-y-3">
                  {['Help Center', 'Account', 'Trading', 'Platform'].map((category, index) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-[#0f0f18]/80 border border-[#FFFFFF1A] rounded-xl p-4 hover:border-[#F1CB68] transition-colors cursor-pointer group"
                    >
                      <h3 className="text-white font-medium mb-1 group-hover:text-[#F1CB68] transition-colors">
                        {category}
                      </h3>
                      <p className="text-brand-muted text-sm">
                        {category === 'Help Center' && 'Quick guides and tutorials'}
                        {category === 'Account' && 'Manage your account settings'}
                        {category === 'Trading' && 'Learn about trading features'}
                        {category === 'Platform' && 'Platform documentation'}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Support Categories Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How can we <span className="text-[#F1CB68]">help you?</span>
            </h2>
            <p className="text-brand-muted text-lg max-w-2xl mx-auto">
              Browse through our support categories to find answers to your questions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {supportCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1a1a24]/60 backdrop-blur-xl rounded-2xl border border-[#FFFFFF1A] p-6 hover:border-[#F1CB68] transition-all duration-300 group"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-[#F1CB68] transition-colors">
                  {category.title}
                </h3>
                <div className="space-y-3">
                  {category.topics.map((topic, topicIndex) => (
                    <motion.div
                      key={topicIndex}
                      whileHover={{ x: 5 }}
                      className="cursor-pointer"
                    >
                      <h4 className="text-white font-medium mb-1 hover:text-[#F1CB68] transition-colors">
                        {topic.name}
                      </h4>
                      <p className="text-brand-muted text-sm">
                        {topic.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6 inline-flex items-center gap-2 text-[#F1CB68] font-medium hover:gap-3 transition-all"
                >
                  Learn more
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#F1CB68]/20 to-[#F1CB68]/5 backdrop-blur-xl rounded-3xl border border-[#F1CB68]/30 p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Still need help?
            </h2>
            <p className="text-brand-muted text-lg mb-8 max-w-2xl mx-auto">
              Our support team is available 24/7 to assist you with any questions or concerns
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F1CB68] px-8 py-4 text-black font-semibold hover:brightness-110 transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2 4L8 10L2 16V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 10L14 4V16L8 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 10H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Contact Support
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#FFFFFF1A] bg-[#1a1a24]/60 px-8 py-4 text-white font-semibold hover:bg-[#1a1a24] transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 14V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="10" cy="6.5" r="0.5" fill="currentColor" stroke="currentColor"/>
                </svg>
                View Documentation
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

