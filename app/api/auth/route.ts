import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();
  if (password === process.env.APP_PASSWORD) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}
