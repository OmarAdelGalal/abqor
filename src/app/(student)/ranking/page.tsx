'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, TrendingUp, Medal, Crown } from 'lucide-react';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';

interface RankedUser {
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  progress: number;
  isCurrentUser?: boolean;
}

// Placeholder data — replace with real API call
const mockRanking: RankedUser[] = [
  { rank: 1,  name: 'أحمد محمد',   score: 9840, progress: 12, avatar: '' },
  { rank: 2,  name: 'سارة خالد',   score: 9210, progress: 10, avatar: '' },
  { rank: 3,  name: 'يوسف علي',    score: 8750, progress: 8,  avatar: '' },
  { rank: 4,  name: 'نور الدين',   score: 8200, progress: 7,  avatar: '' },
  { rank: 5,  name: 'ريم أحمد',    score: 7980, progress: 6,  avatar: '' },
  { rank: 6,  name: 'عمر عبد الله', score: 7650, progress: 5, avatar: '' },
  { rank: 7,  name: 'لينا حسن',    score: 7400, progress: 5,  avatar: '' },
  { rank: 8,  name: 'كريم سامي',   score: 7100, progress: 4,  avatar: '' },
  { rank: 9,  name: 'هناء مصطفى',  score: 6890, progress: 4,  avatar: '' },
  { rank: 10, name: 'أنت',          score: 6500, progress: 3,  avatar: '', isCurrentUser: true },
  { rank: 11, name: 'طارق إبراهيم', score: 6200, progress: 3, avatar: '' },
  { rank: 12, name: 'منى سعيد',    score: 5980, progress: 2,  avatar: '' },
];

const medalColors: Record<number, { bg: string; text: string; icon: React.ReactNode }> = {
  1: { bg: 'from-yellow-400 to-amber-500',   text: 'text-yellow-600', icon: <Crown size={18} className="text-yellow-500 fill-yellow-400" /> },
  2: { bg: 'from-gray-300 to-gray-400',       text: 'text-gray-500',   icon: <Medal size={18} className="text-gray-400 fill-gray-300" /> },
  3: { bg: 'from-orange-300 to-amber-600',    text: 'text-orange-600', icon: <Medal size={18} className="text-orange-400 fill-orange-300" /> },
};

export default function RankingPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<'week' | 'month' | 'all'>('week');

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <AuthenticatedHeader />

      <main className="container mx-auto px-4 py-8 max-w-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            aria-label="رجوع"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#004e70]">لوحة الترتيب</h1>
            <Trophy size={24} className="text-yellow-400 fill-yellow-400" />
          </div>

          <div className="w-10" /> {/* spacer */}
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-white border border-gray-100 rounded-2xl p-1 mb-8 shadow-sm">
          {([['week', 'هذا الأسبوع'], ['month', 'هذا الشهر'], ['all', 'الكل']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                filter === key
                  ? 'bg-[#38b6c7] text-white shadow-md'
                  : 'text-gray-500 hover:text-[#38b6c7]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-4 mb-10">
          {/* 2nd */}
          <PodiumCard user={mockRanking[1]} height="h-28" />
          {/* 1st */}
          <PodiumCard user={mockRanking[0]} height="h-36" isFirst />
          {/* 3rd */}
          <PodiumCard user={mockRanking[2]} height="h-24" />
        </div>

        {/* Ranking List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {mockRanking.map((user, idx) => {
            const medal = medalColors[user.rank];
            const isTop3 = user.rank <= 3;
            return (
              <div
                key={user.rank}
                className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                  user.isCurrentUser
                    ? 'bg-[#e8f9fb] border-r-4 border-[#38b6c7]'
                    : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                } ${idx !== mockRanking.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isTop3 ? `bg-gradient-to-br ${medal.bg}` : 'bg-gray-100'
                }`}>
                  {isTop3
                    ? medal.icon
                    : <span className="text-xs font-black text-gray-500">{user.rank}</span>
                  }
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-black text-sm ${
                  user.isCurrentUser ? 'bg-[#38b6c7]' : 'bg-gradient-to-br from-[#2F8E9C] to-[#004e70]'
                }`}>
                  {user.name.charAt(0)}
                </div>

                {/* Name & Progress */}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm truncate ${user.isCurrentUser ? 'text-[#004e70]' : 'text-gray-800'}`}>
                    {user.name}
                    {user.isCurrentUser && <span className="mr-2 text-[10px] bg-[#38b6c7] text-white px-2 py-0.5 rounded-full">أنت</span>}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <TrendingUp size={11} className="text-green-500" />
                    <span className="text-xs text-gray-400">+{user.progress} مراحل</span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-left flex-shrink-0">
                  <p className={`font-black text-sm ${isTop3 ? medal.text : 'text-gray-700'}`}>
                    {user.score.toLocaleString('ar-DZ')}
                  </p>
                  <p className="text-[10px] text-gray-400 text-left">نقطة</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          يتم تحديث الترتيب كل يوم عند منتصف الليل
        </p>

      </main>
    </div>
  );
}

function PodiumCard({ user, height, isFirst = false }: { user: RankedUser; height: string; isFirst?: boolean }) {
  const colors = {
    1: 'from-yellow-400 to-amber-500',
    2: 'from-gray-300 to-gray-400',
    3: 'from-orange-300 to-amber-600',
  };
  const color = colors[user.rank as 1 | 2 | 3];

  return (
    <div className="flex flex-col items-center gap-2">
      {isFirst && <Crown size={22} className="text-yellow-400 fill-yellow-300 mb-1" />}
      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-black text-lg shadow-lg ${isFirst ? 'ring-4 ring-yellow-300/50' : ''}`}>
        {user.name.charAt(0)}
      </div>
      <p className="text-xs font-bold text-gray-700 text-center max-w-[70px] truncate">{user.name}</p>
      <div className={`w-16 ${height} bg-gradient-to-t ${color} rounded-t-2xl flex items-start justify-center pt-2 shadow-md`}>
        <span className="text-white font-black text-lg">#{user.rank}</span>
      </div>
    </div>
  );
}
