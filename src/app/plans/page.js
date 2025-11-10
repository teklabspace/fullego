'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { useState } from 'react';

const plans = [
  {
    name: 'Starter',
    monthlyCost: '$0 – $49',
    annualCost: '$0 – $499',
    idealUser: 'New or casual investors',
    features: [
      'Basic portfolio dashboard and limited aggregation (1–2 accounts)',
      'Read-only market performance view',
      'Marketplace access for browsing assets (yachts, real estate, jets, collectibles)',
      'View sample valuations but cannot list or buy',
      'Standard email support only',
    ],
    popular: false,
  },
  {
    name: 'Pro',
    monthlyCost: '$99 – $299',
    annualCost: '$999 – $2,999',
    idealUser: 'Active investors & small business owners',
    features: [
      'Full portfolio management (stocks, bonds, ETFs, alternatives)',
      'Automated rebalancing & cash-flow analytics',
      'Access to Marketplace with ability to list and purchase assets',
      'Asset valuation tools for real estate, luxury assets, collectibles',
      'Transaction & trade engine for execution tracking',
      'Standard compliance logs and reporting downloads',
      'Priority support',
    ],
    popular: true,
  },
  {
    name: 'Premium',
    monthlyCost: '$499 – $899',
    annualCost: '$4,999 – $8,999',
    idealUser: 'Advanced investors, entrepreneurs & multi-portfolio users',
    features: [
      'Everything in Pro + AI-driven wealth insights and risk optimization',
      'Automated asset valuation updates via third-party feeds',
      'Marketplace with full interaction: buy/sell, ROI projections, appraisal requests',
      'Document center for legal/estate and appraisal storage',
      'Dedicated tax & investment advisory sessions (monthly)',
      'Premium support with faster SLAs',
    ],
    popular: false,
  },
  {
    name: 'Concierge',
    monthlyCost: 'Custom ($1,000+/mo)',
    annualCost: 'Custom ($10,000+/yr)',
    idealUser: 'High-net-worth individuals, family offices, institutional clients',
    features: [
      'All Premium features + bespoke wealth strategy design',
      'Private Marketplace access to exclusive deals & off-market assets',
      'Real-time valuation feeds for properties, art, and collectibles',
      'Dedicated wealth manager & research analyst',
      'Family office tools: delegated access, secure document sharing, escrow integration',
      'Priority onboarding, white-glove 24/7 concierge support',
    ],
    popular: false,
    isCustom: true,
  },
];

