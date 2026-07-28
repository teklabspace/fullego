'use client';

import { getAssetPriceHistory } from '@/utils/portfolioApi';
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters';
import { useEffect, useRef, useState } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Full trading-terminal timeframe set. Bar size scales server-side:
// hourly (1D/1W), daily (1M–1Y), weekly (5Y), monthly (ALL).
const RANGES = ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y', 'ALL'];

const GREEN = '#10B981';
const RED = '#EF4444';

// The standard broker overlay set (SMA/EMA/Bollinger/volume/high-low).
const OVERLAY_OPTIONS = [
  { key: 'volume', label: 'Volume' },
  { key: 'sma20', label: 'SMA 20' },
  { key: 'sma50', label: 'SMA 50' },
  { key: 'ema20', label: 'EMA 20' },
  { key: 'bollinger', label: 'Bollinger Bands' },
  { key: 'highLow', label: 'High / Low markers' },
];

// Candlestick drawn inside the [low, high] range bar recharts gives us:
// the full height is the wick, the body spans open→close.
function CandleShape({ x, width, y, height, payload }) {
  if (
    payload?.low == null || payload?.high == null ||
    payload?.open == null || payload?.close == null || height <= 0
  ) {
    return null;
  }
  const { open, close, high, low } = payload;
  const span = high - low || 1;
  const up = close >= open;
  const color = up ? GREEN : RED;
  const bodyTopPrice = Math.max(open, close);
  const bodyBottomPrice = Math.min(open, close);
  const bodyY = y + ((high - bodyTopPrice) / span) * height;
  const bodyH = Math.max(1, ((bodyTopPrice - bodyBottomPrice) / span) * height);
  const cx = x + width / 2;
  const bodyWidth = Math.max(1.5, width * 0.6);
  return (
    <g>
      <line x1={cx} y1={y} x2={cx} y2={y + height} stroke={color} strokeWidth={1} />
      <rect
        x={cx - bodyWidth / 2}
        y={bodyY}
        width={bodyWidth}
        height={bodyH}
        fill={color}
      />
    </g>
  );
}

