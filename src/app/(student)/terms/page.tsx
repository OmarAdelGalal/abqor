'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import { useAuthStore } from '@/store/useAuthStore';

export default function TermsPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { title: 'تعديل الحساب', icon: <UserPen className="w-5 h-5" />, href: '/profile/edit', color: 'text-orange-500' },
    { title: 'آراء التلاميذ', icon: <MessageSquareHeart className="w-5 h-5" />, href: '/profile/reviews', color: 'text-yellow-500' },
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
          
          {/* RIGHT COLUMN - MENU */}
          <div className="w-full lg:w-1/3 flex flex-col order-2 lg:order-1">
            <div className="mb-2 px-2 text-right">
              <h3 className="text-gray-400 font-medium text-sm">حسابي</h3>
            </div>
            
            <div className="bg-gray-50/50 rounded-3xl p-3 flex flex-col gap-1">
              {menuItems.map((item, idx) => {
                const isActive = item.href === '/terms';
                return (
                  <Link 
                    key={idx} 
                    href={item.href}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive ? 'bg-white shadow-sm' : 'hover:bg-white hover:shadow-sm'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 bg-white rounded-xl shadow-sm border border-gray-100 ${item.color}`}>
                        {item.icon}
                      </div>
                      <span className="font-bold text-gray-700 text-sm">{item.title}</span>
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
          </div>

          {/* LEFT COLUMN - MAIN CONTENT */}
          <div className="w-full lg:w-2/3 order-1 lg:order-2 flex flex-col pt-4">
            
            <h1 className="text-3xl font-black text-gray-800 mb-8 text-center">الشروط و الأحكام</h1>
            
            <div className="space-y-8 text-right mb-10 text-sm md:text-base leading-relaxed text-gray-600 font-medium">
              <div>
                <h3 className="text-[#45B7C7] font-bold mb-3 text-lg">الشروط والأحكام لتطبيق "Mr. Study"</h3>
                <p>
                  تطبيق "Mr. Study" (يُشار إليه لاحقًا باسم "التطبيق"، "نحن"، "لنا" أو "منصتنا") هو منصة تعليمية رقمية تهدف إلى تقديم مواد دراسية وتفاعلية لمختلف المراحل التعليمية، وربط الطلاب بالأساتذة المختصين في كافة المجالات الدراسية. من خلال استخدامك للتطبيق، فإنك توافق على جميع الشروط والأحكام الموضحة أدناه، بما في ذلك سياسات الخصوصية التي تنظم كيفية تعاملنا مع معلوماتك.
                </p>
              </div>
              
              <div>
                <h3 className="text-[#45B7C7] font-bold mb-3 text-lg">1. تسجيل الحساب</h3>
                <p>
                  لتتمكن من استخدام خدمات التطبيق، يتعين عليك إنشاء حساب شخصي يتضمن بياناتك الأساسية مثل الاسم، البريد الإلكتروني، وكلمة المرور. نلتزم بالحفاظ على سرية بياناتك ولن نشاركها مع أي طرف ثالث دون موافقتك المسبقة.
                </p>
              </div>
              
              <div>
                <h3 className="text-[#45B7C7] font-bold mb-3 text-lg">2. استخدام التطبيق</h3>
                <p className="mb-2">
                  التطبيق مصمم لتقديم تجربة تعليمية مبتكرة، ويتيح لك الوصول إلى الدورات الدراسية، الكويزات، المتابعة مع الأساتذة، بالإضافة إلى تتبع تقدمك التعليمي. باستخدامك التطبيق، فإنك توافق على:
                </p>
                <ul className="list-disc list-inside space-y-1 mr-2 text-gray-500">
                  <li>عدم استخدام التطبيق لأي أغراض غير قانونية أو ضارة.</li>
                  <li>عدم إعادة توزيع أو مشاركة المحتوى دون إذن كتابي منا.</li>
                  <li>الالتزام بمتابعة المحتوى التعليمي ضمن القوانين المحلية.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-[#45B7C7] font-bold mb-3 text-lg">3. المعلومات التي نجمعها</h3>
                <p className="mb-2">
                  نقوم بجمع المعلومات الشخصية وغير الشخصية منك لتحقيق أهداف تشغيل التطبيق وتقديم أفضل خدمة ممكنة، بما في ذلك:
                </p>
                <ul className="list-disc list-inside space-y-1 mr-2 text-gray-500">
                  <li>بيانات الحساب (الاسم، البريد الإلكتروني، العمر).</li>
                  <li>معلومات الدفع والفوترة عند الاشتراك في المحتويات المدفوعة.</li>
                  <li>البيانات المتعلقة بالأداء الأكاديمي والاختبارات داخل التطبيق.</li>
                </ul>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
