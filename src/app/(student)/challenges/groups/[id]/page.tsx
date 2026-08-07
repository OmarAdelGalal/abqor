'use client';

import React, { useState } from 'react';
import { ArrowRight, Share2, Users, Clock, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import StreakWidget from '@/components/dashboard/StreakWidget';
import RankWidget from '@/components/dashboard/RankWidget';
import UpgradeWidget from '@/components/dashboard/UpgradeWidget';
import SocialFollowWidget from '@/components/learning/SocialFollowWidget';

interface Member {
    id: string;
    name: string;
    studyHoursWeek: number;
    studyHoursToday: number;
    rank?: number;
    avatar?: string;
}

interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
    isSystem?: boolean;
}

const SAMPLE_MEMBERS: Member[] = [
    { id: '1', name: 'شيماء أبو القمبز', studyHoursWeek: 41, studyHoursToday: 8, rank: 4 },
    { id: '2', name: 'حمزة هاشم', studyHoursWeek: 41, studyHoursToday: 8, rank: 5 },
    { id: '3', name: 'زينة محمد', studyHoursWeek: 41, studyHoursToday: 8, rank: 6 },
    { id: '4', name: 'زينة محمد', studyHoursWeek: 41, studyHoursToday: 8, rank: 7 },
    { id: '5', name: 'هديل أنور', studyHoursWeek: 25, studyHoursToday: 4 },
    { id: '6', name: 'shimaa', studyHoursWeek: 52, studyHoursToday: 10 },
];

const SAMPLE_CHAT: ChatMessage[] = [
    { id: 'sys1', senderId: 'sys', senderName: '', content: 'Its time for study', timestamp: '09:00 ص', isSystem: true },
    { id: '1', senderId: '5', senderName: 'هديل أنور', content: 'مين بدرس معي؟', timestamp: '09:05 ص' },
    { id: '2', senderId: '6', senderName: 'shimaa', content: 'ميزة مفيدة وأمكنتي من الإنجاز', timestamp: '09:10 ص' },
];

export default function GroupDetailPage({ params }: { params: { id: string } }) {
    const [activeTab, setActiveTab] = useState<'chat' | 'members'>('members');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>(SAMPLE_CHAT);
    const [messageInput, setMessageInput] = useState('');

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        const newMsg: ChatMessage = {
            id: String(Date.now()),
            senderId: 'me',
            senderName: 'أنت',
            content: messageInput.trim(),
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages(prev => [...prev, newMsg]);
        setMessageInput('');
    };

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
                                <h1 className="text-2xl md:text-3xl font-black text-gray-800">هيا نتعلم</h1>
                                <Link href="/challenges/groups" className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                                    <ArrowRight className="w-6 h-6" />
                                </Link>
                            </div>
                            <button
                                type="button"
                                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 font-black text-sm rounded-2xl transition-all cursor-pointer shadow-sm"
                            >
                                <Share2 className="w-4 h-4" />
                                شارك المجموعة
                            </button>
                        </div>

                        {/* Group Info Card */}
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#38b6c7] to-[#004e70] rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0">
                                    هـ
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <h2 className="text-lg font-black text-gray-800">هيا نتعلم</h2>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Users className="w-3.5 h-3.5 text-[#38b6c7]" />
                                            <span className="text-xs font-bold">154 عضو</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Clock className="w-3.5 h-3.5 text-green-400" />
                                            <span className="text-xs font-bold">5254 ساعة إجمالي</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm font-bold text-gray-400 leading-relaxed">
                                نبذة تعريفية عن المجموعة، نبذة تعريفية نبذة تعريفية عن المجموعة نبذة تعريفية عن المجموعة نبذة تعريفية عن المجموعة نبذة تعريفية عن المجموعة نبذة تعريفية.
                            </p>
                        </div>

                        {/* Tabs: Chat / Members */}
                        <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-fit">
                            {[
                                { key: 'members' as const, label: 'الأعضاء', icon: Users },
                                { key: 'chat' as const, label: 'المحادثات', icon: MessageCircle },
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActiveTab(key)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer ${
                                        activeTab === key
                                            ? 'bg-[#004e70] text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Members Tab */}
                        {activeTab === 'members' && (
                            <div className="flex flex-col gap-3">
                                {SAMPLE_MEMBERS.map((member, index) => (
                                    <div
                                        key={member.id}
                                        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4"
                                    >
                                        {/* Rank */}
                                        <div className="w-8 text-center">
                                            <span className="text-sm font-black text-gray-400">#{index + 1}</span>
                                        </div>

                                        {/* Avatar */}
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#38b6c7] to-[#004e70] rounded-full flex items-center justify-center text-white text-sm font-black shrink-0">
                                            {member.name.charAt(0)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-extrabold text-sm text-gray-800 truncate">{member.name}</p>
                                        </div>

                                        {/* Study Stats */}
                                        <div className="text-left flex flex-col gap-0.5 shrink-0">
                                            <span className="text-xs font-bold text-gray-500">
                                                هذا الأسبوع: <span className="text-[#004e70] font-black">{member.studyHoursWeek}س</span>
                                            </span>
                                            <span className="text-xs font-bold text-gray-500">
                                                اليوم: <span className="text-green-600 font-black">{member.studyHoursToday}س</span>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Chat Tab */}
                        {activeTab === 'chat' && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                                {/* Messages Area */}
                                <div className="flex flex-col gap-3 p-5 min-h-[300px] max-h-[500px] overflow-y-auto">
                                    {chatMessages.map((msg) => (
                                        msg.isSystem ? (
                                            <div key={msg.id} className="flex items-center justify-center">
                                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                                    {msg.content}
                                                </span>
                                            </div>
                                        ) : (
                                            <div
                                                key={msg.id}
                                                className={`flex items-end gap-2 ${msg.senderId === 'me' ? 'flex-row-reverse' : ''}`}
                                            >
                                                <div className="w-8 h-8 bg-gradient-to-br from-[#38b6c7] to-[#004e70] rounded-full flex items-center justify-center text-white text-xs font-black shrink-0">
                                                    {msg.senderName.charAt(0)}
                                                </div>
                                                <div className={`max-w-[70%] flex flex-col gap-0.5 ${msg.senderId === 'me' ? 'items-end' : 'items-start'}`}>
                                                    <span className="text-xs font-bold text-gray-400">{msg.senderName}</span>
                                                    <div className={`px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm ${
                                                        msg.senderId === 'me'
                                                            ? 'bg-[#004e70] text-white rounded-tl-sm'
                                                            : 'bg-gray-100 text-gray-800 rounded-tr-sm'
                                                    }`}>
                                                        {msg.content}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-400">{msg.timestamp}</span>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>

                                {/* Message Input */}
                                <form
                                    onSubmit={handleSendMessage}
                                    className="border-t border-gray-100 p-4 flex items-center gap-2"
                                >
                                    <button
                                        type="submit"
                                        className="w-10 h-10 bg-[#004e70] hover:bg-[#003c57] rounded-xl flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
                                    >
                                        <Send className="w-4 h-4 rtl:-scale-x-100" />
                                    </button>
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="اكتب رسالة..."
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-[#38b6c7] transition-colors text-right"
                                    />
                                </form>
                            </div>
                        )}
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
