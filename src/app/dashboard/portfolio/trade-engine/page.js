'use client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useTheme } from '@/context/ThemeContext';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AssetSearchBar from './components/AssetSearchBar';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import OrderForm from './components/OrderForm';
import OrderSummary from './components/OrderSummary';
import RecentTrades from './components/RecentTrades';
import {
  searchAssets,
  getAssetDetails,
  getRecentTrades,
  getTradingHistory,
  getBrokerageAccounts,
  placeOrder,
} from '@/utils/portfolioApi';
import TradeEngineSkeleton from '@/components/skeletons/TradeEngineSkeleton';

export default function TradeEnginePage() {
  const { isDarkMode } = useTheme();

  // State Management
  const [assetClass, setAssetClass] = useState('stocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderType, setOrderType] = useState('buy');
  const [orderMode, setOrderMode] = useState('market');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [quantity, setQuantity] = useState('10');
  const [limitPrice, setLimitPrice] = useState('185.92');
  const [openUntil, setOpenUntil] = useState('2023-09-15');
  const [brokerageAccount, setBrokerageAccount] = useState('****4321');
  const [orderDuration, setOrderDuration] = useState('day-only');
  const [notes, setNotes] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [recentTrades, setRecentTrades] = useState([]);
  const [recentAAPlTrades, setRecentAAPlTrades] = useState([]);
  const [assetDetails, setAssetDetails] = useState(null);
  const [brokerageAccounts, setBrokerageAccounts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [tradesRes, accountsRes] = await Promise.all([
          getRecentTrades({ limit: 5 }),
          getBrokerageAccounts(),
        ]);

        if (tradesRes.data) {
          setRecentTrades(tradesRes.data);
        }

        if (accountsRes.data) {
          setBrokerageAccounts(accountsRes.data);
          if (accountsRes.data.length > 0) {
            setBrokerageAccount(accountsRes.data[0].accountNumber || '****4321');
          }
        }
      } catch (err) {
        console.error('Error fetching trade engine data:', err);
        const errorMessage = err.data?.detail || err.message || 'Failed to load trade engine data';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch asset details when selected stock changes
  useEffect(() => {
    const fetchAssetDetails = async () => {
      if (!selectedStock) return;

      try {
        const detailsRes = await getAssetDetails(selectedStock);
        if (detailsRes.data) {
          setAssetDetails(detailsRes.data);
          if (detailsRes.data.currentPrice) {
            setLimitPrice(detailsRes.data.currentPrice.toString());
          }
        }

        // Fetch trading history for the asset
        try {
          const historyRes = await getTradingHistory(selectedStock);
          if (historyRes.data) {
            setRecentAAPlTrades(historyRes.data);
          }
        } catch (historyErr) {
          // Silently handle trading history errors (endpoint might not exist)
          if (historyErr.status !== 404) {
            console.warn('Error fetching trading history:', historyErr);
          }
        }
      } catch (err) {
        // Handle 404 errors gracefully - asset might not exist in backend yet
        if (err.status === 404) {
          // Asset not found in backend - this is expected for some symbols
          // Set asset details to null and continue with default values
          setAssetDetails(null);
          console.log(`Asset ${selectedStock} not found in backend - using default values`);
        } else {
          // Log other errors but don't show toast
          console.warn('Error fetching asset details:', err);
        }
      }
    };

    fetchAssetDetails();
  }, [selectedStock]);

  // Handle search
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const searchRes = await searchAssets({
        query,
        assetClass: assetClass === 'stocks' ? 'stock' : assetClass,
        limit: 10,
      });

      if (searchRes.data) {
        setSearchResults(searchRes.data);
      }
    } catch (err) {
      console.error('Error searching assets:', err);
      toast.error('Failed to search assets');
    }
  };

  // Handlers
  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      const orderData = {
        symbol: selectedStock,
        orderType: orderType,
        orderMode: orderMode,
        quantity: parseFloat(quantity),
        limitPrice: orderMode === 'limit' ? parseFloat(limitPrice) : undefined,
        brokerageAccount: brokerageAccount,
        duration: orderDuration,
        notes: notes,
      };

      const response = await placeOrder(orderData);

      toast.success('Order placed successfully!');
      setShowConfirmation(true);

      // Refresh recent trades
      const tradesRes = await getRecentTrades({ limit: 5 });
      if (tradesRes.data) {
        setRecentTrades(tradesRes.data);
      }
    } catch (err) {
      console.error('Error placing order:', err);
      const errorMessage = err.data?.detail || err.message || 'Failed to place order';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const total = parseFloat(quantity || 0) * parseFloat(limitPrice || 0);
    return total.toFixed(2);
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Show skeleton while loading
  if (loading && !recentTrades.length) {
    return (
      <DashboardLayout>
        <TradeEngineSkeleton isDarkMode={isDarkMode} />
      </DashboardLayout>
    );
  }

  // Show error state
  if (error && !recentTrades.length) {
    return (
      <DashboardLayout>
        <div className={`p-6 rounded-lg border text-center ${
          isDarkMode ? 'border-[#FFFFFF14] bg-[#1A1A1D]' : 'border-gray-300 bg-gray-50'
        }`}>
          <div className='mb-4 flex justify-center'>
            <svg
              width='48'
              height='48'
              viewBox='0 0 24 24'
              fill='none'
              stroke={isDarkMode ? '#EF4444' : '#DC2626'}
              strokeWidth='2'
            >
              <circle cx='12' cy='12' r='10' />
              <line x1='12' y1='8' x2='12' y2='12' />
              <line x1='12' y1='16' x2='12.01' y2='16' />
            </svg>
          </div>
          <p className={`font-semibold mb-2 text-lg ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Error loading trade engine
          </p>
          <p className={`text-sm mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-[#F1CB68] text-[#101014] rounded-lg font-semibold hover:bg-[#d4b55a] transition-colors'
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className=''>
        {/* Header */}
        <div className='mb-6'>
          <h1
            className={`text-2xl md:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Trade Engine
          </h1>
        </div>

        {/* Asset Search Bar */}
        <AssetSearchBar
          assetClass={assetClass}
          setAssetClass={setAssetClass}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          searchResults={searchResults}
          onSelectAsset={(asset) => {
            setSelectedStock(asset.symbol);
            setSearchQuery(asset.symbol);
            setSearchResults([]);
          }}
          isDarkMode={isDarkMode}
        />

        {/* Recent Trades */}
        <RecentTrades
          trades={recentTrades}
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
          isDarkMode={isDarkMode}
        />

        {/* Main Trading Interface */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Order Form */}
          <OrderForm
            orderType={orderType}
            setOrderType={setOrderType}
            orderMode={orderMode}
            setOrderMode={setOrderMode}
            selectedStock={selectedStock}
            quantity={quantity}
            setQuantity={setQuantity}
            limitPrice={limitPrice}
            setLimitPrice={setLimitPrice}
            openUntil={openUntil}
            setOpenUntil={setOpenUntil}
            brokerageAccount={brokerageAccount}
            setBrokerageAccount={setBrokerageAccount}
            orderDuration={orderDuration}
            setOrderDuration={setOrderDuration}
            notes={notes}
            setNotes={setNotes}
            calculateTotal={calculateTotal}
            handlePlaceOrder={handlePlaceOrder}
            isDarkMode={isDarkMode}
          />

          {/* Order Summary */}
          <OrderSummary
            quantity={quantity}
            limitPrice={limitPrice}
            calculateTotal={calculateTotal}
          recentTrades={recentAAPlTrades.map(trade => ({
            type: trade.type || trade.orderType,
            shares: trade.quantity || trade.shares,
            price: trade.price ? formatCurrency(trade.price) : '$0.00',
            date: trade.date || trade.executionDate,
          }))}
          isDarkMode={isDarkMode}
        />
        </div>

        {/* Order Confirmation Modal */}
        {showConfirmation && (
          <OrderConfirmationModal
            isDarkMode={isDarkMode}
            orderType={orderType}
            stock={selectedStock}
            quantity={quantity}
            pricePerUnit={limitPrice}
            totalValue={calculateTotal()}
            onClose={() => setShowConfirmation(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
