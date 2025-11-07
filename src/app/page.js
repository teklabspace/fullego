import Navbar from '@/components/layout/Navbar';
import Hero from '@/components/sections/Hero';
import FirstSection from '@/components/sections/FirstSection';
import WealthSolutions from '@/components/sections/WealthSolutions';
import HowToGetStarted from '@/components/sections/HowToGetStarted';
import FAQ from '@/components/sections/FAQ';
import Footer from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#101014] text-brand-white">
      <Navbar />
      <Hero />
      <FirstSection />
      <WealthSolutions />
      <HowToGetStarted />
      <FAQ />
      <Footer />
    </div>
  );
}
