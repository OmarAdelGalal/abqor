'use client';

import React from 'react';
import { Users, Clock, Lock, Globe } from 'lucide-react';

export interface StudyGroup {
    id: string;
    name: string;
    description?: string;
    membersCount: number;
    studyHoursWeek: number;
    studyHoursToday: number;
    isPrivate?: boolean;
    isJoined?: boolean;
    avatars?: string[];
}

interface StudyGroupCardProps {
    group: StudyGroup;
    onJoin?: (id: string) => void;
    onView?: (id: string) => void;
}

export default function StudyGroupCard({ group, onJoin, onView }: StudyGroupCardProps) {
    return (
        <div
            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            dir="rtl"
        >
            {/* Color Header Band */}
            <div className="h-2 bg-gradient-to-r from-[#38b6c7] to-[#004e70]" />

            <div className="p-5 flex flex-col gap-4">
                {/* Group Title Row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5 flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-gray-800">{group.name}</h3>
                            {group.isPrivate ? (
                                <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            ) : (
                                <Globe className="w-3.5 h-3.5 text-[#38b6c7] shrink-0" />
                            )}
                        </div>
                        {group.description && (
                            <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed">
                                {group.description}
                            </p>
                        )}
                    </div>

                    {/* Group Icon */}
                    <div className="w-11 h-11 bg-[#edf9fb] rounded-2xl flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-[#38b6c7]" />
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-black text-gray-600">{group.membersCount} عضو</span>
                    </div>
                    <div className="w-px h-4 bg-gray-200" />
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#38b6c7]" />
                            <span className="text-xs font-bold text-gray-500">
                                هذا الأسبوع: <span className="font-black text-[#004e70]">{group.studyHoursWeek}س</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-green-400" />
                            <span className="text-xs font-bold text-gray-500">
                                اليوم: <span className="font-black text-green-600">{group.studyHoursToday}س</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => onView?.(group.id)}
                        className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-black text-xs rounded-xl border border-gray-200 transition-all cursor-pointer"
                    >
                        المعرفة
                    </button>
                    <button
                        type="button"
                        onClick={() => onJoin?.(group.id)}
                        className={`flex-1 py-2.5 font-black text-xs rounded-xl transition-all cursor-pointer ${
                            group.isJoined
                                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-default'
                                : 'bg-[#004e70] hover:bg-[#003c57] text-white shadow-sm'
                        }`}
                        disabled={group.isJoined}
                    >
                        {group.isJoined ? 'منضم ✓' : 'الإنضمام'}
                    </button>
                </div>
            </div>
        </div>
    );
}
