import { createHash } from 'crypto';

interface VerificationEntry {
  email: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  used: boolean;
}

const CODES = new Map<string, VerificationEntry>();

const CODE_TTL = 10 * 60 * 1000;
const RESEND_COOLDOWN = 60 * 1000;
const MAX_ATTEMPTS = 5;

function hashCode(code: string, email: string): string {
  return createHash('sha256').update(`${code}:${email}`).digest('hex');
}

function key(email: string): string {
  return email.toLowerCase().trim();
}

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeCode(email: string, code: string): boolean {
  const k = key(email);
  const now = Date.now();
  const existing = CODES.get(k);

  if (existing && now - existing.lastSentAt < RESEND_COOLDOWN) {
    return false;
  }

  CODES.set(k, {
    email: k,
    codeHash: hashCode(code, email),
    expiresAt: now + CODE_TTL,
    attempts: 0,
    lastSentAt: now,
    used: false,
  });

  return true;
}

export function verifyCode(email: string, code: string): 'ok' | 'expired' | 'invalid' | 'used' | 'blocked' {
  const k = key(email);
  const entry = CODES.get(k);
  if (!entry) return 'invalid';
  if (entry.used) return 'used';
  if (Date.now() > entry.expiresAt) {
    CODES.delete(k);
    return 'expired';
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    CODES.delete(k);
    return 'blocked';
  }

  entry.attempts += 1;

  if (entry.codeHash !== hashCode(code, email)) {
    return 'invalid';
  }

  entry.used = true;
  return 'ok';
}

export function cleanupExpired(): void {
  const now = Date.now();
  for (const [k, v] of CODES) {
    if (now > v.expiresAt || v.used) CODES.delete(k);
  }
}
