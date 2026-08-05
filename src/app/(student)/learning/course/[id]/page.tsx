'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Share2, Play, Lock, FileText, X, MessageCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import { useParams } from 'next/navigation';
import { coursesApi } from '@/lib/courses';

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.id;
  
  // State for active tabs
  const [activeTab, setActiveTab] = useState<'content' | 'about' | 'reviews'>('content');
  const [activeSubTab, setActiveSubTab] = useState<'lessons' | 'topics'>('lessons');
  const [activeReviewTab, setActiveReviewTab] = useState<'teacher_rating' | 'student_reviews'>('teacher_rating');
  
  // State for locked modal, ask modal, subscription status, and Q&A history mode
  const [isLockedModalOpen, setIsLockedModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  
  // QA state
  const [questionText, setQuestionText] = useState('');
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [watchedSeconds, setWatchedSeconds] = useState<Set<number>>(new Set());
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'videoTimeUpdate') {
        const time = Math.floor(event.data.time);
        setCurrentVideoTime(time);
        
        // Track real watch time (prevent skipping)
        setWatchedSeconds(prev => {
          const next = new Set(prev);
          next.add(time);
          return next;
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);


  const formatVideoTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("يرجى السماح بالوصول إلى الميكروفون");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const submitQuestion = async () => {
    if (!questionText.trim() && !audioBlob) {
       alert("يرجى كتابة سؤال أو تسجيل صوت");
       return;
    }
    
    setIsSubmittingQuestion(true);
    try {
      const formData = new FormData();
      if (questionText.trim()) formData.append('text', questionText);
      if (audioBlob) formData.append('audio', audioBlob, 'voice.webm');
      formData.append('timestamp', formatVideoTime(currentVideoTime));
      if (selectedLesson?.id) formData.append('lecture_id', selectedLesson.id.toString());
      
      await coursesApi.submitCourseQuestion(courseId as string, formData);
      alert("تم إرسال السؤال بنجاح!");
      setIsAskModalOpen(false);
      setQuestionText('');
      setAudioBlob(null);
    } catch (err) {
      console.error("Failed to submit question:", err);
      alert("حدث خطأ أثناء إرسال السؤال");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };
  const [isSubscribed, setIsSubscribed] = useState(true); // Default to true to show the paid state
  const [isQAHistoryMode, setIsQAHistoryMode] = useState(false);
  // Course Data State
  const [courseData, setCourseData] = useState<any>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [courseError, setCourseError] = useState('');

  // Video Player State
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [videoData, setVideoData] = useState<any>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [lecturePdfUrl, setLecturePdfUrl] = useState<string | null>(null);

  // Sync real watch progress with the backend periodically (every 10 seconds)
  useEffect(() => {
    if (!selectedLesson?.id || watchedSeconds.size === 0) return;
    
    const interval = setInterval(() => {
       // We send the number of unique seconds watched (real watch time without skipping)
       if (coursesApi.updateProgress) {
         coursesApi.updateProgress(selectedLesson.id, watchedSeconds.size).catch(e => {
           console.warn("Failed to sync progress", e?.message || e);
         });
       }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [selectedLesson?.id, watchedSeconds.size]);

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (lecturePdfUrl && lecturePdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(lecturePdfUrl);
      }
    };
  }, [lecturePdfUrl]);

  const [qaHistory, setQaHistory] = useState<any[]>([]);
  const [isLoadingQA, setIsLoadingQA] = useState(false);
  
  // Reviews state
  const [courseReviews, setCourseReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  
  const submitReview = async () => {
    if (!newReviewComment.trim()) return alert('الرجاء كتابة تعليق للاستاذ');
    try {
      setIsSubmittingReview(true);
      await coursesApi.addCourseReview(courseId as string, newReviewRating, newReviewComment);
      alert('تم إرسال تقييمك بنجاح! شكراً لك.');
      setNewReviewComment('');
      setNewReviewRating(5);
      
      // refetch reviews
      const res = await coursesApi.getCourseReviews(courseId as string);
      setCourseReviews(Array.isArray(res) ? res : (res?.data || []));
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'حدث خطأ أثناء إرسال التقييم');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reviews' && courseId) {
      setIsLoadingReviews(true);
      coursesApi.getCourseReviews(courseId as string)
        .then((res: any) => {
           setCourseReviews(Array.isArray(res) ? res : (res?.data || []));
        })
        .catch(err => {
           console.error("Failed to fetch reviews", err);
           setCourseReviews([]);
        })
        .finally(() => setIsLoadingReviews(false));
    }
  }, [activeTab, courseId]);

  // Fetched Lectures State
  const [fetchedLectures, setFetchedLectures] = useState<any[]>([]);
  const [isLoadingLectures, setIsLoadingLectures] = useState(false);

  // Fetch Lectures based on active tab
  useEffect(() => {
    if (courseData?.id && courseData?.lectures_groups) {
      setIsLoadingLectures(true);
      const type = activeSubTab === 'topics' ? 'solve' : 'lesson';
      
      const fetchAllLectures = async () => {
        try {
          if (courseData.subscribed_group) {
            // User is subscribed — api.ts interceptor already unwraps envelope, res IS the array
            const groupId = typeof courseData.subscribed_group === 'object' ? courseData.subscribed_group.id : courseData.subscribed_group;
            const res = await coursesApi.getLecturesGroup(type, courseData.id, groupId);
            const lectures = Array.isArray(res) ? res : [];
            setFetchedLectures(lectures);
            
            if (lectures.length > 0 && !selectedLesson) {
               setSelectedLesson({ ...lectures[0], groupId: lectures[0].lectures_group_id || groupId });
            }
          } else {
            // Not subscribed — fetch all groups for curriculum preview
            const promises = courseData.lectures_groups.map((g: any) => 
               coursesApi.getLecturesGroup(type, courseData.id, g.id)
                 .then(res => Array.isArray(res) ? res : [])
                 .catch(() => [])
            );
            
            const results = await Promise.all(promises);
            const allLectures = results.flat().filter(l => l && typeof l === 'object');
            setFetchedLectures(allLectures);
            
            if (allLectures.length > 0 && !selectedLesson) {
               setSelectedLesson({ ...allLectures[0], groupId: allLectures[0].lectures_group_id || courseData.lectures_groups[0].id });
            }
          }
          setIsLoadingLectures(false);
        } catch (err) {
          console.error("Failed to load lectures:", err);
          setFetchedLectures([]);
          setIsLoadingLectures(false);
        }
      };

      fetchAllLectures();
    }
  }, [courseData?.id, activeSubTab, courseData?.subscribed_group, courseData?.lectures_groups]);

  // Fetch Q&A History from the API
  useEffect(() => {
    // Determine the numeric ID to use for the questions endpoint
    const numericId = courseData?.id || courseId;
    
    if (isQAHistoryMode && qaHistory.length === 0 && numericId) {
      setIsLoadingQA(true);
      coursesApi.getCourseQuestions(numericId)
        .then(res => {
          console.log("Q&A API Response:", res);
          // Safely extract the array. Often backend APIs wrap lists in res.data or res.data.data
          let dataArray = [];
          if (Array.isArray(res)) dataArray = res;
          else if (res && Array.isArray(res.data)) dataArray = res.data;
          else if (res && res.data && Array.isArray(res.data.data)) dataArray = res.data.data;
          else if (res && res.questions) dataArray = res.questions; // Fallback
          
          setQaHistory(dataArray);
          setIsLoadingQA(false);
        })
        .catch(err => {
          console.error("Failed to load QA history API:", err);
          setIsLoadingQA(false);
        });
    }
  }, [isQAHistoryMode, courseId, courseData?.id, qaHistory.length]);



  // Fetch Course Details
  useEffect(() => {
    if (!courseId) return;
    setIsLoadingCourse(true);
    setCourseError('');
    
    // Check if the param is a slug or a numeric ID
    const isNumeric = /^\d+$/.test(courseId as string);
    const fetchPromise = isNumeric 
      ? coursesApi.getCourseDetails(courseId as string)
      : coursesApi.getCourseBySlug(courseId as string);

    fetchPromise
      .then(res => {
        // api.ts interceptor already unwraps the envelope: res IS the course object directly
        // e.g. { id, title, subscribed, lectures_groups, ... }
        console.log("Course Details API Response (unwrapped):", res);
        
        const data = res && typeof res === 'object' && !Array.isArray(res) ? res : null;
        
        if (!data || !data.id) {
           throw new Error("Course data is empty or not found");
        }

        setCourseData(data);
        // subscribed field tells us if the logged-in user owns this course
        setIsSubscribed(data.subscribed === true);
        
        setIsLoadingCourse(false);
      })
      .catch(err => {
        console.warn("Failed to load course details:", err?.message || err);
        // 401 = not logged in, show a clear message instead of generic error
        if (err?.status === 401 || err?.code === 'UNAUTHENTICATED') {
          setCourseError('يجب تسجيل الدخول أولاً لعرض تفاصيل الدورة');
        } else {
          setCourseError(`فشل في تحميل تفاصيل الدورة: ${err?.message || 'خطأ غير معروف'}`);
        }
        setIsLoadingCourse(false);
      });
  }, [courseId]);

  // Fetch Video Data when a lesson is selected
  useEffect(() => {
    if (selectedLesson?.id) {
      setIsLoadingVideo(true);
      setWatchedSeconds(new Set()); // Reset watch time for new lesson
      
      const fetchVideo = async () => {
        try {
          let data: any = null;
          
          // 0. Ensure the security handshake is complete before any secure video endpoints
          try {
            await coursesApi.getVideoHandshake();
          } catch (e) {
            console.warn("Video handshake failed, playback may be degraded.", e);
          }
          
          if (activeSubTab === 'topics') {
             // For topics, try fetching the PDF
             try {
               const pdfRes = await coursesApi.getLecturePdf(selectedLesson.id);
               const blob = pdfRes instanceof Blob ? pdfRes : pdfRes?.data;
               if (blob instanceof Blob && blob.type !== 'application/json') {
                 const objectUrl = URL.createObjectURL(blob);
                 setLecturePdfUrl(objectUrl);
               } else {
                 throw new Error("PDF not found or invalid format");
               }
             } catch (e: any) {
               // Only log if it's an unexpected error, a 404 just means no PDF exists for this lesson
               const is404 = e?.status === 404 || e?.response?.status === 404 || String(e?.message || e).includes('404');
               if (!is404) {
                 console.error("Failed to load PDF for lecture:", e?.message || e);
               }
               setLecturePdfUrl(null);
             }
             setVideoData(null);
             setIsLoadingVideo(false);
             return; // Skip video fetching for PDF topics
          }
          
          setLecturePdfUrl(null);

          // Attempt to fetch video in priority order
          // api.ts interceptor already unwraps envelope, so each response IS the data directly
          
          // 1. YouTube Player API
          try {
            const ytRes = await coursesApi.getYoutubeLecture(selectedLesson.id);
            // ytRes could be { player_url, ... } or similar
            if (ytRes && typeof ytRes === 'object' && Object.keys(ytRes).length > 0) {
               data = ytRes;
            }
          } catch (ytErr) {
             // 2. Recorded Playback API
             try {
               const recRes = await coursesApi.getRecordedPlayback(selectedLesson.id);
               if (recRes && typeof recRes === 'object' && Object.keys(recRes).length > 0) {
                 data = recRes;
               }
             } catch (recErr) {
               // 3. Direct Self-Hosted Path API
               try {
                 const selfRes = await coursesApi.getSelfHostedVideo(selectedLesson.id);
                 if (selfRes && typeof selfRes === 'object' && Object.keys(selfRes).length > 0) {
                   data = selfRes;
                 }
               } catch (selfErr) {
                  // Live meeting or no video
                  if (selectedLesson.mode === 'live' || selectedLesson.type === 'live') {
                     data = { link: '#' };
                  }
               }
             }
          }
          
          if (!data || Object.keys(data).length === 0) {
             throw new Error("Video data is empty or not found for this lecture");
          }
          
          setVideoData(data);
          setIsLoadingVideo(false);
        } catch (err: any) {
          console.log("Could not load video for this lesson (it may not have one):", err?.message || err);
          setVideoData(null); // Clear video data on error so fallback displays
          setIsLoadingVideo(false);
        }
      };

      fetchVideo();
    }
  }, [selectedLesson?.id]);

  // Use real data or mock data as fallback during loading/errors
  const groups = courseData?.lectures_groups || []; 
  
  const mockGroups = [
    {
      id: 1,
      name: "الفصل الأول",
      lectures: [
        { id: 1, name: 'الحصة الأولى', description: 'ethics in business', isLocked: true },
        { id: 2, name: 'الحصة الثانية', description: 'نص تعريفي عن الحصة', isLocked: true },
      ]
    }
  ];

  const displayGroups = groups.length > 0 ? groups : mockGroups;

  const mockReviews = courseData?.reviews || [
    { id: 1, name: 'احمد علي', comment: 'مدرس رائع وشرح جميل', rating: 4, date: '12/10/2024', avatar: 'https://ui-avatars.com/api/?name=Ahmed&background=random' },
    { id: 2, name: 'Nour m', comment: 'مدرس رائع وشرح جميل', rating: 4, date: '12/10/2024', avatar: 'https://ui-avatars.com/api/?name=Nour&background=random' },
  ];

  // ── Error State ─────────────────────────────────────────────────────────────
  if (!isLoadingCourse && courseError) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <AuthenticatedHeader />
        <main className="container mx-auto px-4 py-20 max-w-4xl flex flex-col items-center justify-center gap-6 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-black text-gray-800">{courseError}</h2>
          {(courseError.includes('تسجيل الدخول')) && (
            <Link href="/login" className="px-8 py-3 bg-[#1FA6BA] text-white font-bold rounded-xl hover:bg-[#188a9c] transition-colors shadow">
              تسجيل الدخول
            </Link>
          )}
          <Link href="/learning" className="text-[#1FA6BA] font-bold hover:underline">
            ← العودة للدورات
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32" dir="rtl">
      {/* Top Header */}
      <AuthenticatedHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Top Navigation Row */}
        <div className="flex justify-between items-center mb-6">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#1FA6BA] text-[#1FA6BA] font-bold text-sm hover:bg-[#f0f9ff] transition-colors shadow-sm">
            <Share2 className="w-4 h-4" />
            شارك الدورة
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">الدورات التعليمية</h1>
            <Link href="/learning" className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>

        {/* Video Hero Banner */}
        <div className="relative w-full h-[250px] md:h-[400px] lg:h-[450px] bg-black rounded-3xl overflow-hidden mb-8 shadow-lg group flex items-center justify-center">
          {isSubscribed ? (
            isLoadingVideo ? (
              <div className="flex flex-col items-center justify-center text-white">
                 <div className="w-10 h-10 border-4 border-[#38b6c7] border-t-transparent rounded-full animate-spin"></div>
                 <span className="mt-4 font-bold">جاري تحميل الفيديو...</span>
              </div>
            ) : videoData?.player_url || videoData?.link || videoData?.video_url || videoData?.path || videoData?.url ? (
              // Actual Video Player
              (() => {
                const url = videoData.player_url || videoData.link || videoData.video_url || videoData.path || videoData.url;
                
                // Handle YouTube links by converting them to embed URLs
                if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
                  const videoId = url.includes('youtube.com/watch?v=') 
                    ? url.split('v=')[1]?.split('&')[0]
                    : url.split('youtu.be/')[1]?.split('?')[0];
                  
                  return (
                    <iframe 
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} 
                      className="w-full h-full border-0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  );
                }

                // Handle direct video files (.mp4, .webm, etc.)
                if (url.endsWith('.mp4') || url.endsWith('.webm')) {
                  return (
                    <video 
                      src={url} 
                      className="w-full h-full object-cover" 
                      controls 
                      controlsList="nodownload"
                    ></video>
                  );
                }

                // Fallback to standard iframe for other links (like Vimeo or unknown)
                return (
                  <iframe 
                    src={url} 
                    className="w-full h-full border-0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                );
              })()
            ) : (
              // Active Video Player Mockup (Fallback if no video URL is found yet)
              <>
                {lecturePdfUrl ? (
                  <iframe 
                    src={lecturePdfUrl} 
                    className="w-full h-full border-0 absolute top-0 left-0 bg-gray-100" 
                    title="Course PDF Preview" 
                  />
                ) : (
                  <>
                    <img 
                      src={courseData?.image?.startsWith('http') ? courseData.image : courseData?.image ? `https://mrstudy.net/storage/${courseData.image}` : "https://images.unsplash.com/photo-1633526543814-9718c8922b7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"} 
                      alt="Video playing" 
                      className="w-full h-full object-cover opacity-80" 
                    />
                    
                    {/* Center Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-white text-center bg-black/60 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/10">
                        <p className="font-bold">
                          {selectedLesson 
                            ? (activeSubTab === 'topics' ? "تعذر تحميل ملف PDF لهذه الحصة" : "لا يتوفر فيديو لهذه الحصة") 
                            : "يرجى تحديد حصة لتشغيلها"}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </>
            )
          ) : (
            // Unsubscribed Video Placeholder
            <>
              <img 
                src="https://images.unsplash.com/photo-1544717302-de2939b7ef71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                alt="Course video placeholder" 
                className="w-full h-full object-cover opacity-90" 
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-2 border-white/80 flex items-center justify-center bg-white/20 backdrop-blur-sm cursor-pointer hover:bg-white/30 hover:scale-105 transition-all shadow-lg">
                  <Play className="w-8 h-8 text-white ml-2" fill="currentColor" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Course Metadata */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 px-2">
          <div className="flex flex-col gap-2">
            {isLoadingCourse ? (
               <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-md"></div>
            ) : (
               <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                  {courseData?.name || courseData?.title || 'جاري التحميل...'} 
                  <span className="font-bold text-gray-600">
                    {courseData?.subject?.name ? ` في ${courseData.subject.name}` : ''}
                  </span>
               </h1>
            )}
            <div className="flex items-center gap-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-[#1FA6BA] text-white flex items-center justify-center text-xs font-bold border border-gray-200">
                 {courseData?.teacher?.name ? courseData.teacher.name.charAt(0) : '?'}
              </div>
              <span className="text-gray-600 font-bold text-sm">
                 {courseData?.teacher?.name ? `أ. ${courseData.teacher.name}` : 'غير محدد'} 
                 {courseData?.subject?.name ? ` . ${courseData.subject.name}` : ''}
              </span>
            </div>
          </div>
          
          {isSubscribed ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsQAHistoryMode(!isQAHistoryMode)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm border ${isQAHistoryMode ? 'bg-[#0d4a68] text-white border-[#0d4a68]' : 'bg-white text-[#0d4a68] border-gray-200 hover:bg-gray-50'}`}
              >
                <div className="relative">
                  <MessageCircle className="w-6 h-6" />
                  <Clock className="w-3 h-3 absolute -top-1 -right-1 bg-white rounded-full text-[#0d4a68]" />
                </div>
              </button>
              
              <button 
                onClick={() => setIsAskModalOpen(true)}
                className="bg-[#38b6c7] text-white px-6 py-3 rounded-xl font-bold transition-colors hover:bg-[#2b96a5] shadow-sm flex items-center gap-2 h-12"
              >
                <span>اسأل معلمك</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-start md:items-end bg-gray-50/50 p-4 rounded-xl border border-gray-100">
              <div className="text-2xl font-black text-[#1FA6BA]">{courseData?.price || '...'} د.ج</div>
              <div className="text-[#1FA6BA] font-bold text-sm">إشتراك الدورة</div>
            </div>
          )}
        </div>

        {/* Dynamic Content Area: Either Q&A History OR the Tabs/Lessons */}
        {isQAHistoryMode ? (
          /* Q&A History Mode */
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-black text-gray-900 mb-4 px-2">سجل الاسئلة</h2>
            
            {isLoadingQA ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#38b6c7] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold mt-4">جاري تحميل الأسئلة...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {qaHistory.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 font-medium">لا توجد أسئلة سابقة. (أو تأكد من اتصال الـ API)</div>
                ) : (
                  qaHistory.map((qa, idx) => (
                    <div key={qa.id || idx} className="bg-gray-50 border border-gray-100 rounded-3xl p-5 shadow-sm">
                      {/* Timestamp */}
                      <div className="flex justify-end items-center gap-1.5 text-[#0d4a68] mb-2 font-bold text-sm">
                        <span dir="ltr">{qa.time || qa.created_at || '00:00'}</span>
                        <Clock className="w-4 h-4" />
                      </div>
                      
                      {/* Question */}
                      <div className="mb-4">
                        <div className="text-sm font-bold text-gray-600 mb-1 text-right">السؤال</div>
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 text-gray-800 shadow-sm" dir="ltr text-left">
                          {qa.question || qa.body || qa.content || '...'}
                        </div>
                      </div>
                      
                      {/* Answer */}
                      <div>
                        <div className="text-sm font-bold text-gray-600 mb-1 text-right">الاجابة</div>
                        <div className={`bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-4 ${(!qa.isAnswered && !qa.answerText && !qa.answer) ? 'items-center justify-center h-16' : ''}`}>
                          {(!qa.isAnswered && !qa.answerText && !qa.answer) ? (
                            <span className="text-gray-400 font-medium">لم يقم الأستاذ بالإجابة عن السؤال</span>
                          ) : (
                            <>
                              {(qa.answerText || qa.answer) && (
                                <div className="text-gray-800 font-medium" dir="ltr text-left">
                                  {qa.answerText || qa.answer}
                                </div>
                              )}
                              
                              {(qa.answerImage || qa.attachment_url) && (
                                <img src={qa.answerImage || qa.attachment_url} alt="Answer attachment" className="w-full rounded-xl max-h-64 object-contain bg-gray-50" />
                              )}
                              
                              {(qa.answerAudio || qa.audio_url) && (
                                <div className="flex items-center justify-end w-full">
                                  <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2 w-48 shadow-inner">
                                    <span className="text-xs text-gray-500 font-medium font-mono" dir="ltr">02:30</span>
                                    <div className="flex-1 flex items-center justify-center gap-0.5 opacity-50">
                                      {/* Fake Audio Waveform */}
                                      {[1, 2, 3, 4, 1, 2, 5, 2, 1, 3, 2, 1].map((bar, i) => (
                                        <div key={i} className="w-1 bg-gray-500 rounded-full" style={{ height: `${bar * 4}px` }}></div>
                                      ))}
                                    </div>
                                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center shrink-0 cursor-pointer hover:bg-gray-400 transition-colors">
                                      <Play className="w-3 h-3 text-white ml-0.5" fill="currentColor" />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          /* Standard Tabs and Content */
          <>
            {/* Main Tabs */}
            <div className="flex justify-center border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`px-8 py-4 font-bold whitespace-nowrap transition-colors relative ${activeTab === 'reviews' ? 'text-[#1FA6BA]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            آراء التلاميذ
            {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1FA6BA] rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`px-8 py-4 font-bold whitespace-nowrap transition-colors relative ${activeTab === 'about' ? 'text-[#1FA6BA]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            عن الدورة
            {activeTab === 'about' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1FA6BA] rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('content')}
            className={`px-8 py-4 font-bold whitespace-nowrap transition-colors relative ${activeTab === 'content' ? 'text-[#1FA6BA]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            محتوى الدورة
            {activeTab === 'content' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1FA6BA] rounded-t-full"></div>}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'content' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Sub-tabs (Lessons vs Topics) */}
            <div className="w-full bg-[#f0f4fb] rounded-xl p-1 flex mb-6">
              <button 
                onClick={() => setActiveSubTab('lessons')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${activeSubTab === 'lessons' ? 'bg-[#0d4a68] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200/50'}`}
              >
                حصص الدروس
              </button>
              <button 
                onClick={() => setActiveSubTab('topics')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${activeSubTab === 'topics' ? 'bg-[#0d4a68] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200/50'}`}
              >
                حصص المواضيع
              </button>
            </div>

            {/* List of Content */}
            <div className="bg-[#fafbfc] border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              
              {/* Header */}
              {activeSubTab === 'lessons' ? (
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                  <Link href={`/learning/course/${courseId}/pdf`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-bold text-gray-800">ملخص الدورة</span>
                    <div className="w-5 h-5 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[6px] font-black text-red-500 bg-white px-0.5 rounded-sm border border-red-100 z-10">PDF</div>
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                  <div className="text-xs text-gray-400 font-bold">
                    محتوى الدروس
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 font-bold px-6 py-4 border-b border-gray-100 text-right">
                  محتوى حل المواضيع
                </div>
              )}
              
              <div className="divide-y divide-gray-100">
                {isLoadingLectures ? (
                   <div className="flex flex-col items-center justify-center py-12">
                     <div className="w-8 h-8 border-4 border-[#38b6c7] border-t-transparent rounded-full animate-spin"></div>
                     <p className="text-gray-500 font-bold mt-4">جاري تحميل المحتوى...</p>
                   </div>
                ) : displayGroups.map((group: any, gIndex: number) => {
                  
                  // Filter the fetched lectures for this specific group
                  // If lectures_group_id isn't returned, and there's only one group, just use all fetched lectures
                  let groupLectures = fetchedLectures.filter(l => l.lectures_group_id == group.id);
                  if (groupLectures.length === 0 && displayGroups.length === 1 && fetchedLectures.length > 0) {
                     groupLectures = fetchedLectures;
                  }
                  
                  // Mock fallback if absolutely no lectures are found but we have mock ones
                  if (groupLectures.length === 0 && group.lectures?.length > 0 && fetchedLectures.length === 0) {
                     groupLectures = group.lectures;
                  }
                  
                  return (
                    <div key={group.id || gIndex} className="flex flex-col">
                      {/* Group Header */}
                      <div className="bg-gray-50 px-6 py-3 font-bold text-[#0d4a68] border-b border-gray-100 flex items-center justify-between">
                         <span>{group.name || `الفصل ${gIndex + 1}`}</span>
                         <span className="text-xs bg-white px-2 py-1 rounded-md border border-gray-200">{groupLectures.length} حصص</span>
                      </div>
                      
                      {/* Lectures List */}
                      <div className="divide-y divide-gray-100">
                        {groupLectures.length === 0 ? (
                           <div className="p-8 text-center text-gray-400 font-medium text-sm">
                              لا توجد حصص متاحة في هذا القسم حاليا.
                           </div>
                        ) : groupLectures.map((lesson: any, index: number) => {
                          const isSelected = selectedLesson?.id === lesson.id;
                          return (
                            <div 
                              key={lesson.id} 
                              onClick={() => {
                                if (!isSubscribed && lesson.isLocked) {
                                  setIsLockedModalOpen(true);
                                } else {
                                  setSelectedLesson({ ...lesson, groupId: group.id });
                                }
                              }}
                              className={`flex justify-between items-center p-5 transition-colors cursor-pointer group ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                            >
                              <div className="flex flex-col items-start gap-1">
                                <span className={`font-bold text-base ${isSelected ? 'text-[#0d4a68]' : 'text-gray-800'}`}>{lesson.name || lesson.title}</span>
                                <span className="text-xs text-gray-500 font-medium">{lesson.description || lesson.subtitle || ''}</span>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                {/* Dynamic Icon based on sub-tab */}
                                {activeSubTab === 'topics' ? (
                                  <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center border border-gray-200 relative shadow-sm group-hover:border-red-200 transition-colors">
                                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-black text-red-500 bg-white px-1 rounded-sm border border-red-100">PDF</div>
                                     <FileText className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
                                  </div>
                                ) : (lesson.quiz || lesson.questions_bank_id) ? (
                                  <div className="relative w-10 h-8 flex items-center justify-center" onClick={(e) => {
                                    // Prevent selecting the lesson video if they click the quiz badge specifically
                                    e.stopPropagation();
                                    // Quiz navigation will be implemented here when destination is decided
                                    alert("سيتم نقلك لصفحة الاختبار قريباً");
                                  }}>
                                    {/* Quiz Icon */}
                                    <div className="w-8 h-6 bg-[#38b6c7] rounded-md flex items-center justify-center relative shadow-sm hover:scale-105 transition-transform">
                                      <span className="text-white text-[8px] font-black">QUIZ</span>
                                      {/* Speech bubble tail */}
                                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#38b6c7] rotate-45"></div>
                                    </div>
                                    {/* Question Mark Badge */}
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#f5d547] rounded-full flex items-center justify-center shadow-sm z-10 border border-white">
                                      <span className="text-white text-[10px] font-black">?</span>
                                    </div>
                                  </div>
                                ) : null}
                                
                                {/* Status Icon (Lock or Play/Pause) */}
                                {isSubscribed ? (
                                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-sm transition-colors ${isSelected ? 'bg-[#1FA6BA] border-[#1FA6BA]' : 'bg-white border-[#1FA6BA] hover:bg-[#1FA6BA] hover:text-white group-hover:bg-[#1FA6BA] group-hover:text-white text-[#1FA6BA]'}`}>
                                    {isSelected ? (
                                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                                    ) : (
                                      <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-full border border-[#1FA6BA] flex items-center justify-center bg-white shadow-sm">
                                    <Lock className="w-4 h-4 text-[#1FA6BA]" />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="p-8 text-right text-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-300 bg-white rounded-2xl border border-gray-100 shadow-sm whitespace-pre-line text-lg leading-relaxed" dir="rtl">
            {(() => {
              if (courseData?.details) {
                try {
                  const detailsArray = JSON.parse(courseData.details);
                  if (Array.isArray(detailsArray) && detailsArray.length > 0) {
                    return (
                      <ul className="list-disc list-inside space-y-4">
                        {detailsArray.map((item: string, idx: number) => (
                          <li key={idx} className="text-gray-800">{item}</li>
                        ))}
                      </ul>
                    );
                  }
                } catch (e) {
                  return courseData.details;
                }
              }
              return courseData?.description || courseData?.about_course || courseData?.about || 'لا توجد معلومات متوفرة عن هذه الدورة حاليا.';
            })()}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Sub-tabs (Teacher Rating vs Student Reviews) */}
            <div className="w-full bg-[#f0f4fb] rounded-xl p-1 flex mb-6">
              <button 
                onClick={() => setActiveReviewTab('teacher_rating')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${activeReviewTab === 'teacher_rating' ? 'bg-[#38b6c7] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200/50'}`}
              >
                تقييم الاستاذ
              </button>
              <button 
                onClick={() => setActiveReviewTab('student_reviews')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${activeReviewTab === 'student_reviews' ? 'bg-[#38b6c7] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200/50'}`}
              >
                اراء التلاميذ
              </button>
            </div>

            {/* Sub-tabs Content */}
            {activeReviewTab === 'teacher_rating' ? (
              <>
                {/* Review Form Container */}
                <div className="bg-[#f8f9fa] border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm">
                  <div className="flex flex-col items-end mb-4">
                    <span className="font-bold text-gray-800 mb-2">قيم الاستاذ</span>
                    <div className="flex items-center gap-1 flex-row-reverse">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          onClick={() => setNewReviewRating(star)}
                          disabled={isSubmittingReview}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <svg className={`w-6 h-6 transition-colors ${star <= newReviewRating ? 'text-[#f5d547]' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col mb-4">
                    <label className="text-sm text-gray-600 font-bold mb-2">اترك تعليقا للاستاذ</label>
                    <textarea 
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      disabled={isSubmittingReview}
                      placeholder="اترك تعليقا للاستاذ..." 
                      className="w-full bg-white border border-gray-200 rounded-xl p-4 min-h-[100px] resize-none focus:outline-none focus:border-[#38b6c7] focus:ring-1 focus:ring-[#38b6c7] transition-all disabled:opacity-50"
                      dir="rtl"
                    ></textarea>
                  </div>

                  <div className="flex justify-start">
                    <button 
                      onClick={submitReview}
                      disabled={isSubmittingReview}
                      className="bg-[#0d4a68] text-white px-8 py-2.5 rounded-xl font-bold transition-colors hover:bg-[#0a3a52] shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmittingReview && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                      حفظ التعليق
                    </button>
                  </div>
                </div>

                {/* List of Reviews */}
                <div className="divide-y divide-gray-100 bg-white border border-gray-100 rounded-2xl shadow-sm px-6">
                  {isLoadingReviews ? (
                    <div className="py-8 flex justify-center">
                      <div className="w-8 h-8 border-4 border-[#38b6c7] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : courseReviews.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 font-medium text-sm">
                       لا توجد تقييمات حاليا لهذه الدورة.
                    </div>
                  ) : courseReviews.map((review: any) => {
                    const name = review.student?.name || review.user?.name || review.name || 'مستخدم مجهول';
                    const rating = review.rate || review.rating || 5;
                    const comment = review.comment || review.body || '';
                    const date = review.created_at ? new Date(review.created_at).toLocaleDateString('ar-DZ') : (review.date || '');
                    const avatar = review.student?.image ? `https://mrstudy.net/${review.student.image}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f5d547&color=fff`;
                    
                    return (
                    <div key={review.id} className="py-6 flex justify-between items-start">
                      <div className="flex gap-4">
                        <img src={avatar} alt={name} className="w-12 h-12 rounded-full border border-gray-200 object-cover" />
                        <div className="flex flex-col text-right">
                          <div className="flex items-center gap-1 flex-row-reverse justify-end mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} className={`w-3 h-3 ${star <= rating ? 'text-[#f5d547]' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="font-bold text-gray-800 text-sm mb-1">{comment}</span>
                          <span className="text-xs text-gray-400 font-medium">{name}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{date}</span>
                    </div>
                  )})}
                </div>
              </>
            ) : (
              <div className="bg-[#f8f9fa] border border-gray-100 rounded-3xl p-8 flex flex-col items-center shadow-sm relative animate-in fade-in zoom-in-95 duration-300">
                <h3 className="text-xl md:text-2xl font-black text-gray-900 text-center mb-8 max-w-lg leading-relaxed">
                  "اكتشف آراء الطلاب وكيف ساعدتهم هذه الدورة على التفوق و تحصيل معدل عال 😍🔥"
                </h3>
                
                {(() => {
                  const screenshotReviews = courseReviews.filter(r => r.image || r.photo || r.image_url);
                  
                  if (screenshotReviews.length === 0) {
                     return (
                       <div className="w-full max-w-sm h-[300px] bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 font-bold">
                         لا توجد صور متوفرة حالياً.
                       </div>
                     );
                  }
                  
                  const currentImageField = screenshotReviews[currentScreenshotIndex]?.image || screenshotReviews[currentScreenshotIndex]?.photo || screenshotReviews[currentScreenshotIndex]?.image_url;
                  const currentScreenshotUrl = currentImageField?.startsWith('http') 
                    ? currentImageField 
                    : `https://mrstudy.net/${currentImageField?.startsWith('storage') ? currentImageField : 'storage/' + currentImageField}`;
                  
                  const nextSlide = () => setCurrentScreenshotIndex((prev) => (prev + 1) % screenshotReviews.length);
                  const prevSlide = () => setCurrentScreenshotIndex((prev) => (prev === 0 ? screenshotReviews.length - 1 : prev - 1));

                  return (
                    <div className="relative w-full max-w-sm flex items-center justify-center">
                      {/* Left Arrow (Cyan) */}
                      {screenshotReviews.length > 1 && (
                        <button 
                          onClick={prevSlide}
                          className="absolute -left-4 md:-left-12 z-10 w-12 h-12 rounded-full bg-[#38b6c7] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                        >
                          <ArrowRight className="w-6 h-6 rotate-180" />
                        </button>
                      )}

                      {/* Screenshot Image Container */}
                      <div className="w-[280px] h-[550px] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-gray-800 relative">
                        <img 
                          src={currentScreenshotUrl}
                          alt="Student Review Screenshot" 
                          className="w-full h-full object-cover transition-opacity duration-300"
                          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; }}
                        />
                      </div>

                      {/* Right Arrow (Dark Blue) */}
                      {screenshotReviews.length > 1 && (
                        <button 
                          onClick={nextSlide}
                          className="absolute -right-4 md:-right-12 z-10 w-12 h-12 rounded-full bg-[#0d4a68] text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                        >
                          <ArrowRight className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

            {/* End of Standard Tabs Content */}
          </>
        )}

      </main>

      {/* Fixed Bottom Action Bar (Only if not subscribed) */}
      {!isSubscribed && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="container mx-auto max-w-4xl flex justify-center">
            <Link href={`/learning/course/${params.id}/pay`} className="w-full md:w-[400px] bg-[#0d4a68] text-white py-3.5 rounded-xl font-bold text-lg hover:bg-[#0a3a52] transition-colors shadow-md flex items-center justify-center gap-2 active:scale-95">
              <span className="font-black">3200 د.ج</span>
              <span>إشترك الآن</span>
            </Link>
          </div>
        </div>
      )}

      {/* Locked Content Modal */}
      {isLockedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            {/* Lock Icon */}
            <div className="w-20 h-20 mb-4 bg-orange-50 rounded-full flex items-center justify-center relative">
              <svg className="w-10 h-10 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              {/* Decorative keyhole dot */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <div className="w-1 h-2 bg-white mx-auto -mt-0.5"></div>
              </div>
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-3">المحتوى مقفول</h3>
            
            <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium px-4">
              هذا الدرس متاح فقط للمشتركين.<br/>
              سجل الآن للوصول إلى الملخصات والفيديوهات وجميع المزايا.
            </p>
            
            <div className="flex w-full gap-3">
              <Link 
                href={`/learning/course/${params.id}/pay`}
                className="flex-1 bg-[#0d4a68] text-white py-3 rounded-xl font-bold transition-colors hover:bg-[#0a3a52] shadow-sm flex items-center justify-center"
              >
                سجل الآن
              </Link>
              <button 
                onClick={() => setIsLockedModalOpen(false)}
                className="flex-[0.4] bg-white border-2 border-[#0d4a68] text-[#0d4a68] py-3 rounded-xl font-bold transition-colors hover:bg-gray-50"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ask Teacher Modal */}
      {isAskModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsAskModalOpen(false)}
        >
          <div 
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsAskModalOpen(false)}
              className="absolute top-4 left-4 w-8 h-8 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              disabled={isSubmittingQuestion}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Title */}
            <h2 className="text-xl font-black text-gray-900 mb-6">أسئلة و أجوبة</h2>

            {/* Image Placeholder */}
            <div className="w-48 h-48 mb-6 relative flex items-center justify-center">
               <img src="https://cdni.iconscout.com/illustration/premium/thumb/confused-man-looking-at-laptop-illustration-download-in-svg-png-gif-file-formats--question-mark-pack-business-illustrations-6484393.png" alt="Confused student" className="w-full h-full object-contain" />
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-2 mb-4 text-[#1FA6BA] font-bold">
              <span dir="ltr">{formatVideoTime(currentVideoTime)}</span>
              <span>الوقت المرتبط بالسؤال</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            {audioBlob && (
                <div className="w-full bg-[#f0f4fb] rounded-full px-4 py-2 mb-4 flex items-center justify-between text-sm text-[#0d4a68]">
                    <span>تم تسجيل الصوت بنجاح</span>
                    <button onClick={() => setAudioBlob(null)} className="text-red-500 hover:text-red-700">
                        حذف
                    </button>
                </div>
            )}

            {/* Input Field */}
            <div className="w-full bg-white border border-gray-300 rounded-full px-4 py-2.5 mb-6 flex items-center gap-3 shadow-sm focus-within:border-[#1FA6BA] focus-within:ring-1 focus-within:ring-[#1FA6BA] transition-all">
              <button 
                 onClick={submitQuestion}
                 disabled={isSubmittingQuestion || (!questionText.trim() && !audioBlob)}
                 className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmittingQuestion ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                )}
              </button>
              
              <input 
                type="text" 
                placeholder="اكتب سؤالك..." 
                className="flex-1 bg-transparent border-none outline-none text-right placeholder:text-gray-400 font-medium"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitQuestion()}
                disabled={isSubmittingQuestion}
              />
              
              <div className="flex items-center gap-2 text-gray-400 shrink-0">
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isSubmittingQuestion}
                  className={`transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'hover:text-gray-600'}`}
                  title={isRecording ? "إيقاف التسجيل" : "تسجيل صوت"}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              onClick={submitQuestion}
              disabled={isSubmittingQuestion || (!questionText.trim() && !audioBlob)}
              className="w-full bg-[#38b6c7] text-white font-black py-4 rounded-xl hover:bg-[#2b96a5] transition-colors shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmittingQuestion ? 'جاري الإرسال...' : 'اطرح السؤال'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
