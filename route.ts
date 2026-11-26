import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  isAuthEnabled,
  isRequestAuthenticated,
  verifyPassword,
} from '@/lib/auth';

export async function GET() {
  return NextResponse.json({
    authenticated: isRequestAuthenticated(),
    authRequired: isAuthEnabled(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe incorrect.' },
        { status: 401 }
      );
    }

    const token = createSessionToken();
    const res = NextResponse.json({ success: true, authenticated: true });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
    });

    return res;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Requête invalide.' },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, authenticated: false });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
