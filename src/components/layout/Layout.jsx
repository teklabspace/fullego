import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

