import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createToken, addAuditLog, checkRateLimit, recordFailedAttempt, resetFailedAttempts, sanitizeInput } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';

    // Rate limit check
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json({
        error: `Too many requests. Try again in ${rateCheck.retryAfter} seconds.`,
      }, { status: 429 });
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const sanitizedUser = sanitizeInput(username.substring(0, 100));

    if (!verifyCredentials(sanitizedUser, password)) {
      recordFailedAttempt(ip);
      addAuditLog({
        id: Date.now().toString(36),
        action: 'LOGIN_FAILED',
        details: `Failed login attempt for: ${sanitizedUser}`,
        ip,
        userAgent: req.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Success - reset attempts
    resetFailedAttempts(ip);
    const token = createToken(sanitizedUser);

    addAuditLog({
      id: Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      action: 'LOGIN_SUCCESS',
      details: `Successful login: ${sanitizedUser}`,
      ip,
      userAgent: req.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
    });

    const response = NextResponse.json({ success: true, username: sanitizedUser });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