// Price chart for the currently selected instrument. One backend call per
// symbol/range (Polygon aggregates — free-tier friendly, cached server-side).
export default function AssetChart({ symbol, isDarkMode }) {
  const [range, setRange] = useState('1M');
  const [chartType, setChartType] = useState('area'); // 'area' | 'candles'
  const [overlays, setOverlays] = useState({
    volume: true,
    sma20: false,
    sma50: false,
    ema20: false,
    bollinger: false,
    highLow: false,
  });
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsRef = useRef(null);
  const [history, setHistory] = useState([]);
  // Starts (and stays) in loading state until an instrument is selected.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await getAssetPriceHistory(symbol, range);
        if (isMounted) {
          setHistory(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.warn(`Failed to load price history for ${symbol}:`, err);
        if (isMounted) setHistory([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [symbol, range]);

  // Close the options dropdown on outside click.
  useEffect(() => {
    const handleClick = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setOptionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // --- Indicator math (computed client-side over the fetched closes) ---
  const closes = history.map((bar) => bar.close ?? 0);

  const smaAt = (index, window) => {
    if (index < window - 1) return null;
    let sum = 0;
    for (let j = index - window + 1; j <= index; j++) sum += closes[j];
    return sum / window;
  };

  const stdAt = (index, window, mean) => {
    if (index < window - 1 || mean == null) return null;
    let sq = 0;
    for (let j = index - window + 1; j <= index; j++) {
      sq += (closes[j] - mean) ** 2;
    }
    return Math.sqrt(sq / window);
  };

  const emaValues = [];
  const k = 2 / (20 + 1);
  closes.forEach((close, i) => {
    emaValues.push(i === 0 ? close : close * k + emaValues[i - 1] * (1 - k));
  });

  const fullData = history.map((bar, i) => {
    const mid = smaAt(i, 20);
    const std = stdAt(i, 20, mid);
    return {
      date: bar.date,
      close: bar.close,
      open: bar.open,
      high: bar.high,
      low: bar.low,
      volume: bar.volume,
      hl: [bar.low, bar.high],
      sma20: mid,
      sma50: smaAt(i, 50),
      ema20: emaValues[i],
      bb: mid != null && std != null ? [mid - 2 * std, mid + 2 * std] : null,
    };
  });

  // The backend sends indicator WARM-UP bars before the requested window
  // (SMA50 needs 50 prior bars or short ranges have nothing to draw).
  // Indicators above are computed over everything; only the window renders.
  const DISPLAY_DAYS = { '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365, '5Y': 365 * 5 };
  let chartData = fullData;
  if (fullData.length > 0) {
    if (range === '1D') {
      const lastDay = String(fullData[fullData.length - 1].date).slice(0, 10);
      chartData = fullData.filter((d) => String(d.date).slice(0, 10) === lastDay);
    } else if (DISPLAY_DAYS[range]) {
      const cutoff = new Date(fullData[fullData.length - 1].date);
      cutoff.setDate(cutoff.getDate() - DISPLAY_DAYS[range]);
      chartData = fullData.filter((d) => new Date(d.date) >= cutoff);
    }
  }

  const first = chartData[0]?.close;
  const last = chartData[chartData.length - 1]?.close;
  const change = first != null && last != null ? last - first : null;
  const changePct = change != null && first ? (change / first) * 100 : null;
  const positive = (change ?? 0) >= 0;

  const periodHigh = chartData.length
    ? Math.max(...chartData.map((d) => d.high ?? -Infinity))
    : null;
  const periodLow = chartData.length
    ? Math.min(...chartData.map((d) => d.low ?? Infinity))
    : null;

  // Evenly spaced ticks (~7 labels). Note the axis walks TRADING periods, so
  // calendar gaps are irregular by nature — markets close on weekends/holidays.
  const tickInterval = Math.max(0, Math.ceil(chartData.length / 7) - 1);
  const maxVolume = Math.max(1, ...chartData.map((d) => d.volume || 0));
  // Explicit candle width: recharts computes NaN positions when one Bar in the
  // chart has a fixed barSize (volume) and another doesn't. Scale to density.
  const candleSize = Math.max(2, Math.min(14, Math.floor(700 / Math.max(1, chartData.length))));

  // Axis/tooltip labels adapt to the bar size of the selected range.
  const formatTick = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    if (range === '1D') {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    if (range === '1W') {
      return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
    }
    if (range === '5Y' || range === 'ALL') {
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTooltipLabel = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return range === '1D' || range === '1W'
      ? d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Broker-style OHLC + volume tooltip, shared by both chart types.
  const renderTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const bar = payload[0]?.payload;
    if (!bar) return null;
    const rows = [
      ['Open', bar.open], ['High', bar.high], ['Low', bar.low], ['Close', bar.close],
    ];
    const indicatorRows = [
      overlays.sma20 && bar.sma20 != null && ['SMA 20', bar.sma20],
      overlays.sma50 && bar.sma50 != null && ['SMA 50', bar.sma50],
      overlays.ema20 && bar.ema20 != null && ['EMA 20', bar.ema20],
    ].filter(Boolean);
    return (
      <div
        className={`rounded-lg border px-3 py-2 text-xs ${
          isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14] text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        <p className='font-semibold mb-1'>{formatTooltipLabel(label)}</p>
        {rows.map(([kLabel, v]) => (
          <div key={kLabel} className='flex justify-between gap-4'>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{kLabel}</span>
            <span>{v != null ? formatCurrency(v, { minDecimals: 2 }) : '—'}</span>
          </div>
        ))}
        {bar.volume != null && (
          <div className='flex justify-between gap-4'>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Volume</span>
            <span>{formatNumber(bar.volume)}</span>
          </div>
        )}
        {indicatorRows.map(([kLabel, v]) => (
          <div key={kLabel} className='flex justify-between gap-4'>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{kLabel}</span>
            <span>{formatCurrency(v, { minDecimals: 2 })}</span>
          </div>
        ))}
      </div>
    );
  };

  const pillClass = (active) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
      active
        ? 'bg-[#F1CB68] text-[#101014]'
        : isDarkMode
          ? 'text-gray-400 hover:bg-white/5'
          : 'text-gray-600 hover:bg-gray-100'
    }`;

  const toggleOverlay = (key) =>
    setOverlays((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div
      className={`rounded-2xl border p-6 my-6 ${
        isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
      }`}
    >
      {/* Header: title/price block, then a right-aligned controls row —
          Options dropdown + timeframes. */}
      <div className='mb-4 space-y-3'>
        <div>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {symbol ? `${symbol} Price Chart` : 'Price Chart'}
          </h2>
          {!loading && last != null && (
            <p className='text-sm mt-1'>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(last, { minDecimals: 2 })}
              </span>{' '}
              {change != null && (
                <span className={positive ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                  {positive ? '+' : ''}{formatCurrency(change, { minDecimals: 2 })} ({formatPercent(changePct)})
                </span>
              )}
              <span className={`ml-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                over {range}
              </span>
            </p>
          )}
          {!loading && chartData.length > 0 && (
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              As of {formatTooltipLabel(chartData[chartData.length - 1].date)} · end-of-day market data
            </p>
          )}
        </div>

        <div className='flex flex-wrap items-center justify-end gap-2'>
          {/* Chart options dropdown */}
          <div className='relative' ref={optionsRef}>
            <button
              type='button'
              onClick={() => setOptionsOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isDarkMode
                  ? 'border-[#FFFFFF14] text-gray-300 hover:bg-white/5'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <line x1='4' y1='6' x2='20' y2='6' />
                <line x1='4' y1='12' x2='20' y2='12' />
                <line x1='4' y1='18' x2='20' y2='18' />
                <circle cx='9' cy='6' r='2' fill='currentColor' />
                <circle cx='15' cy='12' r='2' fill='currentColor' />
                <circle cx='7' cy='18' r='2' fill='currentColor' />
              </svg>
              Chart options
              <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <polyline points='6 9 12 15 18 9' />
              </svg>
            </button>

            {optionsOpen && (
              <div
                className={`absolute right-0 top-full mt-2 z-30 w-56 rounded-xl border shadow-lg p-3 ${
                  isDarkMode ? 'bg-[#1A1A1D] border-[#FFFFFF14]' : 'bg-white border-gray-200'
                }`}
              >
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Chart type
                </p>
                <div className={`flex items-center gap-1 rounded-lg p-0.5 mb-3 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                  <button type='button' onClick={() => setChartType('area')} className={`flex-1 ${pillClass(chartType === 'area')}`}>
                    Line
                  </button>
                  <button type='button' onClick={() => setChartType('candles')} className={`flex-1 ${pillClass(chartType === 'candles')}`}>
                    Candles
                  </button>
                </div>

                <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Overlays &amp; indicators
                </p>
                {OVERLAY_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    type='button'
                    onClick={() => toggleOverlay(key)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center border ${
                        overlays[key]
                          ? 'bg-[#F1CB68] border-[#F1CB68] text-[#101014]'
                          : isDarkMode
                            ? 'border-[#FFFFFF2A]'
                            : 'border-gray-300'
                      }`}
                    >
                      {overlays[key] && (
                        <svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3'>
                          <polyline points='20 6 9 17 4 12' />
                        </svg>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Timeframes */}
          <div className='flex flex-wrap items-center justify-end gap-1'>
            {RANGES.map((r) => (
              <button key={r} type='button' onClick={() => setRange(r)} className={pillClass(range === r)}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div
          className={`h-72 rounded-lg animate-pulse ${
            isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-200'
          }`}
        />
      ) : chartData.length === 0 ? (
        <div className='h-72 flex items-center justify-center'>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No price history available for {symbol}. Market data may be rate-limited — try again in a minute.
          </p>
        </div>
      ) : (
        <div className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id='assetChartGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#F1CB68' stopOpacity={0.35} />
                  <stop offset='95%' stopColor='#F1CB68' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke={isDarkMode ? '#2A2A2D' : '#E5E7EB'}
                vertical={false}
              />
              <XAxis
                dataKey='date'
                stroke={isDarkMode ? '#666666' : '#9CA3AF'}
                style={{ fontSize: '12px' }}
                tick={{ fill: isDarkMode ? '#666666' : '#9CA3AF' }}
                tickFormatter={formatTick}
                interval={tickInterval}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId='price'
                stroke={isDarkMode ? '#666666' : '#9CA3AF'}
                style={{ fontSize: '12px' }}
                tick={{ fill: isDarkMode ? '#666666' : '#9CA3AF' }}
                tickFormatter={(value) => formatCurrency(value)}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
                width={80}
              />
              {/* Hidden volume axis, scaled so bars hug the bottom fifth. */}
              <YAxis yAxisId='volume' hide domain={[0, maxVolume * 5]} />
              <Tooltip content={renderTooltip} />

              {/* Bollinger band (SMA20 ± 2σ) as a translucent range area */}
              {overlays.bollinger && (
                <Area
                  yAxisId='price'
                  dataKey='bb'
                  stroke={isDarkMode ? '#FFFFFF33' : '#9CA3AF66'}
                  strokeWidth={1}
                  fill={isDarkMode ? '#FFFFFF' : '#9CA3AF'}
                  fillOpacity={0.06}
                  isAnimationActive={false}
                  connectNulls
                />
              )}

              {overlays.volume && (
                <Bar yAxisId='volume' dataKey='volume' barSize={3} opacity={0.45} isAnimationActive={false}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={(d.close ?? 0) >= (d.open ?? 0) ? GREEN : RED} />
                  ))}
                </Bar>
              )}

              {overlays.sma20 && (
                <Line yAxisId='price' dataKey='sma20' stroke='#3B82F6' strokeWidth={1.5} dot={false} isAnimationActive={false} connectNulls />
              )}
              {overlays.sma50 && (
                <Line yAxisId='price' dataKey='sma50' stroke='#EC4899' strokeWidth={1.5} dot={false} isAnimationActive={false} connectNulls />
              )}
              {overlays.ema20 && (
                <Line yAxisId='price' dataKey='ema20' stroke='#06B6D4' strokeWidth={1.5} dot={false} isAnimationActive={false} connectNulls />
              )}

              {overlays.highLow && periodHigh != null && Number.isFinite(periodHigh) && (
                <ReferenceLine
                  yAxisId='price'
                  y={periodHigh}
                  stroke={GREEN}
                  strokeDasharray='4 4'
                  ifOverflow='extendDomain'
                  label={{
                    value: `High ${formatCurrency(periodHigh)}`,
                    position: 'insideTopRight',
                    fill: GREEN,
                    fontSize: 11,
                  }}
                />
              )}
              {overlays.highLow && periodLow != null && Number.isFinite(periodLow) && (
                <ReferenceLine
                  yAxisId='price'
                  y={periodLow}
                  stroke={RED}
                  strokeDasharray='4 4'
                  ifOverflow='extendDomain'
                  label={{
                    value: `Low ${formatCurrency(periodLow)}`,
                    position: 'insideBottomRight',
                    fill: RED,
                    fontSize: 11,
                  }}
                />
              )}

              {chartType === 'area' ? (
                <Area
                  yAxisId='price'
                  type='monotone'
                  dataKey='close'
                  stroke='#F1CB68'
                  strokeWidth={2.5}
                  fill='url(#assetChartGradient)'
                />
              ) : (
                <Bar
                  yAxisId='price'
                  dataKey='hl'
                  barSize={candleSize}
                  shape={<CandleShape />}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
