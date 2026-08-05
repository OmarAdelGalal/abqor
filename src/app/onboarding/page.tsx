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

  // Render Character Bubble - aligned to the RIGHT side of the page
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
      case 1: return true;
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
      <div className="w-full max-w-3xl flex items-center gap-4 mb-12">
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

      <div className="w-full max-w-3xl flex flex-col">
        {/* Step 1: Welcome Screen */}
        {currentStep === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center py-6 my-auto">
            {/* Character with Cloud Speech Bubble */}
            <div className="relative flex flex-col items-center">
              
              {/* Cloud Speech Bubble top-right of boy with vibration accent marks */}
              <div className="relative mb-3 mr-14 select-none">
                {/* Vibration Accent Marks - Top Right */}
                <div className="absolute -top-2 -right-4 flex gap-0.5 text-[#056D9C] font-bold text-xl leading-none opacity-80 pointer-events-none">
                  <span className="transform rotate-12">)</span>
                  <span className="transform rotate-12">)</span>
                </div>
                {/* Vibration Accent Marks - Left */}
                <div className="absolute top-4 -left-4 flex gap-0.5 text-[#056D9C] font-bold text-xl leading-none opacity-80 pointer-events-none">
                  <span className="transform -rotate-12">(</span>
                </div>

                <div className="bg-white border-2 border-[#056D9C] rounded-[32px] px-7 py-3.5 shadow-sm relative">
                  {/* Cloud Tail pointing down-left to boy */}
                  <div className="absolute -bottom-2.5 left-7 w-4 h-4 bg-white border-b-2 border-r-2 border-[#056D9C] transform rotate-45"></div>
                  <div className="text-center font-bold text-[#056D9C] text-lg md:text-xl leading-snug">
                    <div>مرحبا بك في</div>
                    <div>عبقور!</div>
                  </div>
                </div>
              </div>

              {/* Boy Character Image */}
              <div className="w-[180px] h-[240px] relative shrink-0">
                <img 
                  src="/boy2.png" 
                  alt="ABQOR Character" 
                  className="w-full h-full object-contain drop-shadow-md" 
                />
              </div>
            </div>

            {/* Subtitle under character */}
            <p className="text-center text-gray-500 font-semibold text-base md:text-lg mt-8">
              هيا نقم ببناء مسار تعليمي خاص بك!
            </p>
          </div>
        )}

        {/* Step 2: Country */}
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

        {/* Step 3: State (Algeria only) */}
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
              {stage === 'primary' && [
                { name: 'سنة أولى ابتدائي', icon: '/ابتدائي/Group 1.png' },
                { name: 'سنة ثانية ابتدائي', icon: '/ابتدائي/سنة ثانية ابتدائي.png' },
                { name: 'سنة ثالثة ابتدائي', icon: '/ابتدائي/سنة ثالثة ابتدائي.png' },
                { name: 'سنة رابعة ابتدائي', icon: '/ابتدائي/Group4.png' },
                { name: 'سنة خامسة ابتدائي', icon: '/ابتدائي/Group 5.png' },
              ].map(g => (
                <SelectionCard
                  key={g.name}
                  label={g.name}
                  icon={<img src={g.icon} alt={g.name} className="w-full h-full object-contain" />}
                  selected={grade === g.name}
                  onClick={() => setGrade(g.name)}
                />
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
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#3DAFC1] cursor-pointer'}
      `}
    >
      {/* Icon (Appears on FAR RIGHT in RTL) */}
      <div className="w-10 h-10 flex items-center justify-center overflow-hidden shrink-0">
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
