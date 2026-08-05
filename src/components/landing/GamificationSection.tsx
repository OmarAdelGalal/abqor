import React from 'react';

export default function GamificationSection() {
  return (
    <section className="w-full py-24 bg-[#f8fbfe] overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        
        {/* Image Column - Visual Right in RTL (First child) */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative">
            {/* Base Phone Mockup */}
            <img src="/الرئيسية.jpg" alt="Gamification App" className="w-[280px] md:w-[320px] h-auto rounded-[32px] shadow-xl relative z-10" />
            {/* Overlapping Widget */}
            <img src="/1 (1).png" alt="Streak Widget" className="absolute z-20 top-[15%] -right-[15%] md:-right-[25%] w-[340px] md:w-[420px] drop-shadow-2xl rounded-2xl" />
          </div>
        </div>

        {/* Text Column - Visual Left in RTL (Second child) */}
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-right z-30">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#112F4E] leading-tight">
            العب كل يوم و<span className="text-[#1FA6BA]">حافظ</span> على حماسك
          </h2>
          <p className="text-xl text-gray-500 max-w-lg leading-relaxed mx-auto md:mx-0 font-medium">
            استمر في التعلم يوميًا، حافظ على سلسلة الحماس، واجمع الإنجازات خطوة بخطوة لتتقدم أكثر كل يوم.
          </p>
        </div>
        
      </div>
    </section>
  );
}
