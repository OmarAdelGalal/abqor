'use client';

import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Device-Id': 'web-client-' + Math.random().toString(36).substring(7),
          'X-Device-Class': 'desktop'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.isSuccess) {
        // api route passes envelope through, so token is at data.data.token
        const token = data?.data?.token;
        if (token) {
          // Use same key as the rest of the app ('abqor_token')
          localStorage.setItem('abqor_token', token);
          onClose();
          router.push('/dashboard');
        } else {
          alert('فشل تسجيل الدخول: استجابة غير صالحة من الخادم');
        }
      } else {
        alert(data.message || 'فشل تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.');
    } finally {
      setIsLoading(false);
    }
  };

  // When closing, also reset the form view
  const handleClose = () => {
    setShowEmailForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleClose}>
      <div 
        className="bg-white rounded-3xl p-8 w-full max-w-[400px] shadow-2xl relative mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {!showEmailForm ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-[28px] font-black tracking-wider uppercase text-[#066e85] mb-2">ABQOR</h2>
              <p className="text-lg font-bold text-[#066e85]">تسجيل الدخول</p>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              <button className="flex flex-row items-center justify-center gap-3 w-full border border-gray-200 rounded-xl py-3 hover:bg-gray-50 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.7 16.82 16.92 15.6 17.74V20.48H19.16C21.24 18.57 22.56 15.68 22.56 12.25Z" fill="#4285F4"/>
                  <path d="M12 23C14.97 23 17.46 22.02 19.16 20.48L15.6 17.74C14.68 18.36 13.44 18.75 12 18.75C9.22 18.75 6.86 16.87 6.03 14.36H2.36V17.21C4.14 20.75 7.78 23 12 23Z" fill="#34A853"/>
                  <path d="M6.03 14.36C5.82 13.73 5.7 13.06 5.7 12.38C5.7 11.69 5.82 11.02 6.03 10.39V7.54H2.36C1.61 9.03 1.19 10.66 1.19 12.38C1.19 14.09 1.61 15.72 2.36 17.21L6.03 14.36Z" fill="#FBBC05"/>
                  <path d="M12 6.01C13.62 6.01 15.06 6.57 16.2 7.66L19.24 4.62C17.46 2.97 14.97 2 12 2C7.78 2 4.14 4.25 2.36 7.54L6.03 10.39C6.86 7.88 9.22 6.01 12 6.01Z" fill="#EA4335"/>
                </svg>
                <span className="text-gray-700 font-semibold text-sm" style={{fontFamily: 'sans-serif'}}>Google</span>
              </button>

              <button className="flex flex-row items-center justify-center gap-3 w-full border border-gray-200 rounded-xl py-3 hover:bg-gray-50 transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.05 16.73c-0.12 0.35-0.29 0.74-0.49 1.15-0.9 1.76-1.85 3.53-3.8 3.56-1.91 0.03-2.55-1.14-4.73-1.14-2.18 0-2.88 1.11-4.71 1.18-1.91 0.06-3.03-1.92-3.95-3.69-1.85-3.56-3.26-10.05-1.37-14.47 0.94-2.19 3.12-3.59 5.48-3.62 1.83-0.03 3.56 1.25 4.68 1.25 1.12 0 3.2-1.52 5.39-1.29 0.91 0.04 3.49 0.37 5.14 2.78-0.13 0.08-3.07 1.8-3.04 5.3 0.04 4.21 3.56 5.56 3.6 5.58-0.03 0.09-0.56 1.91-1.7 3.56h0zM15.54 5.12c0.82-0.99 1.37-2.38 1.22-3.77-1.19 0.05-2.65 0.79-3.5 1.81-0.75 0.89-1.4 2.3-1.22 3.69 1.34 0.1 2.68-0.73 3.5-1.73z" fill="black"/>
                </svg>
                <span className="text-gray-700 font-semibold text-sm" style={{fontFamily: 'sans-serif'}}>App Store</span>
              </button>
            </div>

            <button 
              onClick={() => setShowEmailForm(true)}
              className="w-full bg-[#066e85] hover:bg-[#055b6e] text-white font-medium rounded-xl py-3.5 transition-colors text-[15px] mb-6 shadow-sm hover:shadow-md"
            >
              متابعة الدخول بإستخدام الايميل
            </button>

            <div className="text-center text-[15px]">
              <span className="text-gray-500">لدي حساب، </span>
              <button onClick={() => setShowEmailForm(true)} className="text-[#1fa6ba] font-bold hover:underline">دخول</button>
            </div>
          </>
        ) : (
          <div className="w-full">
            <button 
              onClick={() => setShowEmailForm(false)}
              className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[#087083] transition-colors text-sm font-semibold"
            >
              <ArrowRight size={16} /> عودة
            </button>
            
            <h2 className="text-[#066e85] text-xl font-bold text-center mb-6">تسجيل الدخول</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 block text-right">البريد الإلكتروني</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-[#087083] focus:ring-1 focus:ring-[#087083] outline-none transition-all text-sm"
                    placeholder="name@example.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center flex-row-reverse">
                  <Link href="#" className="text-xs text-[#087083] hover:underline font-semibold">
                    نسيت كلمة المرور؟
                  </Link>
                  <label className="text-sm font-bold text-gray-700 block">كلمة المرور</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-[#087083] focus:ring-1 focus:ring-[#087083] outline-none transition-all text-sm"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#066e85] hover:bg-[#055b6e] text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-[#087083]/20 transition-all transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center mt-6"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'دخول'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
