'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight } from 'lucide-react';
import { authApi } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      localStorage.setItem('forgotPasswordEmail', email);
      setIsSent(true);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
         alert(err.response.data.message);
      } else {
         alert('حدث خطأ. الرجاء المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsSent(false);
    router.push('/forgot-password/otp');
  };

  return (
    <div className="min-h-screen bg-white p-4 relative" dir="rtl">
      
      {/* Dimmed Background Overlay when Modal is Active */}
      {isSent && (
        <div className="absolute inset-0 bg-black/40 z-40" />
      )}

      {/* Main Content */}
      <div className={`max-w-[400px] mx-auto w-full pt-4 ${isSent ? 'blur-sm pointer-events-none' : ''}`}>
        
        {/* Header / Back Button */}
        <div className="flex items-center mb-16">
          <Link href="/login" className="text-gray-800 hover:text-gray-600 transition-colors">
            <ArrowRight size={24} />
          </Link>
        </div>

        {/* Headings */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-[#1FA6BA] mb-3">البريد الإلكتروني</h1>
          <p className="text-gray-400 text-sm leading-relaxed px-2 font-medium">
            قم بكتابة الإيميل الذي قمت بالتسجيل الدخول به، لإرسال رابط تعيين كلمة المرور اليه.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-6">
          
          {/* Email */}
          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-[#004e70] block">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1FA6BA] focus:ring-1 focus:ring-[#1FA6BA] outline-none transition-all bg-white text-right placeholder-gray-400"
                placeholder="user@usre.gmail.com"
                dir="ltr"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#004e70] hover:bg-[#003d58] text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 flex justify-center items-center mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'إرسال'
            )}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {isSent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-3xl p-6 max-w-[340px] w-full flex flex-col items-center shadow-xl text-center">
            
            {/* Illustration */}
            <div className="mb-4">
              <img 
                src="/c518e28edf6bef8d0d46fdbfb27871175eb44f11.png" 
                alt="Email Sent" 
                className="w-32 h-auto object-contain"
                onError={(e) => { 
                  e.currentTarget.outerHTML = '<div class="text-[80px] text-center mb-2">🤷‍♂️</div>' 
                }} 
              />
            </div>

            {/* Modal Headings */}
            <h2 className="text-lg font-bold text-gray-800 mb-2">تم إرسال رابط إعادة التعيين</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium px-2">
              تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من بريدك واتبع الرابط لاستعادة الوصول إلى حسابك.
            </p>

            {/* Modal Button */}
            <button
              onClick={handleModalClose}
              className="w-full bg-[#004e70] hover:bg-[#003d58] text-white font-bold py-3 px-4 rounded-xl transition-colors"
            >
              فهمت
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
