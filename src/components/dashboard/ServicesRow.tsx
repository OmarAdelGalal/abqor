import React from 'react';

export default function ServicesRow() {
  const services = [
    {
      title: 'Ai Bot',
      icon: <img src="/home/ai boot.png" alt="Ai Bot" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#fff4ed]',
      iconBg: 'bg-transparent'
    },
    {
      title: 'IELTS Exam',
      icon: <img src="/home/IELTS Exam.png" alt="IELTS" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#fff4ed]',
      iconBg: 'bg-transparent'
    },
    {
      title: 'تعلم الإنجليزية',
      icon: <img src="/home/lean english.png" alt="Learn English" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#f8f5ff]',
      iconBg: 'bg-transparent'
    },
    {
      title: 'E-Store',
      icon: <img src="/home/E-Store.png" alt="E-Store" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#fff0f2]',
      iconBg: 'bg-transparent'
    },
    {
      title: 'الدورات التعليمية',
      icon: <img src="/home/section.png" alt="Courses" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#f0f9ff]',
      iconBg: 'bg-transparent'
    },
    {
      title: 'منهجي التعليمي',
      icon: <img src="/home/منهجي التعليمي.png" alt="Curriculum" className="w-8 h-8 object-contain" />,
      bgColor: 'bg-[#f0fdf4]',
      iconBg: 'bg-transparent'
    }
  ];

  return (
    <div className="flex flex-nowrap md:flex-wrap items-start justify-between w-full gap-4 mt-8 mb-8 overflow-x-auto pb-4 hide-scrollbar">
      {services.map((service, idx) => (
        <div key={idx} className="flex flex-col items-center gap-3 min-w-[80px] cursor-pointer group">
          <div className={`w-20 h-20 rounded-full ${service.bgColor} flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm`}>
            <div className={`w-12 h-12 rounded-xl ${service.iconBg} flex items-center justify-center`}>
              {service.icon}
            </div>
          </div>
          <span className="text-sm font-bold text-[#004e70] text-center max-w-[80px] leading-tight">
            {service.title}
          </span>
        </div>
      ))}
    </div>
  );
}
