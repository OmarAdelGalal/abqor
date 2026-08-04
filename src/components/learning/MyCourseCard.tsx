import React from 'react';
import Link from 'next/link';
import { BookOpen, FileText } from 'lucide-react';

export interface MyCourseData {
  id: number;
  title: string;
  description?: string;
  education_level?: string;
  lectures?: number;
  pdf?: string;
  color?: string;
  progress?: number;
  progress_current?: number;
  progress_total?: number;
  subject?: any; // For fallback
  teacher?: any; // For fallback
  subscribed?: boolean; // Always true for this endpoint realistically
}

export default function MyCourseCard({ course }: { course: MyCourseData }) {
  const bgColor = course.color ? `bg-${course.color}-50` : 'bg-[#f0f9ff]';
  const textColor = course.color ? `text-${course.color}-600` : 'text-[#38b6c7]';
  const progressBgClass = course.color ? `bg-${course.color}-500` : 'bg-[#38b6c7]';

  // Progress calculation
  const progressCurrent = course.progress ?? course.progress_current ?? 0;
  const progressTotal = course.lectures || course.progress_total || 10;
  const progressPercent = Math.min(100, Math.round((progressCurrent / progressTotal) * 100));

  return (
    <div className="flex flex-col w-full bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
      {/* Top Banner Area */}
      <div className={`w-full p-5 ${bgColor} flex flex-col justify-center min-h-[120px] relative`}>
        <div className="relative z-10">
          <span className={`inline-block px-3 py-1 bg-white/50 rounded-full text-xs font-bold mb-3 ${textColor}`}>
            {course.education_level || 'مستوى غير محدد'}
          </span>
          <h3 className={`text-xl font-bold mb-1 ${textColor}`}>{course.title}</h3>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col relative bg-white">
        <div className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed h-10">
          {course.description || 'لا يوجد وصف متاح لهذه الدورة'}
        </div>

        <div className="flex gap-4 mb-6">
          {course.lectures !== undefined && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span>{course.lectures} دروس</span>
            </div>
          )}
          {course.pdf && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>يوجد ملف PDF</span>
            </div>
          )}
        </div>

        <div className="mt-auto">
          {/* Progress Bar */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-bold text-gray-700 whitespace-nowrap">
              {progressCurrent}/{progressTotal}
            </span>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${progressBgClass}`} 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Action Button */}
          <Link href={`/learning/course/${course.id}`} className="block w-full">
            <button className={`w-full py-2.5 rounded-xl font-bold transition-colors hover:brightness-95 ${bgColor} ${textColor}`}>
              متابعة التعلم
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
