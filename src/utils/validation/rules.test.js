import { describe, expect, it } from 'vitest';
import {
  byteLength,
  sanitizeCurrencyCode,
  sanitizeDecimal,
  sanitizeDigits,
  sanitizeName,
  sanitizePhone,
  sanitizeSymbol,
  sanitizeText,
  validateAmount,
  validateCurrencyCode,
  validateDate,
  validateEmail,
  validateInteger,
  validateName,
  validatePassword,
  validatePercent,
  validatePhone,
  validateQuantity,
  validateText,
  validateUrl,
  validateYear,
} from './rules';

// ---------------------------------------------------------------------------
// Names — the only family that blocks digits
// ---------------------------------------------------------------------------

describe('validateName', () => {
  it('rejects digits', () => {
    expect(validateName('John123')).toMatch(/cannot contain numbers/);
  });

  it.each([
    ["O'Brien", 'straight apostrophe'],
    ['O’Brien', 'smart apostrophe'],
    ['Anne-Marie', 'hyphen'],
    ['Dr. Watson', 'period'],
    ['José María', 'accents'],
    ['李小龙', 'non-Latin script'],
  ])('accepts %s (%s)', name => {
    expect(validateName(name)).toBeNull();
  });

  it('rejects symbols that are not name punctuation', () => {
    expect(validateName('John@Doe')).toBeTruthy();
    expect(validateName('John_Doe')).toBeTruthy();
  });

  it('requires at least two characters', () => {
    expect(validateName('J')).toMatch(/at least 2/);
  });

  it('enforces the users.first_name String(100) width', () => {
    expect(validateName('a'.repeat(101))).toMatch(/100 characters or fewer/);
    expect(validateName('a'.repeat(100))).toBeNull();
  });

  it('treats blank as valid so `required` owns that message', () => {
    expect(validateName('')).toBeNull();
  });
});

describe('sanitizeName', () => {
  it('strips digits as they are typed', () => {
    expect(sanitizeName('John123')).toBe('John');
  });

  it('keeps name punctuation', () => {
    expect(sanitizeName("O'Brien-Smith Jr.")).toBe("O'Brien-Smith Jr.");
  });

  it('collapses runs of whitespace', () => {
    expect(sanitizeName('John    Doe')).toBe('John Doe');
  });

  it('caps at the column width', () => {
    expect(sanitizeName('a'.repeat(200))).toHaveLength(100);
  });
});

// ---------------------------------------------------------------------------
// Email — must agree with Pydantic EmailStr
// ---------------------------------------------------------------------------

describe('validateEmail', () => {
  it.each(['user@example.com', 'first.last+tag@sub.example.co.uk'])(
    'accepts %s',
    email => expect(validateEmail(email)).toBeNull()
  );

  it.each([
    'a@b', // EmailStr needs a dotted domain
    'user@localhost',
    'user@example.c', // single-character TLD
    'no-at-sign.com',
    '@example.com',
    'user @example.com',
    'user@exam ple.com',
  ])('rejects %s', email => expect(validateEmail(email)).toBeTruthy());

  it('enforces the users.email String(255) width', () => {
    const long = `${'a'.repeat(250)}@example.com`;
    expect(validateEmail(long)).toMatch(/255 characters or fewer/);
  });
});

// ---------------------------------------------------------------------------
// Phone — users.phone String(20), E.164 digit count
// ---------------------------------------------------------------------------

describe('validatePhone', () => {
  it.each(['+1 555 010 0199', '(555) 010-0199', '+44 20 7946 0958'])(
    'accepts %s',
    phone => expect(validatePhone(phone)).toBeNull()
  );

  it('rejects letters', () => {
    expect(validatePhone('555-CALL-NOW')).toBeTruthy();
  });

  it('rejects too few digits', () => {
    expect(validatePhone('12345')).toMatch(/too short/);
  });

  it('rejects more than 15 digits (E.164 ceiling)', () => {
    expect(validatePhone('1234567890123456')).toMatch(/too long/);
  });

  it('enforces the String(20) column width', () => {
    expect(validatePhone('+1 (555) 010-0199 x99')).toMatch(/20 characters or fewer/);
  });
});

