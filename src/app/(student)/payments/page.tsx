'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import StreakWidget from '@/components/dashboard/StreakWidget';
import RankWidget from '@/components/dashboard/RankWidget';
import UpgradeWidget from '@/components/dashboard/UpgradeWidget';
import SocialFollowWidget from '@/components/learning/SocialFollowWidget';
import PaymentModal from '@/components/ui/PaymentModal';

interface PlanFeature {
    text: string;
    icon?: string;
}

interface Plan {
    id: string;
    title: string;
    badge?: string;
    badgeIcon?: string;
    price: string;
    period: string;
    headerGradient: string;
    buttonBg: string;
    buttonText: string;
    isCurrent?: boolean;
    headerIcon: string;
    features: PlanFeature[];
}

export default function PaymentsPage() {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);

    const plans: Plan[] = [
        {
            id: 'free',
            title: 'الإشتراك المجاني',
            headerIcon: '✏️',
            price: '0 دج',
            period: 'إشتراك سنوي',
            headerGradient: 'from-[#4dbd79] via-[#40b06b] to-[#36a560]',
            buttonBg: 'bg-[#35825a] hover:bg-[#2c6e4c]',
            buttonText: 'الخطة الحالية',
            isCurrent: true,
            features: [
                { text: '5 قلوب تتجدد يومياً / كل 24 ساعة', icon: '❤️' },
                { text: 'كويزات تفاعلية لكل السنوات الدراسية', icon: '📊' },
                { text: 'ملخصات الدروس في جميع المواد PDF', icon: '📄' },
                { text: 'الحصول على قلوب جديدة بمشاهدة إعلانات', icon: '🚫' },
            ],
        },
        {
            id: 'silver',
            title: 'الإشتراك الفضي',
            headerIcon: '🪙',
            price: '4500 دج',
            period: 'إشتراك سنوي',
            headerGradient: 'from-[#20b7c9] via-[#1bb0c2] to-[#16a5b6]',
            buttonBg: 'bg-[#20b7c9] hover:bg-[#199ea0]',
            buttonText: 'إشترك الآن',
            features: [
                { text: 'قلوب غير محدودة', icon: '❤️' },
                { text: 'كويزات تفاعلية لكل السنوات الدراسية', icon: '📊' },
                { text: 'ملخصات الدروس في جميع المواد PDF', icon: '📄' },
                { text: 'اللعب بدون مشاهدة إعلانات', icon: '🚫' },
            ],
        },
        {
            id: 'gold',
            title: 'الإشتراك الذهبي',
            headerIcon: '🪙',
            badge: 'الأكثر طلباً',
            badgeIcon: '👑',
            price: '6700 دج',
            period: 'إشتراك سنوي',
            headerGradient: 'from-[#9f489f] via-[#913d91] to-[#7f327f]',
            buttonBg: 'bg-[#853e85] hover:bg-[#723272]',
            buttonText: 'إشترك الآن',
            features: [
                { text: 'قلوب غير محدودة', icon: '❤️' },
                { text: 'كويزات تفاعلية لكل السنوات الدراسية', icon: '📊' },
                { text: 'ملخصات الدروس في جميع المواد PDF', icon: '📄' },
                { text: 'فيديوهات الشرح', icon: '📺' },
                { text: 'اللعب بدون مشاهدة إعلانات', icon: '🚫' },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-32 font-sans" dir="rtl">
            <AuthenticatedHeader />

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col lg:flex-row gap-8 items-start">

                    {/* Right Column: Main Subscriptions Area */}
                    <div className="w-full lg:w-3/4 flex flex-col">

                        {/* Header Title with Back Arrow */}
                        <div className="flex items-center justify-end gap-3 mb-6">
                            <h1 className="text-2xl font-black text-gray-800">الإشتراكات</h1>
                            <Link
                                href="/dashboard"
                                className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>

                        {/* Hero Subtitle */}
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-black text-[#004e70] flex items-center justify-center gap-2">
                                <span>اختر خطتك الآن وابدأ التعلم بدون حدود</span>
                                <span className="text-2xl">🚀</span>
                            </h2>
                        </div>

                        {/* Pricing Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-4">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col relative overflow-hidden group"
                                >
                                    {/* Badge for Gold Plan */}
                                    {plan.badge && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                                            <span className="bg-[#ffe680] border border-yellow-300 text-yellow-900 text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                                <span>{plan.badge}</span>
                                                <span className="text-sm">{plan.badgeIcon}</span>
                                            </span>
                                        </div>
                                    )}

                                    {/* Top Curved Header */}
                                    <div className={`bg-gradient-to-b ${plan.headerGradient} text-white pt-10 pb-8 px-6 rounded-b-[50%] flex flex-col items-center text-center relative z-10 shadow-sm`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-black">{plan.title}</h3>
                                            <span className="text-lg">{plan.headerIcon}</span>
                                        </div>

                                        <div className="my-1">
                                            <span className="text-3xl md:text-4xl font-black tracking-tight">{plan.price}</span>
                                        </div>

                                        <span className="text-xs font-semibold opacity-90 mt-1">{plan.period}</span>
                                    </div>

                                    {/* Features List & Action Button */}
                                    <div className="flex-1 p-6 flex flex-col justify-between space-y-6 text-right">
                                        <ul className="space-y-4 text-xs md:text-sm font-bold text-gray-500">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center justify-between gap-3 text-right">
                                                    <span className="flex-1 leading-snug">{feature.text}</span>
                                                    {feature.icon && (
                                                        <span className="text-base shrink-0">{feature.icon}</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Bottom Action Button */}
                                        <div className="pt-4 mt-auto flex justify-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedPlan(plan.id);
                                                    setIsModalOpen(true);
                                                }}
                                                className={`w-4/5 py-3 rounded-full text-white font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer ${plan.buttonBg}`}
                                            >
                                                {plan.buttonText}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* Left Column: Sidebar Widgets */}
                    <div className="w-full lg:w-1/4 flex flex-col gap-6">
                        <StreakWidget />
                        <RankWidget />
                        <UpgradeWidget />
                        <SocialFollowWidget />
                    </div>

                </div>
            </main>

            {/* Payment Method Selection Modal */}
            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onContinue={(method) => {
                    console.log('Selected payment method:', method, 'for plan:', selectedPlan);
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}
