'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PLANS } from '@/config/plans';
import { getStoredUser } from '@/utils/permissions';

const formatUSD = (n) =>
  typeof n === 'number' ? `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : n;

export default function SelectPlanPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');

  // Gate: must be logged in, email-verified and KYC-verified before choosing a plan.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('access_token')) {
      router.replace('/login');
      return;
    }
    const user = getStoredUser();
    // Subscriptions are investor-only — staff never see the plan picker.
    if (user && (user.role === 'admin' || user.role === 'advisor')) {
      router.replace('/dashboard');
      return;
    }
    if (user && !user.is_email_verified) {
      router.replace('/signup');
      return;
    }
    if (user && !user.is_kyc_verified) {
      router.replace('/choose-profile');
      return;
    }
    setReady(true);
  }, [router]);

  const handleSelect = (plan) => {
    try {
      localStorage.setItem('pendingPlan', JSON.stringify({ name: plan.name, billingCycle }));
    } catch {
      /* ignore */
    }
    router.push('/checkout');
  };

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 border-b border-[#FFFFFF14]">
        <Link href="/" className="inline-flex items-center">
          <img src="/darkmode_logo.svg" alt="Akunuba" className="h-9 w-auto object-contain" />
        </Link>
      </header>

      <main className="flex-1 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Choose your plan</h1>
            <p className="text-gray-400 max-w-xl mx-auto">
              Pick a plan to activate your account. You can change or cancel it anytime from
              settings.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-2 mt-6 text-sm">
              {['monthly', 'annual'].map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`px-4 py-2 rounded-full border transition-all capitalize ${
                    billingCycle === cycle
                      ? 'border-[#F1CB68] text-[#F1CB68] bg-[#F1CB68]/10'
                      : 'border-[#FFFFFF1A] text-gray-400 hover:text-white'
                  }`}
                >
                  {cycle}
                  {cycle === 'annual' && <span className="ml-1 text-[10px]">(save ~20%)</span>}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Plans grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`relative flex flex-col rounded-2xl border p-6 bg-[#1a1a24]/60 backdrop-blur-xl ${
                  plan.popular ? 'border-[#F1CB68] shadow-lg shadow-[#F1CB68]/10' : 'border-[#FFFFFF1A]'
                }`}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-semibold text-[#0B0D12]"
                    style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)' }}
                  >
                    Most Popular
                  </div>
                )}

                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-400 mb-4">{plan.idealUser}</p>

                <div className="mb-5">
                  <span className="text-3xl font-bold text-[#F1CB68]">
                    {formatUSD(billingCycle === 'annual' ? plan.annual : plan.monthly)}
                  </span>
                  <span className="text-sm text-gray-400">
                    {' '}
                    / {billingCycle === 'annual' ? 'year' : 'month'}
                  </span>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <svg
                        className="w-4 h-4 text-[#F1CB68] flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleSelect(plan)}
                  className="w-full rounded-full px-6 py-3 font-semibold transition-all shadow-lg text-[#0B0D12]"
                  style={{ background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)' }}
                >
                  Select {plan.name}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
