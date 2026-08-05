'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthModal from '@/components/auth/AuthModal';

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pathname = usePathname();
  
  const authRoutes = ['/dashboard', '/learning', '/account', '/notifications'];
  const isAuthRoute = authRoutes.some(route => pathname?.startsWith(route));

  useEffect(() => {
    const handleOpen = () => setIsAuthModalOpen(true);
    window.addEventListener('open-auth-modal', handleOpen);
    return () => window.removeEventListener('open-auth-modal', handleOpen);
  }, []);

  if (isAuthRoute) return null;

  return (
    <>
      <header className="w-full bg-white sticky top-0 z-50" style={{ padding: '16px 80px' }}>
        <div className="mx-auto flex items-center justify-between flex-row-reverse max-w-[1440px]">
          <div className="text-2xl md:text-3xl font-black text-[#3DAFC1] tracking-wider uppercase font-sans select-none">
            ABQOR
          </div>
          <div>
            <Link 
              href="/onboarding"
              className="flex items-center justify-center font-medium text-white bg-[#3DAFC1] hover:bg-[#35a0b1] transition-all cursor-pointer text-lg"
              style={{
                width: '160px',
                height: '48px',
                borderRadius: '16px',
                boxShadow: '0px 4px 0px rgba(0,0,0,0.25), 0px 4px 0px #3DAFC1',
              }}
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
