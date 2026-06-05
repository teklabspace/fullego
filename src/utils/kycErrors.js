/** Persona inquiries.create API disabled on backend (needs hosted flow). */
export function isPersonaInquiryCreateDisabledError(err) {
  const text = `${err?.message || ''} ${err?.data?.detail || ''}`.toLowerCase();
  return (
    err?.isPersonaHostedFlowRequired === true ||
    text.includes('inquiries.create') ||
    text.includes('inquiries.create.api') ||
    (text.includes('forbidden') && text.includes('not enabled'))
  );
}

export function isPersonaInquiryCreateMessage(text) {
  return `${text || ''}`.toLowerCase().includes('inquiries.create');
}
