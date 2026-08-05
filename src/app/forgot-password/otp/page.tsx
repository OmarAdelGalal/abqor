'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { authApi } from '@/lib/auth';

export default function OTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(82); // 1:22 in seconds
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    const savedEmail = localStorage.getItem('forgotPasswordEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      router.push('/forgot-password');
    }
  }, [router]);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    // Clear error on new input
    if (error) setError('');

    const newOtp = [...otp];
    // Take only the last character if they paste or type multiple
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If empty and backspace is pressed, move to previous
        inputRefs[index - 1].current?.focus();
      } else {
        // Clear current
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 4) newOtp[i] = char;
    });
    setOtp(newOtp);
    
    // Focus the next empty input, or the last one
    const nextEmptyIndex = newOtp.findIndex(val => !val);
    if (nextEmptyIndex !== -1) {
      inputRefs[nextEmptyIndex].current?.focus();
    } else {
      inputRefs[3].current?.focus();
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpComplete) return;

    setError('');
    setIsLoading(true);
    
    try {
      const otpString = otp.join('');
      const res = await authApi.checkOtp(email, otpString);
      if (res.data?.success) {
         localStorage.setItem('resetOtp', otpString);
         router.push('/forgot-password/new-password');
      } else {
         setError('رمز التحقق المدخل غير مطابق، يُرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
       console.error(err);
       if (err.response?.data?.message) {
         setError(err.response.data.message);
       } else {
         setError('رمز التحقق المدخل غير مطابق، يُرجى المحاولة مرة أخرى.');
       }
    } finally {
       setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    try {
      await authApi.forgotPassword(email);
      setTimeLeft(82);
      alert('تم إعادة إرسال الرمز');
    } catch (err) {
      alert('حدث خطأ أثناء إعادة إرسال الرمز');
    }
  };

  return (
    <div className="min-h-screen bg-white p-4" dir="rtl">
      <div className="max-w-[400px] mx-auto w-full pt-4">
        
        {/* Header / Back Button */}
        <div className="flex items-center mb-16">
          <Link href="/forgot-password" className="text-gray-800 hover:text-gray-600 transition-colors">
            <ArrowRight size={24} />
          </Link>
        </div>

        {/* Headings */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-[#1FA6BA] mb-8">إعادة تعيين كلمة المرور</h1>
          
          <div className="text-right space-y-1 mb-8">
            <h2 className="text-[#004e70] font-bold text-lg">رمز التحقق</h2>
            <p className="text-gray-400 text-sm">أدخل رمز التحقق المرسل إلى إيميلك</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 flex flex-col items-center">
          
          {/* OTP Inputs */}
          <div className="flex justify-center gap-3 w-full" dir="ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-14 h-14 rounded-2xl border border-gray-200 text-center text-xl font-bold text-[#004e70] focus:border-[#1FA6BA] focus:ring-1 focus:ring-[#1FA6BA] outline-none transition-all placeholder:text-gray-300"
                placeholder="-"
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-end gap-2 w-full text-[#ef4444] mt-2">
              <span className="text-sm font-medium">{error}</span>
              <AlertCircle size={18} />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isOtpComplete || isLoading}
            className={`w-full font-bold py-3.5 px-4 rounded-xl transition-all flex justify-center items-center ${
              isOtpComplete && !isLoading
                ? 'bg-[#004e70] hover:bg-[#003d58] text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-[#004e70]/30 border-t-[#004e70] rounded-full animate-spin"></div>
            ) : (
              'المتابعة'
            )}
          </button>
        </form>

        {/* Resend Timer */}
        <div className="mt-4 flex flex-col items-center justify-center gap-1 text-sm font-medium text-center">
          {timeLeft > 0 ? (
            <div className="flex items-center justify-center gap-1 text-sm font-medium">
              <span className="text-gray-400 cursor-default">
                إعادة إرسال رمز التحقق
              </span>
              <span className="text-gray-700 dir-ltr">{formatTime(timeLeft)}</span>
            </div>
          ) : (
            <button 
              onClick={handleResend}
              className="text-[#1FA6BA] hover:underline font-bold"
            >
              إعادة إرسال رمز التحقق
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
