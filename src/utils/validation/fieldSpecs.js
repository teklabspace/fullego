/**
 * Field-name -> validation spec resolution.
 *
 * The asset wizard already decides how to RENDER a field by matching its label
 * (`getFieldType` in dashboard/assets/add/page.js). This module applies the
 * same idea to validation, which is what lets one change in that renderer cover
 * all 90 asset sub-categories at once.
 *
 * Max lengths come from the backend's SQLAlchemy columns. Category-specific
 * fields land in the `specifications` JSONB column, which has no width of its
 * own, so those get a sensible single-line cap instead.
 */

import {
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
  MONEY_PRECISION,
  PERCENT_PRECISION,
  QUANTITY_PRECISION,
} from './rules';
import { FIELD_WIDGET, getFieldWidget } from '@/config/assetFieldWidget';

export const KIND = {
  NAME: 'name',
  EMAIL: 'email',
  PHONE: 'phone',
  PASSWORD: 'password',
  MONEY: 'money',
  PERCENT: 'percent',
  QUANTITY: 'quantity',
  INTEGER: 'integer',
  YEAR: 'year',
  TEXT: 'text',
  TEXTAREA: 'textarea',
  DATE: 'date',
  URL: 'url',
  SYMBOL: 'symbol',
  CURRENCY_CODE: 'currencyCode',
  SELECT: 'select',
  FILE: 'file',
};

// Default single-line cap for category fields stored in `specifications`
// (JSONB, so the backend imposes nothing — this is a UI sanity bound).
const SPEC_TEXT_MAX = 255;
// Postgres `Text` columns are unbounded; this keeps a runaway paste in check.
const LONG_TEXT_MAX = 5000;

/**
 * Organisation-shaped names. These must stay free-form: "JPMorgan Chase & Co."
 * and "Sotheby's 1744" are legitimate values that a letters-only rule would
 * destroy. Checked BEFORE the person-name list because "Company Name" and
 * "Trustee Name" both end in "name".
 */
const ORG_NAME_HINTS = [
  'company',
  'business',
  'bank',
  'institution',
  'issuer',
  'fund',
  'entity',
  'organization',
  'organisation',
  'brand',
  'manufacturer',
  'vendor',
  'dealer',
  'broker',
  'firm',
  'employer',
  'custodian',
  'exchange',
  'platform',
  'provider',
  'charity',
  'foundation',
  'trust name',
  'account name',
  'product',
  'project',
  'property',
  'club',
  'venue',
  'school',
  'university',
];

/**
 * Person-shaped names — the only fields where digits are actually blocked.
 */
const PERSON_NAME_HINTS = [
  'first name',
  'last name',
  'middle name',
  'full name',
  'given name',
  'family name',
  'surname',
  'cardholder',
  'contact name',
  'owner name',
  'beneficiary name',
  'trustee name',
  'executor name',
  'guardian name',
  'spouse name',
  'holder name',
  'applicant name',
  'member name',
  'director name',
  'shareholder name',
  'partner name',
  'agent name',
  'artist',
  'author',
  'designer',
  'architect',
  'city',
  'country',
  'nationality',
];

const includesAny = (haystack, needles) => needles.some(n => haystack.includes(n));

/**
 * Resolve a human-facing field label to a validation spec.
 *
 * The WIDGET decides the family, so the rule can never disagree with the
 * control the wizard actually draws — a dropdown or date picker has no error
 * slot, and attaching a typed rule to one blocks the form with a message the
 * user cannot see. Within a typed widget, the label then chooses the specific
 * rule (email, phone, year, person-name, ...).
 */
