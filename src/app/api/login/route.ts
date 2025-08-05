import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  // Contoh autentikasi sederhana
  if (username === 'admin' && password === 'password123') {
    return NextResponse.json({ success: true, message: 'Login berhasil' });
  } else {
    return NextResponse.json({ success: false, message: 'Username/password salah' }, { status: 401 });
  }
}