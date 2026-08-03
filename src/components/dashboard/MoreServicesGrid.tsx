import React from 'react';

export default function MoreServicesGrid() {
  const services = [
    {
      title: 'جدول التوقيت',
      icon: <img src="/home/جدول التوقيت.png" alt="Timetable" className="w-10 h-10 object-contain" />,
      iconBg: 'bg-transparent'
    },
    {
      title: 'حساب المعدل',
      icon: <img src="/home/حساب المعدل.png" alt="GPA" className="w-10 h-10 object-contain" />,
      iconBg: 'bg-transparent'
    },
    {
      title: 'Focus to do',
      icon: <img src="/home/fouce to do.png" alt="Focus to do" className="w-10 h-10 object-contain" />,
      iconBg: 'bg-transparent'
    },
    {
      title: 'بنك الإختبارات',
      icon: <img src="/home/بنك الاختبارات.png" alt="Test Bank" className="w-10 h-10 object-contain" />,
      iconBg: 'bg-transparent'
    }
  ];

  return (
    <div className="w-full mt-4">
      {/* Title */}
      <h3 className="text-right text-[#004e70] font-bold text-lg mb-4">
        المزيد من الخدمات
      </h3>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {services.map((service, idx) => (
          <div 
            key={idx} 
            className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:shadow-md transition-shadow group"
          >
            <div className={`w-16 h-16 rounded-full ${service.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
              {service.icon}
            </div>
            <span className="font-bold text-[#004e70] text-sm text-center">
              {service.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
