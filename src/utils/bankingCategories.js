/**
 * Plaid account categorisation.
 *
 * `GET /banking/accounts` returns every linked account in one list — cash,
 * credit cards, loans and investments together. Before the backend added
 * `category`, everything in that list was a bank account, so several places
 * treated the whole list as cash. That is now wrong: a mortgage balance summed
 * into "Cash on Hand" overstates it by the size of the debt.
 *
 * `category` is the stable, closed enum — switch on it. `subtype` is Plaid's
 * open-ended label ("checking", "money market", "529", ...) and is for display
 * only; never branch exhaustively on it.
 */

export const CATEGORY = {
  DEPOSITORY: 'depository',
  CREDIT: 'credit',
  LOAN: 'loan',
  INVESTMENT: 'investment',
  OTHER: 'other',
};

const KNOWN = new Set(Object.values(CATEGORY));

/**
 * Read an account's category regardless of casing.
 *
 * bankingApi camelCases its responses, but a few call sites still receive raw
 * snake_case shapes, and older records predate the field entirely. When
 * `category` is missing we fall back to `account_type`/`subtype` so an account
 * linked before this change still lands somewhere sensible rather than in
 * "other" — but only for values we recognise.
 */
export const categoryOf = account => {
  if (!account) return CATEGORY.OTHER;

  const explicit = String(account.category ?? account.category_name ?? '')
    .trim()
    .toLowerCase();
  if (KNOWN.has(explicit)) return explicit;

  const legacy = String(
    account.accountType ?? account.account_type ?? account.subtype ?? ''
  )
    .trim()
    .toLowerCase();

  if (KNOWN.has(legacy)) return legacy;
  // Pre-categorisation records only ever held cash accounts.
  if (legacy === 'banking' || legacy === 'checking' || legacy === 'savings')
    return CATEGORY.DEPOSITORY;
  if (legacy === 'brokerage') return CATEGORY.INVESTMENT;
  if (legacy === 'credit card') return CATEGORY.CREDIT;

  return CATEGORY.OTHER;
};

/** Plaid's specific label, e.g. "money market". Display only. */
export const subtypeOf = account =>
  account?.subtype ?? account?.accountType ?? account?.account_type ?? null;

/** Spendable cash. The ONLY category that belongs in a cash total. */
export const isCash = account => categoryOf(account) === CATEGORY.DEPOSITORY;

/** Credit cards and loans: `balance` is the amount OWED, not available. */
export const isLiability = account => {
  const category = categoryOf(account);
  return category === CATEGORY.CREDIT || category === CATEGORY.LOAN;
};

export const isInvestment = account =>
  categoryOf(account) === CATEGORY.INVESTMENT;

/** Section headings, in the order they should appear. */
export const CATEGORY_SECTIONS = [
  { category: CATEGORY.DEPOSITORY, title: 'Cash' },
  { category: CATEGORY.CREDIT, title: 'Credit Cards' },
  { category: CATEGORY.LOAN, title: 'Loans' },
  { category: CATEGORY.INVESTMENT, title: 'Investments' },
  { category: CATEGORY.OTHER, title: 'Other' },
];

/** Split a flat account list into the sections above, dropping empty ones. */
export const groupByCategory = (accounts = []) =>
  CATEGORY_SECTIONS.map(section => ({
    ...section,
    accounts: accounts.filter(a => categoryOf(a) === section.category),
  })).filter(section => section.accounts.length > 0);

/** Sum only the accounts that represent spendable cash. */
export const sumCash = (accounts = []) =>
  accounts.filter(isCash).reduce((total, a) => {
    const value = parseFloat(a?.balance);
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);

/** Sum what is owed across credit cards and loans. */
export const sumOwed = (accounts = []) =>
  accounts.filter(isLiability).reduce((total, a) => {
    const value = parseFloat(a?.balance);
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
