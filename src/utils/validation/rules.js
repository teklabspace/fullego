/**
 * Pure validation primitives.
 *
 * Two families live here and they do different jobs:
 *
 *  - `sanitize*`  run on EVERY keystroke and return the corrected value. They
 *    must tolerate half-typed input ("12." while the user is mid-number) and
 *    never throw away a character the user could still legitimately complete.
 *  - `validate*`  run on blur and on submit and return an error string, or
 *    null when the value is acceptable.
 *
 * Every limit in this file is derived from the real backend contract in
 * D:\Fiver\Fullego_Backend — Pydantic schemas where they exist, and the
 * SQLAlchemy column widths (which are the ACTUAL ceiling, because the schemas
 * mostly don't constrain anything). See BACKEND_MESSAGE_VALIDATION.md.
 */

// ---------------------------------------------------------------------------
// Backend-derived constants
// ---------------------------------------------------------------------------

// Numeric(20, 2) — 20 total digits, 2 after the point, so 18 before it.
// Postgres raises "numeric field overflow" past this, which surfaces as a 500.
export const MONEY_PRECISION = { intDigits: 18, decimals: 2 };
// Numeric(20, 8) — used for tradeable quantities (orders, goal quantities).
export const QUANTITY_PRECISION = { intDigits: 12, decimals: 8 };
// Numeric(5, 2) — asset_ownership.ownership_percentage.
export const PERCENT_PRECISION = { intDigits: 3, decimals: 2 };

// bcrypt hashes at most 72 BYTES. app/core/security.py passes the raw password
// straight to passlib/bcrypt with no guard, so anything longer either raises or
// is silently truncated server-side.
export const PASSWORD_MAX_BYTES = 72;
export const PASSWORD_MIN_LENGTH = 8;

// users.email is String(255); EmailStr also requires a dotted domain.
export const EMAIL_MAX = 255;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

export const isBlank = value =>
  value === null || value === undefined || String(value).trim() === '';

/** UTF-8 byte length — bcrypt's 72 limit counts bytes, not characters. */
export const byteLength = value => {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(String(value)).length;
  }
  return unescape(encodeURIComponent(String(value))).length;
};

/**
 * Characters no backend field should ever receive: C0/C1 control codes and the
 * Unicode direction-override marks used to disguise text.
 */
// eslint-disable-next-line no-control-regex -- matching control characters IS the point
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E]/;

export const stripControlChars = value =>
  String(value).replace(new RegExp(CONTROL_CHARS.source, 'g'), '');

// Letters (any script), combining marks, spaces, apostrophes, hyphens, periods.
const NAME_ALLOWED = "\\p{L}\\p{M}\\s'\u2019.\\-";

// ---------------------------------------------------------------------------
// Sanitizers — keystroke-level, always return a string
// ---------------------------------------------------------------------------

/** Digits only, optionally capped in length. Used for year, OTP, card CVC. */
export const sanitizeDigits = (value, { maxLen } = {}) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return maxLen ? digits.slice(0, maxLen) : digits;
};

/**
 * A decimal number the user is still typing.
 *
 * Keeps at most one decimal point, caps the digits either side to the column's
 * precision, and tolerates the trailing-dot state ("12.") so the field doesn't
 * fight the user mid-entry. Thousands separators are dropped, which makes a
 * pasted "1,200.50" land as "1200.50" instead of being rejected.
 */
export const sanitizeDecimal = (
  value,
  { decimals = 2, intDigits = 18, allowNegative = false } = {}
) => {
  let raw = String(value ?? '').replace(/,/g, '');

  const negative = allowNegative && raw.trim().startsWith('-');
  raw = raw.replace(/[^0-9.]/g, '');

  // Collapse any extra decimal points into the first one.
  const firstDot = raw.indexOf('.');
  if (firstDot !== -1) {
    raw =
      raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, '');
  }

  let [whole = '', fraction] = raw.split('.');
  whole = whole.slice(0, intDigits);

  // Leading zeros: "007" -> "7", but a lone "0" and "0.x" must survive.
  if (whole.length > 1) whole = whole.replace(/^0+(?=\d)/, '');

  let out = whole;
  if (firstDot !== -1 && decimals > 0) {
    out += '.';
    if (fraction) out += fraction.slice(0, decimals);
  }

  return negative ? `-${out}` : out;
};

/**
 * Name-shaped text: letters (any script, so accented and non-Latin names work),
 * spaces, apostrophes, hyphens and periods. This is the ONLY family of fields
 * that blocks digits — "O'Brien-Smith Jr." passes, "John123" does not.
 */
export const sanitizeName = (value, { maxLen = 100 } = {}) => {
  const cleaned = stripControlChars(value)
    .replace(new RegExp(`[^${NAME_ALLOWED}]`, 'gu'), '')
    .replace(/\s{2,}/g, ' ');
  return cleaned.slice(0, maxLen);
};

