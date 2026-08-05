'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'about' | 'content' | 'reviews'>('content');

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      {/* Course Detail Container */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/courses" className="text-[#1FA6BA] font-bold inline-flex items-center gap-2 mb-6 hover:underline">
          ← العودة للدورات
        </Link>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <h1 className="text-3xl font-black text-[#112F4E] mb-4">تفاصيل الدورة التعليمية</h1>
          <div className="flex gap-4 border-b border-gray-100 pb-4 mb-6">
            <button 
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 font-bold rounded-lg transition-all ${activeTab === 'content' ? 'bg-[#1FA6BA] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              محتوى الدورة
            </button>
            <button 
              onClick={() => setActiveTab('about')}
              className={`px-4 py-2 font-bold rounded-lg transition-all ${activeTab === 'about' ? 'bg-[#1FA6BA] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              عن الدورة
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 font-bold rounded-lg transition-all ${activeTab === 'reviews' ? 'bg-[#1FA6BA] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              آراء التلاميذ
            </button>
          </div>
          <div className="py-4">
            <p className="text-gray-600 leading-relaxed">
              أهلاً بك في الدورة التعليمية المتميزة. يمكنك تصفح الدروس والملخصات ومتابعة تقدمك التعليمي بسهولة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
