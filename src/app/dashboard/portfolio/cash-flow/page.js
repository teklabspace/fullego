'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function CashFlowPage() {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('last30');
  const [showFilters, setShowFilters] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferStep, setTransferStep] = useState(1); // 1: Form, 2: Review, 3: Success
  const [transferType, setTransferType] = useState('internal'); // 'internal' or 'external'
  const [transferData, setTransferData] = useState({
    fromAccount: '',
    toAccount: '',
    walletAddress: '',
    amount: '',
    transferDate: '',
    frequency: 'one-time',
    description: '',
  });

  // Mock data for chart
  const chartData = [
    { month: 'Jan', inflow: 25, outflow: 15 },
    { month: 'Feb', inflow: 30, outflow: 20 },
    { month: 'Mar', inflow: 28, outflow: 22 },
    { month: 'Apr', inflow: 35, outflow: 18 },
    { month: 'May', inflow: 32, outflow: 25 },
    { month: 'Jun', inflow: 40, outflow: 20 },
    { month: 'Jul', inflow: 38, outflow: 22 },
  ];

  // Mock transaction data
  const transactions = [
    {
      id: 1,
      date: '2025-07-28',
      category: 'Investment',
      amount: 15000,
      type: 'Inflow',
      account: 'San/Sub',
      notes: 'Portfolio Growth',
    },
    {
      id: 2,
      date: '2025-07-25',
      category: 'Dividend',
      amount: 15000,
      type: 'Inflow',
      account: 'Vanguard',
      notes: 'Quarterly Dividends',
    },
    {
      id: 3,
      date: '2025-07-23',
      category: 'Utilities',
      amount: 1500,
      type: 'Outflow',
      account: 'Wells Fargo',
      notes: 'Electricity bill',
    },
    {
      id: 4,
      date: '2025-07-20',
      category: 'Investment',
      amount: 15000,
      type: 'Inflow',
      account: 'San/Sub',
      notes: 'Portfolio Growth',
    },
    {
      id: 5,
      date: '2025-07-16',
      category: 'Dividend',
      amount: 15000,
      type: 'Inflow',
      account: 'Vanguard',
      notes: 'Quarterly Dividends',
    },
    {
      id: 6,
      date: '2025-07-13',
      category: 'Utilities',
      amount: 2500,
      type: 'Outflow',
      account: 'Wells Fargo',
      notes: 'Electricity bill',
    },
    {
      id: 7,
      date: '2025-07-08',
      category: 'Investment',
      amount: 15000,
      type: 'Inflow',
      account: 'San/Sub',
      notes: 'Portfolio Growth',
    },
    {
      id: 8,
      date: '2025-07-05',
      category: 'Dividend',
      amount: 15000,
      type: 'Inflow',
      account: 'Vanguard',
      notes: 'Quarterly Dividends',
    },
  ];

  return (
    <DashboardLayout>
      <div className=''>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
            <h1
              className={`text-2xl md:text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Cash Flow Overview
            </h1>

            {/* Time Period Tabs */}
            <div
              className={`flex items-center gap-2 p-2 rounded-full overflow-x-auto scrollbar-hide border ${
                isDarkMode ? '' : 'bg-transparent'
              }`}
              style={
                isDarkMode
                  ? {
                      background:
                        'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                      borderColor: '#29292E',
                    }
                  : {
                      background: 'rgba(241, 203, 104, 0.2)',
                      borderColor: 'rgba(0, 0, 0, 0.1)',
                    }
              }
            >
              <button
                onClick={() => setActiveTab('last30')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'last30'
                    ? isDarkMode
                      ? 'bg-[#30333B] text-white'
                      : 'bg-[#F1CB68] text-black'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-black'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setActiveTab('thisMonth')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'thisMonth'
                    ? isDarkMode
                      ? 'bg-[#30333B] text-white'
                      : 'bg-[#F1CB68] text-black'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-black'
                }`}
              >
                This Month
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === 'custom'
                    ? isDarkMode
                      ? 'bg-[#30333B] text-white'
                      : 'bg-[#F1CB68] text-black'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-black'
                }`}
              >
                Custom
              </button>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          {/* Stats Cards - Left Column */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {/* Total Inflow */}
            <StatCard
              icon='/icons/up-side-yellow-arrow.svg'
              title='Total Inflow'
              value='$45,000'
              change='+12% from last month'
              changePositive={true}
              gradientBorder='linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, #F1CB68 50%, rgba(0, 0, 0, 0) 100%)'
              isDarkMode={isDarkMode}
            />

            {/* Total Outflows */}
            <StatCard
              icon='/icons/red-down-arrow.svg'
              title='Total Outflows'
              value='$27,000'
              change='-5% from last month'
              changePositive={false}
              gradientBorder='linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, #FF6B6B 50%, rgba(0, 0, 0, 0) 100%)'
              isDarkMode={isDarkMode}
            />

            {/* Net Cash Flow */}
            <StatCard
              icon='/icons/net-cash-flow-icon.svg'
              title='Net Cash Flow'
              value='+$18000'
              subtitle='40% of total flow'
              gradientBorder='linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, #36D399 50%, rgba(0, 0, 0, 0) 100%)'
              isDarkMode={isDarkMode}
            />

            {/* Cash Flow Forecast */}
            <StatCard
              icon='/icons/cash-flow-forecast.svg'
              title='Cash Flow Forecast'
              value='+$22,500'
              subtitle='Next 30 days'
              gradientBorder='linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, #F1CB68 50%, rgba(0, 0, 0, 0) 100%)'
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Cash Flow Trends Chart - Right Column */}
          <div
            className={`rounded-2xl border p-6 ${
              isDarkMode
                ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6'>
              <h2
                className={`text-lg font-semibold mb-4 sm:mb-0 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Cash Flow Trends
              </h2>

              {/* Chart Tabs */}
              <div
                className={`flex items-center gap-2 p-2 rounded-full overflow-x-auto scrollbar-hide border ${
                  isDarkMode ? '' : 'bg-transparent'
                }`}
                style={
                  isDarkMode
                    ? {
                        background:
                          'linear-gradient(94.02deg, #222126 0%, #111116 100%)',
                        borderColor: '#29292E',
                      }
                    : {
                        background: 'rgba(241, 203, 104, 0.2)',
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                      }
                }
              >
                <button
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isDarkMode
                      ? 'bg-[#30333B] text-white'
                      : 'bg-[#F1CB68] text-black'
                  }`}
                >
                  Daily
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-black'
                  }`}
                >
                  Weekly
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-black'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className='flex items-center gap-6 mb-6'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-[#F1CB68]' />
                <span
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Inflow
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-[#FF6B6B]' />
                <span
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Outflow
                </span>
              </div>
            </div>

            {/* Chart */}
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id='inflowGradient'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='0%' stopColor='#F1CB68' stopOpacity={0.3} />
                      <stop offset='100%' stopColor='#F1CB68' stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id='outflowGradient'
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='0%' stopColor='#FF6B6B' stopOpacity={0.3} />
                      <stop offset='100%' stopColor='#FF6B6B' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke={isDarkMode ? '#333' : '#e5e7eb'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey='month'
                    stroke={isDarkMode ? '#6B7280' : '#9CA3AF'}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke={isDarkMode ? '#6B7280' : '#9CA3AF'}
                    style={{ fontSize: '12px' }}
                    tickFormatter={value => `$${value}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1A1A1D' : '#fff',
                      border: `1px solid ${isDarkMode ? '#333' : '#e5e7eb'}`,
                      borderRadius: '8px',
                    }}
                    labelStyle={{
                      color: isDarkMode ? '#fff' : '#000',
                    }}
                    formatter={value => [`$${value}k`, '']}
                  />
                  <Area
                    type='monotone'
                    dataKey='inflow'
                    stroke='#F1CB68'
                    strokeWidth={2}
                    fill='url(#inflowGradient)'
                    dot={{ fill: '#F1CB68', r: 4 }}
                  />
                  <Area
                    type='monotone'
                    dataKey='outflow'
                    stroke='#FF6B6B'
                    strokeWidth={2}
                    fill='url(#outflowGradient)'
                    dot={{ fill: '#FF6B6B', r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Transaction Breakdown */}
        <div
          className={`rounded-2xl border overflow-hidden ${
            isDarkMode
              ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
              : 'bg-white border-gray-200'
          }`}
        >
          <div className='p-6 border-b border-[#FFFFFF14]'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <h2
                className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Transaction Breakdown
              </h2>

              {/* Actions */}
              <div className='flex flex-wrap items-center gap-3'>
                {/* Transfer Funds Button */}
                <button
                  onClick={() => {
                    setShowTransferModal(true);
                    setTransferStep(1);
                    setTransferType('internal');
                  }}
                  className='relative px-4 py-2 rounded-lg text-sm font-medium overflow-hidden group'
                  style={{
                    background:
                      'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                  }}
                >
                  <span className='flex items-center gap-2 text-[#111116]'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                    >
                      <path
                        d='M21 12H3M21 6H3M21 18H3'
                        strokeWidth='2'
                        strokeLinecap='round'
                      />
                    </svg>
                    Transfer Funds
                  </span>
                </button>

                {/* Search */}
                <div className='relative flex-1 sm:flex-initial'>
                  <input
                    type='text'
                    placeholder='Search transactions...'
                    className={`w-full sm:w-64 px-4 py-2 pl-10 rounded-lg text-sm ${
                      isDarkMode
                        ? 'bg-[#2C2C2E] text-white placeholder-gray-500 border-gray-700'
                        : 'bg-gray-100 text-gray-900 placeholder-gray-400 border-gray-300'
                    } border focus:outline-none focus:border-[#F1CB68]`}
                  />
                  <svg
                    className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                      strokeWidth='2'
                      strokeLinecap='round'
                    />
                  </svg>
                </div>

                {/* Filters */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isDarkMode
                      ? 'bg-[#2C2C2E] text-white hover:bg-[#3C3C3E]'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <path
                      d='M3 4h18M3 12h12M3 20h6'
                      strokeWidth='2'
                      strokeLinecap='round'
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filters Row */}
            {showFilters && (
              <div className='mt-4 flex flex-wrap items-center gap-3'>
                <select className='text-sm'>
                  <option>Type: All</option>
                  <option>Inflow</option>
                  <option>Outflow</option>
                </select>

                <select className='text-sm'>
                  <option>Amount: $10,000</option>
                  <option>$0 - $5,000</option>
                  <option>$5,000 - $10,000</option>
                  <option>$10,000+</option>
                </select>
              </div>
            )}
          </div>

          {/* Table */}
          <div className='overflow-x-auto'>
            <table className='w-full text-nowrap'>
              <thead>
                <tr
                  className={`border-b ${
                    isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                  }`}
                >
                  <th
                    className={`text-left px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Date
                  </th>
                  <th
                    className={`text-left px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Category
                  </th>
                  <th
                    className={`text-left px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Amount
                  </th>
                  <th
                    className={`text-left px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Type
                  </th>
                  <th
                    className={`text-left px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Source Account
                  </th>
                  <th
                    className={`text-left px-6 py-4 text-xs font-medium ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr
                    key={transaction.id}
                    className={`border-b ${
                      isDarkMode ? 'border-[#FFFFFF14]' : 'border-gray-200'
                    } hover:bg-white/5 transition-colors`}
                  >
                    <td
                      className={`px-6 py-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {transaction.date}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {transaction.category}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-semibold ${
                        transaction.type === 'Inflow'
                          ? 'text-[#36D399]'
                          : isDarkMode
                          ? 'text-white'
                          : 'text-gray-900'
                      }`}
                    >
                      ${transaction.amount.toLocaleString()}
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'Inflow'
                            ? 'bg-[#36D399]/10 text-[#36D399]'
                            : 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {transaction.account}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {transaction.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className='p-6 border-t border-[#FFFFFF14] flex items-center justify-between'>
            <span
              className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Showing 8 of 152 transactions
            </span>
            <div className='flex items-center gap-2'>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isDarkMode
                    ? 'bg-[#2C2C2E] text-white hover:bg-[#3C3C3E]'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Previous
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isDarkMode
                    ? 'bg-[#2C2C2E] text-white hover:bg-[#3C3C3E]'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <style jsx global>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Transfer Funds Modal */}
        {showTransferModal && (
          <TransferModal
            isDarkMode={isDarkMode}
            step={transferStep}
            transferType={transferType}
            transferData={transferData}
            onClose={() => {
              setShowTransferModal(false);
              setTransferStep(1);
              setTransferData({
                fromAccount: '',
                toAccount: '',
                walletAddress: '',
                amount: '',
                transferDate: '',
                frequency: 'one-time',
                description: '',
              });
            }}
            onTransferTypeChange={setTransferType}
            onTransferDataChange={setTransferData}
            onNext={() => setTransferStep(2)}
            onEdit={() => setTransferStep(1)}
            onConfirm={() => setTransferStep(3)}
            onMakeAnother={() => {
              setTransferStep(1);
              setTransferData({
                fromAccount: '',
                toAccount: '',
                walletAddress: '',
                amount: '',
                transferDate: '',
                frequency: 'one-time',
                description: '',
              });
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// StatCard Component
function StatCard({
  icon,
  title,
  value,
  change,
  changePositive,
  subtitle,
  gradientBorder,
  isDarkMode,
}) {
  return (
    <div
      className={`rounded-xl border overflow-hidden ${
        isDarkMode
          ? 'bg-[#1A1A1D] border-[#FFFFFF14]'
          : 'bg-white border-gray-200'
      }`}
    >
      {/* Gradient Top Border */}
      <div
        className='h-1'
        style={{
          background: gradientBorder,
        }}
      />

      <div className='p-6'>
        {/* Icon and Title */}
        <div className='flex items-center gap-3 mb-4'>
          <div className=' flex items-center justify-center'>
            <img src={icon} alt={title} className='' />
          </div>
          <h3
            className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {title}
          </h3>
        </div>

        {/* Value */}
        <p
          className={`text-2xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {value}
        </p>

        {/* Change or Subtitle */}
        {change && (
          <p
            className={`text-sm ${
              changePositive ? 'text-[#36D399]' : 'text-[#FF6B6B]'
            }`}
          >
            {change}
          </p>
        )}
        {subtitle && (
          <p
            className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// TransferModal Component
function TransferModal({
  isDarkMode,
  step,
  transferType,
  transferData,
  onClose,
  onTransferTypeChange,
  onTransferDataChange,
  onNext,
  onEdit,
  onConfirm,
  onMakeAnother,
}) {
  const handleInputChange = (field, value) => {
    onTransferDataChange({ ...transferData, [field]: value });
  };

  // Step 1: Transfer Form
  if (step === 1) {
    return (
      <>
        <div className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4'>
          <div
            className={`w-full max-w-2xl rounded-2xl overflow-hidden ${
              isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className='p-6 border-b border-[#FFFFFF14]'>
              <div className='flex items-center justify-between'>
                <h2
                  className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Transfer Funds
                </h2>
                <button
                  onClick={onClose}
                  className={`${
                    isDarkMode
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  } transition-colors`}
                >
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <path
                      d='M18 6L6 18M6 6l12 12'
                      strokeWidth='2'
                      strokeLinecap='round'
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className='p-6 max-h-[calc(100vh-200px)] overflow-y-auto'>
              {/* Select Transfer Type */}
              <h3
                className={`text-sm font-medium mb-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Select Transfer Type
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                {/* Internal Transfer */}
                <button
                  onClick={() => onTransferTypeChange('internal')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    transferType === 'internal'
                      ? 'border-[#F1CB68] bg-[#F1CB68]/10'
                      : isDarkMode
                      ? 'border-[#FFFFFF14] hover:border-[#F1CB68]/50'
                      : 'border-gray-200 hover:border-[#F1CB68]/50'
                  }`}
                >
                  <div className='flex items-center gap-3 mb-2'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      className='text-[#F1CB68]'
                    >
                      <path
                        d='M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    <h4
                      className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Internal Transfer
                    </h4>
                  </div>
                  <p
                    className={`text-sm mb-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Transfer funds between your own accounts within Akunuba.
                  </p>
                  <div className='flex items-center gap-2 text-xs text-[#36D399]'>
                    <span>No transfer fee</span>
                    <span>•</span>
                    <span>Instant transfer</span>
                  </div>
                </button>

                {/* External Transfer */}
                <button
                  onClick={() => onTransferTypeChange('external')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    transferType === 'external'
                      ? 'border-[#F1CB68] bg-[#F1CB68]/10'
                      : isDarkMode
                      ? 'border-[#FFFFFF14] hover:border-[#F1CB68]/50'
                      : 'border-gray-200 hover:border-[#F1CB68]/50'
                  }`}
                >
                  <div className='flex items-center gap-3 mb-2'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      className='text-[#F1CB68]'
                    >
                      <path
                        d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    <h4
                      className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      External Transfer
                    </h4>
                  </div>
                  <p
                    className={`text-sm mb-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Transfer funds to external accounts or third-party
                    beneficiaries.
                  </p>
                  <div className='flex items-center gap-2 text-xs text-[#F1CB68]'>
                    <span>Standard fees apply</span>
                    <span>•</span>
                    <span>1-3 business days</span>
                  </div>
                </button>
              </div>

              {/* Transfer Details */}
              <h3
                className={`text-sm font-medium mb-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {transferType === 'internal'
                  ? 'Internal Transfer Details'
                  : 'External Transfer Details'}
              </h3>

              <div className='space-y-4'>
                {/* From Account */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    From Account
                  </label>
                  <select
                    value={transferData.fromAccount}
                    onChange={e =>
                      handleInputChange('fromAccount', e.target.value)
                    }
                    className='w-full'
                  >
                    <option value=''>Select Account</option>
                    <option value='checking'>
                      Bank A - Checking (****4932)
                    </option>
                    <option value='savings'>Bank A - Savings (****2341)</option>
                    <option value='investment'>Wallet - Investment</option>
                  </select>
                  <p
                    className={`text-xs mt-1 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}
                  >
                    Available balance: $45,320.00
                  </p>
                </div>

                {/* To Account or Wallet Address */}
                {transferType === 'internal' ? (
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      To Account
                    </label>
                    <select
                      value={transferData.toAccount}
                      onChange={e =>
                        handleInputChange('toAccount', e.target.value)
                      }
                      className='w-full'
                    >
                      <option value=''>Select Account</option>
                      <option value='investment'>Wallet - Investment</option>
                      <option value='retirement'>Wallet - Retirement</option>
                      <option value='savings2'>
                        Bank B - Savings (****5678)
                      </option>
                    </select>
                    <p
                      className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}
                    >
                      Current balance: $12,750.00
                    </p>
                  </div>
                ) : (
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Beneficiary Wallet Address
                    </label>
                    <input
                      type='text'
                      value={transferData.walletAddress}
                      onChange={e =>
                        handleInputChange('walletAddress', e.target.value)
                      }
                      placeholder='Enter wallet address or account number'
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode
                          ? 'bg-[#2C2C2E] border-gray-700 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:border-[#F1CB68]`}
                    />
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Amount
                  </label>
                  <div className='relative'>
                    <span
                      className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      $
                    </span>
                    <input
                      type='text'
                      value={transferData.amount}
                      onChange={e =>
                        handleInputChange('amount', e.target.value)
                      }
                      placeholder='0.00'
                      className={`w-full pl-10 pr-4 py-3 text-lg font-bold rounded-lg border ${
                        isDarkMode
                          ? 'bg-[#2C2C2E] border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:border-[#F1CB68]`}
                    />
                  </div>
                  <div className='flex items-center gap-2 mt-2'>
                    <svg
                      width='14'
                      height='14'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      className='text-[#F1CB68]'
                    >
                      <circle cx='12' cy='12' r='10' strokeWidth='2' />
                      <path d='M12 6v6l4 2' strokeWidth='2' />
                    </svg>
                    <p className='text-xs text-[#F1CB68]'>
                      Maximum transfer amount: $45,320.00
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {/* Transfer Date */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Transfer Date
                    </label>
                    <input
                      type='date'
                      value={transferData.transferDate}
                      onChange={e =>
                        handleInputChange('transferDate', e.target.value)
                      }
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isDarkMode
                          ? 'bg-[#2C2C2E] border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:border-[#F1CB68]`}
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Frequency (Optional)
                    </label>
                    <select
                      value={transferData.frequency}
                      onChange={e =>
                        handleInputChange('frequency', e.target.value)
                      }
                      className='w-full'
                    >
                      <option value='one-time'>One time transfer</option>
                      <option value='daily'>Daily</option>
                      <option value='weekly'>Weekly</option>
                      <option value='monthly'>Monthly</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    value={transferData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder='Add a note or description for this transfer'
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-[#2C2C2E] border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:border-[#F1CB68] resize-none`}
                  />
                  <p
                    className={`text-xs mt-1 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}
                  >
                    This will appear in your transaction history
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='p-6 border-t border-[#FFFFFF14]'>
              <button
                onClick={onNext}
                disabled={
                  !transferData.fromAccount ||
                  (transferType === 'internal'
                    ? !transferData.toAccount
                    : !transferData.walletAddress) ||
                  !transferData.amount ||
                  !transferData.transferDate
                }
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  !transferData.fromAccount ||
                  (transferType === 'internal'
                    ? !transferData.toAccount
                    : !transferData.walletAddress) ||
                  !transferData.amount ||
                  !transferData.transferDate
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#F1CB68] text-[#101014] hover:bg-[#C49D2E]'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Step 2: Review Transfer Details
  if (step === 2) {
    return (
      <>
        <div className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4'>
          <div
            className={`w-full max-w-2xl rounded-2xl overflow-hidden ${
              isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className='p-6 border-b border-[#FFFFFF14]'>
              <div className='flex items-center justify-between'>
                <h2
                  className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Review Transfer Details
                </h2>
                <button
                  onClick={onClose}
                  className={`${
                    isDarkMode
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  } transition-colors`}
                >
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <path
                      d='M18 6L6 18M6 6l12 12'
                      strokeWidth='2'
                      strokeLinecap='round'
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className='p-6'>
              {/* From/To Transfer Visual */}
              <div className='flex items-center justify-between mb-6 p-4 rounded-xl bg-[#2C2C2E]'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-full bg-[#F1CB68]/20 flex items-center justify-center'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#F1CB68'
                    >
                      <path
                        d='M21 12H3M21 6H3M21 18H3'
                        strokeWidth='2'
                        strokeLinecap='round'
                      />
                    </svg>
                  </div>
                  <div>
                    <p className='text-xs text-gray-400'>From</p>
                    <p className='text-sm font-semibold text-white'>
                      {transferData.fromAccount === 'checking'
                        ? 'Bank A - Checking (****4932)'
                        : transferData.fromAccount === 'savings'
                        ? 'Bank A - Savings (****2341)'
                        : 'Wallet - Investment'}
                    </p>
                  </div>
                </div>

                <div className='flex items-center justify-center'>
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='#F1CB68'
                  >
                    <path
                      d='M5 12h14M12 5l7 7-7 7'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-full bg-[#F1CB68]/20 flex items-center justify-center'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='#F1CB68'
                    >
                      <path
                        d='M21 12H3M21 6H3M21 18H3'
                        strokeWidth='2'
                        strokeLinecap='round'
                      />
                    </svg>
                  </div>
                  <div>
                    <p className='text-xs text-gray-400'>To</p>
                    <p className='text-sm font-semibold text-white'>
                      {transferType === 'internal'
                        ? transferData.toAccount === 'investment'
                          ? 'Wallet - Investment'
                          : transferData.toAccount === 'retirement'
                          ? 'Wallet - Retirement'
                          : 'Bank B - Savings (****5678)'
                        : transferData.walletAddress}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transfer Details Grid */}
              <div className='grid grid-cols-3 gap-6 mb-6'>
                <div>
                  <p className='text-xs text-gray-400 mb-1'>Amount</p>
                  <p className='text-xl font-bold text-white'>
                    ${transferData.amount}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-400 mb-1'>Transfer Date</p>
                  <p className='text-sm font-semibold text-white'>
                    {new Date(transferData.transferDate).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-gray-400 mb-1'>Frequency</p>
                  <p className='text-sm font-semibold text-white capitalize'>
                    {transferData.frequency.replace('-', ' ')}
                  </p>
                </div>
              </div>

              {/* Description */}
              {transferData.description && (
                <div className='mb-6'>
                  <p className='text-xs text-gray-400 mb-2'>Description</p>
                  <p className='text-sm text-white'>
                    {transferData.description}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='p-6 border-t border-[#FFFFFF14] flex gap-3'>
              <button
                onClick={onEdit}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                  isDarkMode
                    ? 'bg-[#2C2C2E] text-white hover:bg-[#3C3C3E]'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Edit
              </button>
              <button
                onClick={onConfirm}
                className='flex-1 py-3 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold hover:bg-[#C49D2E] transition-all'
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Step 3: Transaction Successful
  if (step === 3) {
    return (
      <>
        <div className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4'>
          <div
            className={`w-full max-w-2xl rounded-2xl overflow-hidden ${
              isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className='p-6 border-b border-[#FFFFFF14]'>
              <h2
                className={`text-xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Transaction Successful
              </h2>
            </div>

            <div className='p-8 text-center'>
              {/* Success Icon */}
              <div className='w-20 h-20 rounded-full bg-[#36D399]/20 flex items-center justify-center mx-auto mb-6'>
                <svg
                  width='40'
                  height='40'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#36D399'
                  strokeWidth='2'
                >
                  <path
                    d='M5 13l4 4L19 7'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </div>

              <h3 className='text-xl font-bold text-white mb-2'>
                Your transfer has been processed
              </h3>
              <p className='text-sm text-gray-400 mb-8'>
                Confirmation #FT928374928
              </p>

              {/* Transfer Summary */}
              <div className='bg-[#2C2C2E] rounded-xl p-6 mb-6 text-left'>
                <div className='grid grid-cols-2 gap-6 mb-4'>
                  <div>
                    <p className='text-xs text-gray-400 mb-1'>From</p>
                    <p className='text-sm font-semibold text-white'>
                      {transferData.fromAccount === 'checking'
                        ? 'Bank A - Checking (****4932)'
                        : transferData.fromAccount === 'savings'
                        ? 'Bank A - Savings (****2341)'
                        : 'Wallet - Investment'}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-400 mb-1'>To</p>
                    <p className='text-sm font-semibold text-white'>
                      {transferType === 'internal'
                        ? transferData.toAccount === 'investment'
                          ? 'Wallet - Investment'
                          : transferData.toAccount === 'retirement'
                          ? 'Wallet - Retirement'
                          : 'Bank B - Savings (****5678)'
                        : transferData.walletAddress}
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-3 gap-6'>
                  <div>
                    <p className='text-xs text-gray-400 mb-1'>Amount</p>
                    <p className='text-lg font-bold text-white'>
                      ${transferData.amount}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-400 mb-1'>Transfer Date</p>
                    <p className='text-sm font-semibold text-white'>
                      {new Date(transferData.transferDate).toLocaleDateString(
                        'en-US',
                        { month: 'long', day: 'numeric', year: 'numeric' }
                      )}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-gray-400 mb-1'>Status</p>
                    <div className='flex items-center gap-2'>
                      <div className='w-2 h-2 rounded-full bg-[#36D399]' />
                      <p className='text-sm font-semibold text-[#36D399]'>
                        Completed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-3 mb-4'>
                <button
                  className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isDarkMode
                      ? 'bg-[#2C2C2E] text-white hover:bg-[#3C3C3E]'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <path
                      d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  Download Receipts
                </button>
                <button
                  className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isDarkMode
                      ? 'bg-[#2C2C2E] text-white hover:bg-[#3C3C3E]'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <path
                      d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      strokeWidth='2'
                      strokeLinecap='round'
                    />
                  </svg>
                  Send Receipts
                </button>
              </div>

              <div className='flex flex-col sm:flex-row gap-3'>
                <button
                  onClick={onClose}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Return to Cash Flow
                </button>
                <button
                  onClick={onMakeAnother}
                  className='flex-1 py-3 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold hover:bg-[#C49D2E] transition-all'
                >
                  Make Another Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
