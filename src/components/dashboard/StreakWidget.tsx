import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StreakWidgetProps {
  flame?: number;
}

export default function StreakWidget({ flame = 0 }: StreakWidgetProps) {
  const days = [
    { label: 'سبت', checked: true },
    { label: 'أحد', checked: false },
    { label: 'إثنين', checked: false },
    { label: 'ثلاثاء', checked: false },
    { label: 'أربعاء', checked: false },
    { label: 'خميس', checked: false },
    { label: 'جمعة', checked: false },
  ];

  return (
    <div className="bg-gray-50 rounded-3xl p-5 w-full border border-gray-100 flex flex-col items-center">
      
      {/* Top Row: Streak Number and Title */}
      <div className="flex w-full justify-between items-center mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-600 font-bold text-sm">أيام الحماس</span>
          <img src="/home/fire icon.png" alt="Flame" className="w-5 h-5 object-contain" />
        </div>
        <div className="text-3xl font-black text-[#004e70]">{flame}</div>
      </div>
      
      {/* Subtitle */}
      <div className="w-full text-right mb-6">
        <span className="text-sm font-bold text-gray-500">استمر أنت هكذا رائع!</span>
      </div>

      {/* Days of Week */}
      <div className="w-full flex justify-between items-center bg-white rounded-2xl py-3 px-2 shadow-sm border border-gray-100">
        {days.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-gray-500">{day.label}</span>
            {day.checked ? (
              <CheckCircle2 size={18} className="text-orange-500 fill-orange-500 border-none bg-white rounded-full" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-gray-100"></div>
            )}
          </div>
        ))}
      </div>
      
    </div>
  );
}
