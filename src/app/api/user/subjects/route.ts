import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay

  return NextResponse.json({
    status: 200,
    message: 'success',
    data: [
      { id: 'arabic', name: 'اللغة العربية', icon: '/home/section.png' },
      { id: 'french', name: 'اللغة الفرنسية', icon: '/home/section.png' },
      { id: 'english', name: 'اللغة الإنجليزية', icon: '/home/lean english.png' },
      { id: 'physics', name: 'الفيزياء', icon: '/home/section.png' },
    ]
  });
}
