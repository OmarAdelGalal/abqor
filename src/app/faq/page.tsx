"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, User, Star, Info, HelpCircle, FileText, LogOut, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('عن التطبيق');
  const [openFaqId, setOpenFaqId] = useState<number | null>(1);

  const categories = [
    'عن التطبيق',
    'عن الأساتذة',
    'عن الكويزات',
    'عن الدورات'
  ];

  const sidebarLinks = [
    { name: 'تعديل الحساب', icon: <User className="w-5 h-5 text-gray-500" />, href: '/profile/edit' },
    { name: 'آراء التلاميذ', icon: <MessageSquare className="w-5 h-5 text-gray-500" />, href: '/reviews' },
    { name: 'من نحن', icon: <Info className="w-5 h-5 text-gray-500" />, href: '/about' },
    { name: 'الأسئلة الأكثر تداولاً', icon: <HelpCircle className="w-5 h-5 text-blue-500" />, href: '/faq', active: true },
    { name: 'الشروط و الأحكام', icon: <FileText className="w-5 h-5 text-gray-500" />, href: '/terms' },
    { name: 'تقييم التطبيق', icon: <Star className="w-5 h-5 text-yellow-400" />, href: '/rate' },
    { name: 'تسجيل الخروج', icon: <LogOut className="w-5 h-5 text-blue-500" />, href: '/logout', isLogout: true },
  ];

  const faqs = [
    {
      id: 1,
      question: 'كيف يمكنني التسجيل في التطبيق وبدء استخدامه؟',
      answer: `للتسجيل في التطبيق، اتبع الخطوات التالية:
1. قم بتحميل التطبيق من متجر التطبيقات على جهازك (App Store أو Google Play).
2. افتح التطبيق واضغط على "إنشاء حساب جديد".
3. أدخل بياناتك الأساسية مثل الاسم، البريد الإلكتروني، وكلمة المرور.
4. يمكنك أيضا تسجيل الدخول عبر حسابات التواصل الاجتماعي، يمكنك اختيار التسجيل باستخدام حساب Google أو Facebook.
5. بعد إكمال التسجيل، ستتلقى رسالة تأكيد عبر البريد الإلكتروني. افتح البريد الإلكتروني واتبع الرابط لتفعيل حسابك.
6. بعد تفعيل الحساب، يمكنك تسجيل الدخول والبدء في استكشاف الدورات، الكويزات، والأساتذة المتاحين في التطبيق.`
    },
    {
      id: 2,
      question: 'هل التطبيق يدعم أجهزة متعددة (الهاتف والكمبيوتر)؟',
      answer: 'نعم، التطبيق يدعم العمل على أجهزة متعددة. يمكنك تسجيل الدخول من الهاتف الذكي أو جهاز الكمبيوتر الخاص بك ومتابعة تقدمك.'
    },
    {
      id: 3,
      question: 'كيف يمكنني تحديث بياناتي الشخصية داخل التطبيق؟',
      answer: 'يمكنك تحديث بياناتك من خلال الذهاب إلى صفحة "تعديل الحساب" من القائمة الجانبية وتغيير المعلومات التي ترغب في تحديثها ثم حفظ التغييرات.'
    },
    {
      id: 4,
      question: 'هل هناك دعم فني إذا واجهت مشاكل في التطبيق؟',
      answer: 'نعم، نوفر دعم فني على مدار الساعة. يمكنك التواصل معنا عبر صفحة "اتصل بنا" أو من خلال البريد الإلكتروني للدعم الفني.'
    }
  ];

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row-reverse gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="text-gray-500 text-sm mb-4">حسابي</div>
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            {sidebarLinks.map((link, index) => (
              <Link 
                href={link.href} 
                key={index}
                className={\`flex items-center justify-between p-4 \${link.active ? 'bg-gray-100' : 'hover:bg-gray-100'} \${index !== sidebarLinks.length - 1 ? 'border-b border-gray-200' : ''}\`}
              >
                <div className="text-gray-400">
                  <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </div>
                <div className="flex items-center gap-3">
                  <span className={\`font-medium \${link.active || link.isLogout ? 'text-gray-900' : 'text-gray-700'}\`}>
                    {link.name}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    {link.icon}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <h3 className="text-blue-600 font-bold mb-4">قم بمتابعتنا الآن</h3>
            <div className="flex justify-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center hover:bg-pink-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center hover:bg-blue-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">الأسئلة الأكثر تداولاً</h1>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map((category, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(category)}
                className={\`px-6 py-2 rounded-full font-medium transition-colors \${
                  activeCategory === category
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }\`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div 
                key={faq.id} 
                className={\`bg-white rounded-xl overflow-hidden transition-all duration-200 \${openFaqId === faq.id ? 'shadow-md border border-gray-100' : 'border border-gray-200'}\`}
              >
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-right focus:outline-none"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span className="font-bold text-gray-800">{faq.question}</span>
                  <div className="text-gray-400">
                    {openFaqId === faq.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>
                
                {openFaqId === faq.id && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
