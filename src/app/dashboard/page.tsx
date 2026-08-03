import React from 'react';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import StreakWidget from '@/components/dashboard/StreakWidget';
import RankWidget from '@/components/dashboard/RankWidget';
import UpgradeWidget from '@/components/dashboard/UpgradeWidget';
import ExamCountdownHero from '@/components/dashboard/ExamCountdownHero';
import ServicesRow from '@/components/dashboard/ServicesRow';
import MoreServicesGrid from '@/components/dashboard/MoreServicesGrid';
import { FaFacebookF, FaInstagram, FaTelegramPlane, FaYoutube } from 'react-icons/fa';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-text-main" dir="rtl">
      <AuthenticatedHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          
          {/* Main Content Area (Right side in RTL) */}
          <div className="flex flex-col gap-6">
            <ExamCountdownHero />
            <ServicesRow />
            <MoreServicesGrid />
          </div>

          {/* Sidebar Area (Left side in RTL) */}
          <div className="flex flex-col gap-4">
            <StreakWidget />
            <RankWidget />
            <UpgradeWidget />
            
            {/* Follow Us Widget */}
            <div className="bg-gray-50 rounded-3xl p-6 w-full border border-gray-100 flex flex-col items-center gap-4 mt-2">
              <span className="text-[#004e70] font-bold">قم بمتابعتنا الآن</span>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                  <FaYoutube size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center hover:bg-blue-500 transition-colors">
                  <FaTelegramPlane size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center hover:bg-pink-600 transition-colors">
                  <FaInstagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <FaFacebookF size={20} />
                </a>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
