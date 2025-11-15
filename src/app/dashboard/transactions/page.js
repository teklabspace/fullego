'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';
import { useTheme } from '@/context/ThemeContext';

export default function TransactionsPage() {
  const { isDarkMode } = useTheme();
  const transactions = [
    {
      id: 1,
      type: 'buy',
      name: 'Tesla Inc.',
      amount: '+$2,450.00',
      date: 'Nov 1, 2024',
      time: '10:30 AM',
      status: 'completed',
    },
    {
      id: 2,
      type: 'sell',
      name: 'Apple Inc.',
      amount: '-$1,230.50',
      date: 'Oct 31, 2024',
      time: '3:45 PM',
      status: 'completed',
    },
    {
      id: 3,
      type: 'buy',
      name: 'Microsoft Corp.',
      amount: '+$3,890.00',
      date: 'Oct 30, 2024',
      time: '11:20 AM',
      status: 'completed',
    },
    {
      id: 4,
      type: 'buy',
      name: 'Amazon.com Inc.',
      amount: '+$5,120.00',
      date: 'Oct 29, 2024',
      time: '2:15 PM',
      status: 'pending',
    },
    {
      id: 5,
      type: 'sell',
      name: 'Google LLC',
      amount: '-$2,340.00',
      date: 'Oct 28, 2024',
      time: '9:30 AM',
      status: 'completed',
    },
    {
      id: 6,
      type: 'buy',
      name: 'Netflix Inc.',
      amount: '+$1,890.00',
      date: 'Oct 27, 2024',
      time: '4:00 PM',
      status: 'completed',
    },
  ];

  return (
    <DashboardLayout>
      <div className='mb-8'>
        <h1
          className={`text-2xl md:text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Transactions
        </h1>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          View your complete transaction history
        </p>
      </div>

      <GlassCard className='p-6'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-fullego-border'>
                <th
                  className={`text-left text-sm font-medium pb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Type
                </th>
                <th
                  className={`text-left text-sm font-medium pb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Asset
                </th>
                <th
                  className={`text-left text-sm font-medium pb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Amount
                </th>
                <th
                  className={`text-left text-sm font-medium pb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Date
                </th>
                <th
                  className={`text-left text-sm font-medium pb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Time
                </th>
                <th
                  className={`text-left text-sm font-medium pb-4 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr
                  key={transaction.id}
                  className='border-b border-fullego-border/50 last:border-0'
                >
                  <td className='py-4'>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.type === 'buy'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {transaction.type === 'buy' ? 'Buy' : 'Sell'}
                    </span>
                  </td>
                  <td
                    className={`py-4 font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {transaction.name}
                  </td>
                  <td
                    className={`py-4 font-medium ${
                      transaction.type === 'buy'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}
                  >
                    {transaction.amount}
                  </td>
                  <td
                    className={`py-4 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {transaction.date}
                  </td>
                  <td
                    className={`py-4 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {transaction.time}
                  </td>
                  <td className='py-4'>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {transaction.status === 'completed'
                        ? 'Completed'
                        : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}
