'use client';

import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import Container from '../ui/Container';

const carouselImages = [
  '/first_crousel_images/freepik__the-style-is-3d-model-with-octane-render-volumetri__820 1.png',
  '/first_crousel_images/freepik__the-style-is-3d-model-with-octane-render-volumetri__823-removebg-preview_upscaled (1) 1.png',
  '/first_crousel_images/freepik__the-style-is-3d-model-with-octane-render-volumetri__90775 1.png',
  '/first_crousel_images/freepik__the-style-is-3d-model-with-octane-render-volumetri__90776 1.png',
];

const FirstSection = () => {
  const carouselRef = useRef(null);

  useEffect(() => {
    if (carouselRef.current) {
      const carousel = carouselRef.current;
      const images = carousel.querySelectorAll('.carousel-item');

      // Duplicate images for seamless loop
      images.forEach(img => {
        const clone = img.cloneNode(true);
        carousel.appendChild(clone);
      });

      // GSAP infinite scroll animation
      gsap.to(carousel, {
        x: '-50%',
        duration: 20,
        ease: 'none',
        repeat: -1,
      });
    }
  }, []);

  return (
    <section className='relative py-8 sm:py-10 md:py-12 lg:py-16 bg-brand-bg overflow-hidden'>
      <Container>
        <div className='relative mx-auto w-full max-w-[1280px] h-[500px] sm:h-[700px] md:h-[900px] lg:h-[876px]'>
          {/* Gold Blur Ellipse - Left */}
          <div
            className='absolute w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:w-[350px] md:h-[350px] lg:w-[420px] lg:h-[420px] left-[20px] sm:left-[30px] md:left-[35px] lg:left-[40px] top-[20px] sm:top-[30px] md:top-[35px] lg:top-[40px] pointer-events-none'
            style={{
              background: '#F1CB68',
              filter: 'blur(150px)',
            }}
          />

          {/* Blue Blur Ellipse - Right */}
          <div
            className='absolute w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:w-[350px] md:h-[350px] lg:w-[420px] lg:h-[420px] right-[20px] sm:right-[80px] md:right-[120px] lg:left-[740px] top-[20px] sm:top-[30px] md:top-[35px] lg:top-[40px] pointer-events-none'
            style={{
              background: '#423DC7',
              filter: 'blur(150px)',
            }}
          />

          {/* Glass Frame Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className='absolute left-0 top-0 w-[95%] sm:w-[92%] md:w-[90%] lg:w-full max-w-[1200px] h-[450px] sm:h-[620px] md:h-[780px] lg:h-[876px] mx-auto'
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(30px)',
              borderRadius: '20px',
            }}
          >
            {/* Left Vertical Line - Gold Gradient - Hidden on small screens */}
            <div
              className='hidden md:block absolute left-0 top-[30px] w-[150px] md:w-[200px] lg:w-[252px] h-[2px]'
              style={{
                background:
                  'linear-gradient(90deg, rgba(241, 203, 104, 0) 0%, #F1CB68 52%, rgba(241, 203, 104, 0) 100%)',
                transform: 'rotate(90deg)',
                transformOrigin: 'top left',
              }}
            />

            {/* Right Vertical Line - Blue Gradient - Hidden on small screens */}
            <div
              className='hidden md:block absolute right-[-150px] md:right-[-200px] lg:right-[-248px] top-[100px] md:top-[140px] lg:top-[173px] w-[150px] md:w-[200px] lg:w-[252px] h-[2px]'
              style={{
                background:
                  'linear-gradient(90deg, rgba(66, 61, 199, 0) 0%, #423DC7 52%, rgba(66, 61, 199, 0) 100%)',
                transform: 'rotate(90deg)',
                transformOrigin: 'top left',
              }}
            />

            {/* Inner Dashboard Container */}
            <div
              className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[88%] md:w-[85%] lg:w-[1120px] h-[350px] sm:h-[500px] md:h-[650px] lg:h-[796.44px] overflow-hidden'
              style={{
                background: '#101014',
                borderRadius: '16px',
              }}
            >
              {/* Dashboard Image */}
              <div className='relative w-full h-full sm:h-[500px] md:h-[650px] lg:h-[796px] top-0 sm:top-[15px] md:top-[25px] lg:top-[33px]'>
                <Image
                  src='/FirstSection.png'
                  alt='Dashboard Preview'
                  fill
                  className='object-cover object-top'
                  priority
                />
              </div>

              {/* Bottom Gradient Overlay (inside inner frame) */}
              <div
                className='absolute w-full sm:w-[85%] md:w-[80%] lg:w-[910px] h-[50px] sm:h-[60px] md:h-[70px] lg:h-[81.67px] right-0 bottom-0 pointer-events-none'
                style={{
                  background:
                    'linear-gradient(180deg, rgba(19, 19, 23, 0) 0%, #131317 100%)',
                }}
              />
            </div>

            {/* Outer Bottom Gradient Overlay */}
            <div
              className='absolute w-full h-[180px] sm:h-[250px] md:h-[320px] lg:h-[382px] left-0 bottom-0 pointer-events-none'
              style={{
                background:
                  'linear-gradient(180deg, rgba(16, 16, 20, 0) 0%, #101014 100%)',
              }}
            />
          </motion.div>
        </div>

        {/* Auto-Running Carousel - Bottom */}
        <div className='relative mt-10 w-full overflow-hidden'>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className='relative'
          >
            <div
              ref={carouselRef}
              className='flex gap-6 sm:gap-8 md:gap-10 lg:gap-12'
              style={{ width: 'max-content' }}
            >
              {carouselImages.map((image, index) => (
                <motion.div
                  key={index}
                  className='carousel-item relative w-[280px] h-[82px]'
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className='relative w-full h-full'>
                    <Image
                      src={image}
                      alt={`Carousel ${index + 1}`}
                      fill
                      className='object-contain'
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Our Solutions Button
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className='relative mt-16 sm:mt-20 flex justify-center'
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='flex flex-row items-center justify-center gap-2 px-5 py-[14px] w-[158px] h-[56px]'
            style={{
              background: '#313035',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(2px)',
              borderRadius: '99px',
            }}
          >
            <img src='/StarIcon.svg' alt='' />
            <span className='text-white text-nowrap text-sm font-medium'>
              Our Solutions
            </span>
          </motion.button>
        </motion.div> */}
      </Container>
    </section>
  );
};

export default FirstSection;
