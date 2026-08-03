'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthModal from '@/components/auth/AuthModal';

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsAuthModalOpen(true);
    window.addEventListener('open-auth-modal', handleOpen);
    return () => window.removeEventListener('open-auth-modal', handleOpen);
  }, []);

  return (
    <>
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-2 text-2xl font-black text-[#1FA6BA] tracking-wider uppercase">
            ABQOR
          </div>
          <div>
            <Link 
              href="/onboarding"
              className="px-8 py-2.5 rounded-full font-bold text-white bg-[#1FA6BA] shadow-md hover:bg-[#188a9c] transition-all cursor-pointer inline-block"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
}
