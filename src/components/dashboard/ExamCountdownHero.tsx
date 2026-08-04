'use client';

import React from 'react';
import { Share2, ChevronRight } from 'lucide-react';

interface ExamCountdownHeroProps {
  bacDate?: string;
}

export default function ExamCountdownHero({ bacDate }: ExamCountdownHeroProps) {
  const [timeLeft, setTimeLeft] = React.useState({ days: 215, hours: 28, minutes: 15, seconds: 32 });

  React.useEffect(() => {
    if (!bacDate) return;
    
    const calculateTimeLeft = () => {
      const difference = new Date(bacDate).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [bacDate]);

  return (
    <div className="bg-[#48B3C4] rounded-3xl p-6 w-full text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-[220px]">
      
      {/* Decorative stars */}
      <div className="absolute top-4 right-10 opacity-30">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>
      <div className="absolute bottom-8 left-1/4 opacity-20 transform scale-75">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>

      {/* Decorative Calendar Grid Background */}
      <div className="absolute left-6 top-6 opacity-10 grid grid-cols-4 gap-1 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-8 h-8 bg-white rounded-sm"></div>
        ))}
      </div>

      {/* Right Side: Title and Timer */}
      <div className="flex flex-col items-end z-10 w-full md:w-1/2 mt-4 md:mt-0 px-4 md:px-12 text-right order-2 md:order-1">
        <h2 className="text-2xl md:text-3xl font-black mb-6 leading-tight">
          بقي على إمتحان <br/> البكالوريا دورة {bacDate ? new Date(bacDate).getFullYear() : '2025'}
        </h2>
        
        <div className="flex items-center gap-3 dir-ltr font-bold text-center flex-row-reverse">
          <div className="flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-2xl md:text-3xl font-black mb-1">
              {timeLeft.seconds}
            </div>
            <span className="text-xs">ثانية</span>
          </div>
          <span className="text-2xl font-black pb-4">:</span>
          <div className="flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-2xl md:text-3xl font-black mb-1">
              {timeLeft.minutes}
            </div>
            <span className="text-xs">دقيقة</span>
          </div>
          <span className="text-2xl font-black pb-4">:</span>
          <div className="flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-2xl md:text-3xl font-black mb-1">
              {timeLeft.hours}
            </div>
            <span className="text-xs">ساعة</span>
          </div>
          <span className="text-2xl font-black pb-4">:</span>
          <div className="flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-2xl md:text-3xl font-black mb-1">
              {timeLeft.days}
            </div>
            <span className="text-xs">يوم</span>
          </div>
        </div>
      </div>

      {/* Left Side: Illustration and Button */}
      <div className="relative z-10 flex flex-col items-center justify-end w-full md:w-1/3 h-[200px] order-1 md:order-2">
        <div className="absolute -bottom-8 w-48 h-56 z-10">
          <img 
            src="/c518e28edf6bef8d0d46fdbfb27871175eb44f11.png" 
            alt="Stressed Student" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <button className="absolute bottom-0 left-0 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold shadow-sm z-20">
          <Share2 size={14} />
          <span>مشاركة</span>
        </button>
      </div>

      {/* Navigation Arrow */}
      <button className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#004e70] rounded-full flex items-center justify-center shadow-lg hover:bg-[#003d58] transition-colors z-20">
        <ChevronRight size={18} className="text-white" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        <div className="w-2 h-2 rounded-full bg-white"></div>
        <div className="w-2 h-2 rounded-full bg-white/40"></div>
        <div className="w-2 h-2 rounded-full bg-white/40"></div>
        <div className="w-2 h-2 rounded-full bg-white/40"></div>
      </div>
      
    </div>
  );
}
