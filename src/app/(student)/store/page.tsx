'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell } from 'lucide-react';
import StreakWidget from '@/components/dashboard/StreakWidget';
import RankWidget from '@/components/dashboard/RankWidget';
import UpgradeWidget from '@/components/dashboard/UpgradeWidget';
import { FaFacebookF, FaInstagram, FaTelegramPlane, FaYoutube } from 'react-icons/fa';

export default function StorePage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl pb-24" dir="rtl">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Content Column (On the Right in RTL) */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-8">
            <h1 className="text-2xl font-black text-gray-800 tracking-wide uppercase">E-Store</h1>
            <button onClick={() => router.back()} className="hover:opacity-70 transition-opacity">
              <ArrowLeft className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center py-10 bg-white rounded-[2rem] min-h-[600px]">
            {/* The coming soon illustration */}
            <img 
              src="/home/Vector.png" 
              alt="Coming Soon" 
              className="max-w-[400px] w-full object-contain mb-8" 
              onError={(e) => {
                e.currentTarget.src = 'https://illustrations.popsy.co/amber/student-going-to-school.svg';
              }}
            />
            
            <h2 className="text-2xl font-black text-[#004e70] mb-2">الميزة غير متوفرة حاليا</h2>
            <p className="text-gray-500 font-bold mb-8">قريباً ستكون متاحة لك بإذن الله</p>
            
            <button className="bg-[#008db9] hover:bg-[#007a9e] text-white font-bold py-3.5 px-8 rounded-xl flex items-center gap-3 transition-colors shadow-md">
              <span>سأخبرك عندما تكون متاحة</span>
              <Bell className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </button>
          </div>
        </div>

        {/* Sidebar Column (On the Left in RTL) */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          <StreakWidget days={8} />
          <RankWidget rank={12} progress={3} />
          <UpgradeWidget />
          
          {/* Social Links Box */}
          <div className="bg-gray-50 rounded-[2rem] p-6 text-center border border-gray-100 shadow-sm mt-8">
            <h3 className="text-[#004e70] font-bold mb-4">قم بمتابعتنا الآن</h3>
            <div className="flex items-center justify-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                <FaYoutube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                <FaTelegramPlane className="w-5 h-5 -ml-1 mt-0.5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                <FaFacebookF className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
