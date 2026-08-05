'use client';

import React from 'react';
import Link from 'next/link';
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
  Gem,
  Flame,
  Clock,
  Send,
  Trophy,
  Wallet,
  BarChart2,
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/auth';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          authApi.getUserProfile(),
          authApi.getAccountView().catch(() => null)
        ]);
        
        setProfileData({
          ...profileRes,
          stats: statsRes
        });
      } catch (error) {
        console.error("Failed to fetch profile info:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { title: 'تعديل الحساب', icon: <UserPen className="w-5 h-5" />, href: '/profile/edit', color: 'text-orange-500' },
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
          
          {/* RIGHT COLUMN - MENU (Visual right, logical order 2 in DOM for mobile first) */}
          <div className="w-full lg:w-1/3 flex flex-col order-2 lg:order-1">
            <div className="mb-2 px-2 text-right">
              <h3 className="text-gray-400 font-medium text-sm">حسابي</h3>
            </div>
            
            <div className="bg-gray-50/50 rounded-3xl p-3 flex flex-col gap-1">
              {menuItems.map((item, idx) => (
                <Link 
                  key={idx} 
                  href={item.href}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 bg-white rounded-xl shadow-sm border border-gray-100 ${item.color}`}>
                      {item.icon}
                    </div>
                    <span className="font-bold text-gray-700 text-sm">{item.title}</span>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-[#45B7C7] transition-colors" />
                </Link>
              ))}
              
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
                  <Send className="w-5 h-5 -ml-0.5 mt-0.5" />
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

          {/* LEFT COLUMN - MAIN PROFILE (Visual left, logical order 1) */}
          <div className="w-full lg:w-2/3 bg-[#eef8f9] rounded-[2.5rem] p-6 lg:p-10 flex flex-col gap-6 order-1 lg:order-2">
            
            {/* User Info Header */}
            <div className="flex flex-col items-center mt-2">
              <div className="relative w-32 h-32 mb-4">
                {/* Circular Progress */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 scale-110" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#e1f0f2" strokeWidth="6" />
                  <circle 
                    cx="50" cy="50" r="46" 
                    fill="none" 
                    stroke="#a3e635" 
                    strokeWidth="6" 
                    strokeDasharray="289" 
                    strokeDashoffset={289 - (289 * 0.58)} 
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 rounded-full overflow-hidden border-[6px] border-transparent">
                  <img src={profileData?.profile?.avatar ? `https://mrstudy.net/storage/${profileData.profile.avatar}` : (user?.avatar || "/c518e28edf6bef8d0d46fdbfb27871175eb44f11.png")} alt="Profile" className="w-full h-full object-cover rounded-full" />
                </div>
                {/* Progress Badge */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white px-3 py-0.5 rounded-full text-green-500 font-bold text-xs border border-gray-100 shadow-sm z-10 whitespace-nowrap">
                  58%
                </div>
              </div>
              
              <h2 className="text-xl font-black text-gray-800 mt-2">
                {profileData?.profile?.name || profileData?.user?.name || profileData?.name || user?.name || 'شيماء أبو القمبز'}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {profileData?.profile?.email || profileData?.user?.email || profileData?.email || user?.email || 'example@example.com'}
              </p>
            </div>


            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-black text-2xl text-[#1a5b6e]">{profileData?.stats?.diamonds ?? profileData?.profile?.jewels ?? profileData?.jewels ?? 500}</span>
                  <Gem className="w-6 h-6 text-blue-400 fill-blue-400" />
                </div>
                <span className="text-gray-400 text-sm font-medium">إجمالي الجواهر</span>
              </div>
              
              <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-black text-2xl text-[#1a5b6e]">{profileData?.stats?.flames ?? profileData?.profile?.streak ?? profileData?.streak ?? 120}</span>
                  <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                </div>
                <span className="text-gray-400 text-sm font-medium">يوم حماس</span>
              </div>
              
              <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-black text-2xl text-[#1a5b6e]">%{(profileData?.stats?.quizzesProgress ?? profileData?.profile?.progress ?? profileData?.progress ?? 98)}</span>
                  <Clock className="w-6 h-6 text-[#8cd6ca]" />
                </div>
                <span className="text-gray-400 text-sm font-medium">التقدم في الدروس</span>
              </div>
            </div>

            {/* Contact Box */}
            <div className="bg-white rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between shadow-sm border border-gray-100 gap-4 mt-2">
              <span className="text-[#1a5b6e] font-bold text-sm md:text-base">لاي استفسار او تساؤل, تواصل معنا من خلال</span>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-sm">
                  <Send className="w-5 h-5 -ml-0.5 mt-0.5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.39 0 0 5.39 0 12.031c0 2.122.55 4.195 1.593 6.02L.03 24l6.096-1.598A11.968 11.968 0 0012.03 24c6.64 0 12.03-5.39 12.03-12.03S18.67 0 12.031 0zm0 21.983c-1.802 0-3.565-.483-5.114-1.4l-.367-.217-3.8.997 1.018-3.704-.237-.378a9.94 9.94 0 01-1.517-5.25C1.983 6.495 6.495 1.983 12.03 1.983c5.534 0 10.046 4.512 10.046 10.048 0 5.535-4.512 10.046-10.045 10.046zm5.518-7.534c-.302-.151-1.792-.885-2.07-9.987-.278-.102-.48-.151-.683.151-.202.302-.782.987-.96 1.188-.176.202-.353.227-.655.076-1.748-.87-3.085-1.99-4.234-3.793-.177-.278-.019-.428.132-.58.135-.136.303-.353.454-.53.151-.176.202-.303.303-.504.101-.202.05-.379-.026-.53-.075-.151-.682-1.643-.933-2.25-.246-.593-.497-.512-.683-.52-.176-.008-.378-.01-.58-.01-.202 0-.53.076-.807.379-.278.303-1.06 1.036-1.06 2.525 0 1.49 1.085 2.93 1.236 3.132.151.202 2.133 3.26 5.166 4.568.72.31 1.282.496 1.722.635.723.23 1.381.197 1.897.12.576-.086 1.792-.733 2.044-1.44.252-.707.252-1.314.177-1.44-.075-.126-.277-.202-.579-.353z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              </div>
            </div>

            {/* Ranking Card */}
            <div className="bg-[#45B7C7] rounded-[2rem] p-6 lg:p-8 relative overflow-hidden flex flex-col text-white mt-2 shadow-sm min-h-[160px]">
              {/* Decorative Background */}
              <div className="absolute right-0 bottom-0 opacity-20 translate-y-12 translate-x-4">
                 <svg width="200" height="200" viewBox="0 0 100 100">
                    <rect x="10" y="60" width="20" height="50" rx="6" fill="white" />
                    <rect x="40" y="35" width="20" height="75" rx="6" fill="white" />
                    <rect x="70" y="10" width="20" height="100" rx="6" fill="white" />
                    <path d="M15,40 l10,-10 l10,10 Z" fill="white" />
                 </svg>
              </div>

              <div className="flex justify-between items-start z-10 h-full">
                <div className="flex justify-between items-end w-full h-full mt-auto">
                   <button 
                      onClick={() => router.push('/profile/ranking')}
                      className="bg-white text-[#1a5b6e] px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
                   >
                      <BarChart2 className="w-5 h-5 text-yellow-500" />
                      <span>عرض الترتيب كامل</span>
                   </button>
                   
                   <div className="flex flex-col items-end">
                     <div className="flex items-center gap-3">
                       <span className="font-bold text-xl">ترتيبك الحالي</span>
                       <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <Trophy className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                       </div>
                     </div>
                     <span className="font-black text-4xl mt-1 leading-none">#{profileData?.profile?.rank ?? profileData?.rank ?? 12}</span>
                     <div className="flex items-center gap-1 mt-3">
                        <span className="text-sm font-bold opacity-90">ارتفعت 3 مراحل هذا الأسبوع</span>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                     </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Wallet Card */}
            <div className="bg-[#0f7eb5] rounded-[2rem] p-6 lg:p-8 relative overflow-hidden flex flex-col text-white shadow-sm min-h-[160px]">
              {/* Decorative Background */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 -rotate-12">
                 <Wallet className="w-40 h-40" />
              </div>

              <div className="flex justify-between items-start z-10 h-full">
                <div className="flex justify-between items-end w-full h-full mt-auto">
                   <Link href="/profile/wallet" className="bg-white text-[#0f7eb5] px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                      <span>عرض تفاصيل المحفظة</span>
                      <Wallet className="w-5 h-5 text-[#0f7eb5]" />
                   </Link>
                   
                   <div className="flex flex-col items-end">
                     <div className="flex items-center gap-3">
                       <span className="font-bold text-xl">المحفظة</span>
                       <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <Wallet className="w-7 h-7 text-yellow-400 fill-yellow-400" />
                       </div>
                     </div>
                     <span className="text-white/80 text-sm mt-2 mb-1">الرصيد المتوفر</span>
                     <span className="font-black text-3xl leading-none font-sans" dir="ltr">{(profileData?.profile?.wallet_balance ?? profileData?.wallet_balance) ? `${profileData?.profile?.wallet_balance ?? profileData?.wallet_balance} د.ج` : '213,545.54 د.ج'}</span>
                   </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
