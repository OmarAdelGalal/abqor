'use client';

import React from 'react';

interface FloatingBottomNavProps {
  activeTab: 'all' | 'mine';
  onTabChange: (tab: 'all' | 'mine') => void;
}

export default function FloatingBottomNav({ activeTab, onTabChange }: FloatingBottomNavProps) {
  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none z-40">
      <div className="bg-[#004e70] p-1.5 rounded-full flex items-center shadow-lg pointer-events-auto" dir="rtl">
        
        {/* All Courses */}
        <button
          onClick={() => onTabChange('all')}
          className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
            activeTab === 'all' 
              ? 'bg-white text-[#004e70]' 
              : 'text-white/80 hover:text-white'
          }`}
        >
          كل الدورات
        </button>

        {/* My Courses */}
        <button
          onClick={() => onTabChange('mine')}
          className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
            activeTab === 'mine' 
              ? 'bg-white text-[#004e70]' 
              : 'text-white/80 hover:text-white'
          }`}
        >
          دوراتي
        </button>

      </div>
    </div>
  );
}
