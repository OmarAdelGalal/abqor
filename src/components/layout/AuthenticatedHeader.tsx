'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authApi } from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthenticatedHeaderProps {
  health?: number;
  diamonds?: number;
  flame?: number;
}

export default function AuthenticatedHeader({ health: propsHealth, diamonds: propsDiamonds, flame: propsFlame }: AuthenticatedHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  const [stats, setStats] = useState({
    flames: propsFlame || 0,
    diamonds: propsDiamonds || 0,
    health: propsHealth || 0,
    avatar: user?.avatar ? `https://mrstudy.net/storage/${user.avatar}` : '/image 24.png',
    progress: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await authApi.getAccountView();
        if (data) {
          setStats(prev => ({
            ...prev,
            flames: data.flames || 0,
            diamonds: data.diamonds || 0,
            avatar: data.avatar ? `https://mrstudy.net/storage/${data.avatar}` : prev.avatar,
            progress: data.quizzesProgress || 0
          }));
        }
      } catch (error) {
        console.error("Failed to fetch account view:", error);
      }
    };
    
    fetchStats();
  }, []);

  const navItems = [
    { name: 'الرئيسية', path: '/dashboard', icon: '/home/home.png' },
    { name: 'التعلم', path: '/learning', icon: '/home/lean icon page.png' },
    { name: 'حسابي', path: '/profile', icon: '/home/account icon page.png' },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50" dir="rtl">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        
        {/* Right Side: Navigation Tabs */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = 
              pathname === item.path || 
              (item.path === '/dashboard' && pathname === '/curriculum');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all ${
                  isActive 
                    ? 'bg-[#cbf4f9] text-[#004e70] border border-[#1FA6BA]' 
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <img src={item.icon} alt={item.name} className={`w-5 h-5 object-contain ${isActive ? '' : 'opacity-60'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Center: User Stats Pill */}
        <div className="hidden md:flex items-center bg-gray-50 rounded-full border border-gray-100 pr-2 pl-4 py-1.5 gap-4">
          
          {/* Avatar with Progress */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-green-500 overflow-hidden">
              <img src={stats.avatar} alt="User Avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=User&background=random' }} />
            </div>
            <div className="absolute -bottom-2 -left-1 bg-white border border-green-500 text-green-600 text-[9px] font-bold px-1.5 rounded-full">
              {stats.progress}%
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-bold">
            <div className="flex items-center gap-1.5 text-gray-700">
              <span>{stats.health}</span>
              <img src="/home/hart icon.png" alt="Heart" className="w-4 h-4 object-contain" />
            </div>
            <div className="h-4 w-[1px] bg-gray-300"></div>
            <Link href="/profile/wallet" className="flex items-center gap-1.5 text-gray-700 hover:opacity-70 transition-opacity cursor-pointer">
              <span>{stats.diamonds}</span>
              <img src="/home/dimond icon.png" alt="Diamond" className="w-4 h-4 object-contain" />
            </Link>
            <div className="h-4 w-[1px] bg-gray-300"></div>
            <div className="flex items-center gap-1.5 text-gray-700">
              <span>{stats.flames}</span>
              <img src="/home/fire icon.png" alt="Flame" className="w-4 h-4 object-contain" />
            </div>
          </div>
        </div>

        {/* Left Side: Logo & Bell */}
        <div className="flex items-center gap-6">
          <Link href="/notifications" className="relative w-10 h-10 flex items-center justify-center bg-yellow-50 rounded-full hover:bg-yellow-100 transition-colors">
            <img src="/home/notifction icon.png" alt="Notifications" className="w-5 h-5 object-contain" />
          </Link>
          
          <Link href="/dashboard" className="text-3xl font-black text-[#004e70] tracking-wider uppercase">
            ABQOR
          </Link>
        </div>

      </div>
    </header>
  );
}
