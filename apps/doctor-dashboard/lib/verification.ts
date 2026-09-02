interface CodeEntry {
  code: string;
  expiresAt: number;
  attempts: number;
  used: boolean;
}

const store = new Map<string, CodeEntry>();

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendVerificationCode(email: string): Promise<'ok' | 'rate-limited'> {
  const normalized = email.toLowerCase().trim();
  const existing = store.get(normalized);

  if (existing && existing.expiresAt > Date.now() - 55000) {
    return 'rate-limited';
  }

  const code = generateCode();
  store.set(normalized, {
    code,
    expiresAt: Date.now() + 600_000,
    attempts: 0,
    used: false,
  });

  const prefix = process.env.NODE_ENV === 'development' ? '🔐 [DEV]' : '📧';
  console.log(`${prefix} Verification code for ${normalized}: ${code}`);

  return 'ok';
}

export async function verifyEmailCode(
  email: string,
  code: string,
): Promise<'ok' | 'expired' | 'used' | 'blocked' | 'invalid'> {
  const normalized = email.toLowerCase().trim();
  const entry = store.get(normalized);

  if (!entry) return 'invalid';
  if (entry.used) return 'used';
  if (Date.now() > entry.expiresAt) return 'expired';
  if (entry.attempts >= 5) return 'blocked';

  entry.attempts += 1;

  if (entry.code !== code) {
    if (entry.attempts >= 5) {
      store.delete(normalized);
    }
    return 'invalid';
  }

  entry.used = true;
  return 'ok';
}
