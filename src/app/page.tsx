import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import StagesSection from '@/components/landing/StagesSection';
import SmartLearningSection from '@/components/landing/SmartLearningSection';
import LearningMethodSection from '@/components/landing/LearningMethodSection';
import TeachersSection from '@/components/landing/TeachersSection';
import GamificationSection from '@/components/landing/GamificationSection';
import ChallengeSection from '@/components/landing/ChallengeSection';
import FooterIllustrationSection from '@/components/landing/FooterIllustrationSection';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center bg-white font-sans text-text-main overflow-hidden">
      <HeroSection />
      <StagesSection />
      <SmartLearningSection />
      <LearningMethodSection />
      <TeachersSection />
      <GamificationSection />
      <ChallengeSection />
      <FooterIllustrationSection />
    </div>
  );
}
