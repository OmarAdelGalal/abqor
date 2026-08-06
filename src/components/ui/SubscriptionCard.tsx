'use client';

import React from 'react';

export interface PlanFeature {
    text: string;
    icon?: string;
}

export interface PlanData {
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

export interface SubscriptionCardProps {
    plan: PlanData;
    onSelect?: (planId: string) => void;
}

export default function SubscriptionCard({ plan, onSelect }: SubscriptionCardProps) {
    return (
        <div
            className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-visible group h-full"
        >
            {/* Badge (e.g. الأكثر طلباً) */}
            {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30">
                    <span className="bg-[#fff1a8] border border-[#ffe05c] text-[#7a4e00] text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                        <span>{plan.badge}</span>
                        {plan.badgeIcon && <span className="text-sm">{plan.badgeIcon}</span>}
                    </span>
                </div>
            )}

            {/* Curved Top Header */}
            <div className={`bg-gradient-to-b ${plan.headerGradient} text-white pt-10 pb-8 px-6 rounded-t-[32px] rounded-b-[45%] flex flex-col items-center text-center relative z-10 shadow-sm`}>
                <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-black">{plan.title}</h3>
                    <span className="text-lg">{plan.headerIcon}</span>
                </div>

                <div className="my-1">
                    <span className="text-3xl md:text-4xl font-black tracking-tight">{plan.price}</span>
                </div>

                <span className="text-xs font-bold opacity-90 mt-1">{plan.period}</span>
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

                {/* Action Button */}
                <div className="pt-4 mt-auto flex justify-center">
                    <button
                        onClick={() => onSelect && onSelect(plan.id)}
                        className={`w-full py-3 rounded-full text-white font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer ${plan.buttonBg}`}
                    >
                        {plan.buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
}
