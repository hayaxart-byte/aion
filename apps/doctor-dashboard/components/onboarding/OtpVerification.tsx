'use client';

import { useState, useRef, useCallback } from 'react';

interface OtpVerificationProps {
  email: string;
  onVerify: (code: string) => void;
  onResend: () => void;
}

export function OtpVerification({ email, onVerify, onResend }: OtpVerificationProps) {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const updateCode = useCallback(
    (newCode: string[]) => {
      setCode(newCode);
      if (newCode.every((d) => d !== '')) {
        onVerify(newCode.join(''));
      }
    },
    [onVerify]
  );

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    const newCode = [...code];
    newCode[index] = digit;
    updateCode(newCode);
    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newCode = [...code];
        digits.forEach((d, i) => { if (i < 6) newCode[i] = d; });
        updateCode(newCode);
        const nextIndex = Math.min(digits.length, 5);
        inputs.current[nextIndex]?.focus();
      });
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground text-center">
        Enviamos un código a <span className="font-medium text-foreground">{email}</span>
      </p>

      <div className="flex gap-2 justify-center">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={code[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="h-14 w-11 rounded-xl border border-input bg-background text-center text-lg font-semibold focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        ))}
      </div>

      <div className="text-center">
        <button onClick={onResend} className="text-sm text-primary hover:underline transition-colors">
          Reenviar código
        </button>
      </div>
    </div>
  );
}
