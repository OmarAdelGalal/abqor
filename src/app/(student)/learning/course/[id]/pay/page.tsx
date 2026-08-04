'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Image as ImageIcon } from 'lucide-react';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import StreakWidget from '@/components/dashboard/StreakWidget';
import RankWidget from '@/components/dashboard/RankWidget';
import UpgradeWidget from '@/components/dashboard/UpgradeWidget';
import SocialFollowWidget from '@/components/learning/SocialFollowWidget';

import { useParams } from 'next/navigation';

// Custom SVG for the blue step bullet icon
const StepIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-0.5">
    <path d="M4 12L20 4L16 20L11 15L4 12Z" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="16" cy="8" r="1.5" fill="#3b82f6"/>
  </svg>
);

export default function CoursePaymentPage() {
  const params = useParams();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-32" dir="rtl">
      <AuthenticatedHeader />

      <main className="container mx-auto px-4 md:px-8 mt-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content (Right Side in RTL) */}
          <div className="flex-1 order-1 lg:order-2">
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                <h1 className="text-2xl font-black text-gray-900">طريقة التسجيل في الدورة</h1>
                <Link 
                  href={`/learning/course/${params.id}`}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <h2 className="text-[#0d4a68] font-bold text-xl mb-8">للتسجيل يرجى اتباع الخطوات التالية:</h2>

              <div className="space-y-10">
                
                {/* Step 1 */}
                <div className="flex gap-4 items-start">
                  <StepIcon />
                  <div className="flex-1">
                    <p className="text-gray-800 font-bold mb-6 text-lg">
                      قم بإرسال مبلغ الدورة وهو 3200 دج إلى حساب الأستاذة رندة:
                    </p>
                    
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden max-w-xl mx-auto shadow-sm">
                      <div className="flex border-b border-gray-100 p-4">
                        <div className="w-1/3 text-gray-500 font-bold text-sm">اسم المستفيد</div>
                        <div className="w-2/3 text-[#0d4a68] font-black" dir="ltr">Randa Foudili</div>
                      </div>
                      <div className="flex border-b border-gray-100 p-4">
                        <div className="w-1/3 text-gray-500 font-bold text-sm">رقم الحساب</div>
                        <div className="w-2/3 text-[#0d4a68] font-black" dir="ltr">0020747627 clé 91</div>
                      </div>
                      <div className="flex p-4">
                        <div className="w-1/3 text-gray-500 font-bold text-sm">العنوان</div>
                        <div className="w-2/3 text-[#0d4a68] font-black" dir="ltr">Draa Ben Khedda</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4 items-start">
                  <StepIcon />
                  <div className="flex-1">
                    <p className="text-gray-800 font-bold mb-3 text-lg leading-relaxed">
                      للدفع باستخدام البطاقة الذهبية، استخدم رقم RIP التالي:<br/>
                      <span className="text-[#38b6c7] font-black" dir="ltr">RIP: 00799999002074762791</span>
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6">
                      <span className="text-gray-600 font-bold">كيفية تعبئة الحولة البريدية</span>
                      <button 
                        onClick={() => setIsImageModalOpen(true)}
                        className="flex items-center justify-center gap-2 bg-[#f8f9fa] border border-gray-200 text-[#0d4a68] font-bold py-2.5 px-6 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <span>فتح الصورة</span>
                        <ImageIcon className="w-5 h-5 text-yellow-500" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4 items-start">
                  <StepIcon />
                  <div className="flex-1">
                    <p className="text-gray-800 font-bold text-lg">
                      بعد إتمام التحويل، قم بتصوير الوصل.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4 items-start">
                  <StepIcon />
                  <div className="flex-1">
                    <p className="text-gray-800 font-bold mb-8 text-lg leading-relaxed max-w-2xl">
                      أرسل الإيصال مرفقًا باسمك، لقبك، رقم هاتفك، والشعبة إلى أحد حسابات التواصل الاجتماعي الخاصة بنا.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 max-w-xl mx-auto">
                      <button className="flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-800 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all hover:shadow-md group">
                        <span className="text-lg">تيليجرام</span>
                        <div className="w-8 h-8 rounded-full bg-[#2AABEE] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <svg className="w-4 h-4 -ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21.724 3.125a1.002 1.002 0 00-1.157-.156L2.348 11.23a.998.998 0 00-.012 1.768l5.247 2.724.877 5.864a1 1 0 001.696.47l3.666-3.666 4.908 3.633a.996.996 0 001.53-.787L22.68 4.122a1.002 1.002 0 00-.956-.997zM7.55 13.04l9.742-6.524-7.514 7.625.32 3.124-2.548-4.225z"/>
                          </svg>
                        </div>
                      </button>
                      
                      <button className="flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-800 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all hover:shadow-md group">
                        <span className="text-lg">إنستقرام</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#C13584] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Left Sidebar (Order 2 in markup, visually left in RTL) */}
          <div className="w-full lg:w-[320px] order-2 lg:order-1 flex flex-col gap-6">
            <StreakWidget />
            <RankWidget />
            <UpgradeWidget />
            <SocialFollowWidget />
          </div>

        </div>
      </main>

      {/* Image Modal for Postal Transfer Form (pay.png) */}
      {isImageModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div 
            className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Prevent clicking inside the modal from closing it
          >
            {/* Close button */}
            <button 
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <img 
              src="/home/pay.png" 
              alt="كيفية تعبئة الحولة البريدية" 
              className="w-full h-auto object-contain max-h-[85vh]"
            />
          </div>
        </div>
      )}

    </div>
  );
}