export const specForFieldName = (fieldName, overrides = {}) => {
  const label = String(fieldName || '').trim();
  const lower = label.toLowerCase();

  const base = { label, kind: KIND.TEXT, maxLen: SPEC_TEXT_MAX, required: false };

  // Refinements available only once the widget is a plain text box.
  const refineText = () => {
    // -- identity / contact ------------------------------------------------
    if (lower.includes('email')) return { kind: KIND.EMAIL, maxLen: 255 };
    if (
      lower.includes('phone') ||
      lower.includes('mobile') ||
      lower.includes('telephone')
    )
      return { kind: KIND.PHONE, maxLen: 20 };
    if (lower.includes('password')) return { kind: KIND.PASSWORD, maxLen: 72 };
    if (
      lower.includes('website') ||
      lower.includes('url') ||
      lower.includes('link')
    )
      return { kind: KIND.URL, maxLen: 500 };

    // -- numbers -----------------------------------------------------------
    if (lower === 'year' || lower.endsWith(' year') || lower.includes('year of'))
      return { kind: KIND.YEAR, maxLen: 4 };
    if (
      lower.includes('quantity') ||
      lower.includes('units') ||
      lower.includes('shares')
    )
      return { kind: KIND.QUANTITY, maxLen: 22 };
    if (
      lower.includes('number of') ||
      // Word-bounded: "Country" must not read as a count of things.
      /\bcounts?\b/.test(lower) ||
      lower.includes('bedrooms') ||
      lower.includes('bathrooms')
    )
      return { kind: KIND.INTEGER, maxLen: 9 };
    if (lower.includes('symbol') || lower.includes('ticker'))
      return { kind: KIND.SYMBOL, maxLen: 50 };

    // Percent-shaped labels the renderer draws as a plain box (it only adds the
    // "%" suffix for rate/interest). A text box has an error slot, so the
    // sharper rule is safe to apply here.
    if (
      lower.includes('percentage') ||
      lower.includes('percent') ||
      lower.includes('yield') ||
      lower.includes('apr')
    )
      return { kind: KIND.PERCENT, maxLen: 7 };

    // Money-shaped labels the wizard still renders as a plain box (it only
    // draws the "$" prefix for price/value/cost/owed).
    if (
      lower.includes('amount') ||
      lower.includes('balance') ||
      lower.includes('premium') ||
      lower.includes('salary') ||
      lower.includes('income') ||
      lower.includes('contribution') ||
      lower.includes('payment')
    )
      return { kind: KIND.MONEY, maxLen: 25, allowZero: true };

    // -- names -------------------------------------------------------------
    // Organisations first: "Company Name" must not become letters-only.
    if (includesAny(lower, ORG_NAME_HINTS))
      return { kind: KIND.TEXT, maxLen: SPEC_TEXT_MAX };
    if (includesAny(lower, PERSON_NAME_HINTS))
      return { kind: KIND.NAME, maxLen: 100 };

    // Everything else stays free-form (Model, Serial Number, Location, ...).
    return { kind: KIND.TEXT, maxLen: SPEC_TEXT_MAX };
  };

  const resolve = () => {
    switch (getFieldWidget(label)) {
      case FIELD_WIDGET.DATE:
        return { kind: KIND.DATE, maxLen: undefined };
      case FIELD_WIDGET.SELECT:
        // Dropdowns constrain their own value; nothing to check, and nowhere
        // to show a message if there were.
        return { kind: KIND.SELECT, maxLen: undefined };
      case FIELD_WIDGET.FILE:
        return { kind: KIND.FILE, maxLen: undefined };
      case FIELD_WIDGET.CURRENCY:
        return { kind: KIND.MONEY, maxLen: 25, allowZero: true };
      case FIELD_WIDGET.PERCENTAGE:
        return { kind: KIND.PERCENT, maxLen: 7 };
      case FIELD_WIDGET.TEXTAREA:
        return { kind: KIND.TEXTAREA, maxLen: LONG_TEXT_MAX };
      default:
        return refineText();
    }
  };

  return { ...base, ...resolve(), ...overrides };
};

// ---------------------------------------------------------------------------
// Applying a spec
// ---------------------------------------------------------------------------

/** Keystroke-level correction for a spec. Returns the value to store. */
export const sanitizeForSpec = (spec, value) => {
  const { kind, maxLen } = spec;
  switch (kind) {
    case KIND.NAME:
      return sanitizeName(value, { maxLen });
    case KIND.PHONE:
      return sanitizePhone(value, { maxLen });
    case KIND.MONEY:
      return sanitizeDecimal(value, {
        decimals: MONEY_PRECISION.decimals,
        intDigits: MONEY_PRECISION.intDigits,
        allowNegative: spec.allowNegative,
      });
    case KIND.PERCENT:
      return sanitizeDecimal(value, {
        decimals: PERCENT_PRECISION.decimals,
        intDigits: PERCENT_PRECISION.intDigits,
      });
    case KIND.QUANTITY:
      return sanitizeDecimal(value, {
        decimals: QUANTITY_PRECISION.decimals,
        intDigits: QUANTITY_PRECISION.intDigits,
      });
    case KIND.INTEGER:
      return sanitizeDigits(value, { maxLen });
    case KIND.YEAR:
      return sanitizeDigits(value, { maxLen: 4 });
    case KIND.SYMBOL:
      return sanitizeSymbol(value, { maxLen });
    case KIND.CURRENCY_CODE:
      return sanitizeCurrencyCode(value);
    // Passwords are never rewritten mid-typing — silently dropping a character
    // the user chose would leave them with a password they cannot reproduce.
    case KIND.PASSWORD:
    case KIND.DATE:
    case KIND.SELECT:
    case KIND.FILE:
      return value;
    default:
      return sanitizeText(value, { maxLen });
  }
};

