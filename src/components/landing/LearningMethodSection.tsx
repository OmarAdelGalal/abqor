"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};

export default function LearningMethodSection() {
  const [activeMethod, setActiveMethod] = useState<'semesters' | 'subjects'>('semesters');

  return (
    <motion.section 
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUpVariants}
      className="w-full py-32 bg-[#F8FAFC] overflow-hidden"
    >
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16 md:gap-8">
        
        {/* Image (Renders on the Right in RTL) */}
        <div className="w-full md:w-1/2 flex justify-center relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeMethod === 'semesters' ? (
              <motion.div
                key="semesters"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.4 }}
                className="absolute w-full flex justify-center items-center"
              >
                <div className="relative w-full max-w-md left-0 md:left-10">
                  <img src="/القصل الدراسي و الأسابيع.png" alt="" className='absolute z-20 -top-15 -left-45 scale-75' />
                  <img src="/لما يضغط على الكارد.png" alt="Learning Method" className="w-full h-auto scale-110 rounded-2xl z-30 drop-shadow-xl" />
                </div>  
              </motion.div>
            ) : (
              <motion.div
                key="subjects"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.4 }}
                className="absolute w-full flex justify-center items-center"
              >
                <div className="relative w-full max-w-md left-0 md:left-10">
                  <img src="/Frame 1984078482.png" alt="Subjects Method" className="w-full h-auto scale-110 rounded-2xl z-30 drop-shadow-xl" />
                </div>  
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Text (Renders on the Left in RTL) */}
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-right flex flex-col items-center md:items-start z-40">
          <h2 className="text-4xl md:text-[2.75rem] font-black text-[#2D3748] leading-tight">
            اختر الطريقة التي <span className="text-[#1FA6BA]">تناسبك</span> في<br/>
            <span className="text-[#1FA6BA]">التعلّم</span>
          </h2>
          <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
            تعلّم حسب الفصول الدراسية أو حسب المواد الدراسية، بالطريقة التي تمنحك تجربة أسهل وأكثر مرونة.
          </p>
          
          {/* Segmented Control with Layout Transitions */}
          <div className="relative flex bg-[#EDF2F7] rounded-xl p-1.5 w-full max-w-md mt-6 shadow-sm overflow-hidden">
            <button 
              onClick={() => setActiveMethod('semesters')}
              className={`relative flex-1 py-3.5 rounded-lg font-bold text-lg z-10 transition-colors ${
                activeMethod === 'semesters' ? 'text-white' : 'text-[#054a6b] hover:bg-gray-200/50'
              }`}
            >
              {activeMethod === 'semesters' && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-[#054a6b] rounded-lg shadow-sm -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              الدراسة بالفصول
            </button>
            <button 
              onClick={() => setActiveMethod('subjects')}
              className={`relative flex-1 py-3.5 rounded-lg font-bold text-lg z-10 transition-colors ${
                activeMethod === 'subjects' ? 'text-white' : 'text-[#054a6b] hover:bg-gray-200/50'
              }`}
            >
              {activeMethod === 'subjects' && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-[#054a6b] rounded-lg shadow-sm -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              الدراسة بالمواد
            </button>
          </div>
        </div>

      </div>
    </motion.section>
  );
}
