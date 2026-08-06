import React from 'react';
import { TrendingUp, BarChart2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RankWidgetProps {
  rank?: number;
  progress?: number;
}

export default function RankWidget({ rank = 12, progress = 3 }: RankWidgetProps) {
  const router = useRouter();

  return (
    <div
      className="rounded-3xl p-5 w-full text-white relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #5DC8D8 0%, #3BA8BA 50%, #2E95A8 100%)',
        minHeight: '110px',
      }}
    >
      {/* Background decorative image - left side */}
      <img
        src="/tartget.png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{
          left: 0,
          top: -20,
          height: '100%',
          width: 'auto',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: 0.50,
          mixBlendMode: 'screen',
        }}
      />

      {/* Top Row */}
      <div dir='ltr' className="flex w-full justify-between items-start mb-3 relative z-10">
        {/* Right side (RTL): Trophy icon in white circle */}
        <div
          className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md"
          style={{ flexShrink: 0 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 21h8M12 17v4M5 3H3a2 2 0 000 4c0 2.4 1.5 4.5 3.7 5.4M19 3h2a2 2 0 010 4c0 2.4-1.5 4.5-3.7 5.4M17 3H7v7a5 5 0 0010 0V3z"
              stroke="#FBBF24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Left side (RTL): Rank label and number */}
        <div className="flex flex-col items-end text-right">
          <span className="font-semibold text-xs block mb-0.5 opacity-90">ترتيبك الحالي</span>
          <span className="font-black block" style={{ fontSize: '2.2rem', lineHeight: '1' }}>#{rank}</span>
        </div>
      </div>

      {/* Bottom Row */}
      <div dir='ltr' className="flex w-full justify-between items-center relative z-10">
        {/* Right side (RTL): Button */}
        <button
          onClick={() => router.push('/ranking')}
          className="bg-white rounded-2xl flex items-center gap-2 font-bold text-xs shadow-sm hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
          style={{
            color: '#3BA8BA',
            paddingTop: '8px',
            paddingBottom: '8px',
            paddingRight: '14px',
            paddingLeft: '10px',
          }}
        >
          <span>عرض الترتيب كامل</span>
          <BarChart2 size={15} style={{ color: '#F59E0B' }} />
        </button>

        {/* Left side (RTL): Rising info */}
        <div className="flex items-center gap-1.5 text-xs font-semibold opacity-95">
          <TrendingUp size={14} />
          <span>ارتفعت {progress} مراحل هذا الأسبوع</span>
        </div>
      </div>
    </div>
  );
}
