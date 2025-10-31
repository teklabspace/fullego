import Navbar from '@/components/layout/Navbar';

export default function Marketplace() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1a1a1f] to-[#0f0f14] text-brand-white">
      <Navbar />
      <section id="marketplace" className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">Marketplace</h1>
          <p className="text-brand-muted text-lg">
            Discover investment opportunities and luxury assets
          </p>
        </div>
      </section>
    </div>
  );
}

