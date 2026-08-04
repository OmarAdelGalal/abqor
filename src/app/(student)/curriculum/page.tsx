'use client';

import React, { useEffect, useState } from 'react';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import StreakWidget from '@/components/dashboard/StreakWidget';
import RankWidget from '@/components/dashboard/RankWidget';
import UpgradeWidget from '@/components/dashboard/UpgradeWidget';
import CurriculumMap from '@/components/dashboard/CurriculumMap';
import { FaFacebookF, FaInstagram, FaTelegramPlane, FaYoutube } from 'react-icons/fa';
import { authApi } from '@/lib/auth';

export default function CurriculumPage() {
  const [stats, setStats] = useState({ health: 0, diamonds: 0, flame: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('abqor_token');
        if (token) {
          const authRaw = await authApi.autoLogin(token);
          const authRes = authRaw?.data?.data || authRaw?.data || authRaw;
          
          if (authRes) {
            setStats({
              health: authRes?.health || 0,
              diamonds: authRes?.diamonds || 0,
              flame: authRes?.flame || 0
            });
          }
        }
      } catch (err: any) {
        console.error("Failed to load curriculum header data", err?.message || err);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-text-main" dir="rtl">
      <AuthenticatedHeader health={stats.health} diamonds={stats.diamonds} flame={stats.flame} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          
          {/* Main Content Area (Right side in RTL) */}
          <div className="flex flex-col gap-6 w-full relative">
            <CurriculumMap />
          </div>

          {/* Sidebar Area (Left side in RTL) */}
          <div className="flex flex-col gap-4">
            <StreakWidget flame={stats.flame} />
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
