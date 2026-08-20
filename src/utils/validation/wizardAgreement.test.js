/**
 * The asset wizard picks a WIDGET from a field's label, and the validation layer
 * picks a RULE from the same label. When those two disagree about whether a
 * field is typed into, the wizard can raise an error on a dropdown — which has
 * nowhere to display it, leaving the user blocked by an invisible message.
 *
 * That happened with "Payment Frequency": the label contains "payment", which
 * the money matcher claimed before the dropdown check could, so choosing
 * "Monthly" produced "Payment Frequency must be a number" on a <select>.
 *
 * These tests pin the invariant across every label the app can actually render.
 */
import { describe, expect, it } from 'vitest';
import { categoryGroupConfig } from '@/config/assetConfig';
import { getFieldWidget } from '@/config/assetFieldWidget';
import { KIND, specForFieldName, validateForSpec } from './fieldSpecs';

// Widgets the user types into; everything else is a dropdown, date picker or
// file input and has no error slot.
const TYPED_WIDGETS = new Set(['text', 'currency', 'percentage', 'textarea']);
// Spec kinds that never produce a message.
const SILENT_KINDS = new Set([KIND.SELECT, KIND.FILE, KIND.DATE]);

const allLabels = () => {
  const labels = new Set();
  Object.values(categoryGroupConfig).forEach(group =>
    (group.formFields || []).forEach(field => labels.add(field))
  );
  return [...labels];
};

describe('wizard widget / validation-rule agreement', () => {
  it('has labels to check', () => {
    expect(allLabels().length).toBeGreaterThan(20);
  });

  it('never attaches a typed rule to a field rendered as a dropdown', () => {
    const offenders = allLabels()
      .filter(label => {
        const lower = label.toLowerCase();
        // The renderer handles these specially and they carry their own rules.
        if (lower.includes('image') || lower.includes('tag')) return false;
        if (label === 'Make/Model/Year' || label === 'Category') return false;

        const widget = getFieldWidget(label);
        const { kind } = specForFieldName(label);
        return !TYPED_WIDGETS.has(widget) && !SILENT_KINDS.has(kind);
      })
      .map(label => `${label} (widget=${getFieldWidget(label)}, kind=${specForFieldName(label).kind})`);

    expect(offenders).toEqual([]);
  });

  it('never attaches a silent rule to a field the user types into', () => {
    const offenders = allLabels()
      .filter(label => {
        const lower = label.toLowerCase();
        if (lower.includes('image') || lower.includes('tag')) return false;
        if (label === 'Make/Model/Year' || label === 'Category') return false;

        const widget = getFieldWidget(label);
        const { kind } = specForFieldName(label);
        return TYPED_WIDGETS.has(widget) && SILENT_KINDS.has(kind);
      })
      .map(label => `${label} (widget=${getFieldWidget(label)})`);

    expect(offenders).toEqual([]);
  });

  // The concrete regression: picking any real dropdown value must not error.
  it('accepts every option the Payment Frequency dropdown offers', () => {
    const spec = specForFieldName('Payment Frequency');
    ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual'].forEach(option => {
      expect(validateForSpec(spec, option)).toBeNull();
    });
  });

  it('accepts every option the Currency dropdown offers', () => {
    const spec = specForFieldName('Currency');
    ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'].forEach(option => {
      expect(validateForSpec(spec, option)).toBeNull();
    });
  });

  it('accepts every option the Risk Level and Condition dropdowns offer', () => {
    ['Low', 'Medium', 'High'].forEach(option => {
      expect(validateForSpec(specForFieldName('Risk Level'), option)).toBeNull();
    });
    ['Excellent', 'Good', 'Fair', 'Poor'].forEach(option => {
      expect(validateForSpec(specForFieldName('Condition'), option)).toBeNull();
    });
  });

  // Money labels must keep working — the fix must not over-correct.
  it('still treats real money labels as money', () => {
    ['Amount Owed', 'Current Value', 'Purchase Price', 'Estimated Value'].forEach(
      label => {
        expect(specForFieldName(label).kind).toBe(KIND.MONEY);
      }
    );
  });

  it('still treats a monthly contribution amount as money', () => {
    expect(specForFieldName('Monthly Contribution').kind).toBe(KIND.MONEY);
  });

  // A blank, untouched form must never block the step.
  it('raises nothing on a completely empty form', () => {
    const blocked = allLabels().filter(label => {
      const spec = specForFieldName(label, { required: label === 'Asset Name' });
      return Boolean(validateForSpec(spec, undefined)) && label !== 'Asset Name';
    });
    expect(blocked).toEqual([]);
  });
});
