'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

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
        className="bg-white rounded-[32px] w-full max-w-[560px] p-5 md:p-6 shadow-2xl relative border border-gray-100 flex flex-col items-center transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          aria-label="إغلاق"
        >
          <X size={16} />
        </button>

        {/* Modal Title */}
        <h2 className="text-lg md:text-xl font-black text-[#004e70] mb-4 text-center">
          إختر طريقة الشحن
        </h2>

        {/* Options List */}
        <div className="w-full flex flex-col gap-2.5 mb-5">

          {/* Option 1: الدفع الإلكتروني */}
          <button
            type="button"
            onClick={() => setSelectedMethod('online')}
            className={`w-full py-3 px-5 rounded-2xl flex items-center justify-between font-bold text-sm transition-all duration-200 cursor-pointer border ${
              selectedMethod === 'online'
                ? 'bg-[#edf9fb] border-[#38b6c7] text-[#004e70] shadow-sm'
                : 'bg-white border-gray-200 text-gray-700 hover:border-[#38b6c7]/50'
            }`}
          >
            <span className="text-sm md:text-base font-extrabold">الدفع الإلكتروني</span>

            <div className="flex items-center gap-2">
              <img
                src="/Frame 1300192978.png"
                alt="الدفع الإلكتروني"
                className="h-7 object-contain"
              />
            </div>
          </button>

          {/* Option 2: التحويل عبر البنك/ البريد */}
          <button
            type="button"
            onClick={() => setSelectedMethod('bank')}
            className={`w-full py-3 px-5 rounded-2xl flex items-center justify-between font-bold text-sm transition-all duration-200 cursor-pointer border ${
              selectedMethod === 'bank'
                ? 'bg-[#edf9fb] border-[#38b6c7] text-[#004e70] shadow-sm'
                : 'bg-white border-gray-200 text-gray-700 hover:border-[#38b6c7]/50'
            }`}
          >
            <span className="text-sm md:text-base font-extrabold">التحويل عبر البنك/ البريد</span>
            <div className="flex items-center gap-2">
              <img
                src="/Frame 1300192752.png"
                alt="التحويل البنكي"
                className="h-7 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/Frame 1300192978.png';
                }}
              />
            </div>
          </button>

          {/* Option 3: بطاقة التعبئة */}
          <button
            type="button"
            onClick={() => setSelectedMethod('card')}
            className={`w-full py-3 px-5 rounded-2xl flex items-center justify-between font-bold text-sm transition-all duration-200 cursor-pointer border ${
              selectedMethod === 'card'
                ? 'bg-[#edf9fb] border-[#38b6c7] text-[#004e70] shadow-sm'
                : 'bg-white border-gray-200 text-gray-700 hover:border-[#38b6c7]/50'
            }`}
          >
            <span className="text-sm md:text-base font-extrabold">بطاقة التعبئة</span>
            <div className="flex items-center gap-2">
              <img
                src="/Frame 1300192753.png"
                alt="بطاقة التعبئة"
                className="h-7 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/Frame 1300192978.png';
                }}
              />
            </div>
          </button>

        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-3 bg-[#004e70] hover:bg-[#003c57] text-white font-black text-base rounded-2xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          المتابعة
        </button>

      </div>
    </div>
  );
}