/** Phone entry: digits plus the punctuation people actually type. */
export const sanitizePhone = (value, { maxLen = 20 } = {}) => {
  let cleaned = String(value ?? '').replace(/[^\d+\s()\-.]/g, '');
  // A plus sign is only meaningful as the very first character.
  cleaned = cleaned.charAt(0) + cleaned.slice(1).replace(/\+/g, '');
  return cleaned.slice(0, maxLen);
};

/** Free-form text: strip control characters, cap at the column width. */
export const sanitizeText = (value, { maxLen } = {}) => {
  const cleaned = stripControlChars(value);
  return maxLen ? cleaned.slice(0, maxLen) : cleaned;
};

/** Ticker symbols are stored uppercase (assets.symbol, orders.symbol). */
export const sanitizeSymbol = (value, { maxLen = 50 } = {}) =>
  String(value ?? '')
    .replace(/[^a-zA-Z0-9.\-/]/g, '')
    .toUpperCase()
    .slice(0, maxLen);

/** ISO-4217 currency codes are exactly three letters (currency String(3)). */
export const sanitizeCurrencyCode = value =>
  String(value ?? '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 3);

// ---------------------------------------------------------------------------
// Validators — return an error string, or null when valid
// ---------------------------------------------------------------------------

export const validateRequired = (value, label = 'This field') =>
  isBlank(value) ? `${label} is required` : null;

export const validateName = (value, { label = 'Name', maxLen = 100 } = {}) => {
  if (isBlank(value)) return null;
  const trimmed = String(value).trim();
  if (trimmed.length < 2) return `${label} must be at least 2 characters`;
  if (trimmed.length > maxLen)
    return `${label} must be ${maxLen} characters or fewer`;
  if (/\d/.test(trimmed)) return `${label} cannot contain numbers`;
  if (!new RegExp(`^[${NAME_ALLOWED}]+$`, 'u').test(trimmed))
    return `${label} can only contain letters, spaces, hyphens and apostrophes`;
  if (!/\p{L}/u.test(trimmed)) return `${label} must contain at least one letter`;
  return null;
};

/**
 * Deliberately close to what Python's email-validator (behind Pydantic's
 * EmailStr) accepts: a dotted domain is mandatory, so "user@localhost" and
 * "a@b" are rejected here rather than 422-ing at the API.
 */
const EMAIL_RE =
  /^[^\s@,;:<>()[\]\\"]+@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;

export const validateEmail = (value, { label = 'Email address' } = {}) => {
  if (isBlank(value)) return null;
  const trimmed = String(value).trim();
  if (trimmed.length > EMAIL_MAX)
    return `${label} must be ${EMAIL_MAX} characters or fewer`;
  if (!EMAIL_RE.test(trimmed)) return `Enter a valid ${label.toLowerCase()}`;
  const domain = trimmed.split('@')[1];
  // A TLD shorter than two characters is never routable.
  if (domain.split('.').pop().length < 2)
    return `Enter a valid ${label.toLowerCase()}`;
  return null;
};

export const validatePhone = (
  value,
  { label = 'Phone number', maxLen = 20 } = {}
) => {
  if (isBlank(value)) return null;
  const raw = String(value).trim();
  if (raw.length > maxLen)
    return `${label} must be ${maxLen} characters or fewer`;
  if (!/^\+?[\d\s()\-.]+$/.test(raw))
    return `${label} can only contain digits, spaces, + ( ) and -`;
  const digits = raw.replace(/\D/g, '');
  // E.164: a subscriber number is 7-15 digits worldwide.
  if (digits.length < 7) return `${label} is too short`;
  if (digits.length > 15) return `${label} is too long`;
  return null;
};

export const validatePassword = (value, { label = 'Password' } = {}) => {
  if (isBlank(value)) return null;
  const raw = String(value);
  if (raw.length < PASSWORD_MIN_LENGTH)
    return `${label} must be at least ${PASSWORD_MIN_LENGTH} characters`;
  // bcrypt truncates past 72 bytes, so a longer password would not round-trip.
  if (byteLength(raw) > PASSWORD_MAX_BYTES)
    return `${label} must be ${PASSWORD_MAX_BYTES} characters or fewer`;
  if (!/[a-zA-Z]/.test(raw)) return `${label} must contain at least one letter`;
  if (!/\d/.test(raw)) return `${label} must contain at least one number`;
  return null;
};

/**
 * A money value bound for a Numeric(20, 2) column.
 * `allowZero` is off by default because most amount fields (deposits, orders,
 * goal targets) are meaningless at zero; asset values pass it explicitly.
 */
export const validateAmount = (
  value,
  { label = 'Amount', allowZero = false, allowNegative = false, min, max } = {}
) => {
  if (isBlank(value)) return null;
  const raw = String(value).replace(/,/g, '').trim();
  if (!/^-?\d*\.?\d*$/.test(raw) || raw === '.' || raw === '-' || raw === '')
    return `${label} must be a number`;

  const num = Number(raw);
  if (!Number.isFinite(num)) return `${label} must be a number`;
  if (!allowNegative && num < 0) return `${label} cannot be negative`;
  if (!allowZero && num === 0) return `${label} must be greater than zero`;

  const [whole = '', fraction = ''] = raw.replace('-', '').split('.');
  if (fraction.length > MONEY_PRECISION.decimals)
    return `${label} can have at most ${MONEY_PRECISION.decimals} decimal places`;
  if (whole.replace(/^0+/, '').length > MONEY_PRECISION.intDigits)
    return `${label} is too large`;

  if (min !== undefined && num < min) return `${label} must be at least ${min}`;
  if (max !== undefined && num > max) return `${label} must be ${max} or less`;
  return null;
};

/** Tradeable quantity bound for a Numeric(20, 8) column. */
export const validateQuantity = (
  value,
  { label = 'Quantity', allowZero = false } = {}
) => {
  if (isBlank(value)) return null;
  const raw = String(value).replace(/,/g, '').trim();
  if (!/^\d*\.?\d*$/.test(raw) || raw === '.' || raw === '')
    return `${label} must be a number`;

  const num = Number(raw);
  if (!Number.isFinite(num)) return `${label} must be a number`;
  if (!allowZero && num <= 0) return `${label} must be greater than zero`;

  const [whole = '', fraction = ''] = raw.split('.');
  if (fraction.length > QUANTITY_PRECISION.decimals)
    return `${label} can have at most ${QUANTITY_PRECISION.decimals} decimal places`;
  if (whole.replace(/^0+/, '').length > QUANTITY_PRECISION.intDigits)
    return `${label} is too large`;
  return null;
};

export const validatePercent = (
  value,
  { label = 'Percentage', max = 100 } = {}
) => {
  if (isBlank(value)) return null;
  const raw = String(value).replace(/[%,]/g, '').trim();
  if (!/^\d*\.?\d*$/.test(raw) || raw === '.' || raw === '')
    return `${label} must be a number`;

  const num = Number(raw);
  if (!Number.isFinite(num)) return `${label} must be a number`;
  if (num < 0) return `${label} cannot be negative`;
  if (num > max) return `${label} cannot be more than ${max}`;

  const fraction = raw.split('.')[1] || '';
  if (fraction.length > PERCENT_PRECISION.decimals)
    return `${label} can have at most ${PERCENT_PRECISION.decimals} decimal places`;
  return null;
};

export const validateInteger = (value, { label = 'Value', min, max } = {}) => {
  if (isBlank(value)) return null;
  const raw = String(value).trim();
  if (!/^\d+$/.test(raw)) return `${label} must be a whole number`;
  const num = Number(raw);
  if (min !== undefined && num < min) return `${label} must be at least ${min}`;
  if (max !== undefined && num > max) return `${label} must be ${max} or less`;
  return null;
};

export const validateYear = (value, { label = 'Year' } = {}) => {
  if (isBlank(value)) return null;
  const raw = String(value).trim();
  if (!/^\d{4}$/.test(raw)) return `${label} must be a 4-digit year`;
  const year = Number(raw);
  // Next year is allowed: model years and maturity years run ahead of today.
  const maxYear = new Date().getFullYear() + 1;
  if (year < 1800) return `${label} must be 1800 or later`;
  if (year > maxYear) return `${label} cannot be later than ${maxYear}`;
  return null;
};

export const validateText = (
  value,
  { label = 'This field', maxLen, minLen } = {}
) => {
  if (isBlank(value)) return null;
  const trimmed = String(value).trim();
  if (minLen !== undefined && trimmed.length < minLen)
    return `${label} must be at least ${minLen} characters`;
  if (maxLen !== undefined && trimmed.length > maxLen)
    return `${label} must be ${maxLen} characters or fewer`;
  if (CONTROL_CHARS.test(trimmed))
    return `${label} contains characters that are not allowed`;
  return null;
};

/**
 * Date validation against the ISO bounds the pickers already use.
 * Returns null for blank so `required` stays the single source of "must fill".
 */
export const validateDate = (value, { label = 'Date', min, max } = {}) => {
  if (isBlank(value)) return null;
  const raw = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(raw)) return `${label} must be a valid date`;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return `${label} must be a valid date`;
  if (min && raw < min) return `${label} cannot be before ${min}`;
  if (max && raw > max) return `${label} cannot be after ${max}`;
  return null;
};

export const validateUrl = (value, { label = 'URL', maxLen = 500 } = {}) => {
  if (isBlank(value)) return null;
  const raw = String(value).trim();
  if (raw.length > maxLen)
    return `${label} must be ${maxLen} characters or fewer`;
  try {
    const parsed = new URL(raw);
    if (!['http:', 'https:'].includes(parsed.protocol))
      return `${label} must start with http:// or https://`;
    return null;
  } catch {
    return `Enter a valid ${label.toLowerCase()}`;
  }
};

export const validateCurrencyCode = (value, { label = 'Currency' } = {}) => {
  if (isBlank(value)) return null;
  return /^[A-Za-z]{3}$/.test(String(value).trim())
    ? null
    : `${label} must be a 3-letter code (e.g. USD)`;
};
