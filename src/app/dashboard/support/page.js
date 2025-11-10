'use client';
import { useTheme } from '@/context/ThemeContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function SupportPage() {
  const { isDarkMode } = useTheme();

  const helpSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'kyc-review',
          title: 'Request KYC Review',
          description:
            'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          icon: 'KYCReview',
        },
        {
          id: 'unconfirmed-deposit',
          title: 'Unconfirmed Deposit',
          description:
            'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          icon: 'UnconfirmedDeposit',
        },
        {
          id: 'recover-account',
          title: 'Recover my Account',
          description:
            'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          icon: 'RecoverAccount',
        },
      ],
    },
    {
      title: 'Trading',
      items: [
        {
          id: 'real-trading',
          title: 'Fulle go Real Tradeing',
          description:
            'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          icon: 'RealTrading',
        },
        {
          id: 'trading-bots',
          title: 'Smart Trading Bots for Every Strategy',
          description:
            'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          icon: 'TradingBots',
        },
        {
          id: 'trading-skills',
          title: 'Essential Skills for Future Trading',
          description:
            'Risk management, market analysis, discipline, and strategic planning drive success',
          icon: 'TradingSkills',
        },
      ],
    },
    {
      title: 'Platform',
      items: [
        {
          id: 'earn-trade',
          title: 'Earn While You Trade',
          description:
            'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          icon: 'EarnTrade',
        },
        {
          id: 'wallet-control',
          title: 'Your Wallet, Your Keys, Your Control',
          description:
            'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          icon: 'WalletControl',
        },
        {
          id: 'market-insights',
          title: 'Real-Time Market Insights',
          description:
            'lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          icon: 'MarketInsights',
        },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className='p-4 md:p-6 lg:p-8'>
        {/* Page Header */}
        <div className='mb-8'>
          <h1
            className={`text-3xl md:text-4xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Help Center
          </h1>
        </div>

        {/* Help Sections */}
        <div className='space-y-12'>
          {helpSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Section Title */}
              <h2
                className={`text-xl font-semibold mb-6 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {section.title}
              </h2>

              {/* Cards Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {section.items.map(item => (
                  <HelpCard key={item.id} item={item} isDarkMode={isDarkMode} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Help Card Component
function HelpCard({ item, isDarkMode }) {
  return (
    <div
      className={`rounded-2xl border p-6 transition-all hover:shadow-lg ${
        isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14] hover:border-[#F1CB68]/50'
          : 'bg-white border-gray-200 hover:border-[#F1CB68]/50'
      }`}
    >
      {/* Icon */}
      <div className='mb-4'>
        <HelpIcon name={item.icon} isDarkMode={isDarkMode} />
      </div>

      {/* Title */}
      <h3
        className={`text-lg font-semibold mb-3 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
      >
        {item.title}
      </h3>

      {/* Description */}
      <p
        className={`text-sm mb-4 leading-relaxed ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {item.description}
      </p>

      {/* Learn More Link */}
      <a
        href='#'
        className='text-[#F1CB68] text-sm font-medium hover:text-[#E5C158] transition-colors inline-flex items-center gap-1'
      >
        Learn more{' '}
        <svg
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <path d='M5 12h14M12 5l7 7-7 7' />
        </svg>
      </a>
    </div>
  );
}

// Help Icon Component
function HelpIcon({ name, isDarkMode }) {
  const iconColor = isDarkMode ? '#FFFFFF' : '#1F2937';
  const iconSize = 48;

  const icons = {
    KYCReview: (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox='0 0 24 24'
        fill='none'
        stroke={iconColor}
        strokeWidth='1.5'
      >
        <circle cx='12' cy='8' r='4' />
        <path d='M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2' />
        <path d='M16 11h4M18 9v4' />
      </svg>
    ),
    UnconfirmedDeposit: (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox='0 0 24 24'
        fill='none'
        stroke={iconColor}
        strokeWidth='1.5'
      >
        <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
        <path d='M14 2v6h6M12 18v-6M9 15l3-3 3 3' />
      </svg>
    ),
    RecoverAccount: (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox='0 0 24 24'
        fill='none'
        stroke={iconColor}
        strokeWidth='1.5'
      >
        <circle cx='12' cy='8' r='4' />
        <path d='M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2' />
        <rect x='8' y='12' width='8' height='4' rx='1' />
        <path d='M10 12v-2M14 12v-2' />
      </svg>
    ),
    RealTrading: (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox='0 0 24 24'
        fill='none'
        stroke={iconColor}
        strokeWidth='1.5'
      >
        <circle cx='12' cy='12' r='3' />
        <path d='M12 1v6M12 17v6M5.64 5.64l4.24 4.24M14.12 14.12l4.24 4.24M1 12h6M17 12h6M5.64 18.36l4.24-4.24M14.12 9.88l4.24-4.24' />
        <path d='M12 8v2M12 14v2M8 12h2M14 12h2' />
      </svg>
    ),
    TradingBots: (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox='0 0 24 24'
        fill='none'
        stroke={iconColor}
        strokeWidth='1.5'
      >
        <rect x='3' y='3' width='18' height='18' rx='2' />
        <circle cx='9' cy='9' r='2' />
        <circle cx='15' cy='9' r='2' />
        <path d='M9 15h6M12 12v6' />
      </svg>
    ),
    TradingSkills: (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox='0 0 24 24'
        fill='none'
        stroke={iconColor}
        strokeWidth='1.5'
      >
        <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />
        <path d='M12 8v4M12 14v4' />
      </svg>
    ),
    EarnTrade: (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox='0 0 24 24'
        fill='none'
        stroke={iconColor}
        strokeWidth='1.5'
      >
        <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
        <path d='M12 6l3-3M12 18l3 3' />
      </svg>
    ),
    WalletControl: (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox='0 0 24 24'
        fill='none'
        stroke={iconColor}
        strokeWidth='1.5'
      >
        <rect x='2' y='7' width='20' height='14' rx='2' />
        <path d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' />
        <path d='M12 11h.01' />
      </svg>
    ),
    MarketInsights: (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox='0 0 24 24'
        fill='none'
        stroke={iconColor}
        strokeWidth='1.5'
      >
        <path d='M3 3v18h18' />
        <path d='M7 16l4-4 4 4 6-6' />
        <path d='M21 12h-6' />
      </svg>
    ),
  };

  return icons[name] || null;
}
