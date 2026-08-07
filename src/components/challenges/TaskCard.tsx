'use client';

import React from 'react';
import { MoreVertical, Clock, Calendar, CheckCircle2, Circle } from 'lucide-react';

export interface Task {
    id: string;
    title: string;
    description?: string;
    time?: string;
    date?: string;
    completed?: boolean;
    priority?: 'high' | 'medium' | 'low';
    subtaskCount?: number;
}

export interface TaskCardProps {
    task: Task;
    onToggleComplete?: (id: string) => void;
    onMenuClick?: (id: string) => void;
    onStart?: (id: string) => void;
}

export default function TaskCard({ task, onToggleComplete, onMenuClick, onStart }: TaskCardProps) {
    const priorityBorder = {
        high: 'border-r-red-400',
        medium: 'border-r-yellow-400',
        low: 'border-r-green-400',
    };

    const borderColor = task.priority ? priorityBorder[task.priority] : 'border-r-[#38b6c7]';

    return (
        <div
            className={`bg-white rounded-2xl p-4 border border-gray-100 border-r-4 ${borderColor} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-2`}
            dir="rtl"
        >
            {/* Header Row */}
            <div className="flex items-start justify-between gap-3">
                {/* Checkbox + Title */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                        type="button"
                        onClick={() => onToggleComplete?.(task.id)}
                        className="mt-0.5 shrink-0 cursor-pointer transition-transform hover:scale-110"
                        aria-label={task.completed ? 'إلغاء الإكمال' : 'تحديد كمكتملة'}
                    >
                        {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-[#38b6c7]" />
                        ) : (
                            <Circle className="w-5 h-5 text-gray-300 hover:text-[#38b6c7]" />
                        )}
                    </button>

                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <h3
                            className={`font-extrabold text-sm md:text-base leading-tight ${
                                task.completed ? 'line-through text-gray-400' : 'text-gray-800'
                            }`}
                        >
                            {task.title}
                        </h3>
                        {task.description && (
                            <p className="text-xs text-gray-500 font-medium leading-snug line-clamp-2">
                                {task.subtaskCount && (
                                    <span className="inline-flex items-center justify-center w-4 h-4 bg-[#38b6c7] text-white rounded-full text-[9px] font-black ml-1 shrink-0">
                                        {task.subtaskCount}
                                    </span>
                                )}
                                {task.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* 3-dot menu button */}
                <button
                    type="button"
                    onClick={() => onMenuClick?.(task.id)}
                    className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer shrink-0"
                    aria-label="خيارات"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>

            {/* Footer Row: Time + Date + Start Button */}
            <div className="flex items-center justify-between gap-2 mt-1 flex-wrap">
                <div className="flex items-center gap-3">
                    {task.time && (
                        <div className="flex items-center gap-1 text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{task.time}</span>
                        </div>
                    )}
                    {task.date && (
                        <div className="flex items-center gap-1 text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{task.date}</span>
                        </div>
                    )}
                </div>

                {onStart && !task.completed && (
                    <button
                        type="button"
                        onClick={() => onStart(task.id)}
                        className="text-xs font-black text-[#004e70] bg-[#edf9fb] hover:bg-[#d4f2f7] px-3 py-1.5 rounded-xl transition-colors cursor-pointer border border-[#38b6c7]/30"
                    >
                        ابدأ المهمة
                    </button>
                )}
            </div>
        </div>
    );
}
