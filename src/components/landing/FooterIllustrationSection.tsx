import React from 'react';

export default function FooterIllustrationSection() {
  return (
    <section className="w-full pt-12 pb-0 mt-12 bg-white flex justify-center items-end border-t border-gray-100 relative">
      <div className="w-full max-w-6xl">
         <img src="/2d75b4db9f9eeb18289aba479398328d648acc7c.png" alt="Students Illustration" className="w-full h-auto object-cover" />
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
        <a href="tel:+213782508214" className="bg-[#1FA6BA] text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-[#1a8c9e] transition-colors inline-block text-center cursor-pointer">
          دعم فني
        </a>
        <button className="bg-[#112F4E] text-white px-6 py-2 rounded-full font-bold shadow-md">
          منصاتنا
        </button>
      </div>
    </section>
  );
}
