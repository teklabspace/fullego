'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: '100vh',
            background: '#101014',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1
              style={{
                color: 'white',
                fontSize: '4rem',
                fontWeight: 'bold',
                marginBottom: '2rem',
              }}
            >
              Oops!
            </h1>
            <button
              className='rounded-full'
              onClick={() => (window.location.href = '/')}
              style={{
                padding: '1rem 2rem',
                background: 'transparent',
                borderImage:
                  'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%) 1',
                background: 'linear-gradient(90deg, #FFFFFF 0%, #F1CB68 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: '600',
                fontSize: '1.125rem',
                cursor: 'pointer',
              }}
            >
              Take me Home →
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
