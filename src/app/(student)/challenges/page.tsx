'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, Users, ListTodo, Play, Pause, Square, ChevronDown } from 'lucide-react';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import StreakWidget from '@/components/dashboard/StreakWidget';
import RankWidget from '@/components/dashboard/RankWidget';
import UpgradeWidget from '@/components/dashboard/UpgradeWidget';
import SocialFollowWidget from '@/components/learning/SocialFollowWidget';
import CreateTaskModal from '@/components/challenges/CreateTaskModal';
import TasksList from '@/components/challenges/TasksList';
import { Task } from '@/components/challenges/TaskCard';
import StudyGroupCard, { StudyGroup } from '@/components/challenges/StudyGroupCard';

/* ────────── Sample Data ────────── */
const INITIAL_TASKS: Task[] = [
    { id: '1', title: 'الإنتهاء من دراسة وحدة الجبر', description: 'الإنتهاء من دراسة أول 10 صفحات', time: '09:00 ص', date: 'الثلاثاء، 13 أكتوبر', completed: false, priority: 'high', subtaskCount: 1 },
    { id: '2', title: 'مراجعة درس الفيزياء', description: 'مراجعة الفصل الثالث', time: '02:00 م', date: 'الثلاثاء، 13 أكتوبر', completed: false, priority: 'medium' },
    { id: '3', title: 'حل تمارين الرياضيات', description: 'حل تمارين من الصفحة 45 إلى 52', time: '04:00 م', date: 'الأربعاء، 14 أكتوبر', completed: true, priority: 'low' },
];

const INITIAL_GROUPS: StudyGroup[] = [
    { id: '1', name: 'هيا نتعلم', description: 'نبذة تعريفية عن المجموعة.', membersCount: 154, studyHoursWeek: 41, studyHoursToday: 8, isPrivate: false, isJoined: true },
    { id: '2', name: 'طلاب البكالوريا 2025', description: 'مجموعة خاصة لطلاب البكالوريا.', membersCount: 89, studyHoursWeek: 62, studyHoursToday: 12, isPrivate: true, isJoined: false },
];

type ActiveTab = 'main' | 'tasks' | 'groups';
type TimerState = 'idle' | 'running' | 'paused' | 'break' | 'done';

const TIMER_LABELS: Record<TimerState, string> = {
    idle: 'هيا نبدأ!',
    running: 'ركز على هدفك!',
    paused: 'متوقف!',
    break: 'وقت الاستراحة!',
    done: 'أحسنت! 🎉',
};

