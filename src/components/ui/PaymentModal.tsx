'use client';

import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: (method: string) => void;
}

export default function PaymentModal({ isOpen, onClose, onContinue }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('online');

  if (!isOpen) return null;

  const handleContinue = () => {
    if (onContinue) {
      onContinue(selectedMethod);
    } else {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn" 
      dir="rtl"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="bg-white rounded-[32px] w-full max-w-md p-6 md:p-8 shadow-2xl relative border border-gray-100 flex flex-col items-center transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X size={18} />
        </button>

        {/* Modal Title */}
        <h2 className="text-xl md:text-2xl font-black text-[#004e70] mb-6 text-center">
          إختر طريقة الشحن
        </h2>

        {/* Options List */}
        <div className="w-full flex flex-col gap-3.5 mb-6">

          {/* Option 1: الدفع الإلكتروني */}
          <button
            type="button"
            onClick={() => setSelectedMethod('online')}
            className={`w-full py-4 px-5 rounded-2xl flex items-center justify-between font-bold text-sm transition-all duration-200 cursor-pointer border ${
              selectedMethod === 'online'
                ? 'bg-[#edf9fb] border-[#38b6c7] text-[#004e70] shadow-sm'
                : 'bg-white border-gray-200 text-gray-700 hover:border-[#38b6c7]/50'
            }`}
          >
            {/* Payment Method Name */}
            <span className="text-base font-extrabold">الدفع الإلكتروني</span>

            {/* Payment Logos / Icon */}
            <div className="flex items-center gap-2">
              <img
                src="/home/pay.png"
                alt="الدفع الإلكتروني"
                className="h-6 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <CreditCard className="w-5 h-5 text-[#38b6c7]" />
            </div>
          </button>

          {/* Option 2: التحويل عبر البنك/ البريد */}
          <button
            type="button"
            onClick={() => setSelectedMethod('bank')}
            className={`w-full py-4 px-5 rounded-2xl flex items-center justify-center font-extrabold text-base transition-all duration-200 cursor-pointer border ${
              selectedMethod === 'bank'
                ? 'bg-[#edf9fb] border-[#38b6c7] text-[#004e70] shadow-sm'
                : 'bg-white border-gray-200 text-gray-700 hover:border-[#38b6c7]/50'
            }`}
          >
            <span>التحويل عبر البنك/ البريد</span>
          </button>

          {/* Option 3: بطاقة التعبئة */}
          <button
            type="button"
            onClick={() => setSelectedMethod('card')}
            className={`w-full py-4 px-5 rounded-2xl flex items-center justify-center font-extrabold text-base transition-all duration-200 cursor-pointer border ${
              selectedMethod === 'card'
                ? 'bg-[#edf9fb] border-[#38b6c7] text-[#004e70] shadow-sm'
                : 'bg-white border-gray-200 text-gray-700 hover:border-[#38b6c7]/50'
            }`}
          >
            <span>بطاقة التعبئة</span>
          </button>

        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-3.5 bg-[#004e70] hover:bg-[#003c57] text-white font-black text-lg rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          المتابعة
        </button>

      </div>
    </div>
  );
}
