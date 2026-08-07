'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Bell, BellOff, Phone, PhoneOff, Shield, ChevronDown } from 'lucide-react';

type TimerState = 'idle' | 'running' | 'paused' | 'break' | 'done';

interface StudyTimerProps {
    studyMinutes?: number;
    breakMinutes?: number;
    taskTitle?: string;
    onEnd?: () => void;
}

export default function StudyTimer({
    studyMinutes = 60,
    breakMinutes = 5,
    taskTitle,
    onEnd,
}: StudyTimerProps) {
    const studySeconds = studyMinutes * 60;
    const breakSeconds = breakMinutes * 60;

    const [timerState, setTimerState] = useState<TimerState>('idle');
    const [timeLeft, setTimeLeft] = useState(studySeconds);
    const [notificationsBlocked, setNotificationsBlocked] = useState(false);
    const [callsBlocked, setCallsBlocked] = useState(false);
    const [appsBlocked, setAppsBlocked] = useState(false);
    const [showDurationPicker, setShowDurationPicker] = useState(false);
    const [selectedStudyMinutes, setSelectedStudyMinutes] = useState(studyMinutes);
    const [selectedBreakMinutes, setSelectedBreakMinutes] = useState(breakMinutes);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isBreak = timerState === 'break';

    const totalTime = isBreak ? selectedBreakMinutes * 60 : selectedStudyMinutes * 60;
    const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

    useEffect(() => {
        if (timerState === 'running' || timerState === 'break') {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current!);
                        if (timerState === 'running') {
                            // Switch to break
                            setTimerState('break');
                            return selectedBreakMinutes * 60;
                        } else {
                            // Break done
                            setTimerState('done');
                            return 0;
                        }
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [timerState, selectedBreakMinutes]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleStart = () => {
        if (timerState === 'idle' || timerState === 'done') {
            setTimeLeft(selectedStudyMinutes * 60);
            setTimerState('running');
        } else if (timerState === 'paused') {
            setTimerState('running');
        }
    };

    const handlePause = () => setTimerState('paused');

    const handleEnd = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimerState('done');
        onEnd?.();
    };

    const handleReset = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimerState('idle');
        setTimeLeft(selectedStudyMinutes * 60);
    };

    const stateLabel = {
        idle: 'هيا نبدأ!',
        running: 'ركز على هدفك!',
        paused: 'متوقف!',
        break: 'وقت الاستراحة!',
        done: 'أحسنت! انتهيت 🎉',
    };

    const stateColor = {
        idle: 'text-[#004e70]',
        running: 'text-[#38b6c7]',
        paused: 'text-yellow-500',
        break: 'text-green-500',
        done: 'text-purple-500',
    };

    const studyDurationOptions = [25, 30, 45, 60, 90];
    const breakDurationOptions = [5, 10, 15, 20];

    return (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4" dir="rtl">

            {/* Task Label */}
            {taskTitle && (
                <div className="text-xs font-bold text-gray-400 text-center truncate px-2">
                    📚 {taskTitle}
                </div>
            )}

            {/* Timer Circle */}
            <div className="flex flex-col items-center gap-2">
                <div className="relative w-44 h-44 flex items-center justify-center">
                    {/* Background circle */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 176 176">
                        <circle cx="88" cy="88" r="80" fill="none" stroke="#f0f9fa" strokeWidth="10" />
                        <circle
                            cx="88" cy="88" r="80"
                            fill="none"
                            stroke={isBreak ? '#22c55e' : '#38b6c7'}
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 80}`}
                            strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress / 100)}`}
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="text-center z-10">
                        <span className={`text-3xl font-black tabular-nums ${timerState === 'done' ? 'text-purple-500' : isBreak ? 'text-green-500' : 'text-[#004e70]'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>

                {/* State label */}
                <span className={`text-base font-black ${stateColor[timerState]}`}>
                    {stateLabel[timerState]}
                </span>
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-2">
                {(timerState === 'idle' || timerState === 'done') && (
                    <button
                        onClick={handleStart}
                        className="flex-1 py-3.5 bg-[#004e70] hover:bg-[#003c57] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
                    >
                        <Play className="w-4 h-4 fill-white" />
                        ابدأ مهمتك
                    </button>
                )}

                {timerState === 'running' && (
                    <>
                        <button
                            onClick={handlePause}
                            className="flex-1 py-3.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-yellow-200"
                        >
                            <Pause className="w-4 h-4" />
                            توقف
                        </button>
                        <button
                            onClick={handleEnd}
                            className="flex-1 py-3.5 bg-red-50 hover:bg-red-100 text-red-500 font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-red-200"
                        >
                            <Square className="w-4 h-4 fill-red-500" />
                            إنهاء
                        </button>
                    </>
                )}

                {timerState === 'paused' && (
                    <>
                        <button
                            onClick={handleStart}
                            className="flex-1 py-3.5 bg-[#004e70] hover:bg-[#003c57] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                            <Play className="w-4 h-4 fill-white" />
                            استمر
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex-1 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-gray-200"
                        >
                            إعادة تعيين
                        </button>
                    </>
                )}

                {timerState === 'break' && (
                    <button
                        onClick={handleEnd}
                        className="flex-1 py-3.5 bg-green-50 hover:bg-green-100 text-green-600 font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-green-200"
                    >
                        تخطي الاستراحة
                    </button>
                )}
            </div>

            {/* Protection Toggles */}
            <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    وضعيات الحماية
                </span>
                <div className="flex flex-col gap-1.5">
                    {[
                        { label: 'حظر الإشعارات', icon: notificationsBlocked ? BellOff : Bell, state: notificationsBlocked, toggle: () => setNotificationsBlocked(p => !p) },
                        { label: 'حظر المكالمات', icon: callsBlocked ? PhoneOff : Phone, state: callsBlocked, toggle: () => setCallsBlocked(p => !p) },
                        { label: 'حظر التطبيقات الأخرى', icon: Shield, state: appsBlocked, toggle: () => setAppsBlocked(p => !p) },
                    ].map(({ label, icon: Icon, state, toggle }) => (
                        <div key={label} className="flex items-center justify-between py-1.5 px-1">
                            <div className="flex items-center gap-2">
                                <Icon className={`w-3.5 h-3.5 ${state ? 'text-[#38b6c7]' : 'text-gray-400'}`} />
                                <span className="text-xs font-bold text-gray-600">{label}</span>
                            </div>
                            <button
                                type="button"
                                onClick={toggle}
                                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${state ? 'bg-[#38b6c7]' : 'bg-gray-200'}`}
                                aria-checked={state}
                                role="switch"
                            >
                                <span
                                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${state ? 'right-0.5' : 'left-0.5'}`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Duration Settings Toggle */}
            <button
                type="button"
                onClick={() => setShowDurationPicker(p => !p)}
                className="flex items-center justify-between text-xs font-bold text-gray-500 hover:text-[#004e70] transition-colors cursor-pointer pt-1 border-t border-gray-100"
            >
                <span>المدة الزمنية</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDurationPicker ? 'rotate-180' : ''}`} />
            </button>

            {showDurationPicker && (
                <div className="flex flex-col gap-3 animate-fadeIn">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-gray-400">مدة الدراسة</span>
                        <div className="flex gap-1.5 flex-wrap">
                            {studyDurationOptions.map((min) => (
                                <button
                                    key={min}
                                    type="button"
                                    onClick={() => {
                                        setSelectedStudyMinutes(min);
                                        if (timerState === 'idle') setTimeLeft(min * 60);
                                    }}
                                    className={`flex-1 min-w-[44px] py-2 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                                        selectedStudyMinutes === min
                                            ? 'bg-[#004e70] text-white border-[#004e70]'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#38b6c7]'
                                    }`}
                                >
                                    {min}د
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-gray-400">مدة الاستراحة</span>
                        <div className="flex gap-1.5">
                            {breakDurationOptions.map((min) => (
                                <button
                                    key={min}
                                    type="button"
                                    onClick={() => setSelectedBreakMinutes(min)}
                                    className={`flex-1 py-2 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                                        selectedBreakMinutes === min
                                            ? 'bg-green-500 text-white border-green-500'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                                    }`}
                                >
                                    {min}د
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
