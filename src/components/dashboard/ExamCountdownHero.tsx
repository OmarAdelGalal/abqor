'use client';

import React from 'react';
import { Share2, ChevronRight, ChevronLeft, Sparkles, BookOpen, Bell } from 'lucide-react';

interface ExamCountdownHeroProps {
  bacDate?: string;
}

interface SlideEvent {
  id: string;
  type: 'countdown' | 'event' | 'announcement';
  title: string;
  subtitle?: string;
  date?: string;
  gradient: string;
  accentColor: string;
  illustration: string;
  badge?: string;
}

export default function ExamCountdownHero({ bacDate }: ExamCountdownHeroProps) {
  const [timeLeft, setTimeLeft] = React.useState({ days: 215, hours: 28, minutes: 15, seconds: 32 });
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [direction, setDirection] = React.useState<'left' | 'right'>('left');
  const [shareToast, setShareToast] = React.useState(false);
  const autoPlayRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const slides: SlideEvent[] = [
    {
      id: 'bac',
      type: 'countdown',
      title: 'بقي على إمتحان',
      subtitle: `البكالوريا دورة ${bacDate ? new Date(bacDate).getFullYear() : '2025'}`,
      date: bacDate,
      gradient: 'from-[#1b5d6e] via-[#2F8E9C] to-[#45B7C7]',
      accentColor: '#45B7C7',
      illustration: '/c518e28edf6bef8d0d46fdbfb27871175eb44f11.png',
      badge: '🎓 موعد البكالوريا',
    },
    {
      id: 'mock',
      type: 'event',
      title: 'اختبار تجريبي',
      subtitle: 'الدورة الأولى — الفصل الدراسي الثاني',
      date: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString();
      })(),
      gradient: 'from-[#3b1e6e] via-[#6b3fa0] to-[#9b6fd4]',
      accentColor: '#9b6fd4',
      illustration: '/c518e28edf6bef8d0d46fdbfb27871175eb44f11.png',
      badge: '📝 اختبار قادم',
    },
    {
      id: 'revision',
      type: 'announcement',
      title: 'أسبوع المراجعة',
      subtitle: 'مراجعة شاملة لجميع المواد',
      date: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        return d.toISOString();
      })(),
      gradient: 'from-[#1a4a2e] via-[#2d7a4f] to-[#4caf80]',
      accentColor: '#4caf80',
      illustration: '/c518e28edf6bef8d0d46fdbfb27871175eb44f11.png',
      badge: '📚 مراجعة',
    },
    {
      id: 'results',
      type: 'announcement',
      title: 'إعلان النتائج',
      subtitle: 'نتائج الفصل الدراسي الأول',
      date: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toISOString();
      })(),
      gradient: 'from-[#6e2a1b] via-[#b04a2f] to-[#e07050]',
      accentColor: '#e07050',
      illustration: '/c518e28edf6bef8d0d46fdbfb27871175eb44f11.png',
      badge: '🏆 نتائج',
    },
  ];

  // Countdown timer
  React.useEffect(() => {
    const calculateTimeLeft = (targetDate?: string) => {
      if (!targetDate) return;
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    const activeDate = slides[currentSlide]?.date;
    calculateTimeLeft(activeDate);
    const timer = setInterval(() => calculateTimeLeft(activeDate), 1000);
    return () => clearInterval(timer);
  }, [currentSlide, bacDate]);

  // Auto-play
  const startAutoPlay = React.useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      goToSlide((prev: number) => (prev + 1) % slides.length, 'left');
    }, 5000);
  }, [slides.length]);

  React.useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [startAutoPlay]);

  const goToSlide = (indexOrUpdater: number | ((prev: number) => number), dir: 'left' | 'right') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(dir);
    setTimeout(() => {
      setCurrentSlide(prev => typeof indexOrUpdater === 'function' ? indexOrUpdater(prev) : indexOrUpdater);
      setIsAnimating(false);
    }, 350);
  };

  const handlePrev = () => {
    goToSlide((prev: number) => (prev - 1 + slides.length) % slides.length, 'right');
    startAutoPlay();
  };

  const handleNext = () => {
    goToSlide((prev: number) => (prev + 1) % slides.length, 'left');
    startAutoPlay();
  };

  const handleDot = (idx: number) => {
    const dir = idx > currentSlide ? 'left' : 'right';
    goToSlide(idx, dir);
    startAutoPlay();
  };

  const handleShare = async () => {
    const slide = slides[currentSlide];
    const shareText = `${slide.title} — ${slide.subtitle ?? ''}\nالأيام المتبقية: ${timeLeft.days} يوم`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: slide.title, text: shareText, url: shareUrl });
      } catch {
        // user cancelled — do nothing
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  const slide = slides[currentSlide];

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

        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-out-left {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-60px); }
        }
        @keyframes slide-out-right {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(60px); }
        }

        .slide-enter-left  { animation: slide-in-left  0.35s ease forwards; }
        .slide-enter-right { animation: slide-in-right 0.35s ease forwards; }
        .slide-exit-left   { animation: slide-out-left  0.35s ease forwards; }
        .slide-exit-right  { animation: slide-out-right 0.35s ease forwards; }

        .hero-gradient-transition {
          transition: background 0.6s ease;
        }
      `}</style>

      <div
        className={`rounded-3xl p-6 w-full text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between min-h-[240px] shadow-[0_15px_40px_-15px_rgba(69,183,199,0.5)] group hero-gradient-transition`}
        style={{ background: `linear-gradient(135deg, ${slide.gradient.replace('from-[', '').replace('] via-[', ', ').replace('] to-[', ', ').replace(']', '')})` }}
      >
        {/* Dynamic Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} z-0 hero-gradient-transition`}></div>

        {/* Glowing Orbs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/20 blur-[60px] rounded-full z-0 animate-pulse-glow"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 blur-[60px] rounded-full z-0 animate-pulse-glow" style={{ animationDelay: '3s' }}></div>

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

        {/* Slide Content */}
        <div
          key={currentSlide}
          className={`flex flex-col md:flex-row items-center justify-between w-full ${isAnimating ? (direction === 'left' ? 'slide-exit-left' : 'slide-exit-right') : (direction === 'left' ? 'slide-enter-left' : 'slide-enter-right')}`}
        >
          {/* Right Side: Title and Timer */}
          <div className="flex flex-col items-end z-10 w-full md:w-[60%] mt-4 md:mt-0 px-4 md:px-8 text-right order-2 md:order-1">
            {/* Badge */}
            {slide.badge && (
              <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-full px-3 py-1 text-xs font-bold mb-3 backdrop-blur-sm">
                {slide.badge}
              </span>
            )}

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black mb-6 leading-tight drop-shadow-md">
              {slide.title} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-white to-white/70 relative inline-block mt-2">
                {slide.subtitle}
                <svg className="absolute -bottom-2 right-0 w-full h-3 text-white/30" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path d="M0,10 Q50,0 100,10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h2>

            <div className="flex items-center gap-2 md:gap-4 font-bold text-center flex-row-reverse pb-2">
              <TimerBox value={timeLeft.seconds} label="ثانية" />
              <span className="text-2xl md:text-3xl font-black pb-6 text-white/50 animate-pulse">:</span>
              <TimerBox value={timeLeft.minutes} label="دقيقة" />
              <span className="text-2xl md:text-3xl font-black pb-6 text-white/50 animate-pulse" style={{ animationDelay: '0.2s' }}>:</span>
              <TimerBox value={timeLeft.hours} label="ساعة" />
              <span className="text-2xl md:text-3xl font-black pb-6 text-white/50 animate-pulse" style={{ animationDelay: '0.4s' }}>:</span>
              <TimerBox value={timeLeft.days} label="يوم" isPrimary />
            </div>
          </div>

          {/* Left Side: Illustration */}
          <div className="relative z-10 flex flex-col items-center justify-end w-full md:w-[30%] h-[200px] order-1 md:order-2 mt-4 md:mt-0">
            <div className="absolute -bottom-8 w-40 h-10 bg-white/10 rounded-[100%] blur-md"></div>
            <div className="absolute -bottom-10 w-48 h-64 z-10 animate-float">
              <img
                src={slide.illustration}
                alt="Student"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Share Button — top left corner */}
        <button
          onClick={handleShare}
          className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/30 hover:bg-white/30 hover:border-white/50 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] transition-all duration-300 rounded-full px-4 py-2 text-sm font-bold text-white shadow-[0_4px_15px_rgba(0,0,0,0.15)] cursor-pointer group/share"
        >
          <Share2 size={15} className="group-hover/share:rotate-12 transition-transform duration-300" />
          <span>{shareToast ? 'تم النسخ ✓' : 'مشاركة'}</span>
        </button>

        {/* Prev Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg hover:bg-white/25 hover:scale-110 transition-all duration-300 z-20 cursor-pointer"
          aria-label="السابق"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>

        {/* Next Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg hover:bg-white/25 hover:scale-110 transition-all duration-300 z-20 cursor-pointer"
          aria-label="التالي"
        >
          <ChevronRight size={20} className="text-white" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDot(idx)}
              className="transition-all duration-300 cursor-pointer"
              aria-label={`الانتقال للشريحة ${idx + 1}`}
            >
              <div className={`rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-6 h-1.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                  : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80 hover:scale-150'
              }`} />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function TimerBox({ value, label, isPrimary = false }: { value: number | string; label: string; isPrimary?: boolean }) {
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
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent"></div>
        <span className="relative z-10 drop-shadow-md">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs md:text-sm font-bold text-white/70 group-hover/timer:text-white transition-colors">{label}</span>
    </div>
  );
}
