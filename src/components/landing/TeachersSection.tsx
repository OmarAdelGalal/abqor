"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function TeachersSection() {
  const [activeSubject, setActiveSubject] = useState<'english' | 'french' | 'physics'>('english');

  return (
    <section className="w-full py-24 relative overflow-hidden">
      <div className="absolute left-0 top-0 w-1/3 h-full bg-[#f4f9f9] rounded-r-[100px] -z-10"></div>
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-right space-y-8">
          <h2 className="text-4xl md:text-[2.75rem] font-black text-[#112F4E] leading-tight">
            تعلّم من <span className="text-[#1FA6BA]">أفضل</span> الأساتذة
          </h2>
          <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
            استكشف مجموعة متنوعة من الدورات التفاعلية مع أفضل الأساتذة، وابدأ رحلة تعلّم تناسب أهدافك.
          </p>
          
          <div className="flex flex-col items-center md:items-start w-full pt-6">
            <div className="flex gap-8 justify-center md:justify-start">
              
              {/* English */}
              <div onClick={() => setActiveSubject('english')} className="cursor-pointer flex flex-col items-center gap-3">
                <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all border-2 ${activeSubject === 'english' ? 'bg-[#1FA6BA] border-[#1FA6BA] text-white shadow-lg shadow-cyan-500/30' : 'bg-transparent border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                  <div className="relative flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
                      <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" />
                    </svg>
                    <span className={`absolute text-[11px] font-black mt-[-4px] ${activeSubject === 'english' ? 'text-[#1FA6BA]' : 'text-white'}`}>EN</span>
                  </div>
                </div>
                <span className={`font-bold text-lg ${activeSubject === 'english' ? 'text-[#1FA6BA]' : 'text-gray-500'}`}>اللغة الإنجليزية</span>
              </div>

              {/* French */}
              <div onClick={() => setActiveSubject('french')} className="cursor-pointer flex flex-col items-center gap-3">
                <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all border-2 ${activeSubject === 'french' ? 'bg-[#1FA6BA] border-[#1FA6BA] text-white shadow-lg shadow-cyan-500/30' : 'bg-transparent border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                  <div className="relative flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9">
                      <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" />
                    </svg>
                    <span className={`absolute text-[11px] font-black mt-[-4px] ${activeSubject === 'french' ? 'text-[#1FA6BA]' : 'text-white'}`}>FR</span>
                  </div>
                </div>
                <span className={`font-bold text-lg ${activeSubject === 'french' ? 'text-[#1FA6BA]' : 'text-gray-500'}`}>اللغة الفرنسية</span>
              </div>

              {/* Physics */}
              <div onClick={() => setActiveSubject('physics')} className="cursor-pointer flex flex-col items-center gap-3">
                <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all border-2 ${activeSubject === 'physics' ? 'bg-[#1FA6BA] border-[#1FA6BA] text-white shadow-lg shadow-cyan-500/30' : 'bg-transparent border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
                    <circle cx="12" cy="12" r="3"></circle>
                    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(45 12 12)"></ellipse>
                    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-45 12 12)"></ellipse>
                  </svg>
                </div>
                <span className={`font-bold text-lg ${activeSubject === 'physics' ? 'text-[#1FA6BA]' : 'text-gray-500'}`}>الفيزياء</span>
              </div>

            </div>

            {/* +15 Other Subjects Button */}
            <div className="mt-8 self-center md:self-start md:mr-2">
              <button className="bg-[#E6F6F9] text-[#1FA6BA] font-bold text-lg px-6 py-2.5 rounded-full hover:bg-[#d0eff4] transition-colors">
                +15 مادة أخرى
              </button>
            </div>

          </div>
        </div>

        <div className="w-full md:w-1/2 relative min-h-[500px] flex items-center justify-center">
          {/* Animated Cards Stack */}
          <div className="relative w-full max-w-[400px] h-[400px]">
            {[
              { id: 'english', src: '/Frame 1984078521.png', alt: 'English Course' },
              { id: 'french', src: '/Frame 1300192893.png', alt: 'French Course' },
              { id: 'physics', src: '/دورة الفصل الأول.png', alt: 'Physics Course' },
            ].map((card) => {
              const subjects = ['english', 'french', 'physics'];
              const activeIndex = subjects.indexOf(activeSubject);
              const thisIndex = subjects.indexOf(card.id);
              // Calculate position in stack (0 = top, 1 = middle, 2 = bottom)
              const stackPos = (thisIndex - activeIndex + 3) % 3;

              // Stack goes down and to the physical left
              let zIndex, scale, x, y, opacity;
              if (stackPos === 0) {
                zIndex = 30; scale = 1; x = 0; y = 0; opacity = 1;
              } else if (stackPos === 1) {
                zIndex = 20; scale = 0.92; x = -40; y = 40; opacity = 0.9;
              } else {
                zIndex = 10; scale = 0.84; x = -80; y = 80; opacity = 0.6;
              }

              return (
                <motion.img
                  key={card.id}
                  src={card.src}
                  alt={card.alt}
                  layout
                  initial={false}
                  animate={{
                    zIndex,
                    scale,
                    x,
                    y,
                    opacity
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 25,
                    mass: 0.8
                  }}
                  className="absolute top-0 right-0 w-[280px] md:w-[350px] h-auto shadow-2xl rounded-2xl cursor-pointer"
                  onClick={() => setActiveSubject(card.id as any)}
                />
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
