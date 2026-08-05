'use client';

import React from 'react';
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
  Wallet,
  Trophy,
  Award
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

// Mock data (since backend API isn't ready)
const FAKE_RANKINGS = [
  { rank: 1, name: 'علي العالي', progress: 12, diamonds: 500, avatar: '/070f32d8344482d233c60ed52e8fab2be5848260.png' },
  { rank: 2, name: 'نور محمد', progress: 12, diamonds: 500, avatar: '/8aef59e22b486ce79cac17963eb0fe241c3dc4f1.png' },
  { rank: 3, name: 'سارة أحمد', progress: 12, diamonds: 500, avatar: '/9bb9cc83266f8df2d0b844971b105eb1084227ff.png' },
  { rank: 4, name: 'شيماء أبو القميز', progress: 12, diamonds: 500, avatar: '/c518e28edf6bef8d0d46fdbfb27871175eb44f11.png' },
  { rank: 5, name: 'شيماء أبو القميز', progress: 12, diamonds: 500, avatar: '/boy2.png' },
  { rank: 6, name: 'شيماء أبو القميز', progress: 12, diamonds: 500, avatar: '/image 24.png' },
  { rank: 7, name: 'شيماء أبو القميز', progress: 12, diamonds: 500, avatar: '/boy2.png' },
];

