'use client';

import React from 'react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="w-full relative min-h-[780px] lg:min-h-[860px] flex items-center justify-center bg-white pt-8 pb-20 overflow-hidden">
      <div className="mx-auto" style={{ maxWidth: '1440px', padding: '0 80px' }}>
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-10 xl:gap-16">

          {/* ═══════════════════════════════════════════════════════════════════
              RIGHT SIDE in RTL — Cards side
              Figma & Screenshot accurate layout
             ═══════════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:block relative shrink-0 select-none" style={{ width: '380px', height: '660px' }}>
            
            {/* Dashed connector line — One single continuous unbroken curve from Quick Review down to Books */}
            <div
              className="absolute z-0 pointer-events-none"
              style={{ width: '380px', height: '640px', right: '0px', top: '0px' }}
            >
              <svg viewBox="0 0 380 640" fill="none" className="w-full h-full">
                <path 
                  d="M 165 125 C 135 175 155 240 210 295 C 235 330 220 375 140 425 C 40 475 25 530 180 560" 
                  stroke="#54C3D5" 
                  strokeWidth="2.5" 
                  strokeDasharray="6 6" 
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>

            {/* Quick Review Card — rotate(13.58deg) */}
            <div
              className="absolute z-20 transition-transform duration-300 hover:scale-105"
              style={{
                width: '254px',
                top: '10px',
                right: '30px',
                transform: 'rotate(13.58deg)',
                filter: 'drop-shadow(0px 4px 32px rgba(0, 44, 51, 0.1))',
              }}
            >
              <img
                src="/Frame 1984078360.png"
                alt="مراجعة سريعة"
                className="w-full h-auto"
              />
            </div>

            {/* Upper 4-point Sparkle — under top card */}
            <div className="absolute z-10" style={{ right: '175px', top: '160px' }}>
              <svg className="w-5 h-5 fill-current animate-pulse" style={{ color: '#54C3D5' }} viewBox="0 0 24 24">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>

            {/* Blue Checkmark Circle (fi_12901762) — left of upper path */}
            <div
              className="absolute z-20"
              style={{ width: '60px', height: '60px', right: '250px', top: '200px' }}
            >
              <img src="/fi_12901762.png" alt="check" className="w-full h-full drop-shadow-sm" />
            </div>

            {/* Target & Dart Icon (fi_3995483) — right of upper path */}
            <div
              className="absolute z-20"
              style={{ width: '56px', height: '56px', right: '100px', top: '190px' }}
            >
              <img src="/fi_3995483.png" alt="target" className="w-full h-full drop-shadow-sm" />
            </div>

            {/* Achievement Card — rotate(4.46deg) */}
            <div
              className="absolute z-20 transition-transform duration-300 hover:scale-105"
              style={{
                width: '254px',
                top: '290px',
                right: '60px',
                transform: 'rotate(4.46deg)',
                filter: 'drop-shadow(0px 4px 32px rgba(0, 44, 51, 0.1))',
              }}
            >
              <img
                src="/Frame 1984078359.png"
                alt="إنجاز جديد مع كل تقدم!"
                className="w-full h-auto"
              />
            </div>

            {/* Lower 4-point Sparkle — inside big left loop of lower dashed line */}
            <div className="absolute z-10" style={{ right: '270px', top: '450px' }}>
              <svg className="w-6 h-6 fill-current animate-pulse" style={{ color: '#3DAFC1' }} viewBox="0 0 24 24">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>

            {/* Books Stack with Graduation Cap (Background.png) */}
            <div
              className="absolute z-10"
              style={{ width: '230px', right: '30px', bottom: '10px' }}
            >
              <img
                src="/Background.png"
                alt="Books and Graduation Cap"
                className="w-full h-auto drop-shadow-xl"
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              CENTER — Title + Subtitle + Buttons
              Figma: 418×563px, centered
             ═══════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col items-center text-center z-30 shrink-0" style={{ width: '418px', gap: '40px' }}>

            {/* Title + Subtitle block — gap 25px */}
            <div className="flex flex-col items-center" style={{ gap: '25px', width: '418px' }}>

              {/* Title */}
              <div className="relative inline-block text-center select-none">

                {/* 4-point Sparkle top-right of تعلم */}
                <div className="absolute z-10" style={{ top: '-5px', right: '-40px' }}>
                  <svg className="w-10 h-10 fill-current animate-pulse" style={{ color: '#54C3D5' }} viewBox="0 0 40 40">
                    <path d="M20 0C20 11.0457 28.9543 20 40 20C28.9543 20 20 28.9543 11.0457 20 0 20C11.0457 20 20 11.0457 20 0Z" />
                  </svg>
                </div>

                {/* Small sparkle */}
                <div className="absolute z-10" style={{ top: '180px', right: '-30px' }}>
                  <svg className="w-5 h-5 fill-current" style={{ color: '#42B1E2' }} viewBox="0 0 40 40">
                    <path d="M20 0C20 11.0457 28.9543 20 40 20C28.9543 20 20 28.9543 11.0457 20 0 20C11.0457 20 20 11.0457 20 0Z" />
                  </svg>
                </div>

                {/* Line 1: تعلم */}
                <h1
                  className="font-medium p-0 m-0"
                  style={{ fontSize: '100px', lineHeight: '130%', color: '#212121' }}
                >
                  تعلم
                </h1>

                {/* Line 2: "بذكاء" */}
                <div className="relative inline-flex items-center justify-center">
                  {/* 3-Ray Burst — stroke 6px #42B1E2 */}
                  <div className="absolute" style={{ top: '-25px', left: '-50px' }}>
                    <svg className="w-12 h-12" viewBox="0 0 36 36" fill="none" strokeWidth="6" strokeLinecap="round" style={{ stroke: '#42B1E2' }}>
                      <line x1="12" y1="24" x2="4" y2="14" />
                      <line x1="18" y1="16" x2="6" y2="4" />
                      <line x1="26" y1="14" x2="20" y2="2" />
                    </svg>
                  </div>

                  <span
                    className="font-medium"
                    style={{ fontSize: '100px', lineHeight: '130%', color: '#3DAFC1' }}
                  >
                    <span className="inline-block mr-1" style={{ color: '#3DAFC1' }}></span>
                    بذكاء
                    <span className="inline-block ml-1" style={{ color: '#3DAFC1' }}></span>
                  </span>
                </div>

                {/* Line 3: وتفوق */}
                <div
                  className="font-medium p-0 m-0"
                  style={{ fontSize: '100px', lineHeight: '130%', color: '#212121' }}
                >
                  وتفوق
                </div>
              </div>

              {/* Subtitle — 20px, #757575 */}
              <p
                className="font-normal text-center"
                style={{ fontSize: '20px', lineHeight: '140%', color: '#757575', width: '418px' }}
              >
                أهلا بك في تطبيق ABQOR، ابدأ بالمغامرة والتحديات معنا!
              </p>
            </div>

            {/* CTA Buttons — 200×52px, gap 20px */}
            <div dir="ltr" className="flex flex-row items-center" style={{ gap: '20px' }}>
              {/* Outlined button ("استكشف الدورات") */}
              <Link
                href="/courses"
                className="flex items-center justify-center font-medium transition-all hover:scale-[1.02] text-center bg-white"
                style={{
                  width: '200px',
                  height: '52px',
                  border: '2px solid #3DAFC1',
                  borderRadius: '16px',
                  fontSize: '18px',
                  color: '#424242',
                  boxShadow: '0px 4px 0px #3DAFC1',
                }}
              >
                استكشف الدورات
              </Link>

              {/* Filled button ("ابدأ رحلتك الآن") */}
              <button
                onClick={() => window.dispatchEvent(new Event('open-auth-modal'))}
                className="flex items-center justify-center font-medium text-white transition-all hover:scale-[1.02] cursor-pointer"
                style={{
                  width: '200px',
                  height: '52px',
                  background: '#3DAFC1',
                  borderRadius: '16px',
                  fontSize: '18px',
                  boxShadow: '0px 4px 0px #2A8A99',
                  border: 'none',
                }}
              >
                ابدأ رحلتك الآن
              </button>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              LEFT SIDE in RTL — Boy side
              Figma positions: boy x=140 y=208, blob x=206 y=267,
              checkmark x=35 y=365, plane x=71 y=465, 
              dashed x=35 y=486, goals x=60 y=662
             ═══════════════════════════════════════════════════════════════════ */}
          <div className="hidden lg:block relative shrink-0 select-none" style={{ width: '460px', height: '700px' }}>

            {/* Background Blob Image — /Vector 88.png */}
            <div
              className="absolute z-0 pointer-events-none"
              style={{ width: '280px', left: '100px', top: '40px' }}
            >
              <img
                src="/Vector 88.png"
                alt="Background shape"
                className="w-full h-auto"
              />
            </div>

            {/* Boy Character — 298px wide */}
            <div
              className="absolute z-10"
              style={{ width: '350px', left: '70px', top: '-25px' }}
            >
              <img
                src="/8aef59e22b486ce79cac17963eb0fe241c3dc4f1.png"
                alt="Student Boy"
                className="w-full h-auto"
              />
            </div>

            {/* Checkmark (fi_12901762) — 78×78px, upper-left of boy */}
            <div
              className="absolute z-20"
              style={{ width: '66px', height: '66px', left: '0px', top: '180px' }}
            >
              <img src="/fi_12901762.png" alt="check" className="w-full h-full drop-shadow-md" />
            </div>

            {/* Telegram icon — /telgram.png */}
            <div
              className="absolute z-25"
              style={{ width: '66px', height: '66px', left: '-20px', top: '261px', transform: 'rotate(20deg)' }}
            >
              <img src="/telgram.png" alt="telegram" className="w-full h-auto drop-shadow-lg object-contain" />
            </div>

            {/* Dashed flight path (Vector 87) — angled top curve flowing directly from paper airplane tail */}
            <div
              className="absolute z-5 pointer-events-none"
              style={{ width: '240px', height: '340px', left: '-100px', top: '310px' }}
            >
              <svg viewBox="0 0 240 340" fill="none" className="w-full h-full">
                <path
                  d="M 92 2 C 35 35 5 85 20 135 C 35 185 150 195 125 235 C 105 270 30 280 165 295"
                  stroke="#056D9C"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>

            {/* 4-point Sparkle — #056D9C (positioned to the right of the dashed curve) */}
            <div className="absolute z-20" style={{ left: '85px', top: '355px' }}>
              <svg className="w-7 h-7 fill-current animate-pulse" style={{ color: '#056D9C' }} viewBox="0 0 40 40">
                <path d="M20 0C20 11.0457 28.9543 20 40 20C28.9543 20 20 28.9543 11.0457 20 0 20C11.0457 20 20 11.0457 20 0Z" />
              </svg>
            </div>

            {/* Small sparkle — #42B1E2, near boy top */}
            <div className="absolute z-20" style={{ left: '145px', top: '10px' }}>
              <svg className="w-6 h-6 fill-current animate-pulse" style={{ color: '#42B1E2' }} viewBox="0 0 40 40">
                <path d="M20 0C20 11.0457 28.9543 20 40 20C28.9543 20 20 28.9543 11.0457 20 0 20C11.0457 20 20 11.0457 20 0Z" />
              </svg>
            </div>

            {/* Daily Goals Card — 420px wide, rotate(-13.7deg) */}
            <div
              className="absolute z-30 transition-transform duration-300 hover:scale-[1.03]"
              style={{
                width: '420px',
                left: '-10px',
                bottom: '0px',
                transform: 'rotate(-13.7deg)',
                filter: 'drop-shadow(0px 4px 32px rgba(0, 0, 0, 0.08))',
              }}
            >
              <img
                src="/Frame 1300192526.png"
                alt="أهداف يومية"
                className="w-full h-auto"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
