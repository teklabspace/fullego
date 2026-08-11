// Layout file to handle generateStaticParams for static export.
// These are the platform strategies' deterministic ids — identical in every
// environment (see backend doc/FRONTEND_PORTFOLIO_API_CHANGES.md §2).
export async function generateStaticParams() {
  return [
    { id: '751b8f8a-9dbe-5f4e-95b0-a9688212b985' }, // Growth Momentum
    { id: '9178113a-ec77-5ef4-b931-83032f8cc78e' }, // Value Dividend Income
    { id: '7814fe3b-eae2-558b-8056-0d147ef58bbb' }, // Crypto DCA Core
    { id: '0fcb4b49-b3c6-5cf7-bc3a-1b0b55eb65b1' }, // Balanced 60/40 Plus
  ];
}

export default function StrategyLayout({ children }) {
  return children;
}


