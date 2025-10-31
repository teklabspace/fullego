import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function Support() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1a1a24] to-[#0f0f18] text-brand-white">
      <Navbar />
      <section id="support" className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">Support</h1>
          <p className="text-brand-muted text-lg">
            24/7 support for all your inquiries
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}

