# ABQOR App — Flow & Functional Spec (for AI Coding Agent)

## How to use this file
You are converting the ABQOR Figma design into a working web app. For every screen below you get:
`Screen name → Purpose → UI elements → Functions/state → Navigation (in/out)`.
Implement each screen as a route/page. Reuse shared components (see "Global Components"). Ask for the exact Figma frame/screenshot for a screen before styling it pixel-perfect — this file describes structure and behavior, not exact pixel values.

## Tech stack
- **Framework:** Next.js (App Router) + React + TypeScript
- **Language/Direction:** Arabic (primary), **RTL layout** (`dir="rtl"` at root). Some content (course names, subject codes) mixes in French/English (LTR) — handle mixed-direction text (`unicode-bidi: plaintext` or per-field `dir="auto"`).
- **Styling:** component library of your choice (Tailwind recommended) — build a design-tokens file first (see below) so every screen pulls from the same source.
- **State/data:** treat every screen's data as coming from an API layer (auth, courses, payments, gamification, groups, AI chat). Stub with mock data + typed interfaces so the UI works before backend wiring.

## Design tokens (observed from source; confirm exact hex values against Figma before final polish)
- Primary brand color: teal/cyan (used for header bar, primary buttons, active nav state)
- Secondary/accent: magenta-pink (used for high-emphasis CTA buttons, e.g. "Subscribe")
- Dark surface: navy/charcoal (used on some promo/course cards)
- Gamification accents: orange/flame (streak), red (hearts/lives), blue (gems/diamonds), gold/yellow (badges, crown/premium)
- Logo/brand name: **ABQOR** (Arabic: **عبقور**) — both appear depending on screen
- Layout: **mobile** = bottom content flow with a persistent top status row (streak, gems, hearts, % avatar ring); **wider viewports (tablet/desktop)** = same features, top horizontal nav bar (الرئيسية / التعلم / حسابي = Home / Learn / My Account) replaces bottom nav. Build ONE responsive layout that switches nav pattern by breakpoint rather than two separate apps.

---

## Global Components (build once, reuse everywhere)

### `TopStatusBar`
Persistent across all authenticated screens.
- Logo (ABQOR)
- Notification bell icon → routes to Notifications screen
- User avatar with circular progress ring showing profile-completion % (e.g. 58%)
- Stat pills: ❤️ hearts count, 💎 gems count, 🔥 streak-days count
- Nav items: **الرئيسية** (Home) / **التعلم** (Learn) / **حسابي** (My Account) — bottom tab bar on mobile, top nav on wider screens

### `StreakWidget`
- Title "أيام الحماس" (Enthusiasm Days) + flame icon + current streak number
- Encouragement text ("استمر انت هكذا رائع!" — "Keep it up!")
- 7-day week strip (سبت أحد إثنين ثلاثاء أربعاء خميس جمعة = Sat–Fri) with a checkmark/fill state per completed day
- CTA: "إبدأ" (Start) button when today isn't done yet

### `LeaderboardMiniWidget`
- Current rank badge (e.g. "#12")
- "ارتفعت 3 مراحل هذا الأسبوع" (Rose 3 places this week) delta indicator
- "عرض الترتيب كامل" (View full leaderboard) link

### `UpgradeBanner`
- "احصل على تجربة تعليمية أفضل!" (Get a better learning experience) promo card
- Sub-copy about unlimited access to lessons/summaries/features
- CTA: "ترقية الحساب" (Upgrade account)

### `SocialFollowRow`
- YouTube / Telegram / Instagram / Facebook icon links (footer widget, appears on several screens)

### `CountdownTimer`
Reusable day/hour/min/sec countdown block. Used for: exam countdown (Bac), quiz timer, task/focus timer.

---

## 1. Onboarding & Authentication Flow

### 1.1 Splash / Welcome
- **Purpose:** first-run intro
- **Elements:** app illustration, headline "أهلا بك في تطبيق ABQOR، ابدأ بالمغامرة والتحديات معنا!" (Welcome to ABQOR, start the adventure and challenges with us), sub-copy "تعلم بذكاء وتفوق، إنجاز جديد مع كل تقدم!" (Learn smart, a new achievement with every step)
- **Functions:** "ابدأ رحلتك الآن" (Start your journey) primary CTA → Onboarding quiz; "استكشف الدورات" (Explore courses) secondary CTA → Course catalog (guest browsing); "تسجيل الدخول" (Login) → Login screen
- **Nav out:** → Login, → Onboarding Quiz, → Course catalog (guest)

