'use client';

import React from 'react';
import { Share2, ChevronRight, Sparkles } from 'lucide-react';

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
    <>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 5s ease-in-out infinite; }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 0.9; transform: scale(1.1) rotate(5deg); }
        }
        .animate-twinkle { animation: twinkle 4s ease-in-out infinite; }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .animate-pulse-glow { animation: pulse-glow 6s ease-in-out infinite; }
      `}</style>
      
      <div className="rounded-3xl p-6 w-full text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-[240px] shadow-[0_15px_40px_-15px_rgba(69,183,199,0.5)] group">
        
        {/* Dynamic Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1b5d6e] via-[#2F8E9C] to-[#45B7C7] z-0"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 blur-[60px] rounded-full z-0 animate-pulse-glow"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#69d9e8]/30 blur-[60px] rounded-full z-0 animate-pulse-glow" style={{ animationDelay: '3s' }}></div>

        {/* Decorative stars */}
        <div className="absolute top-8 right-12 z-0 animate-twinkle">
          <Sparkles className="w-8 h-8 text-white/70" />
        </div>
        <div className="absolute bottom-12 left-1/4 z-0 animate-twinkle" style={{ animationDelay: '1.5s' }}>
          <Sparkles className="w-6 h-6 text-white/50" />
        </div>
        <div className="absolute top-1/2 left-[45%] z-0 animate-twinkle" style={{ animationDelay: '2.5s' }}>
          <Sparkles className="w-4 h-4 text-white/40" />
        </div>

        {/* Right Side: Title and Timer */}
        <div className="flex flex-col items-end z-10 w-full md:w-[60%] mt-4 md:mt-0 px-4 md:px-8 text-right order-2 md:order-1">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-8 leading-tight drop-shadow-md">
            بقي على إمتحان <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-white to-white/70 relative inline-block mt-2">
              البكالوريا دورة {bacDate ? new Date(bacDate).getFullYear() : '2025'}
              {/* Text Underline Decoration */}
              <svg className="absolute -bottom-2 right-0 w-full h-3 text-white/30" viewBox="0 0 100 12" preserveAspectRatio="none">
                <path d="M0,10 Q50,0 100,10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              </svg>
            </span>
          </h2>
          
          <div className="flex items-center gap-2 md:gap-4 dir-ltr font-bold text-center flex-row-reverse pb-2">
            <TimerBox value={timeLeft.seconds} label="ثانية" />
            <span className="text-2xl md:text-3xl font-black pb-6 text-white/50 animate-pulse">:</span>
            <TimerBox value={timeLeft.minutes} label="دقيقة" />
            <span className="text-2xl md:text-3xl font-black pb-6 text-white/50 animate-pulse" style={{ animationDelay: '0.2s' }}>:</span>
            <TimerBox value={timeLeft.hours} label="ساعة" />
            <span className="text-2xl md:text-3xl font-black pb-6 text-white/50 animate-pulse" style={{ animationDelay: '0.4s' }}>:</span>
            <TimerBox value={timeLeft.days} label="يوم" isPrimary />
          </div>
        </div>

        {/* Left Side: Illustration and Button */}
        <div className="relative z-10 flex flex-col items-center justify-end w-full md:w-[30%] h-[200px] order-1 md:order-2 mt-4 md:mt-0">
          {/* Glass platform for the boy */}
          <div className="absolute -bottom-8 w-40 h-10 bg-white/10 rounded-[100%] blur-md"></div>
          
          <div className="absolute -bottom-10 w-48 h-64 z-10 animate-float">
            <img 
              src="/c518e28edf6bef8d0d46fdbfb27871175eb44f11.png" 
              alt="Student" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          
          <button className="absolute bottom-2 left-0 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/25 hover:border-white/40 transition-all duration-300 rounded-full px-4 py-2 flex items-center gap-2 text-sm font-bold shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:-translate-y-1 z-20 group/btn cursor-pointer">
            <Share2 size={16} className="group-hover/btn:rotate-12 transition-transform" />
            <span>مشاركة</span>
          </button>
        </div>

        {/* Navigation Arrow */}
        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg hover:bg-white/20 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-500 z-20 opacity-0 group-hover:opacity-100 translate-x-8 group-hover:translate-x-0 cursor-pointer">
          <ChevronRight size={24} className="text-white" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          <div className="w-6 h-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/40 hover:bg-white/80 cursor-pointer transition-all duration-300 hover:scale-150"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/40 hover:bg-white/80 cursor-pointer transition-all duration-300 hover:scale-150"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/40 hover:bg-white/80 cursor-pointer transition-all duration-300 hover:scale-150"></div>
        </div>
        
      </div>
    </>
  );
}

function TimerBox({ value, label, isPrimary = false }: { value: number | string, label: string, isPrimary?: boolean }) {
  return (
    <div className="flex flex-col items-center group/timer mt-2">
      <div className={`
        relative overflow-hidden
        backdrop-blur-md rounded-2xl px-4 md:px-5 py-3 md:py-4
        text-2xl md:text-4xl font-black mb-2 
        border transition-all duration-300
        hover:-translate-y-1.5
        shadow-[0_8px_32px_rgba(0,0,0,0.15)]
        ${isPrimary 
          ? 'bg-gradient-to-br from-white/30 to-white/10 border-white/60 text-white shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:border-white' 
          : 'bg-white/10 border-white/20 text-white/90 hover:bg-white/25 hover:border-white/50'}
      `}>
        {/* Inner glass shine */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
        
        <span className="relative z-10 drop-shadow-md">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs md:text-sm font-bold text-white/70 group-hover/timer:text-white transition-colors">{label}</span>
    </div>
  );
}
