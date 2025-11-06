'use client';
import Layout from '../../components/layout/Layout';

const AboutPage = () => {
  return (
    <Layout>
      <div className='space-y-8'>
        <section className='text-center space-y-4'>
          <h1 className='text-4xl md:text-6xl font-bold'>About Fullego</h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            Learn about our mission and values
          </p>
        </section>

        {/* About content sections */}
        <section className='grid grid-cols-1 md:grid-cols-2 gap-8 py-12'>
          <div className='space-y-4'>
            <h2 className='text-2xl font-bold'>Our Mission</h2>
            <p className='text-gray-600'>Add your mission statement here...</p>
          </div>
          <div className='space-y-4'>
            <h2 className='text-2xl font-bold'>Our Vision</h2>
            <p className='text-gray-600'>Add your vision statement here...</p>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;
