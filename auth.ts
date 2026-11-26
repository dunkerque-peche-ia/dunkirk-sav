import crypto from 'crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'dunkirk_sav_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 jours

function getAuthSecret(): string {
  return process.env.AUTH_SECRET || process.env.APP_ACCESS_PASSWORD || 'fallback-dev-secret';
}

export function isAuthEnabled(): boolean {
  return Boolean(process.env.APP_ACCESS_PASSWORD && process.env.APP_ACCESS_PASSWORD.trim().length > 0);
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.APP_ACCESS_PASSWORD;
  if (!expected) return true;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `sav-auth:${expiresAt}`;
  const sig = crypto
    .createHmac('sha256', getAuthSecret())
    .update(payload)
    .digest('hex');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!isAuthEnabled()) return true;
  if (!token) return false;

  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return false;

  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);

  const expectedSig = crypto
    .createHmac('sha256', getAuthSecret())
    .update(payload)
    .digest('hex');

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  const parts = payload.split(':');
  const expiresAt = parseInt(parts[1] || '0', 10);
  if (!expiresAt || Math.floor(Date.now() / 1000) > expiresAt) {
    return false;
  }

  return true;
}

export function isRequestAuthenticated(): boolean {
  if (!isAuthEnabled()) return true;
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
