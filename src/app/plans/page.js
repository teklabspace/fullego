import Navbar from '@/components/layout/Navbar';

export default function Plans() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1f1a1f] to-[#14141a] text-brand-white">
      <Navbar />
      <section id="plans" className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">Plans</h1>
          <p className="text-brand-muted text-lg">
            Choose the perfect plan for your financial journey
          </p>
        </div>
      </section>
    </div>
  );
}