export default function ChallengesPage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('main');
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [groups, setGroups] = useState<StudyGroup[]>(INITIAL_GROUPS);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Task selector
    const [selectedTaskId, setSelectedTaskId] = useState<string>(INITIAL_TASKS[0].id);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Timer
    const [timerState, setTimerState] = useState<TimerState>('idle');
    const [studyMins, setStudyMins] = useState(60);
    const [breakMins, setBreakMins] = useState(5);
    const [timeLeft, setTimeLeft] = useState(60 * 60);
    const [showDuration, setShowDuration] = useState(false);
    const [showProtection, setShowProtection] = useState(false);
    const [notifBlocked, setNotifBlocked] = useState(false);
    const [callsBlocked, setCallsBlocked] = useState(false);
    const [appsBlocked, setAppsBlocked] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const isBreak = timerState === 'break';
    const totalSecs = isBreak ? breakMins * 60 : studyMins * 60;
    const pct = totalSecs > 0 ? ((totalSecs - timeLeft) / totalSecs) * 100 : 0;

    useEffect(() => {
        if (timerState === 'running' || timerState === 'break') {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current!);
                        if (timerState === 'running') { setTimerState('break'); return breakMins * 60; }
                        else { setTimerState('done'); return 0; }
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [timerState, breakMins]);

    const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const startTimer = () => {
        if (timerState === 'idle' || timerState === 'done') { setTimeLeft(studyMins * 60); setTimerState('running'); }
        else if (timerState === 'paused') setTimerState('running');
    };
    const pauseTimer = () => setTimerState('paused');
    const resetTimer = () => { if (intervalRef.current) clearInterval(intervalRef.current); setTimerState('idle'); setTimeLeft(studyMins * 60); };

    const pendingTasks = tasks.filter(t => !t.completed);
    const selectedTask = tasks.find(t => t.id === selectedTaskId);

    const handleCreateTask = (data: { title: string; description?: string }) => {
        const t: Task = { id: String(Date.now()), title: data.title, description: data.description, completed: false, priority: 'medium' };
        setTasks(prev => [t, ...prev]);
        setIsCreateModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-10 font-sans" dir="rtl">
            <AuthenticatedHeader />

            <main className="container mx-auto px-4 py-6 max-w-[1440px]">
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ═══════════════ MAIN CONTENT AREA ═══════════════ */}
                    <div className="flex-1 w-full flex flex-col gap-5">

                        {/* Top Bar: Add Task on left, Title on right */}
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 text-sm font-bold text-[#004e70] hover:text-[#003c57] cursor-pointer transition-colors"
                            >
                                <div className="w-7 h-7 bg-[#38b6c7] hover:bg-[#2aa0b0] rounded-full flex items-center justify-center text-white transition-colors shadow-sm">
                                    <Plus className="w-4 h-4 stroke-[3]" />
                                </div>
                                <span>إضافة مهمة</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <h1 className="text-xl md:text-2xl font-black text-[#1e293b]">تحديات الدراسة</h1>
                                <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <ArrowRight className="w-6 h-6" />
                                </Link>
                            </div>
                        </div>

                        {/* MAIN CARD VIEW */}
                        {activeTab === 'main' && (
                            <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">

                                {/* Top Teal Section with Sloped Bottom */}
                                <div className="relative pt-4 pb-20 px-5 bg-gradient-to-b from-[#31a7c1] to-[#207289]">
                                    
                                    {/* Sloped bottom cutout shape */}
                                    <div 
                                        className="absolute inset-x-0 bottom-0 h-16 pointer-events-none" 
                                        style={{
                                            clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 50% 85%, 0 0)',
                                            background: 'linear-gradient(to bottom, #27869d, #207289)'
                                        }} 
                                    />

                                    {/* Dropdown Select Task */}
                                    <div className="relative z-20 max-w-full">
                                        <button 
                                            type="button" 
                                            onClick={() => setDropdownOpen(p => !p)}
                                            className="w-full flex items-center justify-between bg-white border-0 rounded-2xl px-5 py-3 text-sm font-bold text-gray-700 shadow-md transition-colors cursor-pointer"
                                        >
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                            <span className="flex-1 text-right mr-2 truncate text-gray-400 font-bold">
                                                {selectedTask?.title ?? 'إختار المهمة'}
                                            </span>
                                        </button>

                                        {dropdownOpen && (
                                            <div className="absolute top-full right-0 left-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-30 overflow-hidden">
                                                {pendingTasks.length > 0 ? pendingTasks.map(task => (
                                                    <button 
                                                        key={task.id} 
                                                        type="button"
                                                        onClick={() => { setSelectedTaskId(task.id); setDropdownOpen(false); }}
                                                        className={`w-full text-right px-5 py-3 text-sm font-bold hover:bg-[#edf9fb] transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${task.id === selectedTaskId ? 'text-[#004e70] bg-[#edf9fb]' : 'text-gray-700'}`}
                                                    >
                                                        {task.title}
                                                    </button>
                                                )) : (
                                                    <div className="px-5 py-3 text-sm text-gray-400 font-bold text-center">لا توجد مهام</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Floating Circle Clock - Overlaps Teal and White */}
                                <div className="relative flex justify-center -mt-20 z-20">
                                    <div 
                                        className="w-48 h-48 rounded-full bg-white flex flex-col items-center justify-center relative p-3"
                                        style={{
                                            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.08), 0 0 0 10px rgba(255, 255, 255, 0.4)'
                                        }}
                                    >
                                        {/* Outer circle track */}
                                        <div className="absolute inset-2 rounded-full border-[6px] border-[#edf2f7]" />
                                        
                                        {/* Cyan circle dot at 12 o'clock */}
                                        <div 
                                            className="absolute w-5 h-5 rounded-full bg-[#31a7c1] shadow-sm z-30"
                                            style={{ top: '6px', left: '50%', transform: 'translateX(-50%)' }}
                                        />

                                        {/* Timer Content */}
                                        <div className="flex flex-col items-center justify-center gap-1 z-20 mt-2">
                                            <span className="text-sm font-black text-[#1e7085]">
                                                {TIMER_LABELS[timerState]}
                                            </span>
                                            <span className="text-4xl md:text-5xl font-black text-[#2d3748] tabular-nums tracking-tight">
                                                {fmt(timeLeft)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Controls & Actions Section */}
                                <div className="flex flex-col items-center gap-6 px-6 pt-6 pb-6 bg-white">

                                    {/* Main Start Button */}
                                    <div className="w-full flex justify-center">
                                        {(timerState === 'idle' || timerState === 'done') && (
                                            <button 
                                                onClick={startTimer}
                                                className="flex items-center justify-center gap-3 px-8 py-3.5 bg-[#005b7f] hover:bg-[#004e70] text-white font-black text-base rounded-full transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-[#005b7f]/20 min-w-[210px]"
                                            >
                                                <span className="text-base font-black">إبدأ مهمتك</span>
                                                <div className="w-6 h-6 rounded-full border-2 border-white/80 flex items-center justify-center">
                                                    <Play className="w-3 h-3 fill-white text-white translate-x-[-0.5px]" />
                                                </div>
                                            </button>
                                        )}

                                        {timerState === 'running' && (
                                            <div className="flex gap-3">
                                                <button onClick={pauseTimer} className="flex items-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-full cursor-pointer shadow-md">
                                                    <Pause className="w-4 h-4 fill-white" /> توقف
                                                </button>
                                                <button onClick={resetTimer} className="flex items-center gap-2 px-8 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-sm rounded-full cursor-pointer border border-rose-200">
                                                    <Square className="w-4 h-4 fill-rose-500" /> إنهاء
                                                </button>
                                            </div>
                                        )}

                                        {timerState === 'paused' && (
                                            <div className="flex gap-3">
                                                <button onClick={startTimer} className="flex items-center gap-2 px-8 py-3.5 bg-[#005b7f] hover:bg-[#004e70] text-white font-black text-sm rounded-full cursor-pointer shadow-md">
                                                    <Play className="w-4 h-4 fill-white" /> استمر
                                                </button>
                                                <button onClick={resetTimer} className="flex items-center gap-2 px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black text-sm rounded-full cursor-pointer">
                                                    إعادة
                                                </button>
                                            </div>
                                        )}

                                        {timerState === 'break' && (
                                            <button onClick={resetTimer} className="flex items-center gap-2 px-10 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-full cursor-pointer shadow-md">
                                                تخطي الاستراحة
                                            </button>
                                        )}
                                    </div>

                                    {/* Action Icons Row: "وضعيات الحماية" and "المدة زمنية" */}
                                    <div className="flex items-start justify-center gap-14 md:gap-20 mt-2">
                                        {/* Protection Modes Button */}
                                        <button 
                                            type="button" 
                                            onClick={() => { setShowProtection(p => !p); setShowDuration(false); }}
                                            className="flex flex-col items-center gap-3 cursor-pointer group"
                                        >
                                            <div className="w-20 h-20 rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center border border-gray-100 group-hover:shadow-[0_12px_35px_rgba(0,0,0,0.1)] transition-all">
                                                {/* Shield Graphic Matching Screenshot */}
                                                <div className="relative w-11 h-11 flex items-center justify-center">
                                                    {/* Shield Outer */}
                                                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                                                        <path 
                                                            d="M22 4 C32 8, 38 10, 38 22 C38 31, 30 38, 22 40 C14 38, 6 31, 6 22 C6 10, 12 8, 22 4 Z" 
                                                            fill="#e0f7fa" 
                                                            stroke="#38b6c7" 
                                                            strokeWidth="3" 
                                                        />
                                                    </svg>
                                                    {/* Center Green Check Circle */}
                                                    <div className="absolute w-6 h-6 rounded-full bg-[#22c55e] flex items-center justify-center shadow-sm">
                                                        <span className="text-white text-xs font-black">✓</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs md:text-sm font-bold text-gray-700">وضعيات الحماية</span>
                                        </button>

                                        {/* Duration Button */}
                                        <button 
                                            type="button" 
                                            onClick={() => { setShowDuration(p => !p); setShowProtection(false); }}
                                            className="flex flex-col items-center gap-3 cursor-pointer group"
                                        >
                                            <div className="w-20 h-20 rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center border border-gray-100 group-hover:shadow-[0_12px_35px_rgba(0,0,0,0.1)] transition-all">
                                                {/* Clock Graphic Matching Screenshot */}
                                                <div className="relative w-11 h-11 flex items-center justify-center">
                                                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                                                        {/* Top Winder */}
                                                        <rect x="19" y="3" width="6" height="4" rx="1" fill="#9ca3af" />
                                                        {/* Outer Orange Ring */}
                                                        <circle cx="22" cy="24" r="16" fill="#fbbf24" stroke="#f59e0b" strokeWidth="3" />
                                                        {/* Inner White Face */}
                                                        <circle cx="22" cy="24" r="12" fill="white" />
                                                        {/* Clock Hands */}
                                                        <path d="M22 24 L22 17" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />
                                                        <path d="M22 24 L27 24" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <span className="text-xs md:text-sm font-bold text-gray-700">المدة زمنية</span>
                                        </button>
                                    </div>

                                    {/* Duration picker expandable panel */}
                                    {showDuration && (
                                        <div className="w-full max-w-md bg-gray-50 rounded-2xl p-4 flex flex-col gap-3 border border-gray-100 animate-in fade-in duration-150 mt-2">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 mb-2">مدة الدراسة</p>
                                                <div className="flex gap-2">
                                                    {[25, 45, 60, 90].map(m => (
                                                        <button key={m} type="button"
                                                            onClick={() => { setStudyMins(m); if (timerState === 'idle') setTimeLeft(m * 60); }}
                                                            className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${studyMins === m ? 'bg-[#004e70] text-white border-[#004e70]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#38b6c7]'}`}>
                                                            {m}د
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 mb-2">مدة الاستراحة</p>
                                                <div className="flex gap-2">
                                                    {[5, 10, 15, 20].map(m => (
                                                        <button key={m} type="button"
                                                            onClick={() => setBreakMins(m)}
                                                            className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${breakMins === m ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400'}`}>
                                                            {m}د
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Protection toggles expandable panel */}
                                    {showProtection && (
                                        <div className="w-full max-w-md bg-gray-50 rounded-2xl p-4 flex flex-col gap-3 border border-gray-100 animate-in fade-in duration-150 mt-2">
                                            {[
                                                { label: 'حظر الإشعارات', val: notifBlocked, set: setNotifBlocked },
                                                { label: 'حظر المكالمات', val: callsBlocked, set: setCallsBlocked },
                                                { label: 'حظر التطبيقات الأخرى', val: appsBlocked, set: setAppsBlocked },
                                            ].map(({ label, val, set }) => (
                                                <div key={label} className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-gray-600">{label}</span>
                                                    <button type="button" role="switch" aria-checked={val} onClick={() => set(p => !p)}
                                                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${val ? 'bg-[#38b6c7]' : 'bg-gray-200'}`}>
                                                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${val ? 'right-1' : 'left-1'}`} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>

                                {/* Bottom Navigation Bar matching screenshot */}
                                <div className="p-4 bg-[#f8fafc] border-t border-gray-100">
                                    <div className="grid grid-cols-3 gap-3">
                                        
                                        {/* Card 1: إنشاء مهمة جديدة */}
                                        <button 
                                            type="button" 
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center gap-2 border border-gray-100 hover:border-[#38b6c7]/40 shadow-sm transition-all cursor-pointer group"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-[#2563eb] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                                                <Plus className="w-5 h-5 stroke-[3]" />
                                            </div>
                                            <span className="text-xs md:text-sm font-black text-gray-700">إنشاء مهمة جديدة</span>
                                        </button>

                                        {/* Card 2: مهامي */}
                                        <button 
                                            type="button" 
                                            onClick={() => setActiveTab('tasks')}
                                            className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center gap-2 border border-gray-100 hover:border-[#38b6c7]/40 shadow-sm transition-all cursor-pointer group"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-[#edf9fb] text-[#38b6c7] flex items-center justify-center group-hover:scale-105 transition-transform">
                                                <ListTodo className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs md:text-sm font-black text-gray-700">مهامي</span>
                                        </button>

                                        {/* Card 3: مجموعات الدراسة */}
                                        <button 
                                            type="button" 
                                            onClick={() => setActiveTab('groups')}
                                            className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center gap-2 border border-gray-100 hover:border-[#38b6c7]/40 shadow-sm transition-all cursor-pointer group"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-[#edf9fb] text-[#38b6c7] flex items-center justify-center group-hover:scale-105 transition-transform">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs md:text-sm font-black text-gray-700">مجموعات الدراسة</span>
                                        </button>

                                    </div>
                                </div>

                            </div>
                        )}

                        {/* TASKS VIEW */}
                        {activeTab === 'tasks' && (
                            <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                <div className="px-5 pt-5 pb-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-black text-gray-800">مهامي</h2>
                                        <button type="button" onClick={() => setActiveTab('main')} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <TasksList
                                        tasks={tasks}
                                        onToggleComplete={id => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))}
                                        onMenuClick={() => {}}
                                        onStart={id => { setSelectedTaskId(id); setActiveTab('main'); }}
                                        onCreateNew={() => setIsCreateModalOpen(true)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* GROUPS VIEW */}
                        {activeTab === 'groups' && (
                            <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                                <div className="px-5 pt-5 pb-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-black text-gray-800">مجموعات الدراسة</h2>
                                        <button type="button" onClick={() => setActiveTab('main')} className="text-gray-400 hover:text-gray-600 cursor-pointer p-1">
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        {groups.map(group => (
                                            <StudyGroupCard 
                                                key={group.id} 
                                                group={group}
                                                onJoin={id => setGroups(prev => prev.map(g => g.id === id ? { ...g, isJoined: true } : g))}
                                                onView={id => { window.location.href = `/challenges/groups/${id}`; }} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* ═══════════════ SIDEBAR WIDGETS ═══════════════ */}
                    <div className="w-full lg:w-[394px] flex flex-col gap-6 shrink-0">
                        <StreakWidget days={8} flame={8} />
                        <RankWidget rank={12} progress={3} />
                        <UpgradeWidget />
                        <SocialFollowWidget />
                    </div>

                </div>
            </main>

            <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreateTask={handleCreateTask} />
        </div>
    );
}
