import Navbar from '@/components/layout/Navbar';

export default function Concierge() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1a1f1a] to-[#0f140f] text-brand-white">
      <Navbar />
      <section id="concierge" className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">Concierge</h1>
          <p className="text-brand-muted text-lg">
            Premium concierge services for elite clients
          </p>
        </div>
      </section>
    </div>
  );
}

