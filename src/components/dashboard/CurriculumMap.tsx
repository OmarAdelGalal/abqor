'use client';

import React, { useEffect, useState } from 'react';
import { quizzesApi } from '@/lib/quizzes';
import { authApi } from '@/lib/auth';
import CurriculumHeader from './CurriculumHeader';
import CurriculumNode from './CurriculumNode';

export default function CurriculumMap() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [weeksData, setWeeksData] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  
  // Hardcode term 1, week 1 for now, or dynamically select based on weeksData
  const [activeTerm, setActiveTerm] = useState(1);
  const [activeWeek, setActiveWeek] = useState(1);

  useEffect(() => {
    const fetchCurriculumData = async () => {
      try {
        setLoading(true);
        // 1. Fetch User Profile to get the year
        const profileRaw = await authApi.getUserProfile();
        const profileRes = profileRaw?.data?.data || profileRaw?.data || profileRaw;
        
        if (profileRes?.profile) {
          setProfile(profileRes.profile);
        }

        // 2. Fetch Weeks Progress
        const weeksRaw = await quizzesApi.getWeeks();
        const weeksRes = weeksRaw?.data?.data || weeksRaw?.data || weeksRaw;
        if (weeksRes) {
          setWeeksData(weeksRes);
          // Auto-select the active term/week based on progress if needed.
          // For now, sticking to Term 1, Week 1.
        }

        // 3. Fetch nodes for active term/week
        const quizzesRaw = await quizzesApi.getQuizzes(activeTerm, activeWeek);
        const quizzesRes = quizzesRaw?.data?.data || quizzesRaw?.data || quizzesRaw;
        if (quizzesRes?.quizzes) {
          setQuizzes(quizzesRes.quizzes);
        }

      } catch (error) {
        console.error("Failed to load curriculum data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculumData();
  }, [activeTerm, activeWeek]);

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1FA6BA]"></div>
      </div>
    );
  }

  // Construct the Year Name (e.g., "سنة 1 ابتدائي")
  const yearName = profile?.education_year?.name || 'سنة 1 ابتدائي';
  const termName = activeTerm === 1 ? 'الفصل الدراسي الأول' : activeTerm === 2 ? 'الفصل الدراسي الثاني' : 'الفصل الدراسي الثالث';
  const weekName = `الأسبوع ${activeWeek === 1 ? 'الأول' : activeWeek}`;

  return (
    <div className="w-full flex flex-col gap-6 relative">
      
      {/* Active Semester Header */}
      <CurriculumHeader 
        yearName={yearName} 
        termName={termName} 
        weekName={weekName} 
        dayName="اليوم الأول" // Dynamic if needed
        isActive={true} 
      />

      {/* Path Area */}
      <div className="relative py-12 flex flex-col items-center min-h-[400px]">
        {/* Render nodes dynamically */}
        {quizzes.length > 0 ? (
          <div className="flex flex-col gap-12 relative z-10 w-full max-w-[300px]">
             {quizzes.map((quiz, index) => {
               // Winding path logic
               // Alternating translate-x to create a curve
               const translations = [
                 'translate-x-0',
                 '-translate-x-12',
                 '-translate-x-16',
                 '-translate-x-6',
                 'translate-x-8',
                 'translate-x-16',
               ];
               const translation = translations[index % translations.length];
               
               // Mock active/locked state for now since we are building UI
               const isActive = index === 0; 
               const isLocked = index > 0;
               
               return (
                 <div 
                   key={quiz.id} 
                   className={`w-full flex justify-center ${translation} relative`}
                   style={{ zIndex: quizzes.length - index }}
                 >
                   <CurriculumNode 
                     isActive={isActive} 
                     isLocked={isLocked}
                     quiz={quiz}
                     index={index}
                   />
                 </div>
               );
             })}
          </div>
        ) : (
          <div className="text-gray-500 font-bold py-12">لا توجد دروس متاحة في هذا الأسبوع</div>
        )}

        {/* Character Image positioned absolute to the side of the path */}
        <div className="absolute top-20 right-[5%] lg:right-[15%] w-32 md:w-48 z-0 hidden sm:block opacity-90">
           <img 
             src="/boy-character.png" 
             alt="Student Character" 
             className="w-full h-auto drop-shadow-xl"
             onError={(e) => { e.currentTarget.style.display = 'none'; }}
           />
        </div>
      </div>

      {/* Next Semester/Week Placeholder */}
      <CurriculumHeader 
        termName={termName} 
        weekName={`الأسبوع ${activeWeek + 1}`} 
        isActive={false} 
      />

    </div>
  );
}
