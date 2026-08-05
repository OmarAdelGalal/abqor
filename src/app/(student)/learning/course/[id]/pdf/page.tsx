'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import { useParams, useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/courses';

export default function CoursePdfPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [courseData, setCourseData] = useState<any>(null);
  const [pdfData, setPdfData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (pdfData?.pdf_url && pdfData.pdf_url.startsWith('blob:')) {
        URL.revokeObjectURL(pdfData.pdf_url);
      }
    };
  }, [pdfData]);

  useEffect(() => {
    setIsLoading(true);
    
    // 1. First fetch the course details to get the numeric ID and subscription status
    const isNumeric = /^\d+$/.test(courseId);
    const fetchCoursePromise = isNumeric 
      ? coursesApi.getCourseDetails(courseId)
      : coursesApi.getCourseBySlug(courseId);

    fetchCoursePromise
      .then(courseRes => {
        const course = courseRes?.data?.data || courseRes?.data || courseRes;
        
        if (!course || Object.keys(course).length === 0) {
           throw new Error("Course data is empty or not found");
        }
        
        setCourseData(course);
        
        // 2. Now use the numeric course.id to fetch the PDF
        if (course?.id) {
          return coursesApi.getCoursePdf(course.id);
        }
        throw new Error('Course ID not found in response');
      })
      .then(pdfRes => {
        // Since we configured responseType: 'blob', the payload is a Blob
        const blob = pdfRes instanceof Blob ? pdfRes : pdfRes?.data;
        if (blob instanceof Blob && blob.type !== 'application/json') {
           const objectUrl = URL.createObjectURL(blob);
           setPdfData({ pdf_url: objectUrl });
        } else {
           setPdfData(pdfRes?.data?.data || pdfRes?.data || pdfRes);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load PDF:", err?.message || err);
        setIsLoading(false);
      });
  }, [courseId]);

  const isSubscribed = courseData?.subscribed ?? false;
  
  // The backend might return the URL in various fields
  const pdfUrl = pdfData?.pdf_url || pdfData?.file || pdfData?.link || pdfData?.url || pdfData?.path || ''; 


  return (
    <div className="min-h-screen bg-white flex flex-col pb-24" dir="rtl">
      {/* Primary Header */}
      <AuthenticatedHeader />

      {/* Secondary Header */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 max-w-4xl py-4 flex items-center justify-end gap-3">
          <h1 className="text-xl font-black text-gray-900">ملخص الدورة</h1>
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Main Content Viewer */}
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto max-w-4xl min-h-[calc(100vh-200px)] flex flex-col items-center justify-center p-4">
          {isLoading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1FA6BA]"></div>
          ) : (
            <div className="w-full bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden relative">
              {/* Display the PDF/Image Preview */}
              {pdfUrl ? (
                 <iframe src={pdfUrl} className="w-full h-[80vh] border-0 bg-gray-100" title="Course PDF Preview" />
              ) : (
                 <div className="w-full h-[60vh] flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                   <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
                   <p className="font-bold text-lg">لم يتم العثور على ملخص لهذه الدورة</p>
                   <p className="text-sm mt-2">جاري معالجة الملف أو أنه غير متوفر حالياً</p>
                 </div>
              )}
              
              {/* Blur Overlay if NOT subscribed */}
              {!isSubscribed && (
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none flex items-end justify-center pb-20">
                  <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-xl border border-gray-100 shadow-sm font-bold text-gray-600">
                    اشترك لفتح كامل الملخص
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Fixed Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto max-w-4xl flex items-center justify-between gap-4">
          
          <button 
            onClick={() => pdfUrl && window.open(pdfUrl, '_blank')}
            disabled={!pdfUrl}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#1FA6BA] text-[#1FA6BA] rounded-xl font-bold hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>تنزيل الملخص</span>
            <Download className="w-5 h-5" />
          </button>

          {!isSubscribed && (
            <Link 
              href={`/learning/course/${courseId}/pay`}
              className="flex-1 max-w-sm bg-[#0d4a68] text-white px-6 py-3 rounded-xl font-bold text-center hover:bg-[#0a3a52] transition-colors shadow-sm"
            >
              إشترك في الدورة لقراءة المزيد
            </Link>
          )}

        </div>
      </div>
    </div>
  );
}
