'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { MedplumClient } from '@aion/vendor-medplum';
import type { User, UserRole } from '@aion/domain';
import { login as authLogin, logout as authLogout, getCurrentUserAsync, getMedplumBaseUrl } from './auth-service';
import { getAccessToken as getSharedAccessToken } from '@aion/medplum-client';
import { detectRoles, getPrimaryRoleLabel } from './utils';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  client: MedplumClient;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
  hasRole: (...roles: UserRole[]) => boolean;
  getPrimaryRoleLabel: (roles: UserRole[]) => string;
}

function setRoleCookie(user: User | null) {
  try {
    if (user?.roles?.length) {
      const roleStr = [...new Set(user.roles)].join(',');
      document.cookie = `aion_role=${roleStr}; path=/; max-age=86400; SameSite=Lax`;
    } else {
      document.cookie = `aion_role=; path=/; max-age=0; SameSite=Lax`;
    }
  } catch {}
}

const AuthContext = createContext<AuthContextType | null>(null);

const IS_DEV = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG === 'development';

export function AuthProvider({
  children,
  storagePrefix = 'medplum:',
}: {
  children: ReactNode;
  storagePrefix?: string;
}) {
  const [client] = useState(() => new MedplumClient({
    baseUrl: getMedplumBaseUrl(),
    clientId: '8fea6f91-d2dc-4892-975c-948bb4d47c6c',
    tokenUrl: 'api/oauth2/token',
    storagePrefix,
  }));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasSession = !!client.getActiveLogin() && !!client.getAccessToken();

    if (IS_DEV) {
      console.log('[Auth] Init. Has session:', hasSession, 'prefix:', storagePrefix);
    }

    if (hasSession) {
      getCurrentUserAsync(client)
        .then((u) => {
          if (u) {
            if (IS_DEV) {
              console.log('[Auth] Session restored:', u.name, u.roles);
            }
            setUser(u);
            setRoleCookie(u);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      if (IS_DEV) {
        console.log('[Auth] Login:', email);
      }
      const u = await authLogin(client, email, password);
      setUser(u);
      try {
        document.cookie = `aion_auth=true; path=/; max-age=86400; SameSite=Lax`;
      } catch {}
      setRoleCookie(u);
    },
    [client],
  );

  const logout = useCallback(async () => {
    await authLogout(client);
    setUser(null);
    try {
      document.cookie = `aion_auth=; path=/; max-age=0; SameSite=Lax`;
    } catch {}
    setRoleCookie(null);
  }, [client]);

  const getAccessToken = useCallback((): string | null => {
    return getSharedAccessToken(client, storagePrefix);
  }, [client, storagePrefix]);

  const hasRoleFn = useCallback(
    (...roles: UserRole[]): boolean => {
      if (!user) return false;
      return roles.some((r) => user.roles.includes(r));
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        client,
        login,
        logout,
        getAccessToken,
        hasRole: hasRoleFn,
        getPrimaryRoleLabel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}