'use client';

import React, { useState } from 'react';
import { ArrowRight, Send, Image as ImageIcon, X } from 'lucide-react';
import { FaInstagram, FaTelegramPlane } from 'react-icons/fa';

export interface BankTransferInstructionsProps {
    planTitle?: string;
    amount?: string | number;
    onBack?: () => void;
}

export default function BankTransferInstructions({ planTitle, amount = '3200', onBack }: BankTransferInstructionsProps) {
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const displayAmount = typeof amount === 'number' ? `${amount} دج` : amount.toString().includes('دج') ? amount : `${amount} دج`;

    return (
        <div className="w-full flex flex-col font-sans" dir="rtl">
            {/* Page Header with Back Arrow */}
            <div className="flex items-center justify-start gap-2 mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-gray-800">طريقة التسجيل في الدورة</h1>
                <button
                    onClick={onBack}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-1 cursor-pointer"
                    aria-label="رجوع"
                >
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>

            {/* Main Subtitle */}
            <h2 className="text-[#005c8a] font-black text-xl md:text-2xl mb-8 text-right">
                للتسجيل يرجى اتباع الخطوات التالية:
            </h2>

            {/* Details Content Layout */}
            <div className="flex flex-col lg:flex-row gap-8 items-start mb-8">
                
                {/* Right Column: Step-by-Step Instructions */}
                <div className="flex-1 w-full flex flex-col gap-6 text-right">
                    
                    {/* Step 1 */}
                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-1 bg-blue-50 text-[#005c8a] rounded-lg shrink-0">
                            <Send className="w-4 h-4 rtl:-scale-x-100" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-sm md:text-base font-bold text-gray-700 leading-relaxed">
                                قم بإرسال مبلغ الدورة وهو <span className="text-[#004e70] font-black">{displayAmount}</span> إلى حساب الأستاذة رندة.
                            </p>
                            <div className="flex flex-col items-center sm:items-start gap-2 mt-1">
                                <span className="text-xs font-bold text-gray-500">كيفية تعبئة الحوالة البريدية</span>
                                <button
                                    type="button"
                                    onClick={() => setIsImageModalOpen(true)}
                                    className="bg-blue-50 hover:bg-blue-100 text-[#005c8a] font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                                >
                                    <span>فتح الصورة</span>
                                    <ImageIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-1 bg-blue-50 text-[#005c8a] rounded-lg shrink-0">
                            <Send className="w-4 h-4 rtl:-scale-x-100" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm md:text-base font-bold text-gray-700 leading-relaxed">
                                الدفع باستخدام البطاقة الذهبية، استخدم رقم RIP التالي:
                            </p>
                            <span className="text-[#004e70] font-black text-sm md:text-base tracking-wider bg-gray-50 py-1 px-3 rounded-lg border border-gray-100 w-fit">
                                RIP: 00799999002074762791
                            </span>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-1 bg-blue-50 text-[#005c8a] rounded-lg shrink-0">
                            <Send className="w-4 h-4 rtl:-scale-x-100" />
                        </div>
                        <p className="text-sm md:text-base font-bold text-gray-700 leading-relaxed">
                            بعد إتمام التحويل، قم بتصوير الوصل.
                        </p>
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-1 bg-blue-50 text-[#005c8a] rounded-lg shrink-0">
                            <Send className="w-4 h-4 rtl:-scale-x-100" />
                        </div>
                        <p className="text-sm md:text-base font-bold text-gray-700 leading-relaxed">
                            أرسل الإيصال مرفقاً باسمك، لقبك، رقم هاتفك، والناحية إلى أحد حسابات التواصل الاجتماعي الخاصة بنا.
                        </p>
                    </div>

                </div>

                {/* Left Column: Beneficiary Account Details Table Card */}
                <div className="w-full lg:w-[320px] bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4 shrink-0">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 text-sm">
                        <span className="text-gray-500 font-bold">اسم المستفيد</span>
                        <span className="font-extrabold text-[#004e70]">Randa Foudili</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-gray-100 text-sm">
                        <span className="text-gray-500 font-bold">رقم الحساب</span>
                        <span className="font-extrabold text-[#004e70] tracking-tight">0020747627 clé 91</span>
                    </div>

                    <div className="flex items-center justify-between py-2 text-sm">
                        <span className="text-gray-500 font-bold">العنوان</span>
                        <span className="font-extrabold text-[#004e70]">Draa Ben Khedda</span>
                    </div>
                </div>

            </div>

            {/* Bottom Action Social Buttons */}
            <div className="flex items-center gap-4 w-full flex-col sm:flex-row mt-4">
                <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-6 text-gray-800 font-black text-sm flex items-center justify-center gap-3 shadow-sm transition-all cursor-pointer"
                >
                    <span>إنسغرام</span>
                    <FaInstagram className="w-5 h-5 text-pink-600" />
                </a>

                <a
                    href="https://t.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-6 text-gray-800 font-black text-sm flex items-center justify-center gap-3 shadow-sm transition-all cursor-pointer"
                >
                    <span>تيليجرام</span>
                    <FaTelegramPlane className="w-5 h-5 text-[#0088cc]" />
                </a>
            </div>

            {/* Postal Transfer Form Image Modal */}
            {isImageModalOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
                    onClick={() => setIsImageModalOpen(false)}
                >
                    <div 
                        className="relative bg-white rounded-3xl p-3 md:p-4 max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col items-center max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsImageModalOpen(false)}
                            className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            aria-label="إغلاق"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-full h-full flex items-center justify-center overflow-auto rounded-2xl">
                            <img 
                                src="/home/pay.png" 
                                alt="صورة الحوالة البريدية" 
                                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-sm"
                                onError={(e) => {
                                    e.currentTarget.src = '/Frame 1300192978.png';
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
