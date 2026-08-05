'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

  // Define steps
  // 1: User Type
  // 2: Country
  // 3: State (Wilaya)
  // 4: Level
  // 5: Year
  // 6: Major
  // 7: Finish

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

  const renderCharacterBubble = (text: string) => (
    <div className="flex flex-row items-start justify-center gap-4 mb-8">
      <div className="relative w-[120px] h-[150px] shrink-0 flex items-center justify-center text-6xl">
        🧑‍🎓
      </div>
      <div className="relative bg-white border border-gray-100 shadow-sm rounded-2xl p-4 mt-8 min-w-[200px]">
        <div className="absolute right-[-8px] top-4 w-4 h-4 bg-white border-t border-r border-gray-100 transform rotate-45"></div>
        <p className="text-[#1FA6BA] font-bold text-center leading-relaxed">
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

  if (isLoading || isFetchingData && currentStep > 3) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-white" dir="rtl">
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
      <div className="w-full max-w-2xl flex items-center gap-4 mb-12">
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

      <div className="w-full max-w-lg flex flex-col">
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('اختر نوع المستخدم')}
            <div className="flex flex-col gap-4">
              <SelectionCard label="طالب" icon="👨‍🎓" selected={userType === 'student'} onClick={() => setUserType('student')} />
              <SelectionCard label="معلم" icon="👨‍🏫" badge="قريبا SOON" disabled />
              <SelectionCard label="والي امر" icon="👨‍👩‍👦" badge="قريبا SOON" disabled />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('لتبدأ الرحلة! أخبرنا من أي دولة أنت؟')}
            <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2 pb-8 custom-scrollbar">
              {['تونس', 'الجزائر', 'ليبيا', 'لبنان', 'المغرب', 'مصر', 'قطر', 'الإمارات', 'السعودية', 'العراق', 'الأردن', 'فلسطين', 'سوريا'].map(c => (
                <SelectionCard key={c} label={c} icon="🌍" selected={country === c} onClick={() => setCountry(c)} />
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('من أي ولاية تتابعنا؟')}
            <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2 pb-8 custom-scrollbar">
              {['أدرار', 'الجزائر العاصمة', 'بجاية', 'وهران', 'تلمسان', 'الأغواط', 'جيجل', 'بشار', 'تيزي وزو', 'تمنراست', 'أخرى'].map(s => (
                <SelectionCard key={s} label={s} icon="📍" selected={wilaya === s} onClick={() => setWilaya(s)} />
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
                <SelectionCard key={y.id} label={y.title || y.name} icon="🎒" selected={selectedYearId === y.id} onClick={() => setSelectedYearId(y.id)} />
              ))}
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('رائع! دعنا الآن نحدد شعبتك / تخصصك')}
            <div className="flex flex-col gap-3">
               {majors.map(m => (
                 <SelectionCard key={m.id} label={m.name} icon="🎓" selected={selectedMajorId === m.id} onClick={() => setSelectedMajorId(m.id)} />
               ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex justify-center z-10">
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full max-w-md bg-[#48B3C4] hover:bg-[#3ca0b0] text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-sm"
        >
          المتابعة
        </button>
      </div>
    </div>
  );
}

function SelectionCard({ label, subLabel, icon, badge, selected, disabled, onClick }: any) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`relative w-full flex items-center justify-between p-4 rounded-full border-2 transition-all duration-200 ${
        selected ? 'border-[#004e70] bg-[#f8fdff]' : 'border-gray-100 bg-white hover:border-[#1FA6BA] hover:bg-gray-50'
      } ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
    >
      <div className="flex flex-col items-start justify-center pr-2">
        <span className="text-base font-bold text-gray-800">{label}</span>
        {subLabel && <span className="text-xs text-gray-400 font-medium mt-1">{subLabel}</span>}
      </div>
      <div className="flex items-center gap-3">
        {badge && (
          <span className="bg-[#e0f7fa] text-[#087083] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <span className="text-[10px]">⚠️</span> {badge}
          </span>
        )}
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-2xl border border-gray-100 overflow-hidden">
          {icon}
        </div>
      </div>
    </button>
  );
}