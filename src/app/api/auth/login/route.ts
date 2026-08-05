import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const apiUrl = 'https://mrstudy.net/api';
    
    const response = await fetch(`${apiUrl}/user/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Device-Id': request.headers.get('x-device-id') || '',
        'X-Device-Class': request.headers.get('x-device-class') || 'desktop',
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', isSuccess: false }, { status: 500 });
  }
}
