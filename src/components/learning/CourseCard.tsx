import React from 'react';
import Link from 'next/link';
import { Clock, BookOpen, Video, PlayCircle } from 'lucide-react';

export interface CourseData {
  id: number;
  title: string;
  subject: any; // Can be string or { id, name }
  subject_id?: number;
  teacher: any; // Can be string or { id, name }
  teacher_id?: number;
  hours?: string;
  subscribed?: boolean;
  type?: string;
  time: string;
  lessons_count: number;
  solves_count?: number;
  exercises_count?: number;
  progress?: number;
  progress_current?: number;
  progress_total?: number;
  price: number;
  color: string;
  color2?: string;
  image: string;
}

export default function CourseCard({ course }: { course: CourseData }) {
  // Safe extraction of nested API fields
  const subjectName = typeof course.subject === 'string' ? course.subject : course.subject?.name || '';
  const teacherName = typeof course.teacher === 'string' ? course.teacher : course.teacher?.name || '';
  
  // Progress calculation
  const progressCurrent = course.progress ?? course.progress_current ?? 0;
  const progressTotal = course.lessons_count || course.progress_total || 10;
  const progressPercent = Math.min(100, Math.round((progressCurrent / progressTotal) * 100));
  
  // Image URL mapping if it's a relative path from Laravel storage
  const imageUrl = course.image?.startsWith('http') ? course.image : course.image ? `https://mrstudy.net/storage/${course.image}` : '/images/placeholder.jpg';
  const isLive = course.type === 'live' || course.type === 'all';
  const isRecorded = course.type === 'recorded' || course.type === 'all';

  const buttonColorClass = subjectName.includes('الفيزياء') ? 'text-teal-600 bg-teal-50' : 
                           subjectName.includes('فرن') || subjectName.includes('انجلي') ? 'text-pink-600 bg-pink-50' : 
                           'text-green-600 bg-green-50';
  const progressBgClass = subjectName.includes('الفيزياء') ? 'bg-teal-500' : 
                          subjectName.includes('الإنجليزية') ? 'bg-green-500' : 
                          'bg-pink-500';

  return (
    <div className="flex flex-col w-full bg-white rounded-[24px] shadow-sm hover:shadow-md transition-shadow p-2.5 border border-gray-100">
      
      {/* Top Banner Section - IMAGE ONLY */}
      <div className="relative w-full h-[180px] rounded-[18px] overflow-hidden bg-gradient-to-l from-[#b32a72] to-[#564972] mb-3">
        {/* Course / Teacher Image */}
        <img
          src={imageUrl}
          alt={teacherName}
          className="w-full h-full object-cover object-center"
        />

        {/* Badges in top corner */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {isRecorded && (
            <span className="bg-white/95 backdrop-blur-sm text-[#b32a72] text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-md">
              مسجلة <PlayCircle className="w-3.5 h-3.5" />
            </span>
          )}
          {isLive && (
            <span className="bg-[#ff4b4b] text-white text-xs font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-md">
              Live <Video className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>

      {/* Bottom Content Section - ALL TEXT BELOW THE IMAGE */}
      <div className="flex flex-col px-2 pb-1 text-right">
        {/* Title */}
        <h3 className="text-xl font-black text-[#004e70] mb-1 leading-tight">
          {course.title || 'دورة الفصل الأول'}
        </h3>

        {/* Subtitle / Subject & Teacher */}
        <div className="flex items-center gap-2 text-gray-600 font-bold text-sm mb-3">
          {subjectName && <span>في {subjectName}</span>}
          {subjectName && teacherName && <span>•</span>}
          {teacherName && <span>أ. {teacherName}</span>}
        </div>

        {/* Time */}
        <div className="flex items-center justify-start gap-2 mb-2.5 text-gray-500">
          <Clock className="w-4 h-4 text-[#b32a72]" />
          <span className="text-sm font-medium">توقيت الدراسة : {course.time || '20:00 - 23:00'}</span>
        </div>

        {/* Lessons & Exercises Count */}
        <div className="flex items-center gap-4 mb-4 text-gray-500 font-medium text-xs">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#b32a72]" />
            <span>{course.lessons_count < 10 ? `0${course.lessons_count}` : course.lessons_count} حصص دروس</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#b32a72]" />
            <span>{course.exercises_count || 12} حصة حل مواضيع</span>
          </div>
        </div>

        {/* Action Button & Progress */}
        <div className="mt-auto pt-2">
          {course.subscribed ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[#0d4a57] font-black text-sm">
                  {progressCurrent}/{progressTotal}
                </span>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex-1">
                  <div className="h-full rounded-full bg-[#b32a72]" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              <Link href={`/learning/course/${course.id}`} className="block w-full">
                <button className="w-full py-3 rounded-[14px] font-bold bg-[#38b6c7] hover:bg-[#2fa3b3] text-white transition-colors shadow-sm text-base">
                  أكمل الدورة
                </button>
              </Link>
            </>
          ) : (
            <Link href={`/learning/course/${course.id}`} className="block w-full">
              <button className="w-full py-3 rounded-[14px] font-bold bg-[#38b6c7] hover:bg-[#2fa3b3] text-white transition-colors shadow-sm text-base">
                مجاناً الآن
              </button>
            </Link>
          )}
        </div>
      </div>

    </div>
  );
}
