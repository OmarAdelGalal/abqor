'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authApi } from '@/lib/auth';

export default function NewPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('forgotPasswordEmail');
    const savedCode = localStorage.getItem('resetOtp');
    if (savedEmail && savedCode) {
      setEmail(savedEmail);
      setCode(savedCode);
    } else {
      router.push('/forgot-password');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('كلمتا المرور غير متطابقتين');
      return;
    }

    if (password.length < 6) {
      alert('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email,
        code,
        password,
        password_confirmation: confirmPassword
      });
      alert('تم تغيير كلمة المرور بنجاح!');
      localStorage.removeItem('forgotPasswordEmail');
      localStorage.removeItem('resetOtp');
      router.push('/login');
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
         alert(err.response.data.message);
      } else {
         alert('حدث خطأ أثناء تغيير كلمة المرور');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4" dir="rtl">
      <div className="max-w-[400px] mx-auto w-full pt-4">
        
        <div className="flex items-center mb-16">
          <Link href="/forgot-password/otp" className="text-gray-800 hover:text-gray-600 transition-colors">
            <ArrowRight size={24} />
          </Link>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-[#1FA6BA] mb-3">إعادة تعيين كلمة المرور</h1>
          <p className="text-gray-400 text-sm leading-relaxed px-2 font-medium">
            قم بتعيين كلمة المرور الجديدة لحسابك حتى تتمكن من تسجيل الدخول
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-[#004e70] block">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pr-4 pl-12 py-3 rounded-xl border border-gray-200 focus:border-[#1FA6BA] focus:ring-1 focus:ring-[#1FA6BA] outline-none transition-all bg-white text-right tracking-widest placeholder:tracking-normal"
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

          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-[#004e70] block">
              تأكيد كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pr-4 pl-12 py-3 rounded-xl border border-gray-200 focus:border-[#1FA6BA] focus:ring-1 focus:ring-[#1FA6BA] outline-none transition-all bg-white text-right tracking-widest placeholder:tracking-normal"
                placeholder="••••••••"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full bg-[#004e70] hover:bg-[#003d58] text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 flex justify-center items-center mt-4"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'تأكيد'
            )}
          </button>
        </form>

      </div>
    </div>
  );
}