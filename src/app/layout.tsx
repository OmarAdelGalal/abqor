import './globals.css';
import type { Metadata } from 'next';
import { Cairo, Changa } from 'next/font/google';
import React from 'react';
import Header from '@/components/layout/Header';

const cairo = Cairo({ 
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

const changa = Changa({
  subsets: ['arabic', 'latin'],
  weight: ['600', '700', '800'],
  variable: '--font-changa',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ABQOR - منصة عبقر التعليمية',
  description: 'المنصة التعليمية الأولى للطلاب - عبقر',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${changa.variable} font-sans`}>
      <body className="min-h-screen bg-background text-text-main flex flex-col">
        <Header />

        <main className="flex-1">
          {children}
        </main>

        <footer className="w-full bg-white py-8 border-t border-gray-200 mt-20">
          <div className="container mx-auto px-4 text-center text-text-muted">
            <p>© {new Date().getFullYear()} منصة عبقر التعليمية. جميع الحقوق محفوظة.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
