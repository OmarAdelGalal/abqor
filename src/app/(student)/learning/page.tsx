'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Calculator, Globe, Atom } from 'lucide-react';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import StreakWidget from '@/components/dashboard/StreakWidget';
import RankWidget from '@/components/dashboard/RankWidget';
import UpgradeWidget from '@/components/dashboard/UpgradeWidget';
import SocialFollowWidget from '@/components/learning/SocialFollowWidget';
import CourseCard, { CourseData } from '@/components/learning/CourseCard';
import MyCourseCard, { MyCourseData } from '@/components/learning/MyCourseCard';
import FloatingBottomNav from '@/components/learning/FloatingBottomNav';
import { coursesApi } from '@/lib/courses';

export default function LearningPage() {
  const [activeLevel, setActiveLevel] = useState<'BAC' | 'BEM'>('BAC');
  const [activeBottomTab, setActiveBottomTab] = useState<'all' | 'mine'>('all');
  const [activeSubject, setActiveSubject] = useState<string>('');

  const [coursesData, setCoursesData] = useState<Record<string, CourseData[]>>({});
  const [myCoursesData, setMyCoursesData] = useState<MyCourseData[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const coursesPromise = coursesApi.getAllCourses().catch(err => {
          console.error("getAllCourses failed:", err?.message || err);
          return null;
        });
        const subjectsPromise = coursesApi.getSubjects().catch(err => {
          console.error("getSubjects failed:", err?.message || err);
          return null;
        });
        const myCoursesPromise = coursesApi.getMyCourses().catch(err => {
          console.error("getMyCourses failed:", err?.message || err);
          return null;
        });

        const [coursesRes, subjectsRes, myCoursesRes] = await Promise.all([
          coursesPromise,
          subjectsPromise,
          myCoursesPromise
        ]);

        if (coursesRes) {
          // The interceptor already unwraps the envelope, so coursesRes IS the data
          const cData = coursesRes?.data ?? coursesRes;
          console.log('[Learning] coursesRes shape:', typeof cData, Array.isArray(cData) ? 'array' : 'object', Object.keys(cData || {}).slice(0, 5));
          setCoursesData(cData && typeof cData === 'object' && !Array.isArray(cData) ? cData : {});
        }

        if (myCoursesRes) {
          const mData = myCoursesRes?.data ?? myCoursesRes;
          console.log('[Learning] myCoursesRes shape:', typeof mData, Array.isArray(mData));
          if (Array.isArray(mData)) {
            setMyCoursesData(mData);
          }
        }

        if (subjectsRes) {
          const sData = subjectsRes?.data ?? subjectsRes;
          console.log('[Learning] subjectsRes shape:', typeof sData, Array.isArray(sData) ? 'array len=' + sData.length : 'object keys=' + Object.keys(sData || {}).slice(0, 5));
          let parsedSubjects: any[] = [];
          if (Array.isArray(sData)) {
            parsedSubjects = sData;
          } else if (typeof sData === 'object' && sData !== null) {
            parsedSubjects = Object.keys(sData).map((key, index) => ({
              id: index,
              name: key,
              ...sData[key]
            }));
          }

          setSubjects(parsedSubjects);
          // Always set to first subject from API (default 'arabic' was causing mismatches)
          if (parsedSubjects.length > 0) {
            const firstKey = parsedSubjects[0].id ?? parsedSubjects[0].name ?? parsedSubjects[0];
            setActiveSubject(String(firstKey));
          }
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const activeSubjectName = activeSubject;

  return (
    <div className="min-h-screen bg-white pb-24" dir="rtl">
      <AuthenticatedHeader />

      <main className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 max-w-7xl">

        {/* RIGHT COLUMN (Main Content) - Notice flex order changes for RTL */}
        <div className="w-full lg:w-4/6 flex flex-col order-1 lg:order-2">

          {/* Header */}
          <div className="flex items-center justify-end gap-3 mb-8">
            <h1 className="text-2xl font-bold text-gray-800">الدورات التعليمية</h1>
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>

          {/* BAC / BEM Tabs */}
          <div className="flex w-full max-w-sm mb-10 border border-gray-200 rounded-2xl p-1 bg-white self-end">
            <button
              onClick={() => setActiveLevel('BAC')}
              className={`flex-1 py-3 rounded-xl font-bold transition-colors ${activeLevel === 'BAC' ? 'bg-[#38b6c7] text-white' : 'text-[#38b6c7] hover:bg-gray-50'
                }`}
            >
              BAC
            </button>
            <button
              onClick={() => setActiveLevel('BEM')}
              className={`flex-1 py-3 rounded-xl font-bold transition-colors ${activeLevel === 'BEM' ? 'bg-[#38b6c7] text-white' : 'text-[#38b6c7] hover:bg-gray-50'
                }`}
            >
              BEM
            </button>
          </div>

          {/* Subjects Row */}
          <div className="relative flex items-center mb-12">
            <div
              id="subjects-scroll-container"
              className="flex items-center justify-start md:justify-end gap-8 overflow-x-auto pb-4 hide-scrollbar scroll-smooth w-full"
            >
              {subjects.map((subject) => {
                // Determine subject key/name safely based on whatever the API returns
                const subjectName = subject.name || subject;
                const subjectKey = subject.id || subjectName;

                // Determine icon safely
                let iconComponent = (
                  <BookOpen className={`w-8 h-8 transition-colors duration-300 ${activeSubject === subjectKey ? 'text-white' : 'text-[#38b6c7]'}`} />
                );
                const firstCourseWithIcon = coursesData[subjectName]?.find((c: any) => c.subject?.icon);
                if (subject.icon) {
                  const iconUrl = subject.icon.startsWith('http') ? subject.icon : `https://mrstudy.net/storage/${subject.icon}`;
                  iconComponent = (
                    <img
                      src={iconUrl}
                      alt={subjectName}
                      className={`w-8 h-8 object-contain transition-all duration-300 ${activeSubject === subjectKey
                        ? 'brightness-0 invert'
                        : 'opacity-100'
                        }`}
                      style={activeSubject !== subjectKey ? {
                        filter: 'brightness(0) saturate(100%) invert(55%) sepia(60%) saturate(400%) hue-rotate(155deg) brightness(95%)'
                      } : undefined}
                    />
                  );
                } else if (firstCourseWithIcon) {
                  const iconPath = firstCourseWithIcon.subject.icon;
                  const iconUrl = iconPath.startsWith('http') ? iconPath : `https://mrstudy.net/storage/${iconPath}`;
                  iconComponent = (
                    <img
                      src={iconUrl}
                      alt={subjectName}
                      className={`w-8 h-8 object-contain transition-all duration-300 ${activeSubject === subjectKey
                        ? 'brightness-0 invert'
                        : 'opacity-100'
                        }`}
                      style={activeSubject !== subjectKey ? {
                        filter: 'brightness(0) saturate(100%) invert(55%) sepia(60%) saturate(400%) hue-rotate(155deg) brightness(95%)'
                      } : undefined}
                    />
                  );
                }

                return (
                  <div
                    key={subjectKey}
                    onClick={() => {
                      setActiveSubject(subjectKey);
                      setActiveBottomTab('all'); // Reveal details on tab switch
                    }}
                    className="flex flex-col items-center gap-3 cursor-pointer group min-w-[80px] shrink-0"
                  >
                    <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm overflow-hidden ${activeSubject === subjectKey
                      ? 'border-[#38b6c7] bg-[#38b6c7] text-white'
                      : 'border-gray-100 bg-white text-gray-400 group-hover:border-[#38b6c7]'
                      }`}>
                      {iconComponent}
                    </div>
                    <span className={`font-bold text-sm transition-colors whitespace-nowrap ${activeSubject === subjectKey ? 'text-[#38b6c7]' : 'text-gray-700 group-hover:text-[#38b6c7]'
                      }`}>
                      {subjectName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Course Lists */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1FA6BA]"></div>
            </div>
          ) : (
            <div className="space-y-12 min-h-[400px]">
              {(() => {
                const isMineTab = activeBottomTab === 'mine';

                // If it's the "mine" tab, use myCoursesData (not filtered by subject)
                if (isMineTab) {
                  if (myCoursesData.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <BookOpen className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-black text-gray-800 mb-2">لم تشترك في أي دورة بعد</h3>
                        <p className="text-gray-500">تصفح الدورات المتاحة واشترك الآن</p>
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                      {myCoursesData.map((course) => (
                        <MyCourseCard key={course.id} course={course} />
                      ))}
                    </div>
                  );
                }

                // If it's the "all" tab, filter coursesData by activeSubject
                let filteredCourses = coursesData[activeSubject] || [];

                if (filteredCourses.length === 0) {
                  // Fallback: try finding it by ID if activeSubject is an ID
                  const matchingKey = Object.keys(coursesData).find(key => {
                    return coursesData[key].some((c: any) => c.subject_id == activeSubject || c.subject?.id == activeSubject);
                  });
                  if (matchingKey) {
                    filteredCourses = coursesData[matchingKey];
                  }
                }

                if (filteredCourses.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <BookOpen className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-black text-gray-800 mb-2">لا يوجد دورات في {activeSubjectName}</h3>
                      <p className="text-gray-500">سيتم إضافة دورات جديدة قريباً</p>
                    </div>
                  );
                }

                return (
                  <section>
                    <h2 className="text-xl font-black text-gray-800 mb-6 text-right">{activeSubjectName}</h2>
                    <div className="flex flex-col gap-6 w-full">
                      {filteredCourses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                      ))}
                    </div>
                  </section>
                );
              })()}
            </div>
          )}

        </div>

        {/* LEFT COLUMN (Sidebar) */}
        <div className="w-full lg:w-2/6 flex flex-col gap-6 order-2 lg:order-1">
          <StreakWidget />
          <RankWidget />
          <UpgradeWidget />
          <SocialFollowWidget />
        </div>

      </main>

      {/* Floating Bottom Navigation */}
      <FloatingBottomNav
        activeTab={activeBottomTab}
        onTabChange={setActiveBottomTab}
      />

    </div>
  );
}
