import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CartDrawer } from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  title: 'Harmony Haven Enterprise — Small Hands, Wide Reach',
  description:
    'Harmony Haven Enterprise is a growing Ghanaian enterprise building meaningful brands across food, gifting, creativity, and lifestyle. Home of Kowah’s Dishes and 4U HEARTLINES.',
  openGraph: {
    title: 'Harmony Haven Enterprise — Small Hands, Wide Reach',
    description:
      'Home of Kowah’s Dishes (Cook Less, Live More!) and 4U HEARTLINES (Where feelings find words). Order online across Ghana.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased bg-[#fdfbf7] dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-gold-200 selection:text-harmony-950 transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
