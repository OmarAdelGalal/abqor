"use client";
import React from 'react';
import { motion } from 'framer-motion';

const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};

export default function StagesSection() {
  const stages = [
    { title: 'المرحلة الإبتدائية', img: '/المرحلة الإبتدائية.svg', id: 'primary' },
    { title: 'المرحلة المتوسطة', img: '/مرحلة المتوسط.png', id: 'middle' },
    { title: 'المرحلة الثانوية', img: '/المرحلة الثانوية.png', id: 'high' },
    { title: 'المرحلة الجامعية', img: '/المرحلة الجامعية.png', id: 'university' },
  ];

  return (
    <motion.section 
      initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUpVariants}
      className="w-full py-16 bg-white border-b border-gray-100"
    >
      <div className="container mx-auto px-4 flex justify-center">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {stages.map((stage, i) => (
            <motion.div 
              key={stage.id} 
              className="flex flex-col items-center gap-4 cursor-pointer"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-20 h-20 rounded-full shadow-md flex items-center justify-center p-4 bg-white border border-gray-100">
                <img src={stage.img} alt={stage.title} className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-[#112F4E]">{stage.title}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
