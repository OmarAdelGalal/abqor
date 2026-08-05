import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CustomSelect({ options, value, onChange, placeholder = "اختر", disabled = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full text-right" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl border transition-all flex items-center justify-between group ${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-70 border-gray-200' : 
          isOpen ? 'border-[#45B7C7] bg-white ring-2 ring-[#45B7C7]/20' : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <span className={`text-base font-medium truncate ${selectedOption ? 'text-gray-800' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#45B7C7]' : 'text-gray-400 group-hover:text-gray-600'}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[60] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-3 rounded-xl cursor-pointer flex items-center justify-between transition-colors mb-1 last:mb-0 ${
                  value === option.value 
                    ? 'bg-[#45B7C7]/10 text-[#45B7C7] font-bold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="truncate w-full text-right">{option.label}</span>
                {value === option.value && <Check className="w-5 h-5 shrink-0 mr-2" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
