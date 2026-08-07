'use client';

import React, { useState } from 'react';
import { Plus, ListTodo, CheckCheck, BarChart2 } from 'lucide-react';
import TaskCard, { Task } from './TaskCard';

type TaskTab = 'today' | 'tomorrow' | 'week' | 'planned' | 'completed';

interface TasksListProps {
    tasks: Task[];
    onToggleComplete: (id: string) => void;
    onMenuClick: (id: string) => void;
    onStart: (id: string) => void;
    onCreateNew: () => void;
}

const TAB_LABELS: { key: TaskTab; label: string }[] = [
    { key: 'today', label: 'اليوم' },
    { key: 'tomorrow', label: 'غداً' },
    { key: 'week', label: 'هذا الأسبوع' },
    { key: 'planned', label: 'المخطط لها' },
    { key: 'completed', label: 'المكتملة' },
];

export default function TasksList({ tasks, onToggleComplete, onMenuClick, onStart, onCreateNew }: TasksListProps) {
    const [activeTab, setActiveTab] = useState<TaskTab>('today');

    const filteredTasks = tasks.filter((task) => {
        if (activeTab === 'completed') return task.completed;
        if (activeTab === 'planned') return !task.completed;
        return !task.completed;
    });

    const completedCount = tasks.filter(t => t.completed).length;
    const totalStudyHours = 1;
    const totalStudyMinutes = 25;

    return (
        <div className="flex flex-col gap-4" dir="rtl">

            {/* Stats Row */}
            <div className="flex items-center gap-3">
                <div className="flex-1 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#edf9fb] rounded-xl flex items-center justify-center">
                        <ListTodo className="w-4 h-4 text-[#38b6c7]" />
                    </div>
                    <div>
                        <div className="text-lg font-black text-[#004e70]">{tasks.length}</div>
                        <div className="text-xs font-bold text-gray-400">مهمة</div>
                    </div>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
                        <CheckCheck className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                        <div className="text-lg font-black text-green-600">{completedCount}</div>
                        <div className="text-xs font-bold text-gray-400">مكتملة</div>
                    </div>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center">
                        <BarChart2 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <div className="text-sm font-black text-purple-600">{totalStudyHours}س {totalStudyMinutes}د</div>
                        <div className="text-xs font-bold text-gray-400">دراسة</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {TAB_LABELS.map(({ key, label }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setActiveTab(key)}
                        className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            activeTab === key
                                ? 'bg-[#004e70] text-white shadow-sm'
                                : 'bg-white text-gray-500 border border-gray-200 hover:border-[#38b6c7]/50'
                        }`}
                    >
                        {label}
                        {key === 'completed' && completedCount > 0 && (
                            <span className={`mr-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === key ? 'bg-white/20' : 'bg-gray-100'}`}>
                                {completedCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Task Cards List */}
            <div className="flex flex-col gap-3">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onToggleComplete={onToggleComplete}
                            onMenuClick={onMenuClick}
                            onStart={onStart}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <ListTodo className="w-12 h-12 mb-3 text-gray-200" />
                        <p className="font-bold text-sm">لا توجد مهام في هذه الفترة</p>
                        <p className="text-xs mt-1">اضغط على زر الإضافة لإنشاء مهمة جديدة</p>
                    </div>
                )}
            </div>

            {/* Create New Task Button */}
            <button
                type="button"
                onClick={onCreateNew}
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:border-[#38b6c7] hover:text-[#38b6c7] transition-all cursor-pointer font-bold text-sm"
            >
                <Plus className="w-4 h-4" />
                إنشاء مهمة جديدة
            </button>
        </div>
    );
}
