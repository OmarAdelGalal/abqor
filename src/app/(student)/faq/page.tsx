'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import { useAuthStore } from '@/store/useAuthStore';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export default function FAQPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        // Fetching directly using fetch instead of the api instance as requested
        // Using the /proxy-api to bypass CORS
        let res = await fetch('/proxy-api/user/general/faqs');
        if (!res.ok) {
          res = await fetch('/proxy-api/faqs'); // fallback endpoint
        }
        
        if (res.ok) {
          const data = await res.json();
          // Extract data depending on the response envelope
          let fetchedData = data?.data || data || [];
          
          // Map to standard FAQ format if backend returns different keys
          fetchedData = fetchedData.map((item: any, index: number) => ({
            id: item.id || index + 1,
            question: item.question || item.title || 'سؤال بدون عنوان',
            answer: item.answer || item.content || item.description || 'لا توجد إجابة'
          }));
          
          setFaqs(fetchedData);
        } else {
          throw new Error('API endpoints not found');
        }
      } catch (error) {
        console.error('API not found or failed, using fallback data:', error);
        // Fallback mock data if API doesn't exist
        setFaqs([
          { id: 1, question: 'كيف يمكنني الاشتراك في الدروس؟', answer: 'يمكنك الاشتراك في الدروس عبر اختيار المادة التي ترغب بها من صفحة التعلم ثم النقر على زر الاشتراك واتباع خطوات الدفع.' },
          { id: 2, question: 'هل يمكنني استرجاع أموالي بعد الدفع؟', answer: 'نعم، في حال لم تكن راضياً عن المحتوى، يرجى مراجعة صفحة الشروط والأحكام لمعرفة سياسة الاسترجاع الخاصة بنا.' },
          { id: 3, question: 'كيف أتواصل مع الدعم الفني؟', answer: 'يمكنك التواصل معنا عبر صفحاتنا على منصات التواصل الاجتماعي أو عبر البريد الإلكتروني الموجود أسفل الصفحة.' },
          { id: 4, question: 'هل يمكنني مشاهدة الدروس في أي وقت؟', answer: 'نعم، جميع الدروس المسجلة متاحة لك لمشاهدتها في أي وقت بعد تفعيل اشتراكك.' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaqs();
  }, []);

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
                const isActive = item.href === '/faq';
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
            <h1 className="text-3xl font-black text-gray-800 mb-8 text-center">الأسئلة الأكثر تداولاً</h1>
            
            <div className="bg-[#f9fafb] rounded-3xl p-6 md:p-8 min-h-[400px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#45B7C7]"></div>
                </div>
              ) : faqs.length === 0 ? (
                <div className="text-center text-gray-500 py-10 font-medium">لا توجد أسئلة حالياً.</div>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <button 
                        onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                        className="w-full flex items-center justify-between p-5 text-right transition-colors hover:bg-gray-50"
                      >
                        <span className="font-bold text-gray-800 text-right w-11/12">{faq.question}</span>
                        <div className={`p-1 rounded-full ${openId === faq.id ? 'bg-[#45B7C7] text-white' : 'bg-gray-100 text-gray-500'}`}>
                          {openId === faq.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </button>
                      
                      <div 
                        className={`transition-all duration-300 ease-in-out px-5 overflow-hidden ${openId === faq.id ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
                      >
                        <div className="w-full h-[1px] bg-gray-100 mb-4"></div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
