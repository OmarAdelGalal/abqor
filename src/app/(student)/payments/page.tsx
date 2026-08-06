'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import StreakWidget from '@/components/dashboard/StreakWidget';
import RankWidget from '@/components/dashboard/RankWidget';
import UpgradeWidget from '@/components/dashboard/UpgradeWidget';
import SocialFollowWidget from '@/components/learning/SocialFollowWidget';
import PaymentModal from '@/components/ui/PaymentModal';
import SubscriptionCard, { PlanData } from '@/components/ui/SubscriptionCard';
import CardCheckoutForm from '@/components/ui/CardCheckoutForm';
import BankTransferInstructions from '@/components/ui/BankTransferInstructions';
import RechargeCardCheckout from '@/components/ui/RechargeCardCheckout';
import PaymentStatusModal from '@/components/ui/PaymentStatusModal';

export default function PaymentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'plans' | 'checkout' | 'bank' | 'recharge'>('plans');

    const [statusModal, setStatusModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title?: string;
        message?: string;
    }>({
        isOpen: false,
        type: 'success',
    });

    const plans: PlanData[] = [
        {
            id: 'gold',
            title: 'الاشتراك الذهبي',
            headerIcon: '🥇',
            badge: 'الأكثر طلباً',
            badgeIcon: '👑',
            price: '6700 دج',
            period: 'إشتراك سنوي',
            headerGradient: 'from-[#b448b4] via-[#9f369f] to-[#882888]',
            buttonBg: 'bg-[#913894] hover:bg-[#7e2f81]',
            buttonText: 'إشترك الان',
            features: [
                { text: 'قلوب غير محدودة', icon: '❤️' },
                { text: 'كويزات تفاعلية لكل السنوات الدراسية', icon: '🧮' },
                { text: 'ملخصات الدروس في جميع المواد PDF', icon: '📖' },
                { text: 'فيديوهات الشرح', icon: '📺' },
                { text: 'اللعب بدون مشاهدة إعلانات', icon: '🚫' },
            ],
        },
        {
            id: 'silver',
            title: 'الاشتراك الفضي',
            headerIcon: '🥈',
            price: '4500 دج',
            period: 'إشتراك سنوي',
            headerGradient: 'from-[#38bdf8] via-[#0284c7] to-[#0369a1]',
            buttonBg: 'bg-[#35b5d8] hover:bg-[#289cb9]',
            buttonText: 'إشترك الان',
            features: [
                { text: 'قلوب غير محدودة', icon: '❤️' },
                { text: 'كويزات تفاعلية لكل السنوات الدراسية', icon: '🧮' },
                { text: 'ملخصات الدروس في جميع المواد PDF', icon: '📖' },
                { text: 'اللعب بدون مشاهدة إعلانات', icon: '🚫' },
            ],
        },
        {
            id: 'free',
            title: 'الإشتراك المجاني',
            headerIcon: '🏷️',
            price: '0 دج',
            period: 'إشتراك سنوي',
            headerGradient: 'from-[#4ade80] via-[#22c55e] to-[#15803d]',
            buttonBg: 'bg-[#357a55] hover:bg-[#2a6344]',
            buttonText: 'الخطة الحالية',
            isCurrent: true,
            features: [
                { text: '5 قلوب تتجدد يومياً / كل 24 ساعة', icon: '❤️' },
                { text: 'كويزات تفاعلية لكل السنوات الدراسية', icon: '🧮' },
                { text: 'الحصول على قلوب جديدة بمشاهدة إعلانات', icon: '🚫' },
            ],
        },
    ];

    const handleSelectPlan = (planId: string) => {
        setSelectedPlanId(planId);
        setIsModalOpen(true);
    };

    const selectedPlanData = plans.find(p => p.id === selectedPlanId);

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans" dir="rtl">
            <AuthenticatedHeader />

            <main className="container mx-auto px-4 py-6 max-w-[1440px]">

                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* Right Main Content: Switches between Subscriptions Plans, Card Checkout, Bank Transfer & Recharge Card */}
                    <div className="flex-1 w-full flex flex-col">
                        {viewMode === 'bank' ? (
                            <BankTransferInstructions 
                                planTitle={selectedPlanData?.title}
                                amount={selectedPlanData?.price || '3200 دج'}
                                onBack={() => setViewMode('plans')}
                            />
                        ) : viewMode === 'recharge' ? (
                            <RechargeCardCheckout 
                                planTitle={selectedPlanData?.title}
                                onBack={() => setViewMode('plans')}
                                onSubmitRecharge={() => {
                                    setStatusModal({
                                        isOpen: true,
                                        type: 'success',
                                        title: 'تمت عملية الاشتراك بنجاح',
                                    });
                                }}
                            />
                        ) : viewMode === 'checkout' ? (
                            <CardCheckoutForm 
                                plan={selectedPlanData}
                                onBack={() => setViewMode('plans')}
                                onSubmitPayment={() => {
                                    setStatusModal({
                                        isOpen: true,
                                        type: 'success',
                                        title: 'تمت عملية الاشتراك بنجاح',
                                    });
                                }}
                            />
                        ) : (
                            <>
                                {/* Page Title & Navigation Header */}
                                <div className="flex items-center justify-start gap-2 mb-6">
                                    <h1 className="text-2xl md:text-3xl font-black text-[#1e293b]">الإشتراكات</h1>
                                    <Link
                                        href="/dashboard"
                                        className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                                        aria-label="رجوع"
                                    >
                                        <ArrowRight className="w-6 h-6" />
                                    </Link>
                                </div>

                                {/* Subtitle */}
                                <div className="text-center mb-10">
                                    <h2 className="text-2xl md:text-3xl font-black text-[#004e70] flex items-center justify-center gap-2">
                                        <span>اختر خطتك الآن وابدأ التعلم بدون حدود</span>
                                        <span className="text-2xl">🚀</span>
                                    </h2>
                                </div>

                                {/* Pricing Cards Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-4">
                                    {plans.map((plan) => (
                                        <SubscriptionCard
                                            key={plan.id}
                                            plan={plan}
                                            onSelect={handleSelectPlan}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Left Sidebar Widgets Column */}
                    <div className="w-full lg:w-[394px] flex flex-col gap-6 shrink-0">
                        <StreakWidget days={8} flame={8} />
                        <RankWidget rank={12} progress={3} />
                        <UpgradeWidget />
                        <SocialFollowWidget />
                    </div>

                </div>
            </main>

            {/* Payment Method Modal */}
            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onContinue={(method) => {
                    console.log('Selected payment method:', method, 'for plan:', selectedPlanId);
                    setIsModalOpen(false);
                    if (method === 'bank') {
                        setViewMode('bank');
                    } else if (method === 'card') {
                        setViewMode('recharge');
                    } else {
                        setViewMode('checkout');
                    }
                }}
            />

            {/* Payment Feedback Status Modal (Success / Error) */}
            <PaymentStatusModal
                isOpen={statusModal.isOpen}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                onClose={() => {
                    setStatusModal(prev => ({ ...prev, isOpen: false }));
                    if (statusModal.type === 'success') {
                        setViewMode('plans');
                    }
                }}
            />
        </div>
    );
}
