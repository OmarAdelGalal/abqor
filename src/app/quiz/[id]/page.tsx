'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, Heart } from 'lucide-react';
import { quizzesApi } from '@/lib/quizzes';

// Type definitions based on provided JSON
interface Answer {
  id: number;
  question_id: number;
  text: string;
}

interface Question {
  id: number;
  text: string;
  answers: Answer[];
  correct_answer_id: number;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  
  // Game state
  const [lives, setLives] = useState(7);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finishData, setFinishData] = useState<any>(null); // To store diamonds, flames, etc.

  useEffect(() => {
    // Fetch quiz data
    const fetchQuiz = async () => {
      try {
        setIsLoading(true);
        
        // 1. Try to load from localStorage first (passed from CurriculumNode)
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('currentQuizData');
          if (stored) {
            const data = JSON.parse(stored);
            if (data.id.toString() === quizId && data.current_lesson?.questions) {
              setQuestions(data.current_lesson.questions);
              return;
            }
          }
        }

        // 2. Fallback to API if we don't have it in localStorage
        const res = await quizzesApi.getQuizDetails(quizId);
        
        // Handle response based on expected backend structure
        const data = res?.data?.data || res?.data;
        
        if (data?.current_lesson?.questions) {
          setQuestions(data.current_lesson.questions);
        } else if (data?.questions) {
          setQuestions(data.questions);
        } else {
          console.warn('Questions not found in API response');
        }
      } catch (err) {
        // Use console.warn instead of console.error to avoid Next.js dev overlay for missing quizzes
        console.warn('Failed to load quiz from API, falling back to empty state.', err);
      } finally {
        // Simulate a small delay for the loading screen animation
        setTimeout(() => setIsLoading(false), 1500);
      }
    };

    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const handleClose = () => {
    router.back();
  };

  const handleAnswerSubmit = async () => {
    if (selectedAnswerId === null || isSubmitting || isAnswerRevealed) return;

    const currentQuestion = questions[currentQuestionIndex];
    setIsSubmitting(true);

    try {
      // Check answer correctness (frontend validation based on correct_answer_id)
      const correct = selectedAnswerId === currentQuestion.correct_answer_id;
      
      // Update local state
      setIsCorrect(correct);
      setIsAnswerRevealed(true);
      
      if (!correct) {
        setLives((prev) => Math.max(0, prev - 1));
        
        // Notify backend of health decrease
        try {
          await quizzesApi.decrementHealth();
        } catch (healthErr) {
          console.warn('Failed to decrement health on backend', healthErr);
        }
      }

      // Send to backend
      try {
        await quizzesApi.submitQuizAnswer(quizId, {
          question_id: currentQuestion.id,
          answer_id: selectedAnswerId
        });
      } catch (apiErr) {
        console.warn('API submit failed, continuing locally', apiErr);
      }
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswerId(null);
      setIsAnswerRevealed(false);
      setIsCorrect(null);
    } else {
      // Quiz finished
      setIsFinished(true);
      // Notify backend and get rewards
      try {
        const res = await quizzesApi.finishQuiz(quizId);
        if (res?.data?.data) {
          setFinishData(res.data.data);
        }
      } catch (err) {
        console.warn('Failed to finish quiz on backend', err);
      }
    }
  };

  // ----------------------------------------
  // LOADING STATE
  // ----------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center" dir="rtl">
        <div className="max-w-md w-full flex flex-col items-center">
          <img 
            src="/c518e28edf6bef8d0d46fdbfb27871175eb44f11.png" // Using one of the available character PNGs or a generic one
            alt="Loading Character"
            className="w-48 h-48 object-contain mb-8 animate-pulse"
            onError={(e) => { (e.target as HTMLImageElement).src = '/1.png' }}
          />
          <h2 className="text-xl font-bold text-gray-800 mb-2">جاري تحميل الدرس ...</h2>
          <p className="text-gray-500">استعد لمعلومة جديدة نحو النجاح!<br/>الدرس في طريقه إليك</p>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // FINISHED STATE
  // ----------------------------------------
  if (isFinished) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center" dir="rtl">
        <div className="max-w-md w-full flex flex-col items-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">أحسنت! لقد أكملت الاختبار.</h2>
          <p className="text-gray-500 mb-6">لقد حافظت على {lives} قلوب.</p>

          {finishData && (
            <div className="bg-gray-50 rounded-2xl p-6 w-full mb-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">مكافآتك</h3>
              <div className="flex justify-around items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl font-bold text-blue-500">{finishData.diamonds || 0}</div>
                  <div className="text-sm text-gray-500">ماسة</div>
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl font-bold text-orange-500">{finishData.flame || 0}</div>
                  <div className="text-sm text-gray-500">حماس</div>
                </div>
              </div>
              {finishData.dailyTargetAchieved && (
                <div className="mt-4 text-sm font-bold text-green-600 bg-green-100 py-2 rounded-lg">
                  لقد حققت هدفك اليومي! 🎉
                </div>
              )}
            </div>
          )}

          <button 
            onClick={handleClose}
            className="px-8 py-3 w-full bg-[#45B7C7] text-white rounded-xl font-bold hover:bg-[#3ca4b3] transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // EMPTY STATE (No Questions)
  // ----------------------------------------
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center" dir="rtl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">لا توجد أسئلة متاحة حالياً</h2>
        <button 
          onClick={handleClose}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
        >
          عودة
        </button>
      </div>
    );
  }

  // ----------------------------------------
  // QUIZ STATE
  // ----------------------------------------
  const currentQuestion = questions[currentQuestionIndex];
  // Calculate progress for segments (as seen in screenshot)
  const totalQuestions = questions.length;

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      
      {/* HEADER */}
      <header className="flex items-center justify-between p-4 border-b border-gray-100">
        <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        {/* Progress Bar (Segmented like in the screenshot) */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="flex items-center gap-1 w-full h-3">
            {questions.map((_, idx) => (
              <div 
                key={idx} 
                className={`flex-1 h-full rounded-full transition-colors duration-300 ${
                  idx < currentQuestionIndex ? 'bg-[#45B7C7]' :
                  idx === currentQuestionIndex ? 'bg-[#45B7C7] opacity-60' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Lives / Hearts */}
        <div className="flex items-center gap-1 text-red-500 font-bold">
          <Heart className="w-6 h-6 fill-red-500 text-red-500" />
          <span className="text-lg">{lives}</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full p-4 pt-12">
        <h1 className="text-xl font-bold text-gray-800 mb-12 text-center">اختر الإجابة الصحيحة</h1>

        {/* Question Bubble */}
        <div className="w-full flex justify-center items-center mb-12 relative">
          <div className="relative flex-1 max-w-lg min-w-[280px]">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm relative z-10">
              <p className="text-center text-gray-800 font-bold text-lg leading-relaxed">
                {currentQuestion.text}
              </p>
              {/* Speech bubble pointer pointing left towards the character */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 border-l border-b border-gray-200 rotate-45"></div>
            </div>
          </div>
          <div className="mr-6 z-20 self-center">
            <img 
              src="/c518e28edf6bef8d0d46fdbfb27871175eb44f11.png" // Placeholder for the character
              alt="Character" 
              className="w-24 h-24 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = '/1.png' }}
            />
          </div>
        </div>

        {/* Options */}
        <div className="w-full max-w-lg flex flex-col gap-3">
          {(currentQuestion.answers || []).map((answer, idx) => {
            const isSelected = selectedAnswerId === answer.id;
            
            // Determine styles for revealed state
            let buttonStyles = "bg-white border-gray-200 text-gray-700 hover:bg-gray-50";
            if (isAnswerRevealed) {
              if (answer.id === currentQuestion.correct_answer_id) {
                buttonStyles = "bg-green-50 border-green-500 text-green-700"; // Correct answer is green
              } else if (isSelected) {
                buttonStyles = "bg-red-50 border-red-500 text-red-700"; // Wrong selected answer is red
              }
            } else if (isSelected) {
              buttonStyles = "bg-[#e6f7f9] border-[#45B7C7] text-[#3ca4b3]"; // Selected state
            }

            return (
              <button
                key={answer.id}
                onClick={() => !isAnswerRevealed && setSelectedAnswerId(answer.id)}
                disabled={isAnswerRevealed}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${buttonStyles}`}
              >
                <span className="font-bold text-sm">{answer.text}</span>
                <span className={`flex items-center justify-center w-6 h-6 rounded-md border text-sm font-bold ${
                  isSelected && !isAnswerRevealed ? 'bg-[#45B7C7] text-white border-[#45B7C7]' : 
                  isAnswerRevealed && answer.id === currentQuestion.correct_answer_id ? 'bg-green-500 text-white border-green-500' :
                  isAnswerRevealed && isSelected ? 'bg-red-500 text-white border-red-500' :
                  'border-gray-200 text-gray-400'
                }`}>
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {/* BOTTOM ACTION AREA */}
      <div className="p-6 w-full flex justify-center bg-white">
        {!isAnswerRevealed ? (
          <button 
            onClick={handleAnswerSubmit}
            disabled={selectedAnswerId === null || isSubmitting}
            className={`w-full max-w-md py-3.5 rounded-xl font-bold text-lg transition-colors ${
              selectedAnswerId !== null 
                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            تحقق من الإجابة
          </button>
        ) : (
          <button 
            onClick={handleNextQuestion}
            className={`w-full max-w-md py-3.5 rounded-xl font-bold text-lg text-white shadow-md transition-colors ${
              isCorrect ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            المتابعة
          </button>
        )}
      </div>

    </div>
  );
}
