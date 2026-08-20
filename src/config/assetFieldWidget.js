/**
 * Which widget the asset wizard renders for a given field label.
 *
 * This lives in its own module because TWO things need to agree on it: the
 * wizard's renderer (which draws the control) and the validation layer (which
 * decides the rule). When they each had their own copy of this logic they
 * drifted — "Payment Frequency" was drawn as a dropdown but validated as a
 * money field, so choosing "Monthly" produced an error message on a control
 * that has nowhere to show one, blocking the step with nothing highlighted.
 *
 * Deliberately data-free so importing it costs nothing; the category field
 * lists live in assetConfig.js.
 */

export const FIELD_WIDGET = {
  DATE: 'date',
  CURRENCY: 'currency',
  PERCENTAGE: 'percentage',
  TEXTAREA: 'textarea',
  FILE: 'file',
  SELECT: 'select',
  TEXT: 'text',
};

/**
 * Order matters: the first match wins, and it is the same order the wizard has
 * always used. Do not reorder without checking every category's fields.
 */
export const getFieldWidget = fieldName => {
  const lowerName = String(fieldName || '').toLowerCase();

  if (lowerName.includes('date')) return FIELD_WIDGET.DATE;

  if (
    lowerName.includes('price') ||
    lowerName.includes('value') ||
    lowerName.includes('cost') ||
    lowerName.includes('owed')
  )
    return FIELD_WIDGET.CURRENCY;

  if (lowerName.includes('rate') || lowerName.includes('interest'))
    return FIELD_WIDGET.PERCENTAGE;

  if (
    lowerName.includes('description') ||
    lowerName.includes('notes') ||
    lowerName.includes('purpose')
  )
    return FIELD_WIDGET.TEXTAREA;

  if (lowerName.includes('image')) return FIELD_WIDGET.FILE;

  if (lowerName.includes('condition')) return FIELD_WIDGET.SELECT;
  if (lowerName.includes('ownership type')) return FIELD_WIDGET.SELECT;
  if (lowerName.includes('risk level')) return FIELD_WIDGET.SELECT;
  if (lowerName.includes('payment frequency')) return FIELD_WIDGET.SELECT;
  if (lowerName.includes('currency')) return FIELD_WIDGET.SELECT;
  if (lowerName.includes('type') && !lowerName.includes('ownership'))
    return FIELD_WIDGET.SELECT;

  return FIELD_WIDGET.TEXT;
};

/** Widgets the user types into — the only ones that can display an error. */
export const isTypedWidget = widget =>
  widget === FIELD_WIDGET.TEXT ||
  widget === FIELD_WIDGET.CURRENCY ||
  widget === FIELD_WIDGET.PERCENTAGE ||
  widget === FIELD_WIDGET.TEXTAREA;

export default getFieldWidget;
