'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Beaker, MessageCircle, Globe, Lightbulb, Box } from 'lucide-react';

interface CurriculumNodeProps {
  quiz: any;
  isActive: boolean;
  isLocked: boolean;
  index: number;
}

export default function CurriculumNode({ quiz, isActive, isLocked, index }: CurriculumNodeProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Decide Icon based on index or quiz style
  const getIcon = () => {
    switch (index % 5) {
      case 0: return <Beaker className="w-8 h-8" />;
      case 1: return <MessageCircle className="w-8 h-8" />;
      case 2: return <Globe className="w-8 h-8" />;
      case 3: return <Box className="w-8 h-8" />;
      case 4: return <Lightbulb className="w-8 h-8" />;
      default: return <Beaker className="w-8 h-8" />;
    }
  };

  const linkHref = isLocked ? '#' : `/learning/course/${quiz.id}`;

  const handleClick = (e: React.MouseEvent) => {
    if (isActive) {
      e.preventDefault();
      setShowDetails(!showDetails);
    } else if (isLocked) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative group">
      
      {/* Tooltip for Active Node */}
      {isActive && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white rounded-lg px-4 py-2 shadow-lg border border-gray-100 z-20 animate-bounce cursor-default">
          <span className="text-[#1FA6BA] font-bold">إبدأ</span>
          {/* Arrow pointing down */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-gray-100 rotate-45"></div>
        </div>
      )}

      {/* Node Button */}
      <Link href={linkHref} onClick={handleClick} className={`relative block rounded-full z-10 transition-transform ${isLocked ? 'cursor-not-allowed' : 'hover:scale-105'}`}>
        
        {isActive ? (
           // Active State (Teal inner, Yellow outer ring)
           <div className="w-24 h-24 rounded-full relative flex items-center justify-center">
              {/* SVG Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="46" 
                  fill="none" 
                  stroke="#fbbf24" 
                  strokeWidth="8" 
                  strokeDasharray="289" 
                  strokeDashoffset="72" // ~75% complete visual
                  strokeLinecap="round"
                />
              </svg>
              {/* Inner Circle */}
              <div className="w-16 h-16 bg-[#1FA6BA] rounded-full flex items-center justify-center text-white shadow-[0_4px_0_#148091]">
                {getIcon()}
              </div>
           </div>
        ) : (
           // Locked State (Gray 3D effect)
           <div className="w-20 h-20 bg-[#e5e5e5] rounded-full flex items-center justify-center text-[#a3a3a3] shadow-[inset_0_-4px_0_#d4d4d4,0_4px_10px_rgba(0,0,0,0.05)] border-4 border-white">
             {getIcon()}
           </div>
        )}
      </Link>

      {/* Popup Details Card */}
      {isActive && showDetails && (
        <div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-[280px] bg-[#45B7C7] rounded-xl p-4 shadow-xl z-30 flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          {/* Arrow pointing up */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#45B7C7] rotate-45 rounded-sm"></div>
          
          <h3 className="text-white font-bold text-lg">{quiz.subject_name || 'اللغة العربية'}</h3>
          <p className="text-white text-sm text-center">{quiz.title || 'الجمل التي لها محل من الاعراب'}</p>
          <p className="text-white/90 text-xs mb-1">السؤال 1 من {quiz.questions_count || 4}</p>

          <div className="w-full flex flex-col gap-2 mt-1">
            <Link 
              href={`/learning/course/${quiz.id}`} 
              className="w-full bg-white text-[#45B7C7] text-center font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              ابدا الان
            </Link>
            <button className="w-full bg-[#fbbf24] text-white flex items-center justify-center gap-2 font-bold py-2.5 rounded-lg hover:bg-yellow-500 transition-colors shadow-sm">
              <span>شرح الدرس</span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="11" fill="white" stroke="#ef4444" strokeWidth="1.5"/>
                <path d="M10 8L16 12L10 16V8Z" fill="#ef4444"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
