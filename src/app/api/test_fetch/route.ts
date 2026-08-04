export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const email = 'john.doe@0example.com';
    const password = 'password'; // Or try 12345678
    
    // Login as the student
    const loginRes = await fetch('https://mrstudy.net/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email, // Wait, the student login uses phone or email?
        // In AuthController, let's check what it uses. Usually 'phone' or 'email'
        // I will try 'email' first. Wait, maybe the endpoint is /auth/login?
      })
    });
    // Wait, let's look at web.php: Route::post('/login', [PagesContoller::class,'telescopeLogin']);
    // Wait, the user API login route is probably /api/login or /api/auth/login.
    
    return NextResponse.json({ error: 'Check code' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
