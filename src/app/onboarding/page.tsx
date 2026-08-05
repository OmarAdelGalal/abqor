'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authApi } from '@/lib/auth';

type UserType = 'student' | 'teacher' | 'parent' | null;

export default function OnboardingPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [wilaya, setWilaya] = useState<string | null>(null);
  
  // Dynamic Data
  const [levels, setLevels] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [majors, setMajors] = useState<any[]>([]);
  
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await authApi.fetchEducationLevels();
        setLevels(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchLevels();
  }, []);

  const finishOnboarding = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('onboardingData', JSON.stringify({
         country,
         state: wilaya,
         education_level_id: selectedLevelId,
         education_year_id: selectedYearId,
         education_major_id: selectedMajorId
      }));
      alert("تم حفظ بياناتك! الانتقال لإنشاء الحساب...");
      router.push('/register');
    }, 1500);
  };

  const handleNext = async () => {
    if (currentStep === 1 && userType !== 'student') return;
    if (currentStep === 2 && country !== 'الجزائر') {
      setCurrentStep(4);
      return;
    }
    
    if (currentStep === 4) {
      if (!selectedLevelId) return;
      const lvl = levels.find(l => l.id === selectedLevelId);
      setIsFetchingData(true);
      
      try {
        if (lvl?.select_next === 'YEARS') {
           const res = await authApi.fetchEducationYears({ education_level_id: selectedLevelId });
           const fetchedYears = Array.isArray(res) ? res : [];
           setYears(fetchedYears);
           if (fetchedYears.length > 0) {
              setCurrentStep(5);
           } else {
              finishOnboarding(); // No years available
           }
        } else if (lvl?.select_next === 'MAJORS') {
           const res = await authApi.fetchEducationMajors({ education_level_id: selectedLevelId });
           const fetchedMajors = Array.isArray(res) ? res : [];
           setMajors(fetchedMajors);
           if (fetchedMajors.length > 0) {
              setCurrentStep(6);
           } else {
              finishOnboarding();
           }
        } else {
           finishOnboarding();
        }
      } catch (e) {
        console.error(e);
        finishOnboarding();
      }
      setIsFetchingData(false);
      return;
    }

    if (currentStep === 5) {
      if (!selectedYearId) return;
      // Check if this year has majors
      setIsFetchingData(true);
      try {
        const res = await authApi.fetchEducationMajors({ education_year_id: selectedYearId });
        const fetchedMajors = Array.isArray(res) ? res : [];
        setMajors(fetchedMajors);
        if (fetchedMajors.length > 0) {
           setCurrentStep(6);
        } else {
           finishOnboarding();
        }
      } catch (e) {
        finishOnboarding();
      }
      setIsFetchingData(false);
      return;
    }

    if (currentStep === 6) {
      if (!selectedMajorId) return;
      finishOnboarding();
      return;
    }
    
    if (currentStep < 7) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 4 && country !== 'الجزائر') {
      setCurrentStep(2);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.back();
    }
  };

  // Render Character Bubble - aligned to the RIGHT side of the page (from remote)
  const renderCharacterBubble = (text: string) => (
    <div className="w-full flex flex-row items-center justify-start gap-3.5 mb-8">
      {/* Character Image (First in DOM = RIGHT in RTL) */}
      <div className="relative w-[130px] h-[175px] shrink-0">
        <img
          src="/boy2.png"
          alt="ABQOR Character"
          className="w-full h-full object-contain drop-shadow-sm"
        />
      </div>

      {/* Speech Bubble (Second in DOM = LEFT of character) */}
      <div className="relative bg-white border border-gray-200/80 shadow-sm rounded-2xl px-5 py-3.5 w-[220px]">
        {/* Tail pointing right towards character on the right */}
        <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-t border-r border-gray-200/80 transform rotate-45"></div>
        <p className="text-[#3DAFC1] font-bold text-center text-sm md:text-base leading-snug">
          {text}
        </p>
      </div>
    </div>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1: return userType === 'student';
      case 2: return !!country;
      case 3: return !!wilaya;
      case 4: return !!selectedLevelId;
      case 5: return !!selectedYearId;
      case 6: return !!selectedMajorId;
      default: return true;
    }
  };

  if (isLoading || (isFetchingData && currentStep > 3)) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-white" dir="rtl">
        <div className="mb-6">
          <img src="/070f32d8344482d233c60ed52e8fab2be5848260.png" alt="Loading" className="max-w-[280px] h-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        </div>
        <h2 className="text-xl font-bold text-[#1FA6BA] mb-6">جاري التحميل...</h2>
        <div className="flex gap-2 justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1FA6BA] animate-pulse"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#90d7e0] animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#d2f3f7] animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-8 px-4" dir="rtl">
      {/* Progress Bar Header */}
      <div className="w-full max-w-3xl flex items-center gap-4 mb-12">
        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0">
          <ArrowRight size={24} className="text-gray-600" />
        </button>
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFC107] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-3xl flex flex-col">
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center py-6 my-auto">
            {/* Character with Cloud Speech Bubble */}
            <div className="relative flex flex-col items-center mb-8">
              <div className="relative mb-3 mr-14 select-none">
                <div className="absolute -top-2 -right-4 flex gap-0.5 text-[#056D9C] font-bold text-xl leading-none opacity-80 pointer-events-none">
                  <span className="transform rotate-12">)</span>
                  <span className="transform rotate-12">)</span>
                </div>
                <div className="absolute top-4 -left-4 flex gap-0.5 text-[#056D9C] font-bold text-xl leading-none opacity-80 pointer-events-none">
                  <span className="transform -rotate-12">(</span>
                </div>

                <div className="bg-white border-2 border-[#056D9C] rounded-[32px] px-7 py-3.5 shadow-sm relative">
                  <div className="absolute -bottom-2.5 left-7 w-4 h-4 bg-white border-b-2 border-r-2 border-[#056D9C] transform rotate-45"></div>
                  <div className="text-center font-bold text-[#056D9C] text-lg md:text-xl leading-snug">
                    <div>مرحبا بك في</div>
                    <div>عبقور!</div>
                  </div>
                </div>
              </div>

              <div className="w-[180px] h-[240px] relative shrink-0">
                <img 
                  src="/boy2.png" 
                  alt="ABQOR Character" 
                  className="w-full h-full object-contain drop-shadow-md" 
                />
              </div>
            </div>

            <div className="w-full max-w-lg flex flex-col gap-4">
              <SelectionCard label="طالب" icon="👨‍🎓" selected={userType === 'student'} onClick={() => setUserType('student')} />
              <SelectionCard label="معلم" icon="👨‍🏫" badge="قريبا SOON" disabled />
              <SelectionCard label="والي امر" icon="👨‍👩‍👦" badge="قريبا SOON" disabled />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('لتبدأ الرحلة! أخبرنا من أي دولة أنت؟')}
            <div className="flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-2 pb-12 custom-scrollbar">
              {['تونس', 'الجزائر', 'ليبيا', 'لبنان', 'المغرب', 'مصر', 'قطر', 'الإمارات', 'السعودية', 'العراق', 'الأردن', 'فلسطين', 'سوريا'].map(c => (
                <SelectionCard
                  key={c}
                  label={c}
                  icon={getCountryFlag(c)}
                  selected={country === c}
                  onClick={() => setCountry(c)}
                />
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('من أي ولاية تتابعنا؟')}
            <div className="flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-2 pb-12 custom-scrollbar">
              {['أدرار', 'الجزائر العاصمة', 'بجاية', 'وهران', 'تلمسان', 'الأغواط', 'جيجل', 'بشار', 'تيزي وزو', 'تمنراست', 'أخرى'].map(s => (
                <SelectionCard
                  key={s}
                  label={s}
                  icon="📍"
                  selected={wilaya === s}
                  onClick={() => setWilaya(s)}
                />
              ))}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('في أي مرحلة دراسية تدرس ؟')}
            <div className="flex flex-col gap-3">
              {levels.map(lvl => (
                <SelectionCard 
                  key={lvl.id} 
                  label={lvl.name} 
                  subLabel={lvl.subtitle}
                  icon="🏫" 
                  selected={selectedLevelId === lvl.id} 
                  onClick={() => setSelectedLevelId(lvl.id)} 
                />
              ))}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('في أي سنة تدرس؟')}
            <div className="flex flex-col gap-3">
              {years.map(y => (
                <SelectionCard 
                  key={y.id} 
                  label={y.title || y.name} 
                  icon="🎒" 
                  selected={selectedYearId === y.id} 
                  onClick={() => setSelectedYearId(y.id)} 
                />
              ))}
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('رائع! دعنا الآن نحدد شعبتك / تخصصك')}
            <div className="flex flex-col gap-3">
               {majors.map(m => (
                 <SelectionCard 
                   key={m.id} 
                   label={m.name} 
                   icon="🎓" 
                   selected={selectedMajorId === m.id} 
                   onClick={() => setSelectedMajorId(m.id)} 
                 />
               ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-100 flex justify-center z-10">
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full max-w-[280px] bg-[#3DAFC1] hover:bg-[#3298a8] text-white font-bold py-4 rounded-full transition-all disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed text-lg shadow-sm"
        >
          المتابعة
        </button>
      </div>
    </div>
  );
}

// Helper Components

function SelectionCard({
  label,
  subLabel,
  icon,
  badge,
  selected,
  disabled,
  rounded = 'full',
  onClick
}: {
  label: string,
  subLabel?: string,
  icon: React.ReactNode,
  badge?: string,
  selected?: boolean,
  disabled?: boolean,
  rounded?: 'full' | '2xl' | 'xl' | 'md',
  onClick?: () => void
}) {
  const roundedClass =
    rounded === 'full' ? 'rounded-full' :
      rounded === '2xl' ? 'rounded-2xl' :
        rounded === 'xl' ? 'rounded-xl' : 'rounded-md';

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`relative w-full flex items-center justify-start gap-4 px-7 py-4 ${roundedClass} border-2 transition-all duration-200 shadow-sm
        ${selected ? 'border-[#3DAFC1] bg-[#f0f9fa]' : 'border-gray-200 bg-white'}
        ${disabled ? 'opacity-60 cursor-not-allowed grayscale' : 'hover:border-[#3DAFC1] cursor-pointer'}
      `}
    >
      {/* Icon (Appears on FAR RIGHT in RTL) */}
      <div className="w-10 h-10 flex items-center justify-center overflow-hidden shrink-0 text-2xl">
        {icon}
      </div>

      {/* Label & Sublabel (Appears right next to icon to its LEFT in RTL) */}
      <div className="flex flex-col items-start justify-center flex-1">
        <span className="text-lg font-bold text-[#212121]">{label}</span>
        {subLabel && (
          <span className="text-xs text-gray-400 font-medium mt-0.5">{subLabel}</span>
        )}
      </div>

      {/* Badge (Appears on FAR LEFT in RTL) */}
      {badge && (
        <span className="bg-[#e0f7fa] text-[#087083] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
          <span className="text-[10px]">⚠️</span> {badge}
        </span>
      )}
    </button>
  );
}

function getCountryFlag(country: string) {
  const flagImages: Record<string, string> = {
    'تونس': '/Cuntry/تونس.png',
    'الجزائر': '/Cuntry/الجزائر.png',
    'ليبيا': '/Cuntry/ليبيا.png',
    'لبنان': '/Cuntry/لبنان.png',
    'المغرب': '/Cuntry/المغرب.png',
    'مصر': '/Cuntry/مصر.png',
    'قطر': '/Cuntry/قطر.png',
    'الإمارات': '/Cuntry/الامارات.png',
    'الامارات': '/Cuntry/الامارات.png',
    'السعودية': '/Cuntry/السعودية.png',
    'العراق': '/Cuntry/العراق.png',
    'الأردن': '/Cuntry/الاردن.png',
    'الاردن': '/Cuntry/الاردن.png',
    'فلسطين': '/Cuntry/فلسطين.png',
    'سوريا': '/Cuntry/سوريا.png',
  };

  const imagePath = flagImages[country];
  if (imagePath) {
    return (
      <img
        src={imagePath}
        alt={country}
        className="w-full h-full object-cover rounded-full"
      />
    );
  }

  return '🌍';
}
