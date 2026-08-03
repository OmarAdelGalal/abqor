import React from 'react';

export default function SmartLearningSection() {
  return (
    <section className="w-full py-24 relative">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-right">
          <h2 className="text-4xl md:text-5xl font-black text-[#112F4E]">
            تعلم <span className="text-[#1FA6BA]">بذكاء</span> وتقدم <span className="text-[#1FA6BA]">بثقة</span>
          </h2>
          <p className="text-xl text-gray-500 max-w-lg leading-relaxed mx-auto md:mx-0">
            منصة عبقر توفر لك بيئة تعليمية تفاعلية مصممة خصيصاً لمساعدتك على التفوق.
          </p>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          {/* Smart Learning Illustration */}
          <img src="/image 24.png" alt="Smart Learning" className="max-w-full h-auto" />
        </div>
      </div>
    </section>
  );
}
