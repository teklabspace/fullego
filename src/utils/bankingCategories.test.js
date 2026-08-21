import { describe, expect, it } from 'vitest';
import {
  CATEGORY,
  categoryOf,
  groupByCategory,
  isCash,
  isInvestment,
  isLiability,
  subtypeOf,
  sumCash,
  sumOwed,
} from './bankingCategories';

// Shapes taken from the backend integration guide's sandbox response.
const CHECKING = {
  id: 'f47ac10b',
  accountName: 'Plaid Checking',
  accountType: 'checking',
  category: 'depository',
  subtype: 'checking',
  balance: 110.0,
};
const CARD = {
  id: 'a1b2c3d4',
  accountName: 'Plaid Credit Card',
  accountType: 'credit card',
  category: 'credit',
  subtype: 'credit card',
  balance: 410.0,
};
const IRA = {
  id: 'b2c3d4e5',
  accountName: 'Plaid IRA',
  accountType: 'ira',
  category: 'investment',
  subtype: 'ira',
  balance: 320.76,
};
const MORTGAGE = {
  id: 'c3d4e5f6',
  accountName: 'Plaid Mortgage',
  accountType: 'mortgage',
  category: 'loan',
  subtype: 'mortgage',
  balance: 56302.06,
};

const ALL = [CHECKING, CARD, IRA, MORTGAGE];

describe('categoryOf', () => {
  it('reads the explicit category', () => {
    expect(categoryOf(CHECKING)).toBe(CATEGORY.DEPOSITORY);
    expect(categoryOf(CARD)).toBe(CATEGORY.CREDIT);
    expect(categoryOf(IRA)).toBe(CATEGORY.INVESTMENT);
    expect(categoryOf(MORTGAGE)).toBe(CATEGORY.LOAN);
  });

  it('accepts snake_case payloads', () => {
    expect(categoryOf({ category: 'loan' })).toBe(CATEGORY.LOAN);
    expect(categoryOf({ account_type: 'brokerage' })).toBe(CATEGORY.INVESTMENT);
  });

  it('falls back for accounts linked before categorisation existed', () => {
    // Everything in that list used to be a bank account.
    expect(categoryOf({ account_type: 'banking' })).toBe(CATEGORY.DEPOSITORY);
    expect(categoryOf({ accountType: 'checking' })).toBe(CATEGORY.DEPOSITORY);
    expect(categoryOf({ accountType: 'savings' })).toBe(CATEGORY.DEPOSITORY);
    expect(categoryOf({ accountType: 'credit card' })).toBe(CATEGORY.CREDIT);
  });

  it('is case-insensitive', () => {
    expect(categoryOf({ category: 'DEPOSITORY' })).toBe(CATEGORY.DEPOSITORY);
  });

  it('returns "other" for unknown or missing input', () => {
    expect(categoryOf({ category: 'spaceship' })).toBe(CATEGORY.OTHER);
    expect(categoryOf({})).toBe(CATEGORY.OTHER);
    expect(categoryOf(null)).toBe(CATEGORY.OTHER);
  });
});

describe('predicates', () => {
  it('counts only depository accounts as cash', () => {
    expect(ALL.filter(isCash)).toEqual([CHECKING]);
  });

  it('treats credit and loan as liabilities', () => {
    expect(ALL.filter(isLiability)).toEqual([CARD, MORTGAGE]);
  });

  it('identifies investment accounts', () => {
    expect(ALL.filter(isInvestment)).toEqual([IRA]);
  });
});

// The regression this module exists to prevent.
describe('sumCash', () => {
  it('excludes the mortgage, card and IRA from cash', () => {
    expect(sumCash(ALL)).toBe(110.0);
  });

  it('does NOT sum every balance the way the old dashboard did', () => {
    const naive = ALL.reduce((t, a) => t + a.balance, 0);
    expect(naive).toBeCloseTo(57142.82, 2);
    expect(sumCash(ALL)).not.toBeCloseTo(naive, 2);
  });

  it('ignores non-numeric balances', () => {
    expect(sumCash([CHECKING, { category: 'depository', balance: null }])).toBe(110.0);
  });

  it('returns 0 for an empty list', () => {
    expect(sumCash([])).toBe(0);
    expect(sumCash()).toBe(0);
  });
});

describe('sumOwed', () => {
  it('adds the card and the mortgage', () => {
    expect(sumOwed(ALL)).toBeCloseTo(56712.06, 2);
  });
});

describe('groupByCategory', () => {
  it('orders sections cash, credit, loans, investments', () => {
    expect(groupByCategory(ALL).map(s => s.title)).toEqual([
      'Cash',
      'Credit Cards',
      'Loans',
      'Investments',
    ]);
  });

  it('drops empty sections', () => {
    expect(groupByCategory([CHECKING]).map(s => s.title)).toEqual(['Cash']);
  });

  it('keeps every account exactly once', () => {
    const grouped = groupByCategory(ALL).flatMap(s => s.accounts);
    expect(grouped).toHaveLength(ALL.length);
  });

  it('puts unrecognised accounts in Other rather than dropping them', () => {
    const odd = { id: 'x', category: 'spaceship', balance: 1 };
    const sections = groupByCategory([...ALL, odd]);
    expect(sections.find(s => s.title === 'Other').accounts).toEqual([odd]);
  });
});

describe('subtypeOf', () => {
  it('prefers subtype and falls back to account_type', () => {
    expect(subtypeOf(MORTGAGE)).toBe('mortgage');
    expect(subtypeOf({ account_type: 'money market' })).toBe('money market');
    expect(subtypeOf({})).toBeNull();
  });
});
