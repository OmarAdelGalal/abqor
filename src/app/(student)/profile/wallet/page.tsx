'use client';

import React, { useEffect, useState } from 'react';
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
  ArrowLeft,
  Wallet
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/lib/auth';

const FAKE_TRANSACTIONS = [
  { id: 1, date: '15 يناير 2025', title: 'المراجعة الشاملة في اللغة العربية', amount: -3200 },
  { id: 2, date: '10 يناير 2025', title: 'شحن رصيد', amount: 3200 },
  { id: 3, date: '12 ديسمبر 2024', title: 'شحن رصيد', amount: 3200 },
  { id: 4, date: '11 ديسمبر 2024', title: 'المراجعة الشاملة في اللغة العربية', amount: -3200 },
  { id: 5, date: '11 ديسمبر 2024', title: 'المراجعة الشاملة في اللغة العربية', amount: -3200 },
  { id: 6, date: '12 ديسمبر 2024', title: 'دورة الإنقاذ في الفيزياء', amount: -154 },
];

export default function WalletPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [balance, setBalance] = useState(213545.54);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('electronic');

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

          {/* LEFT COLUMN - MAIN WALLET CONTENT (Main Content in RTL) */}
          <div className="flex-1 w-full">
            <h1 className="text-2xl font-black text-gray-800 mb-6 text-center">المحفظة</h1>

            {/* Balance Card */}
            <div className="bg-[#41b5c8] rounded-[2rem] p-8 flex flex-col justify-between text-white relative overflow-hidden shadow-md mb-8 h-48">
              {/* Background Decoration */}
              <div className="absolute left-0 bottom-0 opacity-20 pointer-events-none">
                <img src="/home/pay.png" alt="" className="w-48 h-48 object-cover -mb-8 -ml-8 mix-blend-overlay" />
              </div>

              <div className="flex justify-between items-start z-10">
                <div className="flex flex-col gap-2">
                  <p className="text-white/80 font-medium text-lg">الرصيد المتوفر</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-black tracking-tight">{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className="text-2xl font-bold">د.ج</span>
                  </div>
                </div>
              </div>

              <div className="z-10 mt-auto">
                <button 
                  onClick={() => setShowAddFundsModal(true)}
                  className="bg-white text-gray-800 font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors w-fit shadow-sm text-sm"
                >
                  <span>اضافة رصيد</span>
                  <div className="bg-gray-800 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                    $
                  </div>
                </button>
              </div>
            </div>

            {/* Transactions List */}
            <div>
              <h2 className="text-gray-400 font-bold text-sm mb-4 mr-2">آخر المعاملات</h2>
              
              <div className="flex flex-col gap-3">
                {FAKE_TRANSACTIONS.map((tx) => (
                  <div key={tx.id} className="bg-white border border-gray-100 rounded-3xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                    
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#f0f9fa] rounded-full flex items-center justify-center shrink-0">
                        <Wallet className="w-6 h-6 text-[#1a5b6e] fill-[#1a5b6e]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-lg mb-0.5">{tx.date}</span>
                        <span className="text-sm text-gray-400 font-medium">{tx.title}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      <span 
                        className={`font-black text-lg ${tx.amount > 0 ? 'text-[#008db9]' : 'text-red-500'}`}
                      >
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                      <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-[#008db9]' : 'text-red-500'}`}>
                        {tx.title.includes('دورة') ? 'ر.س' : 'د.ج'}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddFundsModal(false)}>
          <div 
            className="bg-white rounded-3xl w-full max-w-[400px] p-8 shadow-xl relative animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-black text-[#004e70] text-center mb-8">إختر طريقة الشحن</h2>
            
            <div className="flex flex-col gap-3 mb-6">
              {/* Method 1 */}
              <button 
                onClick={() => setSelectedMethod('electronic')}
                className={`flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${selectedMethod === 'electronic' ? 'border-[#004e70] ring-1 ring-[#004e70]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
              >
                <span className="font-bold text-gray-700 text-sm">الدفع الإلكتروني</span>
                <div className="flex items-center gap-1">
                  <div className="w-8 h-5 bg-[#002f6c] rounded flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold tracking-tighter">CIB</span>
                  </div>
                  <div className="w-8 h-5 bg-[#00885e] rounded flex items-center justify-center">
                    <span className="text-yellow-400 text-[10px] font-bold">بريد</span>
                  </div>
                </div>
              </button>

              {/* Method 2 */}
              <button 
                onClick={() => setSelectedMethod('transfer')}
                className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${selectedMethod === 'transfer' ? 'border-[#004e70] ring-1 ring-[#004e70]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
              >
                <span className="font-bold text-gray-700 text-sm">التحويل عبر البنك/ البريد</span>
              </button>

              {/* Method 3 */}
              <button 
                onClick={() => setSelectedMethod('card')}
                className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${selectedMethod === 'card' ? 'border-[#004e70] ring-1 ring-[#004e70]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
              >
                <span className="font-bold text-gray-700 text-sm">بطاقة التعبئة</span>
              </button>
            </div>

            <button 
              disabled={!selectedMethod}
              onClick={() => {
                setShowAddFundsModal(false);
                if (selectedMethod === 'electronic') {
                  router.push('/profile/wallet/electronic');
                }
                setSelectedMethod('electronic');
              }}
              className="w-full bg-[#004e70] hover:bg-[#003b55] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-colors shadow-sm"
            >
              المتابعة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