export default function RankingPage() {
  const router = useRouter();
  const { logout, user } = useAuthStore();
  
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

  // Current user's rank info
  const currentUserRank = 12;

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
                const isActive = item.href === '/profile/ranking'; // Highlight nothing or something if needed
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
            <h1 className="text-2xl font-black text-gray-800 mb-8 text-center">ترتيب التلاميذ</h1>

            {/* Podium Section */}
            <div className="bg-[#f2fbfb] rounded-[2rem] p-6 pt-16 mb-6 flex items-end justify-center h-[300px] gap-0 lg:gap-2 relative overflow-hidden shadow-sm">
               
               {/* 2nd place */}
               <div className="flex flex-col items-center z-10 w-28">
                 <div className="relative mb-3 flex flex-col items-center justify-center">
                    {/* Fake silver wing decoration */}
                    <div className="absolute -inset-2 bg-gray-300 rounded-full blur-sm opacity-50"></div>
                    <img src={FAKE_RANKINGS[1].avatar} className="w-14 h-14 rounded-full border-4 border-gray-400 object-cover relative z-10" alt="" />
                 </div>
                 <div className="bg-white rounded-t-xl w-full pt-4 pb-2 px-2 flex flex-col items-center justify-end h-28 shadow-md relative border border-gray-100">
                    <div className="absolute -top-3 w-7 h-7 bg-slate-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-white">2</div>
                    <span className="font-bold text-xs text-[#004e70] mb-2">{FAKE_RANKINGS[1].name}</span>
                    <div className="flex items-center gap-2 text-[#45B7C7] text-xs font-bold">
                       <span>{FAKE_RANKINGS[1].progress}%</span>
                       <span>{FAKE_RANKINGS[1].diamonds} ♦</span>
                    </div>
                 </div>
               </div>

               {/* 1st place */}
               <div className="flex flex-col items-center z-20 w-[130px] -mb-2">
                 <div className="relative mb-3 flex flex-col items-center justify-center">
                    <Award className="absolute -top-8 text-yellow-500 fill-yellow-500 w-12 h-12 drop-shadow-md z-20" />
                    {/* Fake gold wing decoration */}
                    <div className="absolute -inset-3 bg-yellow-400 rounded-full blur-md opacity-40"></div>
                    <img src={FAKE_RANKINGS[0].avatar} className="w-16 h-16 rounded-full border-[5px] border-yellow-400 object-cover relative z-10" alt="" />
                 </div>
                 <div className="bg-white rounded-t-xl w-full pt-6 pb-4 px-2 flex flex-col items-center justify-end h-[140px] shadow-lg relative border border-yellow-100">
                    <div className="absolute -top-4 w-9 h-9 bg-orange-400 text-white rounded-full flex items-center justify-center font-black text-lg shadow-sm ring-4 ring-white">1</div>
                    <span className="font-black text-sm text-[#004e70] mb-2">{FAKE_RANKINGS[0].name}</span>
                    <div className="flex items-center gap-2 text-[#45B7C7] text-sm font-bold">
                       <span>{FAKE_RANKINGS[0].progress}%</span>
                       <span>{FAKE_RANKINGS[0].diamonds} ♦</span>
                    </div>
                 </div>
               </div>

               {/* 3rd place */}
               <div className="flex flex-col items-center z-10 w-28">
                 <div className="relative mb-3 flex flex-col items-center justify-center">
                    {/* Fake bronze wing decoration */}
                    <div className="absolute -inset-2 bg-amber-700 rounded-full blur-sm opacity-50"></div>
                    <img src={FAKE_RANKINGS[2].avatar} className="w-14 h-14 rounded-full border-4 border-[#b06a4b] object-cover relative z-10" alt="" />
                 </div>
                 <div className="bg-white rounded-t-xl w-full pt-4 pb-2 px-2 flex flex-col items-center justify-end h-24 shadow-md relative border border-gray-100">
                    <div className="absolute -top-3 w-7 h-7 bg-[#8c5237] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-4 ring-white">3</div>
                    <span className="font-bold text-xs text-[#004e70] mb-2">{FAKE_RANKINGS[2].name}</span>
                    <div className="flex items-center gap-2 text-[#45B7C7] text-xs font-bold">
                       <span>{FAKE_RANKINGS[2].progress}%</span>
                       <span>{FAKE_RANKINGS[2].diamonds} ♦</span>
                    </div>
                 </div>
               </div>
            </div>

            {/* Current User Highlight */}
            <div className="border border-[#45B7C7] bg-[#f8fdff] rounded-3xl p-5 flex items-center justify-between mb-6 shadow-sm relative overflow-hidden">
               <div className="flex items-center gap-3 relative z-10">
                  <span className="text-gray-800 font-bold mr-2 text-sm">أنت</span>
                  
                  {/* Badge */}
                  <div className="relative w-12 h-12 flex items-center justify-center mr-2">
                    <div className="absolute inset-0 bg-[#008db9] rounded-xl rotate-45 transform scale-90"></div>
                    <span className="relative z-10 text-white font-black text-xl">{currentUserRank}</span>
                  </div>

                  <div className="flex items-center gap-2">
                     <img src={user?.avatar ? `https://mrstudy.net/storage/${user.avatar}` : '/image 24.png'} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                     <span className="font-bold text-gray-800">{user?.name || 'شيماء أبو القميز'}</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-6 text-[#008db9] font-bold relative z-10">
                  <div className="flex items-center gap-2">
                     <span className="text-xl">500</span>
                     <span className="text-sm">♦</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-xl">12%</span>
                     <span className="text-xs text-gray-500 font-medium">مستوى التقدم</span>
                  </div>
               </div>
            </div>

            {/* Other Ranks List */}
            <div className="flex flex-col gap-2 mb-8">
               {FAKE_RANKINGS.slice(3).map((student, idx) => (
                 <div key={student.rank} className="bg-white border border-gray-100 rounded-3xl p-4 flex items-center justify-between hover:border-gray-200 transition-colors shadow-sm">
                   <div className="flex items-center gap-4">
                     <span className="font-black text-gray-800 w-8 text-center text-lg">{student.rank}</span>
                     <img src={student.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                     <span className="font-bold text-gray-700">{student.name}</span>
                   </div>
                   
                   <div className="flex items-center gap-6 text-[#008db9] font-bold">
                     <div className="flex items-center gap-1">
                        <span className="text-lg">{student.diamonds}</span>
                        <span className="text-xs">♦</span>
                     </div>
                     <div className="flex items-center gap-1">
                        <span className="text-lg">{student.progress}%</span>
                     </div>
                   </div>
                 </div>
               ))}
            </div>

            {/* Motivation Banner */}
            <div className="bg-[#eff2f9] rounded-3xl p-8 flex items-center justify-between relative overflow-hidden shadow-sm">
               <div className="flex flex-col gap-2 relative z-10">
                  <h3 className="font-black text-gray-900 text-2xl">استمر يا بطل</h3>
                  <p className="text-gray-500 font-bold">انت من افضل 15% من الطلاب! بقي 450 نقطة للوصول الى المركز 10.</p>
               </div>
               <div className="relative z-10 -my-4">
                 <img src="/home/Vector.png" alt="" className="w-24 h-24 object-contain opacity-80 mix-blend-multiply" />
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
