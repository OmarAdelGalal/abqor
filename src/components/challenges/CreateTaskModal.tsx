'use client';

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export interface NewTaskData {
    title: string;
    description?: string;
    studyHours: number;
    studyMinutes: number;
    studySeconds: number;
    breakMinutes: number;
}

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateTask: (data: NewTaskData) => void;
}

export default function CreateTaskModal({ isOpen, onClose, onCreateTask }: CreateTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [studyHours, setStudyHours] = useState(0);
    const [studyMinutes, setStudyMinutes] = useState(25);
    const [studySeconds, setStudySeconds] = useState(0);
    const [breakMinutes, setBreakMinutes] = useState(5);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onCreateTask({ title, description, studyHours, studyMinutes, studySeconds, breakMinutes });
        setIsSuccess(true);

        setTimeout(() => {
            setIsSuccess(false);
            setTitle('');
            setDescription('');
            setStudyHours(0);
            setStudyMinutes(25);
            setStudySeconds(0);
            setBreakMinutes(5);
            onClose();
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
            dir="rtl"
            onClick={onClose}
        >
            <div
                className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag handle for mobile */}
                <div className="flex justify-center pt-3 sm:hidden">
                    <div className="w-10 h-1 rounded-full bg-gray-300" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-800">إضافة مهمة جديدة</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5 overflow-y-auto">

                    {/* Task Title */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">عنوان المهمة</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="مثال: الانتهاء من دراسة وحدة الجبر"
                            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#38b6c7] focus:bg-white transition-all text-right"
                            required
                        />
                    </div>

                    {/* Task Description */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">وصف المهمة</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="مثال: الانتهاء من دراسة أول 10 صفحات من وحدة الجبر"
                            rows={2}
                            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-[#38b6c7] focus:bg-white transition-all resize-none text-right"
                        />
                    </div>

                    {/* Study Duration */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">مدة الدراسة</label>
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                            <span className="text-gray-400 font-bold text-sm">ث</span>
                            <input
                                type="number"
                                value={studySeconds}
                                onChange={(e) => setStudySeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                                min="0" max="59"
                                className="w-12 text-center bg-transparent outline-none text-sm font-black text-gray-800"
                            />
                            <span className="text-[#38b6c7] font-black">:</span>
                            <input
                                type="number"
                                value={studyMinutes}
                                onChange={(e) => setStudyMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                                min="0" max="59"
                                className="w-12 text-center bg-transparent outline-none text-sm font-black text-gray-800"
                            />
                            <span className="text-[#38b6c7] font-black">:</span>
                            <input
                                type="number"
                                value={studyHours}
                                onChange={(e) => setStudyHours(Math.max(0, parseInt(e.target.value) || 0))}
                                min="0" max="23"
                                className="w-12 text-center bg-transparent outline-none text-sm font-black text-gray-800"
                            />
                            <span className="text-gray-400 font-bold text-sm mr-auto">س</span>
                        </div>
                    </div>

                    {/* Break Duration */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">مدة الاستراحة (دقيقة)</label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {[5, 10, 15, 20].map((min) => (
                                <button
                                    key={min}
                                    type="button"
                                    onClick={() => setBreakMinutes(min)}
                                    className={`flex-1 min-w-[52px] py-2.5 rounded-xl font-black text-sm border transition-all cursor-pointer ${
                                        breakMinutes === min
                                            ? 'bg-[#004e70] text-white border-[#004e70] shadow-sm'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#38b6c7]'
                                    }`}
                                >
                                    {min} د
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className={`w-full py-4 rounded-2xl font-black text-base mt-2 transition-all cursor-pointer shadow-sm ${
                            isSuccess
                                ? 'bg-green-500 text-white'
                                : 'bg-[#004e70] hover:bg-[#003c57] text-white active:scale-[0.98]'
                        }`}
                    >
                        {isSuccess ? '✓ تم إنشاء المهمة بنجاح' : 'إضافة المهمة'}
                    </button>
                </form>
            </div>
        </div>
    );
}
