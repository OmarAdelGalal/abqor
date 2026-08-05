import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // The design groups by category ("Free", "Physics", "English").
  // According to implementation plan, backend groups by subject keys like `french`, `physics`.
  // We'll mimic that shape but structure it so the frontend can easily map it to the UI.
  
  const mockCoursesData = {
    free: [
      {
        id: 101,
        title: 'دورة الفصل الأول',
        subject: 'اللغة الفرنسية',
        teacher: 'أ. سالي بوميدل',
        is_live: true,
        is_recorded: true,
        time: '20:00 - 23:00',
        lessons_count: 8,
        exercises_count: 12,
        progress_current: 12,
        progress_total: 25,
        price: 0,
        color: 'from-pink-500 to-purple-600', // Mock visual cue for UI
        image: 'https://ui-avatars.com/api/?name=Sally&background=random' // Placeholder
      }
    ],
    physics: [
      {
        id: 102,
        title: 'دورة الإنقاذ الوحدة الأولى',
        subject: 'الفيزياء',
        teacher: 'أ. أميرة شنوف',
        is_live: true,
        is_recorded: true,
        time: '20:00 - 23:00',
        lessons_count: 8,
        exercises_count: 12,
        progress_current: 12,
        progress_total: 25,
        price: 50,
        color: 'from-teal-400 to-cyan-500',
        image: 'https://ui-avatars.com/api/?name=Amira&background=random'
      }
    ],
    english: [
      {
        id: 103,
        title: 'دورة الفصل الأول',
        subject: 'اللغة الإنجليزية',
        teacher: 'أ. رندة فضيلي',
        is_live: true,
        is_recorded: true,
        time: '20:00 - 23:00',
        lessons_count: 8,
        exercises_count: 12,
        progress_current: 12,
        progress_total: 25,
        price: 50,
        color: 'from-green-400 to-emerald-500',
        image: 'https://ui-avatars.com/api/?name=Randa&background=random'
      }
    ]
  };

  return NextResponse.json({
    status: 200,
    message: 'success',
    code: 'SUCCESS',
    isSuccess: true,
    data: mockCoursesData
  });
}
