import Button from '@/components/ui/Button';
import Layout from '../../components/layout/Layout';

export default function AkunubaLandingPage() {
  return (
    <Layout>
      <div className='space-y-12'>
        {/* Hero Section */}
        <section className='text-center py-12 space-y-6'>
          <h1 className='text-4xl md:text-6xl font-bold'>Welcome to Akunuba</h1>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Your complete solution for digital growth and success
          </p>
          <div className='flex justify-center gap-4'>
            <Button variant='primary'>Get Started</Button>
            <Button variant='secondary'>Learn More</Button>
          </div>
        </section>

        {/* Features Section */}
        <section className='grid grid-cols-1 md:grid-cols-3 gap-8 py-12'>
          <div className='space-y-4 text-center'>
            <h3 className='text-xl font-bold'>Easy Integration</h3>
            <p className='text-gray-600'>
              Seamlessly integrate with your existing systems
            </p>
          </div>
          <div className='space-y-4 text-center'>
            <h3 className='text-xl font-bold'>Powerful Analytics</h3>
            <p className='text-gray-600'>Get insights that drive growth</p>
          </div>
          <div className='space-y-4 text-center'>
            <h3 className='text-xl font-bold'>24/7 Support</h3>
            <p className='text-gray-600'>Expert help whenever you need it</p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