### 1.2 Login
- **Elements:** Email field, password field, "تذكرني" (Remember me) checkbox, "نسيت كلمة المرور؟" (Forgot password) link, primary "ابدأ الآن" (Start now) button, "ليس لديك حساب سجل هنا" (No account? Sign up) link, social buttons (Google, Apple/App Store)
- **Functions:** form validation; on submit → authenticate → Home. Error state variant shown ("والمحاولة مرة أخرى" — invalid credentials, try again).
- **Nav:** ↔ Register, → Forgot Password, → Home (on success)

### 1.3 Forgot Password → OTP → Reset (3-step flow)
1. **Enter email** — field + "إرسال" (Send) button
2. **Confirmation** — "تم إرسال رابط إعادة التعيين" (Reset link sent), "فهمت" (Got it) dismiss
3. **OTP verification** — 4-digit code input (individual boxes), countdown resend timer, "إعادة إرسال رمز التحقق" (Resend code), error state for wrong code, "المتابعة" (Continue)
4. **Set new password** — new password + confirm password fields, "تأكيد" (Confirm) → back to Login

### 1.4 Register / Create Account
- **Elements:** Full name, email, gender (male/female toggle), password, "أوافق على الشروط والاحكام" (I agree to T&C) checkbox, social signup (Google/App Store), "متابعة بالإيميل" email option, "لدي حساب، دخول" (Have an account, login) link
- **Functions:** validate + create account → Onboarding personalization quiz

### 1.5 Onboarding Personalization Quiz (multi-step, progress bar at top)
Sequential steps, each single-select, "المتابعة" (Continue) to advance:
1. **User type** — طالب (Student) / معلم (Teacher, "قريبا"/coming soon) / ولي أمر (Parent, "قريبا")
2. **Country** — تونس / الجزائر / ليبيا / لبنان / المغرب / مصر / قطر / الإمارات / السعودية (Tunisia, Algeria, Libya, Lebanon, Morocco, Egypt, Qatar, UAE, Saudi)
3. **(Algeria only, extra step) State/province (ولاية)** — list of Algerian wilayas
4. **Education stage** — الإبتدائية (Primary 10–16) / المتوسط (Middle 14–17)† / الثانوية (Secondary 17–15)† / الجامعية (University 18+)
   *(†Age ranges as extracted may contain OCR noise — verify against design before shipping)*
5. **Grade/year within stage** — e.g. for Primary: سنة أولى/ثانية/ثالثة/رابعة/خامسة ابتدائي (Years 1–5); analogous lists for Middle/Secondary
6. **Branch/track (Secondary only)** — جدع مشترك آداب / جدع مشترك علوم وتكنولوجيا (Common trunk humanities/sciences) → then specific track: رياضيات، علوم تجريبية، تسيير واقتصاد، تقني رياضي، آداب وفلسفة، لغات أجنبية، فنون (Math, Experimental Sciences, Management/Econ, Math-Tech, Literature/Philosophy, Foreign Languages, Arts)
7. **Major (University only)** — طب بشري، طب أسنان، صيدلة، هندسة معمارية، جذع مشترك علوم اجتماعية، لغة إنجليزية، أدب وحضارة (Medicine, Dentistry, Pharmacy, Architecture, Social Sciences, English, Literature) etc.
8. **Loading screen** — "جاري بناء منهجك الدراسي" (Building your curriculum...) with animated illustration → auto-advance
9. **Account creation prompt** — "الآن قم بإنشاء حسابك في عبقور!" reinforcement screen if not yet registered → Register

**State to persist:** userType, country, (state), educationStage, grade, branch/major — used later to filter Home feed & course catalog.

---

## 2. Home / Dashboard

