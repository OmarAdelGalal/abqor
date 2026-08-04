'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { authApi } from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // api.ts interceptor unwraps the envelope, so 'data' IS the inner data object
      // Backend login returns: { token, id, name, email, role, ... }
      const data = await authApi.login({ email, password });

      const token = data?.token;
      if (token) {
        // Persist to both localStorage and Zustand store
        useAuthStore.getState().setAuth(token, {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          avatar: data.avatar,
        });
        router.push('/dashboard');
      } else {
        setError('استجابة غير متوقعة من الخادم. يرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || 'حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4" dir="rtl">
      <div className="max-w-[400px] mx-auto w-full pt-4">
        
        {/* Header / Back Button */}
        <div className="flex items-center mb-10">
          <Link href="/" className="text-gray-800 hover:text-gray-600 transition-colors">
            <ArrowRight size={24} />
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1FA6BA]">تسجيل الدخول</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email */}
          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-[#004e70] block">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-gray-200 focus:border-[#1FA6BA] focus:ring-1 focus:ring-[#1FA6BA] outline-none transition-all bg-white text-right placeholder-gray-400"
                placeholder="user@user.gmail.com"
                dir="ltr"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-[#004e70] block">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pr-10 pl-12 py-3 rounded-xl border border-gray-200 focus:border-[#1FA6BA] focus:ring-1 focus:ring-[#1FA6BA] outline-none transition-all bg-white text-right tracking-widest placeholder:tracking-normal"
                placeholder="••••••••"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Forgot Password & Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-gray-700">
              نسيت كلمة المرور؟
            </Link>
            <label className="flex items-center cursor-pointer gap-2">
              <span className="text-sm text-gray-500">تذكرني</span>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#1FA6BA] focus:ring-[#1FA6BA] border-gray-300"
              />
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 mt-4 text-[#ef4444] bg-white pt-2">
              <div className="flex-1 text-right text-xs font-medium leading-relaxed">
                {error}
              </div>
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#004e70] hover:bg-[#003d58] text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 flex justify-center items-center mt-6"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'ابدأ الآن'
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-4 text-center text-sm text-gray-500">
          ليس لديك حساب{' '}
          <Link href="/register" className="text-[#1FA6BA] font-bold hover:underline">
            سجل هنا
          </Link>
        </div>

        {/* Divider */}
        <div className="w-full relative py-6 mt-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dotted border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-400">إنشاء حساب بواسطة</span>
          </div>
        </div>

        {/* Social Buttons Row */}
        <div className="flex gap-3 pb-8">
          <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700">
            <span className="text-sm">Google</span>
            <FcGoogle size={20} />
          </button>
          
          <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700">
            <span className="text-sm">App Store</span>
            <FaApple size={20} className="mb-1" />
          </button>
        </div>

      </div>
    </div>
  );
}
