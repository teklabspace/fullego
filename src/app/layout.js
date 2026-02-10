import { Poppins } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import ToastProvider from '@/components/providers/ToastProvider';

const poppins = Poppins({
  variable: '--font-poppins',
  weight: ['400', '700'],
  subsets: ['latin'],
});

export const metadata = {
  title: 'Akunuba - Your Digital Growth Partner',
  description:
    'Akunuba helps businesses achieve digital success through powerful tools and expert support',
  icons: {
    icon: '/favicon/fav.svg',
    shortcut: '/favicon/fav.svg',
    apple: '/favicon/fav.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning={true}>
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
