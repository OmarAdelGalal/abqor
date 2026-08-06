'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

export interface PaymentStatusModalProps {
    isOpen: boolean;
    type: 'success' | 'error';
    title?: string;
    message?: string;
    buttonText?: string;
    onClose: () => void;
    onAction?: () => void;
}

export default function PaymentStatusModal({
    isOpen,
    type,
    title,
    message,
    buttonText,
    onClose,
    onAction,
}: PaymentStatusModalProps) {
    if (!isOpen) return null;

    const isSuccess = type === 'success';

    const defaultTitle = isSuccess ? 'تمت عملية الاشتراك بنجاح' : 'حدث خطأ في الدفع';
    const defaultButtonText = isSuccess ? 'حسناً' : 'اعد المحاولة';

    const handleButtonClick = () => {
        if (onAction) {
            onAction();
        }
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn" 
            dir="rtl"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[32px] w-full max-w-sm p-6 md:p-8 shadow-2xl border border-gray-100 flex flex-col items-center text-center transition-all duration-300 gap-5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Status Icon Circle */}
                {isSuccess ? (
                    <div className="w-16 h-16 rounded-full bg-[#e3f7fa] flex items-center justify-center text-[#38b6c7] shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#38b6c7] text-white flex items-center justify-center shadow-sm">
                            <Check className="w-6 h-6 stroke-[3]" />
                        </div>
                    </div>
                ) : (
                    <div className="w-16 h-16 rounded-full bg-[#fee2e2] flex items-center justify-center text-[#ef4444] shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#ef4444] text-white flex items-center justify-center shadow-sm">
                            <X className="w-6 h-6 stroke-[3]" />
                        </div>
                    </div>
                )}

                {/* Status Message */}
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg md:text-xl font-black text-gray-800 leading-snug">
                        {title || defaultTitle}
                    </h3>
                    {message && (
                        <p className="text-xs md:text-sm font-bold text-gray-500 mt-1">
                            {message}
                        </p>
                    )}
                </div>

                {/* Main Action Button */}
                <button
                    type="button"
                    onClick={handleButtonClick}
                    className="w-full py-3.5 bg-[#004e70] hover:bg-[#003c57] text-white font-black text-base rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer mt-2"
                >
                    {buttonText || defaultButtonText}
                </button>
            </div>
        </div>
    );
}
