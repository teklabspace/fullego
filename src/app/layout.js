import { Poppins } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';

const poppins = Poppins({
  variable: '--font-poppins',
  weight: ['400', '700'],
  subsets: ['latin'],
});

export const metadata = {
  title: 'Fullego - Your Digital Growth Partner',
  description:
    'Fullego helps businesses achieve digital success through powerful tools and expert support',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning={true}>
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
