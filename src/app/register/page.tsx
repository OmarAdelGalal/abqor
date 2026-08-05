'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { authApi } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  
  const [showDetails, setShowDetails] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>('female');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  
  const detailedEmailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showDetails && detailedEmailInputRef.current) {
      detailedEmailInputRef.current.focus();
    }
  }, [showDetails]);

  useEffect(() => {
    // Load onboarding data
    const data = localStorage.getItem('onboardingData');
    if (data) {
       try {
         setOnboardingData(JSON.parse(data));
       } catch (e) {}
    }
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert('يجب الموافقة على الشروط والأحكام');
      return;
    }
    if (!onboardingData) {
      alert('يرجى إكمال خطوات الاستبيان أولاً (Onboarding)');
      router.push('/onboarding');
      return;
    }
    
    setIsLoading(true);
    try {
      const payload = {
        name,
        email,
        phone,
        password,
        password_confirmation: password,
        gender,
        state: onboardingData.state || 'أخرى',
        education_level_id: onboardingData.education_level_id,
        education_year_id: onboardingData.education_year_id,
        education_major_id: onboardingData.education_major_id || null,
        know_by: 'web'
      };
      
      const res = await authApi.registerByPhone(payload);
      alert('تم إرسال كود التحقق بنجاح!');
      localStorage.setItem('registerEmail', email);
      router.push('/register/otp');
    } catch (err: any) {
      console.error('Registration Error:', err);
      if (err.data && err.data.errors) {
         const firstError = Object.values(err.data.errors)[0] as string[];
         alert(firstError[0] || err.message || 'حدث خطأ أثناء إنشاء الحساب');
      } else if (err.message) {
         alert(err.message);
      } else if (err.response?.data?.message) {
         alert(err.response.data.message);
      } else {
         alert('حدث خطأ أثناء إنشاء الحساب');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDetails(true);
  };

  if (showDetails) {
    return (
      <div className="min-h-screen bg-white p-4" dir="rtl">
        <div className="max-w-[400px] mx-auto w-full pt-4">
          <div className="flex items-center mb-8">
            <button type="button" onClick={() => setShowDetails(false)} className="text-gray-800 hover:text-gray-600 transition-colors">
              <ArrowRight size={24} />
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#1FA6BA]">بيانات إنشاء حساب</h1>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2 text-right">
              <label className="flex items-center text-sm font-bold text-[#004e70] gap-2">
                <User size={18} />
                <span>الإسم بالكامل</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1FA6BA] focus:ring-1 focus:ring-[#1FA6BA] outline-none transition-all bg-white text-right placeholder-gray-400"
                placeholder="الإسم"
              />
            </div>

            <div className="space-y-2 text-right">
              <label className="flex items-center text-sm font-bold text-[#004e70] gap-2">
                <Mail size={18} />
                <span>البريد الإلكتروني</span>
              </label>
              <input
                ref={detailedEmailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1FA6BA] focus:ring-1 focus:ring-[#1FA6BA] outline-none transition-all bg-white text-right placeholder-gray-400"
                placeholder="user@user.com"
                dir="ltr"
              />
            </div>

            <div className="space-y-2 text-right">
              <label className="flex items-center text-sm font-bold text-[#004e70] gap-2">
                <Phone size={18} />
                <span>رقم الهاتف</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1FA6BA] focus:ring-1 focus:ring-[#1FA6BA] outline-none transition-all bg-white text-right placeholder-gray-400"
                placeholder="0555555555"
                dir="ltr"
              />
            </div>

            <div className="space-y-2 text-right">
              <label className="flex items-center text-sm font-bold text-[#004e70] gap-2">
                <User size={18} />
                <span>الجنس</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${gender === 'male' ? 'bg-[#48B3C4] text-white' : 'bg-gray-100 text-gray-700'}`}
                >ذكر</button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${gender === 'female' ? 'bg-[#48B3C4] text-white' : 'bg-gray-100 text-gray-700'}`}
                >أنثى</button>
              </div>
            </div>

            <div className="space-y-2 text-right">
              <label className="flex items-center text-sm font-bold text-[#004e70] gap-2">
                <Lock size={18} />
                <span>كلمة المرور</span>
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

            <div className="flex items-center gap-2 pt-2">
              <label className="flex items-center cursor-pointer gap-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 rounded text-[#48B3C4] focus:ring-[#48B3C4] border-gray-300"
                />
                <span className="text-sm text-gray-500">
                  أوافق على <span className="text-[#48B3C4] font-bold">الشروط والاحكام</span>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#004e70] hover:bg-[#003d58] text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 flex justify-center items-center mt-6"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'تأكيد'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 pb-8">
            لدي حساب بالفعل{' '}
            <Link href="/login" className="text-[#1FA6BA] font-bold hover:underline">
              دخول
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-white p-4" dir="rtl">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        <div className="mb-6">
          <img 
            src="/603878e1486a7e2012f3fae14f8205e3edcf979d.png" 
            alt="Create Account" 
            className="w-32 h-auto object-contain"
            onError={(e) => { e.currentTarget.outerHTML = '<div class="text-6xl text-center">👍</div>' }} 
          />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1FA6BA] mb-2">الآن قم بإنشاء حسابك في عبقور!</h1>
          <p className="text-gray-500 text-sm leading-relaxed px-4">
            إنها عملية سهلة و سريعة، و تمكنك من استخدام جميع دروس عبقور.
          </p>
        </div>

        <div className="w-full space-y-3 mb-6">
          <button type="button" className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700">
            <span className="text-sm">Google</span>
            <FcGoogle size={20} />
          </button>
          <button type="button" className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700">
            <span className="text-sm">App Store</span>
            <FaApple size={20} className="mb-1" />
          </button>
        </div>

        <div className="w-full relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dotted border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-400">المتابعة بالإيميل</span>
          </div>
        </div>

        <form onSubmit={handleSplashSubmit} className="w-full space-y-5">
          <div className="space-y-2 text-right">
            <label className="text-sm font-bold text-[#004e70] block">بواسطة البريد الإلكتروني</label>
            <div className="relative cursor-text" onClick={() => setShowDetails(true)}>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                readOnly
                onFocus={() => setShowDetails(true)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#1FA6BA] focus:ring-1 focus:ring-[#1FA6BA] outline-none transition-all bg-white text-right placeholder-gray-400 cursor-text"
                placeholder="user@usre.gmail.com"
                dir="rtl"
              />
            </div>
          </div>
          <button type="button" onClick={() => setShowDetails(true)} className="w-full bg-[#004e70] hover:bg-[#003d58] text-white font-bold py-3.5 px-4 rounded-xl transition-all flex justify-center items-center">
            متابعة
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          لدي حساب، <Link href="/login" className="text-[#1FA6BA] hover:underline">دخول</Link>
        </div>
      </div>
    </div>
  );
}