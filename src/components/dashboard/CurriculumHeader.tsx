'use client';

import React from 'react';
import { List } from 'lucide-react';

interface CurriculumHeaderProps {
  yearName?: string;
  termName: string;
  weekName: string;
  dayName?: string;
  isActive: boolean;
}

export default function CurriculumHeader({
  yearName,
  termName,
  weekName,
  dayName,
  isActive
}: CurriculumHeaderProps) {
  
  if (!isActive) {
    // Locked / Upcoming Style (Yellow/Tan)
    return (
      <div className="w-full relative mt-8">
        <div className="w-full bg-[#fcefb4] rounded-2xl p-6 shadow-sm border border-[#f9df88] flex items-center justify-between opacity-70">
           <div className="text-right flex flex-col items-start w-full pr-4">
             <h2 className="text-xl font-bold text-white drop-shadow-md">{termName}</h2>
             <p className="text-white font-bold opacity-90 drop-shadow-sm">{weekName}</p>
           </div>
           
           <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-inner shrink-0">
             <List className="w-6 h-6 text-white" />
           </div>
        </div>
      </div>
    );
  }

  // Active Style (Teal/Blue)
  return (
    <div className="w-full relative pt-6">
      {/* Top Pill - Year Name */}
      {yearName && (
        <div className="absolute top-0 right-4 bg-[#23a7ba] text-white font-bold px-6 py-2 rounded-xl text-sm shadow-sm z-10">
          {yearName}
        </div>
      )}
      
      {/* Main Card */}
      <div className="w-full bg-gradient-to-l from-[#1FA6BA] to-[#3097c5] rounded-2xl p-6 pt-8 shadow-md flex items-center justify-between">
         
         {/* Right Text */}
         <div className="text-right flex flex-col items-start w-full pr-4">
           <h2 className="text-2xl font-black text-white">{termName}</h2>
           <p className="text-white font-bold mt-1 opacity-90">{weekName}</p>
         </div>

         {/* Left Icon Block */}
         <div className="flex flex-col items-center justify-center shrink-0">
           <div className="w-12 h-12 bg-[#2dbbe1] rounded-xl flex items-center justify-center shadow-inner mb-2 border border-[#4eceef]">
             <List className="w-6 h-6 text-white" />
           </div>
           {dayName && (
             <span className="text-white text-xs font-bold opacity-90">{dayName}</span>
           )}
         </div>

      </div>
    </div>
  );
}