### 2.1 Home (main authenticated landing)
- **Widgets (in order):**
  - `TopStatusBar`
  - Exam countdown card — e.g. "بقي على إمتحان البكالوريا دورة 2025" (Time left until Bac exam) + `CountdownTimer` (days/hrs/min/sec) + "مشاركة" (Share) action
  - `StreakWidget` + `LeaderboardMiniWidget`
  - Quick-link tiles: **AI Bot**, **IELTS**, **تعلم الإنجليزي** (Learn English), **E-Store**, **الدورات التعليمية** (Courses), **منهجي التعليمي** (My Curriculum)
  - `UpgradeBanner`
- **Functions:** each quick-link tile routes to its feature; countdown is computed from a stored exam date

### 2.2 Notifications
- **Empty state:** illustration + "لا يوجد إشعارات" / "لم تصلك أي اشعارات بعد" (No notifications yet)
- **Populated state:** list of notification cards, each with relative time ("الآن" now / "1 ساعة" 1h ago) and message text (e.g. lesson-starting reminders, streak reminders, "لديك 5 دقائق؟ انطلق في درس سريع الآن!" quick-lesson nudge)
- **Functions:** tap notification → deep-link to relevant screen (lesson, streak, etc.)

---

## 3. Courses

### 3.1 Course Catalog / Explore
- **Filters:** subject/language tabs — اللغة العربية / الفرنسية / الإنجليزية / الفيزياء (Arabic/French/English/Physics) + "الدورات المجانية" (Free courses) filter, country-flag style toggle chips (EN/FR)
- **Course card:** teacher photo, course title, teacher name, "Live" or "مسجلة" (Recorded) badge, schedule time, lesson-count stat, price + "إشتراك سنوي" (Annual subscription) label, subscribe CTA button
- **Empty state:** "لا يوجد دورات في اللغة العربية" / "انت غير مسجل في أي دورة" (no courses / not enrolled) + `UpgradeBanner`
- **Functions:** filter by subject; tap card → Course Detail

### 3.2 Course Detail
- **Header:** course title, teacher name+subject, price, "إشتراك سنوي" badge, share icon
- **Tabs:** عن الدورة (About) / محتوى الدورة (Content) / آراء التلاميذ (Student Reviews)
  - **About:** description text, course summary, "الحصة الأولى / الحصة الثانية" (Session 1/2) list with intro blurb per session
  - **Content:** حصص الدروس (lesson sessions) vs حصص المواضيع (topic/practice sessions) sub-tabs; per-lesson row with lock icon if not enrolled
  - **Reviews:** teacher rating, student comment list, "اترك تعليق للأستاذ" (Leave a comment) input + "حفظ التعليق" (Save comment)
- **Locked-content paywall state:** "المحتوى مقفول" (Content locked) banner, "سجل الآن للوصول إلى الملخصات والفيديوهات وجميع المزايا" (Register now for full access), "سجل الآن" (Register) vs "تراجع" (Cancel) buttons
- **"اسأل معلمك" (Ask your teacher) sub-flow:** submitted-question log with question text, timestamp, and teacher's answer thread
- **Course summary sub-screen:** "ملخص الدورة" — "تنزيل الملخص" (Download summary) if enrolled, else "إشترك في الدورة لقراءة المزيد" (Subscribe to read more)
- **Enrollment (manual bank transfer) instructions sub-screen:** beneficiary name, account number, amount to transfer, address, RIP number for gold-card payment — treat as a static instructional panel (recipient/account fields should be data-driven per teacher/course, not hardcoded)
- **Video player:** playback-speed selector (Normal / 1.25x / 1.5x / 1.75x / 2x)

### 3.3 Subscription Plans
- **Elements:** "اختر خطتك الآن وابدأ التعلم بدون حدود 🚀" (Choose your plan, learn without limits) headline; 3 plan cards — **الإشتراك الذهبي** (Gold, ~6700 DA/yr, "الأكثر طلبا/شعبية" most-requested/popular badge), **الإشتراك الفضي** (Silver, ~4500 DA/yr), **الإشتراك المجاني** (Free, 0 DA) — each with "إشتراك سنوي" (annual) label and its own CTA
- **Functions:** select plan → Payment flow

---

## 4. Learning / Lesson Player

