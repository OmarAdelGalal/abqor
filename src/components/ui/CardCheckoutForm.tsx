'use client';

import React, { useState } from 'react';
import { ArrowRight, ChevronDown, CheckCircle2 } from 'lucide-react';
import { PlanData } from './SubscriptionCard';
import PaymentStatusModal from './PaymentStatusModal';

export interface CardCheckoutFormProps {
    plan?: PlanData | null;
    onBack?: () => void;
    onSubmitPayment?: (details: any) => void;
}

export default function CardCheckoutForm({ plan, onBack, onSubmitPayment }: CardCheckoutFormProps) {
    const [selectedCardType, setSelectedCardType] = useState<'edahabia' | 'cib'>('edahabia');
    const [subscriptionType, setSubscriptionType] = useState<'course' | 'plan' | 'recharge'>('plan');
    const [selectedTarget, setSelectedTarget] = useState<string>(plan ? plan.title : 'دورة اللغة الإنجليزية');
    const [couponCode, setCouponCode] = useState('');
    const [isCouponApplied, setIsCouponApplied] = useState(false);
    const [discountAmount, setDiscountAmount] = useState(0);

    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title?: string;
        message?: string;
    }>({
        isOpen: false,
        type: 'success',
    });

    // Parse base price
    const basePrice = plan ? parseInt(plan.price.replace(/[^\d]/g, ''), 10) || 5000 : 5000;
    const finalPrice = Math.max(0, basePrice - discountAmount);

    const handleApplyCoupon = () => {
        if (couponCode.trim()) {
            setIsCouponApplied(true);
            setDiscountAmount(500); // Sample discount
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmitPayment) {
            onSubmitPayment({
                cardType: selectedCardType,
                subscriptionType,
                target: selectedTarget,
                amount: finalPrice,
                coupon: couponCode,
            });
        } else {
            setStatusModal({
                isOpen: true,
                type: 'success',
                title: 'تمت عملية الاشتراك بنجاح',
            });
        }
    };

    return (
        <div className="w-full flex flex-col font-sans" dir="rtl">
            {/* Top Page Header with Back Arrow */}
            <div className="flex items-center justify-start gap-2 mb-6">
                <h1 className="text-2xl md:text-3xl font-black text-gray-800">الدفع الإلكتروني</h1>
                <button
                    onClick={onBack}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-1 cursor-pointer"
                    aria-label="رجوع"
                >
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>

            {/* Form Container */}
            <div className="bg-[#f9fafb] rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    
                    {/* Section 1: Select Card Type */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-700 text-right">
                            الرجاء اختيار البطاقة
                        </label>
                        <div className="flex items-center gap-4">
                            {/* Card 1 Option */}
                            <button
                                type="button"
                                onClick={() => setSelectedCardType('edahabia')}
                                className={`relative p-2 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center h-14 w-24 overflow-hidden ${
                                    selectedCardType === 'edahabia'
                                        ? 'border-[#38b6c7] bg-[#edf9fb] shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-[#38b6c7]/50'
                                }`}
                            >
                                <img
                                    src="/visa1.png"
                                    alt="البطاقة الذهبية"
                                    className="h-10 w-auto object-contain"
                                    onError={(e) => {
                                        e.currentTarget.src = '/Frame 1300192978.png';
                                    }}
                                />
                                {selectedCardType === 'edahabia' && (
                                    <div className="absolute -top-1 -left-1 bg-[#38b6c7] text-white rounded-full p-0.5 z-10">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                )}
                            </button>

                            {/* Card 2 Option */}
                            <button
                                type="button"
                                onClick={() => setSelectedCardType('cib')}
                                className={`relative p-2 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-center h-14 w-24 overflow-hidden ${
                                    selectedCardType === 'cib'
                                        ? 'border-[#38b6c7] bg-[#edf9fb] shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-[#38b6c7]/50'
                                }`}
                            >
                                <img
                                    src="/visa2.png"
                                    alt="بطاقة CIB"
                                    className="h-10 w-auto object-contain"
                                    onError={(e) => {
                                        e.currentTarget.src = '/Frame 1300192752.png';
                                    }}
                                />
                                {selectedCardType === 'cib' && (
                                    <div className="absolute -top-1 -left-1 bg-[#38b6c7] text-white rounded-full p-0.5 z-10">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Section 2: Subscription Scope Tabs */}
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-700 text-right">
                            حدد المراد الاشتراك به
                        </label>
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setSubscriptionType('course')}
                                className={`py-2.5 px-5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer border ${
                                    subscriptionType === 'course'
                                        ? 'bg-[#edf9fb] border-[#38b6c7] text-[#004e70] shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                الإشتراك في دورة
                            </button>

                            <button
                                type="button"
                                onClick={() => setSubscriptionType('plan')}
                                className={`py-2.5 px-5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer border ${
                                    subscriptionType === 'plan'
                                        ? 'bg-[#edf9fb] border-[#38b6c7] text-[#004e70] shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                الإشتراك في خطة
                            </button>

                            <button
                                type="button"
                                onClick={() => setSubscriptionType('recharge')}
                                className={`py-2.5 px-5 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer border ${
                                    subscriptionType === 'recharge'
                                        ? 'bg-[#edf9fb] border-[#38b6c7] text-[#004e70] shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                            >
                                شحن رصيد
                            </button>
                        </div>
                    </div>

                    {/* Section 3: Target Dropdown */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700 text-right">
                            {subscriptionType === 'course' 
                                ? 'حدد الدورة المراد الاشتراك بها'
                                : subscriptionType === 'plan'
                                ? 'حدد الخطة المراد الاشتراك بها'
                                : 'حدد قيمة الشحن'}
                        </label>
                        <div className="relative">
                            <select
                                value={selectedTarget}
                                onChange={(e) => setSelectedTarget(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 px-4 pl-10 text-gray-800 font-bold text-sm appearance-none outline-none focus:border-[#38b6c7] transition-colors cursor-pointer shadow-sm text-right"
                            >
                                {subscriptionType === 'course' && (
                                    <>
                                        <option value="دورة اللغة الإنجليزية">دورة اللغة الإنجليزية</option>
                                        <option value="دورة الرياضيات">دورة الرياضيات</option>
                                        <option value="دورة العلوم الطبيعية">دورة العلوم الطبيعية</option>
                                        <option value="دورة الفيزياء">دورة الفيزياء</option>
                                    </>
                                )}
                                {subscriptionType === 'plan' && (
                                    <>
                                        <option value="الاشتراك الذهبي">الاشتراك الذهبي (6700 دج)</option>
                                        <option value="الاشتراك الفضي">الاشتراك الفضي (4500 دج)</option>
                                        <option value="الاشتراك المجاني">الاشتراك المجاني (0 دج)</option>
                                    </>
                                )}
                                {subscriptionType === 'recharge' && (
                                    <>
                                        <option value="شحن 1000 دج">شحن 1000 دج</option>
                                        <option value="شحن 2500 دج">شحن 2500 دج</option>
                                        <option value="شحن 5000 دج">شحن 5000 دج</option>
                                    </>
                                )}
                            </select>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronDown className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Discount Code Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700 text-right">
                            هل لديك كود خصم؟
                        </label>
                        <div className="bg-white border border-gray-200 rounded-2xl flex items-center overflow-hidden p-1 shadow-sm focus-within:border-[#38b6c7] transition-colors">
                            <button
                                type="button"
                                onClick={handleApplyCoupon}
                                className="text-[#38b6c7] font-black text-sm px-5 py-2.5 hover:bg-[#edf9fb] rounded-xl transition-colors cursor-pointer border-l border-gray-100 shrink-0"
                            >
                                {isCouponApplied ? 'تم التفعيل' : 'تفعيل'}
                            </button>
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="ادخل الرمز"
                                className="bg-transparent px-4 py-2.5 outline-none flex-1 text-sm font-bold text-gray-700 text-right w-full"
                            />
                        </div>
                    </div>

                    {/* Section 5: Total Amount & Checkout Button */}
                    <div className="flex flex-col gap-3 mt-4">
                        <div className="flex items-center justify-start gap-3">
                            <span className="text-[#38b6c7] font-bold text-sm">المبلغ الإجمالي</span>
                            <span className="text-2xl md:text-3xl font-black text-[#004e70] tracking-tight">
                                {finalPrice}دج
                            </span>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 bg-[#004e70] hover:bg-[#003c57] text-white font-black text-lg rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer text-center mt-2"
                        >
                            ادفع الآن
                        </button>
                    </div>

                </form>
            </div>

            {/* Payment Feedback Status Modal */}
            <PaymentStatusModal
                isOpen={statusModal.isOpen}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                onClose={() => {
                    setStatusModal(prev => ({ ...prev, isOpen: false }));
                    if (onBack && statusModal.type === 'success') onBack();
                }}
            />
        </div>
    );
}
