'use client';

import type { ReactNode } from 'react';
import { AuthProvider as SharedAuthProvider, useAuth as useSharedAuth } from '@aion/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SharedAuthProvider storagePrefix="medplum:patient:">{children}</SharedAuthProvider>;
}

export const useAuth = useSharedAuth;