'use client';

import React, { useState } from 'react';
import { ArrowRight, Plus, Search, Lock, Globe } from 'lucide-react';
import Link from 'next/link';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import StreakWidget from '@/components/dashboard/StreakWidget';
import RankWidget from '@/components/dashboard/RankWidget';
import UpgradeWidget from '@/components/dashboard/UpgradeWidget';
import SocialFollowWidget from '@/components/learning/SocialFollowWidget';
import StudyGroupCard, { StudyGroup } from '@/components/challenges/StudyGroupCard';

const SAMPLE_GROUPS: StudyGroup[] = [
    {
        id: '1',
        name: 'هيا نتعلم',
        description: 'نبذة تعريفية عن المجموعة، نبذة تعريفية نبذة تعريفية عن المجموعة نبذة تعريفية عن المجموعة.',
        membersCount: 154,
        studyHoursWeek: 41,
        studyHoursToday: 8,
        isPrivate: false,
        isJoined: true,
    },
    {
        id: '2',
        name: 'طلاب البكالوريا 2025',
        description: 'مجموعة خاصة لطلاب البكالوريا للتحضير المشترك للامتحانات.',
        membersCount: 89,
        studyHoursWeek: 62,
        studyHoursToday: 12,
        isPrivate: true,
        isJoined: false,
    },
    {
        id: '3',
        name: 'مجموعة الرياضيات',
        description: 'نبذة تعريفية عن المجموعة، نبذة تعريفية.',
        membersCount: 45,
        studyHoursWeek: 28,
        studyHoursToday: 5,
        isPrivate: false,
        isJoined: false,
    },
    {
        id: '4',
        name: 'أبطال الفيزياء',
        description: 'مجموعة دراسية متخصصة في مواد الفيزياء والكيمياء للثانوي.',
        membersCount: 32,
        studyHoursWeek: 19,
        studyHoursToday: 3,
        isPrivate: false,
        isJoined: false,
    },
];

export default function GroupsPage() {
    const [groups, setGroups] = useState<StudyGroup[]>(SAMPLE_GROUPS);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'joined' | 'public' | 'private'>('all');

    const handleJoin = (id: string) => {
        setGroups(prev => prev.map(g => g.id === id ? { ...g, isJoined: true } : g));
    };

    const filteredGroups = groups.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            g.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filterType === 'all' ||
            (filterType === 'joined' && g.isJoined) ||
            (filterType === 'public' && !g.isPrivate) ||
            (filterType === 'private' && g.isPrivate);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans" dir="rtl">
            <AuthenticatedHeader />

            <main className="container mx-auto px-4 py-6 max-w-[1440px]">
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* Main Content */}
                    <div className="flex-1 w-full flex flex-col gap-6">

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl md:text-3xl font-black text-gray-800">مجموعات الدراسة</h1>
                                <Link href="/challenges" className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                                    <ArrowRight className="w-6 h-6" />
                                </Link>
                            </div>
                            <button
                                type="button"
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#004e70] hover:bg-[#003c57] text-white font-black text-sm rounded-2xl transition-all cursor-pointer shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                إنشاء مجموعة
                            </button>
                        </div>

                        {/* Search + Filter Bar */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="ابحث عن مجموعة..."
                                    className="w-full bg-white border border-gray-200 rounded-2xl py-3 pr-10 pl-4 text-sm font-bold text-gray-700 outline-none focus:border-[#38b6c7] transition-colors text-right shadow-sm"
                                />
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex gap-1 bg-white rounded-2xl p-1 border border-gray-100 shadow-sm shrink-0">
                                {[
                                    { key: 'all' as const, label: 'الكل' },
                                    { key: 'joined' as const, label: 'منضم' },
                                    { key: 'public' as const, label: 'عامة', icon: Globe },
                                    { key: 'private' as const, label: 'خاصة', icon: Lock },
                                ].map(({ key, label, icon: Icon }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setFilterType(key)}
                                        className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer ${
                                            filterType === key
                                                ? 'bg-[#004e70] text-white shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {Icon && <Icon className="w-3 h-3" />}
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Groups Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredGroups.length > 0 ? (
                                filteredGroups.map((group) => (
                                    <StudyGroupCard
                                        key={group.id}
                                        group={group}
                                        onJoin={handleJoin}
                                        onView={(id) => window.location.href = `/challenges/groups/${id}`}
                                    />
                                ))
                            ) : (
                                <div className="col-span-2 flex flex-col items-center justify-center py-16 text-gray-400">
                                    <span className="text-4xl mb-3">👥</span>
                                    <p className="font-bold text-sm">لم يتم العثور على مجموعات</p>
                                    <p className="text-xs mt-1">جرب البحث بكلمات مختلفة أو غير الفلتر</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Widgets */}
                    <div className="w-full lg:w-[394px] flex flex-col gap-6 shrink-0">
                        <StreakWidget days={8} flame={8} />
                        <RankWidget rank={12} progress={3} />
                        <UpgradeWidget />
                        <SocialFollowWidget />
                    </div>

                </div>
            </main>
        </div>
    );
}
