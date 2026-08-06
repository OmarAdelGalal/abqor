import React from 'react';
import { Crown } from 'lucide-react';

export default function UpgradeWidget() {
  return (
    <div dir='rtl' className="bg-[#004e70] rounded-3xl p-7 pt-10 w-auto text-white relative overflow-hidden flex flex-col items-end text-right">

      {/* Decorative background image */}
      <img
        src="/Vector1.png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          height: '80%',
          width: 'auto',
          opacity: 0.12,
          mixBlendMode: 'screen',
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-2 relative z-10 w-full justify-end">
        <h3 className="font-bold text-lg">!احصل على تجربة تعليمية أفضل</h3>
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0">
          <Crown size={16} className="text-yellow-500 fill-yellow-500" />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-blue-100 font-medium leading-relaxed mb-5 relative z-10">
        وصول غير محدود للدروس والملخصات والعديد من المميزات الحصرية
      </p>

      {/* Upgrade Button */}
      <button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-white font-bold py-3 rounded-xl shadow-lg relative z-10 transition-all">
        ترقية الحساب
      </button>

    </div>
  );
}
