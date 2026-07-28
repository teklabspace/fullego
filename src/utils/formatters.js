// Shared number/currency formatting for the whole dashboard.
// Rule: thousands separators always, never more than 2 decimals
// (raw values like 6677.797 must render as 6,677.8 / $6,677.80).

const toNumber = (value) => {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return n === null || n === undefined || Number.isNaN(n) ? null : n;
};

export const formatNumber = (value, { minDecimals = 0, maxDecimals = 2 } = {}) => {
  const n = toNumber(value);
  if (n === null) return '0';
  return n.toLocaleString('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
};

export const formatCurrency = (
  value,
  { currency = 'USD', minDecimals = 0, maxDecimals = 2 } = {}
) => {
  const n = toNumber(value);
  if (n === null) return '$0';
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
};

// $1,234.5K / $6,677.8M / $1.2B — compact for cards and chart labels.
export const formatCurrencyCompact = (value, { currency = 'USD' } = {}) => {
  const n = toNumber(value);
  if (n === null) return '$0';
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${formatCurrency(n / 1e9, { currency })}B`;
  if (abs >= 1e6) return `${formatCurrency(n / 1e6, { currency })}M`;
  if (abs >= 1e3) return `${formatCurrency(n / 1e3, { currency, maxDecimals: 1 })}K`;
  return formatCurrency(n, { currency, minDecimals: 2, maxDecimals: 2 });
};

export const formatPercent = (value, { decimals = 2, sign = true } = {}) => {
  const n = toNumber(value);
  if (n === null) return '0%';
  const prefix = sign && n > 0 ? '+' : '';
  return `${prefix}${n.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })}%`;
};
