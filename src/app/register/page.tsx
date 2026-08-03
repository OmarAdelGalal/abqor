'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Placeholder for actual API call
    setTimeout(() => {
      setIsLoading(false);
      alert('تم إنشاء الحساب بنجاح! (محاكاة)');
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-background to-primary-light/30 p-4">
      <div className="w-full max-w-md">
        
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-primary mb-6 transition-colors">
          <ArrowRight size={20} />
          العودة للرئيسية
        </Link>

        {/* Register Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-500"></div>
          
          <div className="text-center mb-8 mt-2">
            <h1 className="text-3xl font-extrabold text-text-main mb-2">إنشاء حساب جديد</h1>
            <p className="text-text-muted">انضم إلى منصة عبقر وابدأ رحلتك التعليمية</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main block">الاسم الكامل</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white/50 focus:bg-white"
                  placeholder="محمد أحمد"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main block">البريد الإلكتروني</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white/50 focus:bg-white"
                  placeholder="name@example.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main block">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white/50 focus:bg-white"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center h-[52px]"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'إنشاء حساب'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-text-muted text-sm mb-4">أو التسجيل باستخدام</p>
            <div className="flex gap-4 justify-center">
              <button type="button" className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex-1 flex justify-center items-center gap-2 font-semibold">
                Github
              </button>
              <button type="button" className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors flex-1 flex justify-center items-center gap-2 font-semibold text-blue-600">
                <span className="font-extrabold text-xl">G</span>
                Google
              </button>
            </div>
            
            <p className="mt-8 text-sm text-text-muted">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-primary font-bold hover:underline">
                سجل الدخول
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
