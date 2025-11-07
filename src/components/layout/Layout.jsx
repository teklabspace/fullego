import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#101014] text-brand-white">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