/** Submit/blur-level check for a spec. Returns an error string or null. */
export const validateForSpec = (spec, value) => {
  const { kind, label = 'This field', maxLen } = spec;

  if (spec.required && (value === null || value === undefined || String(value).trim() === ''))
    return `${label} is required`;

  const opts = { label, maxLen };
  switch (kind) {
    case KIND.NAME:
      return validateName(value, opts);
    case KIND.EMAIL:
      return validateEmail(value, opts);
    case KIND.PHONE:
      return validatePhone(value, opts);
    case KIND.PASSWORD:
      return validatePassword(value, opts);
    case KIND.MONEY:
      return validateAmount(value, {
        ...opts,
        allowZero: spec.allowZero !== false,
        allowNegative: spec.allowNegative,
        min: spec.min,
        max: spec.max,
      });
    case KIND.PERCENT:
      return validatePercent(value, { ...opts, max: spec.max ?? 100 });
    case KIND.QUANTITY:
      return validateQuantity(value, { ...opts, allowZero: spec.allowZero });
    case KIND.INTEGER:
      return validateInteger(value, { ...opts, min: spec.min, max: spec.max });
    case KIND.YEAR:
      return validateYear(value, opts);
    case KIND.DATE:
      return validateDate(value, { ...opts, min: spec.min, max: spec.max });
    case KIND.URL:
      return validateUrl(value, opts);
    case KIND.CURRENCY_CODE:
      return validateCurrencyCode(value, opts);
    case KIND.SELECT:
    case KIND.FILE:
      return null;
    default:
      return validateText(value, { ...opts, minLen: spec.minLen });
  }
};

// ---------------------------------------------------------------------------
// Named specs for the fixed (non-category) forms
// ---------------------------------------------------------------------------

/**
 * Reusable specs for fields that appear on hand-written forms. Widths match the
 * backend columns noted alongside each entry.
 */
export const COMMON_SPECS = {
  // users.first_name / last_name — String(100), Pydantic min_length=1
  firstName: { kind: KIND.NAME, label: 'First name', maxLen: 100, required: true },
  lastName: { kind: KIND.NAME, label: 'Last name', maxLen: 100, required: true },
  // users.email — String(255) + EmailStr
  email: { kind: KIND.EMAIL, label: 'Email address', maxLen: 255, required: true },
  // users.phone — String(20)
  phone: { kind: KIND.PHONE, label: 'Phone number', maxLen: 20 },
  // bcrypt ceiling, see rules.js
  password: { kind: KIND.PASSWORD, label: 'Password', maxLen: 72, required: true },
  // users.otp_code — String(6)
  otp: { kind: KIND.INTEGER, label: 'Verification code', maxLen: 6, required: true },

  // assets.name String(255) NOT NULL — free-form, an asset may be "Villa 12B"
  assetName: { kind: KIND.TEXT, label: 'Asset name', maxLen: 255, required: true, minLen: 2 },
  // assets.symbol String(50)
  symbol: { kind: KIND.SYMBOL, label: 'Symbol', maxLen: 50 },
  // assets.location String(255)
  location: { kind: KIND.TEXT, label: 'Location', maxLen: 255 },
  // assets.description — Text
  description: { kind: KIND.TEXTAREA, label: 'Description', maxLen: LONG_TEXT_MAX },
  // assets.current_value Numeric(20,2) NOT NULL
  assetValue: { kind: KIND.MONEY, label: 'Value', allowZero: true, maxLen: 25 },
  // assets.currency String(3)
  currency: { kind: KIND.CURRENCY_CODE, label: 'Currency', maxLen: 3 },

  // orders.quantity Numeric(20,8) NOT NULL
  orderQuantity: { kind: KIND.QUANTITY, label: 'Quantity', maxLen: 22, required: true },
  // orders.price / stop_price Numeric(20,2)
  orderPrice: { kind: KIND.MONEY, label: 'Price', maxLen: 25 },
  // payments.amount Numeric(20,2) NOT NULL — zero payments are meaningless
  paymentAmount: { kind: KIND.MONEY, label: 'Amount', maxLen: 25, required: true, allowZero: false },

  // investment_goals.name String(255) NOT NULL
  goalName: { kind: KIND.TEXT, label: 'Goal name', maxLen: 255, required: true, minLen: 2 },
  // investment_goals.target_amount Numeric(20,2) NOT NULL
  goalTarget: { kind: KIND.MONEY, label: 'Target amount', maxLen: 25, required: true, allowZero: false },
  // investment_goals.notes String(1000)
  goalNotes: { kind: KIND.TEXTAREA, label: 'Notes', maxLen: 1000 },

  // support_tickets.subject String(255) NOT NULL
  ticketSubject: { kind: KIND.TEXT, label: 'Subject', maxLen: 255, required: true, minLen: 3 },
  // support_tickets.description Text NOT NULL
  ticketDescription: { kind: KIND.TEXTAREA, label: 'Description', maxLen: LONG_TEXT_MAX, required: true, minLen: 10 },

  // entities.name String(255) NOT NULL
  entityName: { kind: KIND.TEXT, label: 'Entity name', maxLen: 255, required: true, minLen: 2 },
  // entities.jurisdiction String(100)
  jurisdiction: { kind: KIND.TEXT, label: 'Jurisdiction', maxLen: 100 },
  // entities.registration_number String(100)
  registrationNumber: { kind: KIND.TEXT, label: 'Registration number', maxLen: 100 },
  // entity_persons.phone String(50) — wider than users.phone
  entityPersonPhone: { kind: KIND.PHONE, label: 'Phone number', maxLen: 50 },
};

export { SPEC_TEXT_MAX, LONG_TEXT_MAX };
