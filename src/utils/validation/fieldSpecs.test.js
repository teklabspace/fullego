import { describe, expect, it } from 'vitest';
import { KIND, sanitizeForSpec, specForFieldName, validateForSpec } from './fieldSpecs';

const kindOf = label => specForFieldName(label).kind;

describe('specForFieldName', () => {
  it('mirrors the wizard renderer: dates win over everything', () => {
    expect(kindOf('Acquisition Date')).toBe(KIND.DATE);
    expect(kindOf('Purchase Date')).toBe(KIND.DATE);
  });

  it.each([
    'Purchase Price',
    'Estimated Value',
    'Current Value',
    'Replacement Cost',
    'Amount Owed',
    'Monthly Contribution',
  ])('treats %s as money', label => expect(kindOf(label)).toBe(KIND.MONEY));

  it.each(['Interest Rate', 'Annual Yield', 'Ownership Percentage'])(
    'treats %s as a percentage',
    label => expect(kindOf(label)).toBe(KIND.PERCENT)
  );

  it.each(['Description', 'Notes', 'Purpose'])('treats %s as long text', label =>
    expect(kindOf(label)).toBe(KIND.TEXTAREA)
  );

  it('resolves contact fields', () => {
    expect(kindOf('Email Address')).toBe(KIND.EMAIL);
    expect(kindOf('Phone Number')).toBe(KIND.PHONE);
    expect(kindOf('Website')).toBe(KIND.URL);
  });

  it('resolves numeric shapes', () => {
    expect(kindOf('Year')).toBe(KIND.YEAR);
    expect(kindOf('Number of Bedrooms')).toBe(KIND.INTEGER);
    expect(kindOf('Ticker Symbol')).toBe(KIND.SYMBOL);
  });

  // The distinction that keeps real data enterable.
  describe('person names vs organisation names', () => {
    it.each([
      'First Name',
      'Last Name',
      'Cardholder Name',
      'Beneficiary Name',
      'Trustee Name',
      'City',
      'Country',
    ])('%s is letters-only', label => expect(kindOf(label)).toBe(KIND.NAME));

    it.each([
      'Company Name',
      'Bank Name',
      'Institution Name',
      'Fund Name',
      'Issuer Name',
      'Manufacturer',
      'Trust Name',
    ])('%s stays free-form', label => expect(kindOf(label)).toBe(KIND.TEXT));
  });

  it('leaves ordinary asset fields free-form', () => {
    expect(kindOf('Model')).toBe(KIND.TEXT);
    expect(kindOf('Serial Number')).toBe(KIND.TEXT);
    expect(kindOf('Location')).toBe(KIND.TEXT);
  });

  it('applies overrides last', () => {
    const spec = specForFieldName('Model', { required: true, maxLen: 10 });
    expect(spec.required).toBe(true);
    expect(spec.maxLen).toBe(10);
  });
});

describe('sanitizeForSpec', () => {
  it('strips digits from a person name', () => {
    expect(sanitizeForSpec(specForFieldName('First Name'), 'John123')).toBe('John');
  });

  it('keeps digits in an organisation name', () => {
    expect(sanitizeForSpec(specForFieldName('Company Name'), 'Studio 54 Ltd')).toBe(
      'Studio 54 Ltd'
    );
  });

  it('keeps digits in a free-form asset field', () => {
    expect(sanitizeForSpec(specForFieldName('Model'), '911 Turbo')).toBe('911 Turbo');
    expect(sanitizeForSpec(specForFieldName('Location'), '40 Ocean Drive')).toBe(
      '40 Ocean Drive'
    );
  });

  it('strips letters from a money field', () => {
    expect(sanitizeForSpec(specForFieldName('Purchase Price'), '$1,200.50abc')).toBe(
      '1200.50'
    );
  });

  it('caps a percentage to 2 decimals', () => {
    expect(sanitizeForSpec(specForFieldName('Interest Rate'), '4.2599')).toBe('4.25');
  });

  it('never rewrites a password mid-typing', () => {
    const spec = specForFieldName('Password');
    expect(sanitizeForSpec(spec, 'p@$$w0rd!')).toBe('p@$$w0rd!');
  });

  it('caps a year at four digits', () => {
    expect(sanitizeForSpec(specForFieldName('Year'), '19988')).toBe('1998');
  });
});

describe('validateForSpec', () => {
  it('reports required fields by their label', () => {
    const spec = specForFieldName('Serial Number', { required: true });
    expect(validateForSpec(spec, '')).toBe('Serial Number is required');
  });

  it('passes blank through when not required', () => {
    expect(validateForSpec(specForFieldName('Serial Number'), '')).toBeNull();
  });

  it('rejects a zero purchase price only when configured to', () => {
    const optional = specForFieldName('Purchase Price'); // allowZero defaults on
    expect(validateForSpec(optional, '0')).toBeNull();

    const strict = specForFieldName('Purchase Price', { allowZero: false });
    expect(validateForSpec(strict, '0')).toMatch(/greater than zero/);
  });

  it('rejects an over-100 percentage', () => {
    expect(validateForSpec(specForFieldName('Interest Rate'), '150')).toMatch(
      /cannot be more than 100/
    );
  });

  it('never blocks a select or file field', () => {
    expect(validateForSpec(specForFieldName('Condition'), 'anything')).toBeNull();
    expect(validateForSpec(specForFieldName('Image'), 'anything')).toBeNull();
  });
});
