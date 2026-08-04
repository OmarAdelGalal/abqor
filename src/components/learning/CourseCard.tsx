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
      
      {/* Top Section - Colored Box */}
      {/* We need overflow-visible on the parent to allow the teacher's head to pop out, 
          but rounded corners on the background. We can achieve this with an inner div. */}
      <div className="relative w-full h-[180px] rounded-[18px] bg-gradient-to-l from-[#b32a72] to-[#564972] mt-2 mb-2 flex p-4">
        
        {/* Left Side: Teacher Image Cutout */}
        <div className="absolute left-0 bottom-0 w-32 md:w-40 h-[115%] z-10 pointer-events-none">
           <img src={imageUrl} alt={teacherName} className="w-full h-full object-contain object-bottom drop-shadow-xl" />
        </div>

        {/* Right Side: Text & Badges (RTL means this is flex-start) */}
        <div className="flex-1 flex flex-col items-start justify-center text-white pr-2 z-20">
           <h3 className="text-2xl font-black mb-1">{course.title || 'دورة الفصل الأول'}</h3>
           <p className="text-base font-medium opacity-95 mb-3">{subjectName ? `في ${subjectName}` : ''}</p>
           <p className="text-lg font-bold mb-4">{teacherName ? `أ. ${teacherName}` : ''}</p>

           <div className="flex items-center gap-2 mt-auto pb-1">
              {isRecorded && (
                <span className="bg-white text-[#b32a72] text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                  مسجلة <PlayCircle className="w-3 h-3" />
                </span>
              )}
              {isLive && (
                <span className="bg-[#ff4b4b] text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                  Live <Video className="w-3 h-3" />
                </span>
              )}
           </div>
        </div>
      </div>

      {/* Bottom Section - White Info */}
      <div className="pt-3 pb-1 px-3 flex flex-col bg-white">
         
         {/* Time */}
         <div className="flex items-center justify-center gap-2 mb-3 text-gray-500">
            <span className="text-sm font-medium">توقيت الدراسة : {course.time || '20:00 - 23:00'}</span>
            <Clock className="w-4 h-4 text-[#b32a72]" />
         </div>

         {/* Lessons */}
         <div className="flex items-center justify-center gap-4 mb-5 text-gray-500 font-medium text-sm">
            <div className="flex items-center gap-1.5">
               <span>{course.lessons_count < 10 ? `0${course.lessons_count}` : course.lessons_count} حصص دروس</span>
               <BookOpen className="w-4 h-4 text-[#b32a72]" />
            </div>
            <div className="flex items-center gap-1.5">
               <span>{course.exercises_count || 12} حصة حل مواضيع</span>
               <BookOpen className="w-4 h-4 text-[#b32a72]" />
            </div>
         </div>

         <div className="mt-auto">
           {course.subscribed ? (
             <>
               {/* Progress Bar for Subscribed */}
               <div className="flex items-center gap-3 mb-4">
                 <span className="text-[#0d4a57] font-black text-sm">
                   {progressCurrent}/{progressTotal}
                 </span>
                 <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex-1">
                   <div className="h-full rounded-full bg-[#b32a72]" style={{ width: `${progressPercent}%` }}></div>
                 </div>
               </div>

               {/* Action Button */}
               <Link href={`/learning/course/${course.id}`} className="block w-full">
                 <button className="w-full py-3 rounded-[14px] font-bold bg-[#fff0f5] text-[#b32a72] transition-colors hover:brightness-95 text-lg">
                   أكمل الدورة
                 </button>
               </Link>
             </>
           ) : (
             <>
               <div className="h-4"></div> {/* Spacer */}
               <Link href={`/learning/course/${course.id}`} className="block w-full">
                 <button className="w-full py-3 rounded-[14px] font-bold bg-[#fff0f5] text-[#b32a72] transition-colors hover:brightness-95 text-lg">
                   اشترك الآن
                 </button>
               </Link>
             </>
           )}
         </div>
         
      </div>

    </div>
  );
}
