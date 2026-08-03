'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Apple } from 'lucide-react';

export default function LoginPage() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
        if (data.data?.token) {
          localStorage.setItem('token', data.data.token);
          alert('تم تسجيل الدخول بنجاح!');
          router.push('/');
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-w-[360px] w-full mx-auto flex flex-col items-center">
        {!showEmailForm ? (
          <>
            <h1 className="text-[#087083] text-[28px] font-black tracking-wider mb-2 mt-2 font-sans">ABQOR</h1>
            <h2 className="text-[#087083] font-bold text-lg mb-8">تسجيل الدخول</h2>

            <div className="w-full space-y-3">
              <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors">
                <span className="text-gray-700 font-semibold text-sm">Google</span>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>

              <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors">
                <span className="text-gray-700 font-semibold text-sm">App Store</span>
                <Apple size={18} className="text-black fill-black" />
              </button>

              <div className="pt-2">
                <button 
                  onClick={() => setShowEmailForm(true)}
                  className="w-full bg-[#087083] hover:bg-[#065b6a] text-white font-bold rounded-xl py-3 transition-colors text-sm"
                >
                  متابعة الدخول بإستخدام الايميل
                </button>
              </div>
            </div>

            <div className="mt-8 mb-2">
              <p className="text-gray-400 text-xs font-semibold">
                لدي حساب، <Link href="#" onClick={(e) => { e.preventDefault(); setShowEmailForm(true); }} className="text-[#087083] font-bold hover:underline">دخول</Link>
              </p>
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
            
            <h2 className="text-[#087083] text-xl font-bold text-center mb-6">تسجيل الدخول</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 block">البريد الإلكتروني</label>
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
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-gray-700 block">كلمة المرور</label>
                  <Link href="#" className="text-xs text-[#087083] hover:underline font-semibold">
                    نسيت كلمة المرور؟
                  </Link>
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
                className="w-full bg-[#087083] hover:bg-[#065b6a] text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-[#087083]/20 transition-all transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center mt-6"
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
