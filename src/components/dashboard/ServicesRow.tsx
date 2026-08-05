'use client';

import React from 'react';
import Link from 'next/link';

export default function ServicesRow() {
  const services = [
    {
      title: 'Ai Bot',
      icon: <img src="/home/ai boot.png" alt="Ai Bot" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#fff4ed]',
      route: '#'
    },
    {
      title: 'IELTS Exam',
      icon: <img src="/home/IELTS Exam.png" alt="IELTS" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#fff4ed]',
      route: '#'
    },
    {
      title: 'تعلم الإنجليزية',
      icon: <img src="/home/lean english.png" alt="Learn English" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#f8f5ff]',
      route: '#'
    },
    {
      title: 'E-Store',
      icon: <img src="/home/E-Store.png" alt="E-Store" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#fff0f2]',
      route: '/store'
    },
    {
      title: 'الدورات التعليمية',
      icon: <img src="/home/section.png" alt="Courses" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#f0f9ff]',
      route: '/learning'
    },
    {
      title: 'منهجي التعليمي',
      icon: <img src="/home/منهجي التعليمي.png" alt="Curriculum" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#f0fdf4]',
      route: '/curriculum'
    }
  ];

  return (
    <div className="mt-8 mb-8 w-full">
      <div className="grid grid-cols-2 min-[400px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 justify-items-center">
        {services.map((service, idx) => {
          const content = (
            <div className="flex flex-col items-center gap-3 cursor-pointer group max-w-[90px]">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${service.bgColor} flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm group-hover:shadow-md`}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                  {service.icon}
                </div>
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#004e70] text-center leading-tight">
                {service.title}
              </span>
            </div>
          );

          return service.route !== '#' ? (
            <Link key={idx} href={service.route} className="w-full flex justify-center">
              {content}
            </Link>
          ) : (
            <div key={idx} className="w-full flex justify-center">{content}</div>
          );
        })}
      </div>
    </div>
  );
}
