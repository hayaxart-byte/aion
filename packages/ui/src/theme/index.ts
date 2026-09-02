export const themeColors = {
  primary: {
    DEFAULT: 'hsl(211 100% 40%)',
    foreground: 'hsl(0 0% 100%)',
  },
  secondary: {
    DEFAULT: 'hsl(210 40% 96%)',
    foreground: 'hsl(222 47% 11%)',
  },
  accent: {
    DEFAULT: 'hsl(210 40% 96%)',
    foreground: 'hsl(222 47% 11%)',
  },
  muted: {
    DEFAULT: 'hsl(210 40% 96%)',
    foreground: 'hsl(215 16% 47%)',
  },
  destructive: {
    DEFAULT: 'hsl(0 65% 50%)',
    foreground: 'hsl(0 0% 100%)',
  },
  success: {
    DEFAULT: 'hsl(142 50% 42%)',
    foreground: 'hsl(0 0% 100%)',
  },
  warning: {
    DEFAULT: 'hsl(38 92% 50%)',
    foreground: 'hsl(0 0% 100%)',
  },
  background: 'hsl(210 20% 98%)',
  foreground: 'hsl(222 47% 11%)',
  card: 'hsl(0 0% 100%)',
  cardForeground: 'hsl(222 47% 11%)',
  border: 'hsl(220 14% 90%)',
  input: 'hsl(220 14% 90%)',
  ring: 'hsl(211 100% 40%)',
} as const;

export const themeRadii = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

export const themeShadows = {
  sm: '0 1px 3px 0 hsl(0 0% 0% / 0.04), 0 1px 2px -1px hsl(0 0% 0% / 0.06)',
  md: '0 4px 12px -2px hsl(0 0% 0% / 0.06), 0 2px 6px -1px hsl(0 0% 0% / 0.04)',
  lg: '0 12px 32px -8px hsl(0 0% 0% / 0.08), 0 4px 12px -2px hsl(0 0% 0% / 0.04)',
  xl: '0 24px 48px -12px hsl(0 0% 0% / 0.12), 0 8px 24px -4px hsl(0 0% 0% / 0.06)',
  '2xl': '0 32px 64px -16px hsl(0 0% 0% / 0.16)',
} as const;

export const themeBlurs = {
  sm: 'backdrop-blur-sm bg-white/80',
  md: 'backdrop-blur-md bg-white/70',
  lg: 'backdrop-blur-lg bg-white/60',
  xl: 'backdrop-blur-xl bg-white/50',
} as const;

export const themeAnimations = {
  'fade-in': 'animate-fade-in',
  'slide-up': 'animate-slide-up',
  'scale-in': 'animate-scale-in',
  'slide-in-right': 'animate-slide-in-right',
} as const;