export default function Plans() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'

  return (
    <div className="min-h-screen bg-[#0B0D12] text-brand-white relative overflow-hidden">
      <Navbar />
      
      {/* Background Grid Lines with Creative Angles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Center Grid Shape with Glow - Main */}
        <div
          className="absolute"
          style={{
            width: '546px',
            height: '506px',
            left: 'calc(50% - 546px/2)',
            top: 'calc(50% - 506px/2 - 100px)',
          }}
        >
          {/* Blurred Yellow Ellipse */}
          <div
            className="absolute"
            style={{
              width: '181px',
              height: '181px',
              left: '181px',
              top: '192px',
              background: '#F1CB68',
              filter: 'blur(135px)',
              borderRadius: '50%',
            }}
          />

          {/* Grid Lines Container */}
          <div
            className="absolute"
            style={{
              width: '546px',
              height: '546px',
              left: '0px',
              top: '0px',
            }}
          >
            {/* Vertical Lines */}
            <div
              className="absolute bg-white/10"
              style={{
                width: '546px',
                height: '1px',
                left: '133.71px',
                top: '0px',
                transform: 'rotate(90deg)',
                transformOrigin: 'top left',
              }}
            />
            <div
              className="absolute bg-white/10"
              style={{
                width: '546px',
                height: '1px',
                left: '267.43px',
                top: '0px',
                transform: 'rotate(90deg)',
                transformOrigin: 'top left',
              }}
            />
            <div
              className="absolute bg-white/10"
              style={{
                width: '546px',
                height: '1px',
                left: '401.14px',
                top: '0px',
                transform: 'rotate(90deg)',
                transformOrigin: 'top left',
              }}
            />

            {/* Horizontal Lines */}
            <div
              className="absolute bg-white/10"
              style={{
                width: '546px',
                height: '1px',
                left: '0px',
                top: '133.71px',
              }}
            />
            <div
              className="absolute bg-white/10"
              style={{
                width: '546px',
                height: '1px',
                left: '0px',
                top: '267.43px',
              }}
            />
            <div
              className="absolute bg-white/10"
              style={{
                width: '546px',
                height: '1px',
                left: '0px',
                top: '401.14px',
              }}
            />
          </div>
        </div>

        {/* Angled Grid Pattern - Top Left */}
        <div
          className="absolute"
          style={{
            width: '400px',
            height: '400px',
            left: '10%',
            top: '10%',
            transform: 'rotate(15deg)',
          }}
        >
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '0px',
              top: '100px',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '0px',
              top: '200px',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '0px',
              top: '300px',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '100px',
              top: '0px',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '200px',
              top: '0px',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '300px',
              top: '0px',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }}
          />
        </div>

        {/* Angled Grid Pattern - Bottom Right */}
        <div
          className="absolute"
          style={{
            width: '400px',
            height: '400px',
            right: '10%',
            bottom: '10%',
            transform: 'rotate(-15deg)',
          }}
        >
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '0px',
              top: '100px',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '0px',
              top: '200px',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '0px',
              top: '300px',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '100px',
              top: '0px',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '200px',
              top: '0px',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }}
          />
          <div
            className="absolute bg-white/5"
            style={{
              width: '400px',
              height: '1px',
              left: '300px',
              top: '0px',
              transform: 'rotate(90deg)',
              transformOrigin: 'top left',
            }}
          />
        </div>

        {/* Additional Blurred Ellipse - Top Right */}
        <div
          className="absolute"
          style={{
            width: '250px',
            height: '250px',
            right: '15%',
            top: '15%',
            background: '#F1CB68',
            filter: 'blur(120px)',
            borderRadius: '50%',
            opacity: 0.4,
          }}
        />
      </div>

      {/* Hero Section */}
      <section id="plans" className="relative min-h-screen flex items-center overflow-hidden py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Choose Your
              <br />
              <span className="text-[#F1CB68]">Plan</span>
            </h1>
            <p className="text-brand-muted text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Select the perfect plan for your wealth management journey. All plans include Marketplace access and asset valuation features.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-brand-muted'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-14 h-8 rounded-full transition-colors"
                style={{
                  background: billingCycle === 'monthly' 
                    ? 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <motion.div
                  className="absolute top-1 left-1 w-6 h-6 rounded-full bg-[#0B0D12] shadow-lg"
                  animate={{
                    x: billingCycle === 'monthly' ? 0 : 24,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-white' : 'text-brand-muted'}`}>
                Annual
                <span className="ml-2 text-[#F1CB68] text-xs">(Save up to 20%)</span>
              </span>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6,
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 100,
                }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className={`relative bg-[#1a1a24]/60 backdrop-blur-xl rounded-2xl border p-6 lg:p-8 transition-all duration-300 ${
                  plan.popular 
                    ? 'border-[#F1CB68] shadow-lg shadow-[#F1CB68]/20 lg:scale-105' 
                    : 'border-[#FFFFFF1A] hover:border-[#F1CB68]/50'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-[#0B0D12]"
                    style={{
                      background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                    }}
                  >
                    Most Popular
                  </motion.div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-2xl lg:text-3xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <div className="text-3xl lg:text-4xl font-bold text-[#F1CB68] mb-1">
                      {billingCycle === 'monthly' ? plan.monthlyCost : plan.annualCost}
                    </div>
                    <div className="text-sm text-brand-muted">
                      {billingCycle === 'monthly' ? 'per month' : 'per year'}
                    </div>
                  </div>
                  <p className="text-sm text-brand-muted">{plan.idealUser}</p>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8 min-h-[300px]">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        delay: 0.4 + (index * 0.1) + (featureIndex * 0.05),
                        duration: 0.4
                      }}
                      className="flex items-start gap-3"
                    >
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          delay: 0.5 + (index * 0.1) + (featureIndex * 0.05),
                          type: 'spring'
                        }}
                        className="w-5 h-5 text-[#F1CB68] flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                      <span className="text-sm text-gray-300 leading-relaxed">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full rounded-full px-6 py-3 font-semibold transition-all shadow-lg ${
                    plan.popular
                      ? 'text-[#0B0D12]'
                      : 'text-[#0B0D12]'
                  }`}
                  style={{
                    background: plan.popular
                      ? 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)'
                      : 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                  }}
                >
                  {plan.isCustom ? 'Contact Sales' : 'Get Started'}
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-brand-muted text-sm mb-4">
              All plans include Marketplace access and asset valuation features. 
              <span className="text-[#F1CB68]"> Need help choosing? Contact our team.</span>
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-[#0B0D12] font-semibold hover:brightness-110 transition-all shadow-lg"
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
              }}
            >
              Contact Sales Team
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
