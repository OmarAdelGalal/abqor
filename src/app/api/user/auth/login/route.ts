import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simulate invalid credentials error if password is '123456'
    if (body.password === '123456') {
      return NextResponse.json({
        status: 400,
        message: 'Invalid credentials',
        data: null,
        code: 'INVALID_CREDENTIALS',
        isSuccess: false
      }, { status: 400 });
    }

    // Simulate successful login
    return NextResponse.json({
      status: 200,
      message: 'success',
      code: 'SUCCESS',
      isSuccess: true,
      data: {
        token: '7|zFQwKcLwv0FLVwxBzdek28X1ia0w2QEK8TExNvKb2ffcc636',
        name: body.email.split('@')[0] || 'John Doe',
        email: body.email,
        role: 'student',
        id: 8,
        student: {
          id: 6,
          gender: 'male',
          education: 'Primary',
          state: 'Damascus',
          health: 10,
          diamonds: 50,
          flame: 5
        }
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: 'Internal server error',
      data: null,
      code: 'SERVER_ERROR',
      isSuccess: false
    }, { status: 500 });
  }
}
