'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import { 
  UserPen, 
  MessageSquareHeart, 
  CreditCard, 
  Users, 
  HelpCircle, 
  Lock, 
  Star, 
  LogOut,
  ArrowRight,
  ArrowLeft,
  Wallet
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function ElectronicPaymentPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  
  const [selectedCard, setSelectedCard] = useState<'edahabia' | 'cib'>('edahabia');
  const [subscriptionType, setSubscriptionType] = useState<'course' | 'plan' | 'recharge'>('recharge');
  const [amount, setAmount] = useState('');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { title: 'تعديل الحساب', icon: <UserPen className="w-5 h-5" />, href: '/profile/edit', color: 'text-orange-500' },
    { title: 'المحفظة', icon: <Wallet className="w-5 h-5" />, href: '/profile/wallet', color: 'text-[#45B7C7]' },
    { title: 'آراء التلاميذ', icon: <MessageSquareHeart className="w-5 h-5" />, href: '/reviews', color: 'text-yellow-500' },
    { title: 'الاشتراكات', icon: <CreditCard className="w-5 h-5" />, href: '/subscriptions', color: 'text-blue-500' },
    { title: 'من نحن', icon: <Users className="w-5 h-5" />, href: '/about', color: 'text-slate-700' },
    { title: 'الأسئلة الأكثر تداولاً', icon: <HelpCircle className="w-5 h-5" />, href: '/faq', color: 'text-orange-400' },
    { title: 'الشروط و الأحكام', icon: <Lock className="w-5 h-5" />, href: '/terms', color: 'text-amber-500' },
    { title: 'تقييم التطبيق', icon: <Star className="w-5 h-5" />, href: '/rate', color: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <AuthenticatedHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* RIGHT COLUMN - MENU (Sidebar in RTL) */}
          <div className="w-full lg:w-1/3 flex flex-col shrink-0">
            <div className="mb-2 px-2 text-right">
              <h3 className="text-gray-400 font-medium text-sm">حسابي</h3>
            </div>
            
            <div className="bg-gray-50/50 rounded-3xl p-3 flex flex-col gap-1 shadow-sm">
              {menuItems.map((item, idx) => {
                // Keep Wallet active since this is a subpage of Wallet
                const isActive = item.href === '/profile/wallet';
                return (
                  <Link 
                    key={idx} 
                    href={item.href}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive ? 'bg-white shadow-sm' : 'hover:bg-white hover:shadow-sm'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl shadow-sm border border-gray-100 ${item.color} ${isActive ? 'bg-[#f0f9fa]' : 'bg-white'}`}>
                        {item.icon}
                      </div>
                      <span className={`font-bold text-sm ${isActive ? 'text-[#004e70]' : 'text-gray-700'}`}>{item.title}</span>
                    </div>
                    <ArrowLeft className={`w-5 h-5 transition-colors ${isActive ? 'text-[#45B7C7]' : 'text-gray-400 group-hover:text-[#45B7C7]'}`} />
                  </Link>
                );
              })}
              
              <button 
                onClick={handleLogout}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all group mt-2"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-red-500">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-700 text-sm group-hover:text-red-600">تسجيل الخروج</span>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
              </button>
            </div>

            {/* Social Follow */}
            <div className="mt-10 flex flex-col items-center">
              <h4 className="font-bold text-[#1a5b6e] mb-4">قم بمتابعتنا الآن</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* LEFT COLUMN - MAIN CONTENT */}
          <div className="flex-1 w-full relative">
            {/* Header / Title */}
            <div className="flex items-center justify-center mb-6 relative">
              <h1 className="text-2xl font-black text-gray-800">الدفع الإلكتروني</h1>
              <button 
                onClick={() => router.back()}
                className="absolute right-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>

            {/* Content Container */}
            <div className="bg-[#fcfdfd] rounded-[2rem] p-8 min-h-[500px]">
              
              {/* Card Selection */}
              <div className="mb-6">
                <h3 className="text-gray-800 font-bold mb-3 mr-2">الرجاء اختيار البطاقة</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Edahabia Card */}
                  <button 
                    onClick={() => setSelectedCard('edahabia')}
                    className={`h-16 flex items-center justify-center border rounded-2xl transition-all ${selectedCard === 'edahabia' ? 'border-[#bcebf2] bg-[#e6f7fa]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <div className="h-10 w-24 bg-[#005e55] rounded-md relative flex items-center justify-between px-2 overflow-hidden shadow-sm">
                       <span className="text-yellow-400 text-[10px] font-bold z-10">الذهبية</span>
                       <div className="w-4 h-3 bg-yellow-400/80 rounded-[2px] z-10 opacity-70"></div>
                       <div className="absolute -right-2 -bottom-2 w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-300 to-transparent opacity-20"></div>
                    </div>
                  </button>

                  {/* CIB Card */}
                  <button 
                    onClick={() => setSelectedCard('cib')}
                    className={`h-16 flex items-center justify-center border rounded-2xl transition-all ${selectedCard === 'cib' ? 'border-[#bcebf2] bg-[#e6f7fa]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                  >
                    <div className="h-10 w-24 bg-[#051c4a] rounded-md relative flex items-center justify-center px-2 overflow-hidden shadow-sm">
                       <div className="flex items-center">
                         <div className="w-4 h-4 bg-yellow-400 rounded-sm mr-1"></div>
                         <span className="text-white text-lg font-black italic tracking-tighter">CIB</span>
                       </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Subscription Type Selection */}
              <div className="mb-6">
                <h3 className="text-gray-800 font-bold mb-3 mr-2">حدد المراد الإشتراك به</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button 
                    onClick={() => setSubscriptionType('course')}
                    className={`py-3.5 px-4 text-center rounded-2xl border font-bold transition-all ${subscriptionType === 'course' ? 'border-[#bcebf2] bg-[#e6f7fa] text-gray-800' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                  >
                    الإشتراك في دورة
                  </button>
                  <button 
                    onClick={() => setSubscriptionType('plan')}
                    className={`py-3.5 px-4 text-center rounded-2xl border font-bold transition-all ${subscriptionType === 'plan' ? 'border-[#bcebf2] bg-[#e6f7fa] text-gray-800' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                  >
                    الإشتراك في خطة
                  </button>
                  <button 
                    onClick={() => setSubscriptionType('recharge')}
                    className={`py-3.5 px-4 text-center rounded-2xl border font-bold transition-all ${subscriptionType === 'recharge' ? 'border-[#bcebf2] bg-[#e6f7fa] text-gray-800' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
                  >
                    شحن رصيد
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-12">
                <h3 className="text-gray-800 font-bold mb-3 mr-2">أدخل المبلغ المراد شحنه</h3>
                <input 
                  type="number"
                  placeholder="المبلغ (د.ج)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-5 text-gray-800 font-bold focus:outline-none focus:border-[#45B7C7] focus:ring-1 focus:ring-[#45B7C7] transition-all placeholder:font-normal"
                />
              </div>

              {/* Total and Pay Button */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[#008db9] font-bold text-lg">المبلغ الإجمالي</span>
                  <span className="text-[#008db9] font-black text-2xl tracking-widest">{amount ? amount : '----'}</span>
                </div>
                
                <button 
                  disabled={!amount}
                  className="bg-[#004e70] hover:bg-[#003b55] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-xl transition-colors shadow-sm"
                >
                  ادفع الآن
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
