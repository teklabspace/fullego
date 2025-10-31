import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-white">
      <Navbar />
      <Hero />
    </div>
  );
}
