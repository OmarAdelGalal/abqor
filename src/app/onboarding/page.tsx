'use client';

import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type UserType = 'student' | 'teacher' | 'parent' | null;
type Country = string | null;
type State = string | null;
type Stage = 'primary' | 'middle' | 'secondary' | 'university' | null;
type Grade = string | null;
type Track = string | null;
type Major = string | null;

const TOTAL_STEPS = 7;

export default function OnboardingPage() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(null);
  const [country, setCountry] = useState<Country>(null);
  const [wilaya, setWilaya] = useState<State>(null);
  const [stage, setStage] = useState<Stage>(null);
  const [grade, setGrade] = useState<Grade>(null);
  const [track, setTrack] = useState<Track>(null);
  const [major, setMajor] = useState<Major>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    // Determine next step based on logic
    if (currentStep === 1 && userType !== 'student') return; // Cannot proceed if not student for now
    if (currentStep === 2 && country !== 'الجزائر') {
      // Skip state if not Algeria
      setCurrentStep(4);
      return;
    }
    if (currentStep === 5) {
      if (stage === 'secondary') {
        setCurrentStep(6);
        return;
      }
      if (stage === 'university') {
        setCurrentStep(7); // Jump to Major selection
        return;
      }
      // If primary or middle, finish onboarding after grade
      finishOnboarding();
      return;
    }
    if (currentStep === 6 || currentStep === 7) {
      finishOnboarding();
      return;
    }
    
    if (currentStep < TOTAL_STEPS) {
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

  const finishOnboarding = () => {
    setIsLoading(true);
    // Simulate API call and loading screen
    setTimeout(() => {
      // Typically we'd save this to local storage or context, then redirect to register or home
      alert("تم حفظ بياناتك! الانتقال لإنشاء الحساب...");
      router.push('/register'); // Redirect to register as per spec
    }, 2000);
  };

  // Render Character Bubble
  const renderCharacterBubble = (text: string) => (
    <div className="flex flex-row items-start justify-center gap-4 mb-8">
      {/* Fallback character if image not found, using an emoji for now as a placeholder */}
      <div className="relative w-[120px] h-[150px] shrink-0 flex items-center justify-center text-6xl">
        🧑‍🎓
      </div>
      <div className="relative bg-white border border-gray-100 shadow-sm rounded-2xl p-4 mt-8 min-w-[200px]">
        {/* Chat bubble tail */}
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
      case 4: return !!stage;
      case 5: return !!grade;
      case 6: return !!track;
      case 7: return !!major;
      default: return true;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-white" dir="rtl">
        <div className="mb-6">
          <img src="/070f32d8344482d233c60ed52e8fab2be5848260.png" alt="Loading" className="max-w-[280px] h-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />
        </div>
        <h2 className="text-xl font-bold text-[#1FA6BA] mb-6">جاري بناء منهجك الدراسي</h2>
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
      <div className="w-full max-w-2xl flex items-center gap-4 mb-12">
        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0">
          <ArrowRight size={24} className="text-gray-600" />
        </button>
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#FFC107] rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-lg flex flex-col">
        {/* Step 1: User Type */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('اختر نوع المستخدم')}
            <div className="flex flex-col gap-4">
              <SelectionCard 
                label="طالب" 
                icon="👨‍🎓" 
                selected={userType === 'student'} 
                onClick={() => setUserType('student')} 
              />
              <SelectionCard 
                label="معلم" 
                icon="👨‍🏫" 
                badge="قريبا SOON" 
                disabled 
              />
              <SelectionCard 
                label="والي امر" 
                icon="👨‍👩‍👦" 
                badge="قريبا SOON" 
                disabled 
              />
            </div>
          </div>
        )}

        {/* Step 2: Country */}
        {currentStep === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('لتبدأ الرحلة! أخبرنا من أي دولة أنت؟')}
            <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2 pb-8 custom-scrollbar">
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

        {/* Step 3: State (Algeria only) */}
        {currentStep === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('من أي ولاية تتابعنا؟')}
            <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2 pb-8 custom-scrollbar">
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

        {/* Step 4: Education Stage */}
        {currentStep === 4 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('في أي مرحلة دراسية تدرس ؟')}
            <div className="flex flex-col gap-3">
              <SelectionCard 
                label="المرحلة الإبتدائية" 
                subLabel="6 - 10 سنة"
                icon={<img src="/المرحلة الإبتدائية.png" alt="primary" className="w-8 h-8 object-contain" />} 
                selected={stage === 'primary'} 
                onClick={() => setStage('primary')} 
              />
              <SelectionCard 
                label="مرحلة المتوسط" 
                subLabel="11 - 14 سنة"
                icon={<img src="/مرحلة المتوسط.png" alt="middle" className="w-8 h-8 object-contain" />} 
                selected={stage === 'middle'} 
                onClick={() => setStage('middle')} 
              />
              <SelectionCard 
                label="المرحلة الثانوية" 
                subLabel="15 - 17 سنة"
                icon={<img src="/المرحلة الثانوية.png" alt="secondary" className="w-8 h-8 object-contain" />} 
                selected={stage === 'secondary'} 
                onClick={() => setStage('secondary')} 
              />
              <SelectionCard 
                label="المرحلة الجامعية" 
                subLabel="18 سنة وما فوق"
                icon={<img src="/المرحلة الجامعية.png" alt="university" className="w-8 h-8 object-contain" />} 
                selected={stage === 'university'} 
                onClick={() => setStage('university')} 
              />
            </div>
          </div>
        )}

        {/* Step 5: Grade */}
        {currentStep === 5 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('في أي سنة تدرس؟')}
            <div className="flex flex-col gap-3">
              {stage === 'primary' && ['سنة أولى ابتدائي', 'سنة ثانية ابتدائي', 'سنة ثالثة ابتدائي', 'سنة رابعة ابتدائي', 'سنة خامسة ابتدائي'].map(g => (
                <SelectionCard key={g} label={g} icon="🎒" selected={grade === g} onClick={() => setGrade(g)} />
              ))}
              {stage === 'middle' && ['سنة أولى متوسط', 'سنة ثانية متوسط', 'سنة ثالثة متوسط', 'سنة رابعة متوسط'].map(g => (
                <SelectionCard key={g} label={g} icon="📚" selected={grade === g} onClick={() => setGrade(g)} />
              ))}
              {stage === 'secondary' && ['سنة أولى ثانوي', 'سنة ثانية ثانوي', 'سنة ثالثة ثانوي'].map(g => (
                <SelectionCard key={g} label={g} icon="📖" selected={grade === g} onClick={() => setGrade(g)} />
              ))}
              {stage === 'university' && ['سنة أولى', 'سنة ثانية', 'سنة ثالثة', 'سنة رابعة', 'سنة خامسة'].map(g => (
                <SelectionCard key={g} label={g} icon="🏛️" selected={grade === g} onClick={() => setGrade(g)} />
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Track (Secondary) */}
        {currentStep === 6 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('رائع! دعنا الآن نحدد شعبتك الدراسية')}
            <div className="flex flex-col gap-3">
              {grade === 'سنة أولى ثانوي' ? (
                <>
                  <SelectionCard label="جذع مشترك آداب" icon="📜" selected={track === 'جذع مشترك آداب'} onClick={() => setTrack('جذع مشترك آداب')} />
                  <SelectionCard label="جذع مشترك علوم وتكنولوجيا" icon="🔬" selected={track === 'جذع مشترك علوم وتكنولوجيا'} onClick={() => setTrack('جذع مشترك علوم وتكنولوجيا')} />
                </>
              ) : (
                <>
                  <SelectionCard label="رياضيات" icon="📐" selected={track === 'رياضيات'} onClick={() => setTrack('رياضيات')} />
                  <SelectionCard label="علوم تجريبية" icon="🧪" selected={track === 'علوم تجريبية'} onClick={() => setTrack('علوم تجريبية')} />
                  <SelectionCard label="تسيير واقتصاد" icon="📈" selected={track === 'تسيير واقتصاد'} onClick={() => setTrack('تسيير واقتصاد')} />
                  <SelectionCard label="تقني رياضي" icon="⚙️" selected={track === 'تقني رياضي'} onClick={() => setTrack('تقني رياضي')} />
                  <SelectionCard label="آداب وفلسفة" icon="🎭" selected={track === 'آداب وفلسفة'} onClick={() => setTrack('آداب وفلسفة')} />
                  <SelectionCard label="لغات أجنبية" icon="🌐" selected={track === 'لغات أجنبية'} onClick={() => setTrack('لغات أجنبية')} />
                  <SelectionCard label="فنون" icon="🎨" selected={track === 'فنون'} onClick={() => setTrack('فنون')} />
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 7: Major (University) */}
        {currentStep === 7 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderCharacterBubble('ما هو تخصصك الجامعي؟')}
            <div className="flex flex-col gap-3">
              <SelectionCard label="طب أسنان" icon="🦷" selected={major === 'طب أسنان'} onClick={() => setMajor('طب أسنان')} />
              <SelectionCard label="طب بشري" icon="⚕️" selected={major === 'طب بشري'} onClick={() => setMajor('طب بشري')} />
              <SelectionCard label="هندسة معمارية" icon="👷" selected={major === 'هندسة معمارية'} onClick={() => setMajor('هندسة معمارية')} />
              <SelectionCard label="صيدلة" icon="💊" selected={major === 'صيدلة'} onClick={() => setMajor('صيدلة')} />
              <SelectionCard label="لغة إنجليزية" icon="🇬🇧" selected={major === 'لغة إنجليزية'} onClick={() => setMajor('لغة إنجليزية')} />
              <SelectionCard label="جذع مشترك علوم إجتماعية" icon="👥" selected={major === 'جذع مشترك علوم إجتماعية'} onClick={() => setMajor('جذع مشترك علوم إجتماعية')} />
              <SelectionCard label="أدب وحضارة" icon="📚" selected={major === 'أدب وحضارة'} onClick={() => setMajor('أدب وحضارة')} />
            </div>
          </div>
        )}
      </div>

      {/* Footer Continue Button */}
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

// Helper Components

function SelectionCard({ 
  label, 
  subLabel,
  icon, 
  badge, 
  selected, 
  disabled, 
  onClick 
}: { 
  label: string, 
  subLabel?: string,
  icon: React.ReactNode, 
  badge?: string, 
  selected?: boolean, 
  disabled?: boolean, 
  onClick?: () => void 
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`relative w-full flex items-center justify-between p-4 rounded-full border-2 transition-all duration-200 
        ${selected ? 'border-[#48B3C4] bg-[#f0f9fa]' : 'border-gray-100 bg-white'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-200 cursor-pointer'}
      `}
    >
      <div className="flex flex-col items-start justify-center pr-2">
        <span className="text-base font-bold text-gray-800">{label}</span>
        {subLabel && (
          <span className="text-xs text-gray-400 font-medium mt-1">{subLabel}</span>
        )}
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

function getCountryFlag(country: string) {
  const flags: Record<string, string> = {
    'تونس': '🇹🇳',
    'الجزائر': '🇩🇿',
    'ليبيا': '🇱🇾',
    'لبنان': '🇱🇧',
    'المغرب': '🇲🇦',
    'مصر': '🇪🇬',
    'قطر': '🇶🇦',
    'الإمارات': '🇦🇪',
    'السعودية': '🇸🇦',
    'العراق': '🇮🇶',
    'الأردن': '🇯🇴',
    'فلسطين': '🇵🇸',
    'سوريا': '🇸🇾',
  };
  return flags[country] || '🌍';
}
