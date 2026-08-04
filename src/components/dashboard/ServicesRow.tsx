'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ServicesRow() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      // In RTL, scrollLeft is negative or zero. 
      // If we can scroll further left (which means more negative in some browsers, or positive in others).
      // A simple check is if scrollWidth > clientWidth, we might need arrows.
      // For simplicity, we just check if it's scrollable and show the button.
      setCanScrollLeft(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      // Scroll by 200px. In RTL, subtracting from scrollLeft moves left in most browsers.
      // We use scrollBy for smooth scrolling behavior across different browsers.
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const services = [
    {
      title: 'Ai Bot',
      icon: <img src="/home/ai boot.png" alt="Ai Bot" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#fff4ed]',
      iconBg: 'bg-transparent',
      route: '#'
    },
    {
      title: 'IELTS Exam',
      icon: <img src="/home/IELTS Exam.png" alt="IELTS" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#fff4ed]',
      iconBg: 'bg-transparent',
      route: '#'
    },
    {
      title: 'تعلم الإنجليزية',
      icon: <img src="/home/lean english.png" alt="Learn English" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#f8f5ff]',
      iconBg: 'bg-transparent',
      route: '#'
    },
    {
      title: 'E-Store',
      icon: <img src="/home/E-Store.png" alt="E-Store" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#fff0f2]',
      iconBg: 'bg-transparent',
      route: '#'
    },
    {
      title: 'الدورات التعليمية',
      icon: <img src="/home/section.png" alt="Courses" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#f0f9ff]',
      iconBg: 'bg-transparent',
      route: '/learning'
    },
    {
      title: 'منهجي التعليمي',
      icon: <img src="/home/منهجي التعليمي.png" alt="Curriculum" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#f0fdf4]',
      iconBg: 'bg-transparent',
      route: '/curriculum'
    }
  ];

  return (
    <div className="relative flex items-center mt-8 mb-8">
      <div 
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex flex-nowrap items-start justify-start md:justify-between w-full gap-6 overflow-x-auto pb-4 hide-scrollbar scroll-smooth"
      >
        {services.map((service, idx) => {
          const content = (
            <div className="flex flex-col items-center gap-3 min-w-[80px] cursor-pointer group">
              <div className={`w-20 h-20 rounded-full ${service.bgColor} flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm`}>
                <div className={`w-12 h-12 rounded-xl ${service.iconBg} flex items-center justify-center`}>
                  {service.icon}
                </div>
              </div>
              <span className="text-sm font-bold text-[#004e70] text-center max-w-[80px] leading-tight whitespace-nowrap">
                {service.title}
              </span>
            </div>
          );

          return service.route !== '#' ? (
            <Link key={idx} href={service.route} className="shrink-0">
              {content}
            </Link>
          ) : (
            <div key={idx} className="shrink-0">{content}</div>
          );
        })}
      </div>

      {/* Scroll Arrow (Matches screenshot) */}
      {canScrollLeft && (
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-6 z-10 w-10 h-10 rounded-full bg-[#e6f7ff] border border-[#bae0ff] flex items-center justify-center shadow-sm hover:bg-[#bae0ff] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#004e70]" />
        </button>
      )}
    </div>
  );
}

