export async function sendEmailVerification(email: string): Promise<{ success: boolean }> {
  const res = await fetch('/api/onboarding/send-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Error al enviar código');
  }
  return res.json();
}

export async function verifyEmailCode(email: string, code: string): Promise<{ success: boolean }> {
  const res = await fetch('/api/onboarding/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Código inválido');
  }
  return res.json();
}

/** @deprecated Replaced by email verification. Kept for reference. */
export async function sendOtpCode(phone: string, channel: 'sms' | 'whatsapp'): Promise<{ success: boolean }> {
  throw new Error('OTP por teléfono/WhatsApp fue reemplazado por verificación por email');
}

/** @deprecated Replaced by email verification. Kept for reference. */
export async function verifyOtpCode(phone: string, code: string): Promise<{ success: boolean }> {
  throw new Error('OTP por teléfono/WhatsApp fue reemplazado por verificación por email');
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await res.json();
    if (data?.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return data?.display_name ?? null;
  } catch {
    return null;
  }
}
