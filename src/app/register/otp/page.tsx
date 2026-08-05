'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { authApi } from '@/lib/auth';

export default function RegisterOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('registerEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      router.push('/register');
    }
  }, [router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 4) return;

    setIsLoading(true);
    try {
      await authApi.verifyRegisterOtp(email, code);
      alert('تم تأكيد الحساب بنجاح!');
      localStorage.removeItem('onboardingData');
      localStorage.removeItem('registerEmail');
      router.push('/login');
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.message) {
         alert(err.response.data.message);
      } else {
         alert('كود التحقق غير صحيح أو منتهي الصلاحية');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 relative" dir="rtl">
      <div className="max-w-[400px] mx-auto w-full pt-4">
        
        <div className="flex items-center justify-between mb-16">
          <button onClick={() => router.back()} className="text-gray-800 hover:text-gray-600 transition-colors">
            <ArrowRight size={24} />
          </button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-[#1FA6BA] mb-3">كود التحقق</h1>
          <p className="text-gray-400 text-sm leading-relaxed px-2 font-medium">
            قم بكتابة كود التحقق المرسل إلى الايميل الذي قمت بادخاله مسبقا
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-8">
          <div className="flex justify-center gap-3 md:gap-4" dir="ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 md:w-16 md:h-16 text-center text-2xl font-bold text-[#004e70] bg-white border border-gray-200 rounded-xl focus:border-[#1FA6BA] focus:ring-1 focus:ring-[#1FA6BA] outline-none transition-all shadow-sm"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 4}
            className="w-full bg-[#004e70] hover:bg-[#003d58] text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'تأكيد'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium">
          <span className="text-gray-400">لم تصلك أي رسالة؟ </span>
          <button type="button" className="text-[#1FA6BA] hover:underline mr-1 font-bold">
            إعادة إرسال
          </button>
        </div>

      </div>
    </div>
  );
}