### 4.1 Lesson intro / loading
- "جاري تحميل الدرس..." (Loading lesson...) + "الدرس في طريقه إليك، استعد لخطوة جديدة نحو النجاح!" (Your lesson is on its way, get ready for a new step toward success)

### 4.2 Quiz / Exercise screen
- **Elements:** hearts-remaining indicator, question text, multiple-choice options (2–4), "تحقق من الإجابة" (Check answer) button
- **States:**
  - Correct → "رائع! إجابة صحيحة" (Great! Correct answer) → auto-advance/"المتابعة"
  - Incorrect → shows correct answer inline + "فهمت" (Got it) to continue
  - Out of hearts → "لقد إنتهت جميع فرص محاولاتك!" (You're out of attempts!) → options: watch an ad video for a new heart ("مشاهدة" Watch) or subscribe ("إشتراك")
  - Exit-confirm modal — "هل أنت متأكد من أنك تريد مغادرة الدرس؟ سوف تفقد حماستك لليوم" (Are you sure you want to leave? You'll lose today's streak) → "نعم" (Yes) / "تراجع" (Cancel)
  - Reward micro-screen — "لقد حصلت على قلوب جديدة" (You earned new hearts) → "متابعة الدرس" (Continue lesson)

### 4.3 Daily goal / streak completion
- "رائع! لقد وصلت إلى هدفك اليومي" (You reached your daily goal!) celebration screen
- "لقد ربحت 4 جواهر! وظيفة لطيفة تصل إلى هدفك اليومي" (You earned 4 gems!) reward screen with "مراجعة الدرس" (Review lesson) secondary action
- Streak-day-complete screen reusing `StreakWidget` full-screen with "تعلمك اليوم يقربك أكثر من هدفك!" copy

---

## 5. Study Planner / Curriculum

### 5.1 Study by Chapter / Study by Subject (toggle)
- Toggle: "الدراسة بالفصول" (By chapters) vs "الدراسة بالمواد" (By subjects)
- Chapter/week list with completion state, per-week detail (e.g. "الفصل الدراسي الأول" → "الأسبوع الأول/الثاني/الثالث...")
- Subject list variant: اللغة العربية، العلوم الطبيعية والحياة، etc. (Arabic, Natural Sciences, ...) each showing progress ("دروس مكتملة" completed lessons, e.g. 0/5)

### 5.2 Study Challenges / Tasks
- **List screen:** "تحديات الدراسة" (Study challenges) with existing tasks (title, countdown/status: "هيا نبدأ!" let's start / "ركز على هدفك!" focus on your goal / "وقت الإستراحة!" break time / "متوقف!" paused) + "إضافة مهمة" (Add task) CTA
- **Add task screen:** title field, description field, duration picker (5/10/15/20/30/40/50/60 minutes)
- **Active timer screen:** running countdown (mm:ss) tied to the task, likely with pause/resume controls (Pomodoro-style)

### 5.3 Study Groups
- **List:** "مجموعات التعليم" (Study groups) — "أنت غير منضم إلى أي مجموعة" (not joined) empty state / joined-groups list; "المجموعات المتوفرة" (Available groups) discovery list with member count + join CTA; "إنشاء مجموعة جديدة" (Create new group) CTA
- **Create group:** group image upload, group name, bio/description, privacy toggle ("جعل الحساب خاص" make private)
- **Group detail:** cover/name, total study hours stat, member count, tabs "الأعضاء" (Members) / "المحادثات" (Chats/discussion), "شارك المجموعة" (Share group) action

---

## 6. AI Features

### 6.1 Quick Actions menu (surfaced from Home or a floating action button)
- **اشرح لي درساً** — Explain a lesson to me
- **التقط صورة لسؤال** — Snap a photo of a question
- **تحدث مع المعلم الذكي** — Talk to the AI teacher
- **ساعدني في الكتابة** — Help me write
- **اختبرني** — Quiz me

### 6.2 AI Bot (Smart Teacher chat)
- **Elements:** subject picker (لغة عربية / رياضيات / التاريخ والجغرافيا / فيزياء / العلوم الطبيعية والحياة — Arabic/Math/History-Geo/Physics/Natural Sciences), "المحادثات الأخيرة" (Recent conversations) list with topic + timestamp, "ابدأ محادثة جديدة" (Start new conversation) CTA
- **Chat screen:** standard chat UI — user bubble (right, "أنت" You) vs AI bubble (left, "المعلم الذكي · ABQOR AI" branded), timestamp per message, message input
- **Functions:** persist conversation history per subject; support starting a fresh thread

---

## 7. Payments / Wallet

### 7.1 Electronic Payment — method selection
- "حدد المراد الإشتراك به" (Select what to pay for): **شحن رصيد** (Top up balance) / **الإشتراك في خطة** (Subscribe to a plan) / **الإشتراك في دورة** (Subscribe to a course)
- Depending on choice → course dropdown selector OR plan selector
- "هل لديك كود خصم؟" (Have a discount code?) input + "تفعيل" (Apply)
- Total amount summary + "ادفع الآن" (Pay now) CTA

### 7.2 Recharge via top-up card
- "اشحن اشتراكك باستخدام بطاقة التعبئة" (Recharge using a top-up card) — enter card code to activate
- Variant: enter custom amount to charge ("أدخل المبلغ المراد شحنه")

### 7.3 Card payment form
- Card number, cardholder name, expiry date, CVV → "ادفع الآن" (Pay now)
- **States:** success — "لقد فعلت الاشتراك بنجاح" (Subscription activated successfully); error — "حدث خطأ في الدفع" (Payment error)

### 7.4 Manual bank-transfer instructions (alt payment path)
- Beneficiary name/account number, amount, address, RIP number for gold-card transfers, and "كيفية تعبئة الحوالة البريدية" (how to fill a postal transfer) guidance — render as data-driven instructional content, not hardcoded copy

---

## 8. Profile / Account (حسابي)

### 8.1 Account overview
- Stats: total gems, streak days, lesson-progress %, app rating summary
- Menu list: **تعديل الحساب** (Edit account) / **الإشتراكات** (Subscriptions) / **آراء التلاميذ** (Reviews I've given) / **من نحن** (About us) / **الأسئلة الأكثر تداولاً** (FAQ) / **الشروط والأحكام** (Terms & Conditions) / **تقييم التطبيق** (Rate the app)

### 8.2 Edit Account
- Full name, email, (avatar), save/confirm

### 8.3 Subscriptions history
- List of active/past subscriptions (plan or course, dates, status)

---

## 9. Marketing / Growth widgets (appear inline across screens, not full pages)
- App-store badges: "تحميل" (Download) for Android and iOS
- "مجموعة المعرفة" (Knowledge community) join banner with member/hour stats
- `SocialFollowRow` (YouTube/Telegram/Instagram/Facebook)

---

## Suggested route map (Next.js App Router)

```
/                          → Splash/Welcome (unauthenticated)
/login
/register
/forgot-password
/forgot-password/otp
/forgot-password/reset
/onboarding/[step]         → user-type, country, stage, grade, branch, loading
/home
/notifications
/courses                   → catalog
/courses/[courseId]
/courses/[courseId]/summary
/courses/[courseId]/enroll-instructions
/subscriptions/plans
/lesson/[lessonId]
/lesson/[lessonId]/quiz/[questionId]
/planner                   → study by chapter/subject
/planner/tasks
/planner/tasks/new
/planner/tasks/[taskId]/timer
/groups
/groups/new
/groups/[groupId]
/ai-bot
/ai-bot/[conversationId]
/payment
/payment/topup
/payment/card
/account
/account/edit
/account/subscriptions
/account/faq
/account/terms
```

## Notes / open questions to confirm against the live Figma file before building
- Exact hex values for brand colors, type scale, spacing — pull via Figma variables/styles, not guessed from this doc.
- Age ranges captured for education stages contain likely extraction artifacts (source PDF text layer is RTL and lossy) — re-verify "المتوسط 14–17" / "الثانوية 15–17" style ranges visually.
- Confirm whether the wider/light-theme screens are truly a separate "Desktop" Figma page or a responsive state of the same mobile screens — this doc assumes the latter and recommends one responsive build.
- Icon assets and character illustrations (mascot) exist as a separate asset set in the Figma file — export these separately as SVG/PNG for the agent to drop into `/public`.