describe('sanitizePhone', () => {
  it('keeps only a leading plus', () => {
    expect(sanitizePhone('+1+555+0100')).toBe('+15550100');
  });

  it('drops letters as they are typed', () => {
    expect(sanitizePhone('555abc0100')).toBe('5550100');
  });

  it('caps at the column width', () => {
    expect(sanitizePhone('1'.repeat(40)).length).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// Password — bcrypt's 72-byte ceiling is a real backend limit
// ---------------------------------------------------------------------------

describe('validatePassword', () => {
  it('requires 8 characters', () => {
    expect(validatePassword('Ab1cdef')).toMatch(/at least 8/);
    expect(validatePassword('Ab1cdefg')).toBeNull();
  });

  it('requires a letter and a number', () => {
    expect(validatePassword('12345678')).toMatch(/at least one letter/);
    expect(validatePassword('abcdefgh')).toMatch(/at least one number/);
  });

  it('rejects passwords bcrypt would truncate at 72 bytes', () => {
    expect(validatePassword(`${'a'.repeat(72)}1`)).toMatch(/72 characters or fewer/);
    expect(validatePassword(`${'a'.repeat(71)}1`)).toBeNull();
  });

  it('counts bytes, not characters, for multi-byte passwords', () => {
    // 25 x 3-byte characters = 75 bytes, under 72 chars but over the bcrypt cap.
    const multibyte = 'é'.repeat(40); // 2 bytes each = 80 bytes
    expect(byteLength(multibyte)).toBe(80);
    expect(validatePassword(`${multibyte}1`)).toMatch(/72 characters or fewer/);
  });
});

// ---------------------------------------------------------------------------
// Money — Numeric(20, 2)
// ---------------------------------------------------------------------------

describe('validateAmount', () => {
  it('rejects non-numeric input', () => {
    expect(validateAmount('abc')).toMatch(/must be a number/);
    expect(validateAmount('.')).toMatch(/must be a number/);
  });

  it('rejects negatives by default', () => {
    expect(validateAmount('-5')).toMatch(/cannot be negative/);
    expect(validateAmount('-5', { allowNegative: true })).toBeNull();
  });

  it('rejects zero unless allowed', () => {
    expect(validateAmount('0')).toMatch(/greater than zero/);
    expect(validateAmount('0', { allowZero: true })).toBeNull();
  });

  it('rejects more than 2 decimal places (Numeric scale)', () => {
    expect(validateAmount('10.999')).toMatch(/at most 2 decimal places/);
    expect(validateAmount('10.99')).toBeNull();
  });

  it('rejects values wider than 18 integer digits (Numeric precision)', () => {
    expect(validateAmount('1'.repeat(19))).toMatch(/too large/);
    expect(validateAmount('1'.repeat(18))).toBeNull();
  });

  it('accepts thousands separators', () => {
    expect(validateAmount('1,200.50')).toBeNull();
  });

  it('honours explicit min and max', () => {
    expect(validateAmount('5', { min: 10 })).toMatch(/at least 10/);
    expect(validateAmount('50', { max: 20 })).toMatch(/20 or less/);
  });
});

describe('sanitizeDecimal', () => {
  it('strips letters and currency symbols', () => {
    expect(sanitizeDecimal('$1a2b3')).toBe('123');
  });

  it('keeps a single decimal point', () => {
    expect(sanitizeDecimal('1.2.3')).toBe('1.23');
  });

  it('tolerates the trailing-dot state while typing', () => {
    expect(sanitizeDecimal('12.')).toBe('12.');
  });

  it('caps decimal places', () => {
    expect(sanitizeDecimal('1.23456')).toBe('1.23');
    expect(sanitizeDecimal('1.23456', { decimals: 8 })).toBe('1.23456');
  });

  it('caps integer digits', () => {
    expect(sanitizeDecimal('1'.repeat(25))).toHaveLength(18);
  });

  it('drops thousands separators from a pasted value', () => {
    expect(sanitizeDecimal('1,200.50')).toBe('1200.50');
  });

  it('trims leading zeros but keeps a lone zero', () => {
    expect(sanitizeDecimal('007')).toBe('7');
    expect(sanitizeDecimal('0')).toBe('0');
    expect(sanitizeDecimal('0.5')).toBe('0.5');
  });

  it('only keeps a minus sign when negatives are allowed', () => {
    expect(sanitizeDecimal('-5')).toBe('5');
    expect(sanitizeDecimal('-5', { allowNegative: true })).toBe('-5');
  });
});

// ---------------------------------------------------------------------------
// Quantity — Numeric(20, 8)
// ---------------------------------------------------------------------------

describe('validateQuantity', () => {
  it('allows 8 decimal places for crypto amounts', () => {
    expect(validateQuantity('0.00000001')).toBeNull();
    expect(validateQuantity('0.000000001')).toMatch(/at most 8 decimal places/);
  });

  it('rejects zero and negatives', () => {
    expect(validateQuantity('0')).toMatch(/greater than zero/);
    expect(validateQuantity('-1')).toMatch(/must be a number/);
  });

  it('rejects values wider than 12 integer digits', () => {
    expect(validateQuantity('1'.repeat(13))).toMatch(/too large/);
  });
});

// ---------------------------------------------------------------------------
// Percent — Numeric(5, 2), 0..100
// ---------------------------------------------------------------------------

describe('validatePercent', () => {
  it('accepts a normal rate', () => {
    expect(validatePercent('4.25')).toBeNull();
  });

  it('rejects over 100 and under 0', () => {
    expect(validatePercent('101')).toMatch(/cannot be more than 100/);
    expect(validatePercent('-1')).toMatch(/must be a number/);
  });

  it('rejects more than 2 decimal places', () => {
    expect(validatePercent('4.2555')).toMatch(/at most 2 decimal places/);
  });

  it('tolerates a typed percent sign', () => {
    expect(validatePercent('4.25%')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Integers, years, dates
// ---------------------------------------------------------------------------

describe('validateInteger', () => {
  it('rejects decimals', () => {
    expect(validateInteger('3.5')).toMatch(/whole number/);
  });

  it('honours bounds', () => {
    expect(validateInteger('0', { min: 1 })).toMatch(/at least 1/);
    expect(validateInteger('11', { max: 10 })).toMatch(/10 or less/);
  });
});

describe('validateYear', () => {
  it('requires four digits', () => {
    expect(validateYear('99')).toMatch(/4-digit year/);
  });

  it('rejects a year beyond next year', () => {
    const tooFar = String(new Date().getFullYear() + 2);
    expect(validateYear(tooFar)).toMatch(/cannot be later than/);
  });

  it('allows next year for model and maturity years', () => {
    expect(validateYear(String(new Date().getFullYear() + 1))).toBeNull();
  });

  it('rejects implausibly early years', () => {
    expect(validateYear('1799')).toMatch(/1800 or later/);
  });
});

describe('validateDate', () => {
  it('rejects malformed values', () => {
    expect(validateDate('12/05/2024')).toMatch(/valid date/);
    expect(validateDate('2024-13-45')).toMatch(/valid date/);
  });

  it('honours min and max bounds', () => {
    expect(validateDate('1899-01-01', { min: '1900-01-01' })).toMatch(/cannot be before/);
    expect(validateDate('2099-01-01', { max: '2030-01-01' })).toMatch(/cannot be after/);
    expect(validateDate('2024-06-01', { min: '1900-01-01', max: '2030-01-01' })).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Free text, symbols, currency codes, URLs
// ---------------------------------------------------------------------------

describe('validateText', () => {
  it('allows digits and punctuation — this is NOT letters-only', () => {
    expect(validateText('911 Turbo')).toBeNull();
    expect(validateText('40 Ocean Drive, Apt 7B')).toBeNull();
    expect(validateText('A1B2-9981')).toBeNull();
  });

  it('enforces the column width it is given', () => {
    expect(validateText('a'.repeat(256), { maxLen: 255 })).toMatch(/255 characters or fewer/);
  });

  it('enforces a minimum when asked', () => {
    expect(validateText('a', { minLen: 2 })).toMatch(/at least 2 characters/);
  });

  it('rejects control characters', () => {
    const BELL = String.fromCharCode(7);
    expect(validateText(`abc${BELL}def`)).toMatch(/not allowed/);
  });
});

describe('sanitizeText', () => {
  it('strips control and direction-override characters', () => {
    const RLO = String.fromCharCode(0x202e);
    expect(sanitizeText(`ab${RLO}cd`)).toBe('abcd');
  });

  it('leaves ordinary punctuation alone', () => {
    expect(sanitizeText("JPMorgan Chase & Co.")).toBe('JPMorgan Chase & Co.');
  });
});

describe('sanitizeSymbol', () => {
  it('uppercases and strips spaces', () => {
    expect(sanitizeSymbol('btc usd')).toBe('BTCUSD');
  });

  it('caps at assets.symbol String(50)', () => {
    expect(sanitizeSymbol('A'.repeat(60))).toHaveLength(50);
  });
});

describe('validateCurrencyCode', () => {
  it('requires exactly three letters', () => {
    expect(validateCurrencyCode('USD')).toBeNull();
    expect(validateCurrencyCode('US')).toBeTruthy();
    expect(validateCurrencyCode('US1')).toBeTruthy();
  });
});

describe('sanitizeCurrencyCode', () => {
  it('uppercases and truncates to the String(3) column', () => {
    expect(sanitizeCurrencyCode('usdollar')).toBe('USD');
  });
});

describe('validateUrl', () => {
  it('accepts http and https', () => {
    expect(validateUrl('https://example.com/a')).toBeNull();
  });

  it('rejects other schemes and malformed values', () => {
    expect(validateUrl('javascript:alert(1)')).toMatch(/http:\/\/ or https:\/\//);
    expect(validateUrl('example.com')).toBeTruthy();
  });
});

describe('sanitizeDigits', () => {
  it('keeps digits only and caps length', () => {
    expect(sanitizeDigits('a1b2c3', { maxLen: 2 })).toBe('12');
  });
});
