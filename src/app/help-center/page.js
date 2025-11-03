'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Image from 'next/image';
import Link from 'next/link';

export default function HelpCenterPage() {
  const helpSections = [
    {
      category: 'Account',
      items: [
        {
          id: 1,
          icon: '/icons/user-check.svg',
          title: 'Request KYC Review',
          description:
            'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          link: '#',
        },
        {
          id: 2,
          icon: '/icons/deposit.svg',
          title: 'Unconfirmed Deposit',
          description:
            'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          link: '#',
        },
        {
          id: 3,
          icon: '/icons/user-icon.svg',
          title: 'Recover my Account',
          description:
            'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          link: '#',
        },
      ],
    },
    {
      category: 'Trading',
      items: [
        {
          id: 4,
          icon: '/icons/trading.svg',
          title: 'Fulle go Real Tradeing',
          description:
            'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          link: '#',
        },
        {
          id: 5,
          icon: '/icons/bot.svg',
          title: 'Smart Trading Bots for Every Strategy',
          description:
            'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          link: '#',
        },
        {
          id: 6,
          icon: '/icons/skills.svg',
          title: 'Essential Skills for Future Trading',
          description:
            'Risk management, market analysis, discipline, and strategic planning drive success',
          link: '#',
        },
      ],
    },
    {
      category: 'Platform',
      items: [
        {
          id: 7,
          icon: '/icons/earn.svg',
          title: 'Earn While You Trade',
          description:
            'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          link: '#',
        },
        {
          id: 8,
          icon: '/icons/wallet-keys.svg',
          title: 'Your Wallet, Your Keys, Your Control',
          description:
            'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          link: '#',
        },
        {
          id: 9,
          icon: '/icons/insights.svg',
          title: 'Real-Time Market Insights',
          description:
            'Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum',
          link: '#',
        },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className='min-h-screen pb-12'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-white'>Help Center</h1>
        </div>

        {/* Help Sections */}
        <div className='space-y-10'>
          {helpSections.map((section, index) => (
            <div key={index}>
              {/* Category Title */}
              <h2 className='text-xl font-semibold text-white mb-6'>
                {section.category}
              </h2>

              {/* Cards Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {section.items.map(item => (
                  <div
                    key={item.id}
                    className='rounded-2xl p-6 transition-all hover:scale-[1.02] cursor-pointer'
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(30, 30, 35, 0.8) 0%, rgba(20, 20, 25, 0.9) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {/* Icon */}
                    <div className='mb-4'>
                      <Image
                        src={item.icon}
                        alt={item.title}
                        width={32}
                        height={32}
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    </div>

                    {/* Title */}
                    <h3 className='text-white font-semibold text-lg mb-3'>
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className='text-gray-400 text-sm mb-4 line-clamp-3'>
                      {item.description}
                    </p>

                    {/* Learn More Link */}
                    <Link
                      href={item.link}
                      className='inline-flex items-center gap-2 text-[#D4AF37] text-sm font-medium hover:text-[#E5C158] transition-colors'
                    >
                      Learn more
                      <Image
                        src='/icons/arrow-right.svg'
                        alt='Arrow'
                        width={14}
                        height={14}
                        style={{
                          filter:
                            'brightness(0) saturate(100%) invert(73%) sepia(48%) saturate(418%) hue-rotate(6deg) brightness(94%) contrast(87%)',
                        }}
                      />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

