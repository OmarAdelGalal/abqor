'use client';

import React, { useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';

export interface RechargeCardCheckoutProps {
    planTitle?: string;
    onBack?: () => void;
    onSubmitRecharge?: (data: any) => void;
}

export default function RechargeCardCheckout({ planTitle, onBack, onSubmitRecharge }: RechargeCardCheckoutProps) {
    const [selectedCourse, setSelectedCourse] = useState(planTitle || 'دورة اللغة الإنجليزية');
    const [amount, setAmount] = useState('');
    const [cardCode, setCardCode] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmitRecharge) {
            onSubmitRecharge({ selectedCourse, amount, cardCode });
        } else {
            alert('تم شحن الحساب بنجاح باستخدام بطاقة التعبئة!');
            if (onBack) onBack();
        }
    };

    return (
        <div className="w-full flex flex-col font-sans" dir="rtl">
            {/* Page Header with Back Arrow */}
            <div className="flex items-center justify-start gap-2 mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-gray-800">بطاقة التعبئة</h1>
                <button
                    onClick={onBack}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-1 cursor-pointer"
                    aria-label="رجوع"
                >
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>

            {/* Form Container */}
            <div className="bg-[#f9fafb] rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col gap-5">
                {/* Header Subtitles */}
                <div className="flex flex-col gap-1 text-right mb-2">
                    <h2 className="text-[#005c8a] font-black text-xl md:text-2xl">
                        اشحن اشتراكك باستخدام بطاقة التعبئة
                    </h2>
                    <p className="text-xs md:text-sm font-bold text-gray-400">
                        ادخل الكود الموجود على بطاقة التعبئة الخاصة بك للتفعيل
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    
                    {/* Field 1: Course/Plan Select */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-gray-700 text-right">
                            حدد الدورة المراد الإشتراك بها
                        </label>
                        <div className="relative">
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 px-4 pl-10 text-gray-800 font-bold text-sm appearance-none outline-none focus:border-[#38b6c7] transition-colors cursor-pointer shadow-sm text-right"
                            >
                                <option value="دورة اللغة الإنجليزية">دورة اللغة الإنجليزية</option>
                                <option value="الاشتراك الذهبي">الاشتراك الذهبي</option>
                                <option value="الاشتراك الفضي">الاشتراك الفضي</option>
                                <option value="دورة الرياضيات">دورة الرياضيات</option>
                                <option value="دورة العلوم">دورة العلوم</option>
                            </select>

                            {/* Chevron Icon Right/Left */}
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronDown className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Field 2: Recharge Amount */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-gray-700 text-right">
                            ادخل المبلغ المراد شحنه
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="أدخل المبلغ (مثال: 5000)"
                            className="bg-white border border-gray-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-gray-800 outline-none focus:border-[#38b6c7] transition-colors w-full shadow-sm text-right"
                            required
                        />
                    </div>

                    {/* Field 3: Card Code */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-bold text-gray-700 text-right">
                            ادخل كود البطاقة
                        </label>
                        <input
                            type="text"
                            value={cardCode}
                            onChange={(e) => setCardCode(e.target.value)}
                            placeholder="أدخل كود بطاقة التعبئة"
                            className="bg-white border border-gray-200 rounded-2xl py-3.5 px-4 text-sm font-bold text-gray-800 outline-none focus:border-[#38b6c7] transition-colors w-full shadow-sm text-right tracking-wider"
                            required
                        />
                    </div>

                    {/* CTA Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-4 bg-[#004e70] hover:bg-[#003c57] text-white font-black text-lg rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer text-center mt-3"
                    >
                        ادفع الآن
                    </button>

                </form>
            </div>
        </div>
    );
}
