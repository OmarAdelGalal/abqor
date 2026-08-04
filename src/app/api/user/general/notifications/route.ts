import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock data matching the design and the Laravel Notification model shape
  const mockNotifications = [
    {
      id: 1,
      title: 'Reminder',
      body: 'تذكير ! الحصة الخامسة لمادة اللغة الفرنسية ستبدأ بعد 5 دقائق',
      icon: '📅',
      created_at: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
    },
    {
      id: 2,
      title: 'Motivation',
      body: 'اكمل درساً واحداً يومياً للحفاظ على معدل حماستك!',
      icon: '🔥',
      created_at: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
    },
    {
      id: 3,
      title: 'Quick Lesson',
      body: 'لديك 5 دقائق؟ انطلق في درس سريع الآن!',
      icon: '🚀',
      created_at: new Date(Date.now() - 65 * 60000).toISOString(),
    },
    {
      id: 4,
      title: 'Streak',
      body: 'لقد وصلت إلى 5 أيام متتالية! استمر في التعلم لتحافظ على السلسلة.',
      icon: '👑',
      created_at: new Date(Date.now() - 70 * 60000).toISOString(),
    },
    {
      id: 5,
      title: 'Review',
      body: 'حان وقت مراجعة بعض الأخطاء في اللغة الإنجليزية لتتقدم بشكل أفضل.',
      icon: '📖',
      created_at: new Date(Date.now() - 75 * 60000).toISOString(),
    },
    {
      id: 6,
      title: 'Goal',
      body: 'تبقى لك درس واحد فقط لتحقيق هدف الاسبوع.',
      icon: '🎯',
      created_at: new Date(Date.now() - 80 * 60000).toISOString(),
    },
    {
      id: 7,
      title: 'Time',
      body: 'لم يتبق سوى 15 دقيقة لإنتهاء اليوم! ابدأ درسًا سريعًا الآن.',
      icon: '⏳',
      created_at: new Date(Date.now() - 85 * 60000).toISOString(),
    }
  ];

  // Laravel pagination shape
  return NextResponse.json({
    status: 200,
    message: 'success',
    code: 'SUCCESS',
    isSuccess: true,
    data: {
      current_page: 1,
      data: mockNotifications,
      last_page: 1,
      per_page: 25,
      total: mockNotifications.length
    }
  });
}
