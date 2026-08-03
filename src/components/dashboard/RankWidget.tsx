import React from 'react';
import { Trophy, TrendingUp, BarChart2 } from 'lucide-react';

export default function RankWidget() {
  return (
    <div className="bg-[#48B3C4] rounded-3xl p-5 w-full text-white relative overflow-hidden">
      
      {/* Decorative stars - absolute positioning */}
      <div className="absolute top-2 left-4 opacity-20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>

      {/* Top Row */}
      <div className="flex w-full justify-between items-start mb-2 relative z-10">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
          <Trophy size={20} className="text-yellow-400 fill-yellow-400" />
        </div>
        <div className="text-right">
          <span className="font-bold text-sm block mb-1">ترتيبك الحالي</span>
          <span className="text-3xl font-black block">#12</span>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex w-full justify-between items-center mt-4 relative z-10">
        <button className="bg-white text-[#48B3C4] rounded-xl px-4 py-2 flex items-center gap-2 font-bold text-xs shadow-sm hover:bg-gray-50 transition-colors">
          <span>عرض الترتيب كامل</span>
          <BarChart2 size={16} className="text-[#f59e0b]" />
        </button>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <TrendingUp size={14} />
          <span>ارتفعت 3 مراحل هذا الأسبوع</span>
        </div>
      </div>
      
    </div>
  );
}
