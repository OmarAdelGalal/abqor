import React from 'react';

export default function ChallengeSection() {
  return (
    <section className="w-full py-24 overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        
        {/* Text Column - Visual Right in RTL (First child) */}
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-right z-30">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#112F4E] leading-tight">
            حوّل التعلّم إلى <span className="text-[#1FA6BA]">تحدّي</span> ممتع
          </h2>
          <p className="text-xl text-gray-500 max-w-lg leading-relaxed mx-auto md:mx-0 font-medium">
            ادخل تحديات يومية واختبر مهاراتك، تنافس مع الآخرين، واكسب نقاطًا وإنجازات مع كل خطوة تتقدمها.
          </p>
        </div>

        {/* Image Column - Visual Left in RTL (Second child) */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative">
            {/* Base Phone Mockup */}
            <img src="/study with me.jpg" alt="Challenge Timer" className="w-[280px] md:w-[320px] h-auto rounded-[32px] shadow-xl relative z-10" />
            {/* Overlapping Widget */}
            <img src="/1.png" alt="Challenge Widget" className="absolute z-20 top-[40%] -left-[15%] md:-left-[35%] w-[320px] md:w-[400px] drop-shadow-2xl rounded-xl" />
          </div>
        </div>
        
      </div>
    </section>
  );
}
