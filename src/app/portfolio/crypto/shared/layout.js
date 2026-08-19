// Public, unauthenticated route — deliberately outside /dashboard so it is not
// wrapped by DashboardLayout -> SecureRoute (which would bounce anonymous
// visitors to /login). The access code arrives as a `?code=` query param, so
// there is no dynamic segment here and no generateStaticParams shell is needed.
export const metadata = {
  title: 'Shared Crypto Portfolio — Akunuba',
  description: 'View a crypto portfolio shared with you on Akunuba.',
};

export default function SharedCryptoPortfolioLayout({ children }) {
  return children;
}
