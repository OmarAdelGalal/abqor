'use client';

import React from 'react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="w-full relative min-h-[750px] flex items-center justify-center bg-white pt-16 pb-20">
      <div className="container mx-auto px-4 max-w-[1300px]">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-8">
          
          {/* Visual Right in RTL (Widgets & Books) - First child in DOM */}
          <div className="hidden lg:block relative w-[320px] h-[550px] shrink-0">
              <img src="/Frame 1984078360.png" alt="مراجعة سريعة" className="absolute top-10 right-0 w-[260px]" />
              <img src="/Frame 1984078359.png" alt="إنجاز جديد" className="absolute top-[45%] right-6 w-[240px]" />
              <img src="/Background.png" alt="Books" className="absolute bottom-0 right-12 w-[180px]" />
              <img src="/fi_12901762.png" alt="check" className="absolute top-[35%] right-1/2 w-8" />
              <img src="/fi_3995483.png" alt="target" className="absolute top-[50%] -right-4 w-12" />
          </div>

          {/* Centered Content */}
          <div className="flex flex-col items-center text-center space-y-6 max-w-xl z-30 shrink-0">
            <h1 className="text-6xl md:text-[5.5rem] lg:text-[6.5rem] font-black leading-[1.2] text-[#112F4E] relative">
              تعلم<br />
              <span className="text-[#1FA6BA] relative inline-block my-2">
                 <img src="/Vector 86.png" alt="sparkle" className="absolute -top-8 -right-12 w-12 hidden md:block" />
                 <img src="/Vector 86.png" alt="sparkle" className="absolute -bottom-2 -left-8 w-8 hidden md:block" />
                 بذكاء
              </span><br />
              وتفوق
            </h1>
            <p className="text-xl text-gray-500 font-medium mt-4 leading-relaxed">
              أهلاً بك في تطبيق ABQOR، ابدأ بالمغامرة والتحديات معنا!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full pt-6">
              <button onClick={() => window.dispatchEvent(new Event('open-auth-modal'))} className="px-8 py-3.5 rounded-full font-bold bg-[#1FA6BA] text-white shadow-xl hover:bg-[#188a9c] transition-all text-xl w-full sm:w-[220px]">
                ابدأ رحلتك الآن
              </button>
              <Link href="/courses" className="px-8 py-3.5 rounded-full font-bold bg-white text-[#1FA6BA] border-2 border-[#1FA6BA] hover:bg-gray-50 transition-all text-xl w-full sm:w-[220px]">
                استكشف الدورات
              </Link>
            </div>
          </div>

          {/* Visual Left in RTL (Boy & Goals) - Last child in DOM */}
          <div className="hidden lg:block relative w-[320px] h-[550px] shrink-0">
              <img src="/8aef59e22b486ce79cac17963eb0fe241c3dc4f1.png" alt="Boy" className="absolute top-10 left-6 w-[260px] z-10" />
              <img src="/Frame 1300192526.png" alt="أهداف يومية" className="absolute bottom-[5%] left-0 w-[320px] z-20" />
              <img src="/Vector.png" alt="Airplane" className="absolute top-[40%] -left-8 w-16" />
              <img src="/fi_12901762.png" alt="check" className="absolute top-[30%] left-4 w-8" />
          </div>
          
        </div>
      </div>
    </section>
  );
}
