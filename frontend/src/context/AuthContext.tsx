import React, { createContext, useContext, useState, useEffect } from 'react';
import { type AppRole } from '../shared/config/roleConfig';

const AUTH_SESSION_KEY = 'auth_session';
const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';

export type Role = AppRole;

export interface User {
  id: number | string;
  name: string;
  role: Role;
  username?: string;
  email?: string;
}

interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

type SessionLike = {
  user?: unknown;
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
    access_token?: string;
    refresh_token?: string;
  };
  session?: SessionLike;
};

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (sessionData: AuthSession) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  return value as Record<string, unknown>;
}

function pickToken(...candidates: unknown[]): string | null {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }
  return null;
}

function normalizeStoredSession(raw: string): AuthSession | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const root = asRecord(parsed) as SessionLike | null;
  if (!root) return null;

  const nestedSession = asRecord(root.session) as SessionLike | null;
  const source = nestedSession ?? root;
  const tokens = asRecord(source.tokens) as SessionLike['tokens'] | null;

  const accessToken = pickToken(
    source.accessToken,
    source.access_token,
    tokens?.accessToken,
    tokens?.access_token,
    root.accessToken,
    root.access_token
  );
  const refreshToken = pickToken(
    source.refreshToken,
    source.refresh_token,
    tokens?.refreshToken,
    tokens?.refresh_token,
    root.refreshToken,
    root.refresh_token
  );

  if (!accessToken || !refreshToken) {
    return null;
  }

  const userSource = asRecord(source.user) ?? asRecord(root.user);
  if (!userSource) {
    return null;
  }

  const id = userSource.id;
  const role = userSource.role;
  const nameCandidate = userSource.name ?? userSource.full_name ?? userSource.username;

  if ((typeof id !== 'number' && typeof id !== 'string') || typeof role !== 'string' || typeof nameCandidate !== 'string') {
    return null;
  }

  return {
    user: {
      id,
      role: role as Role,
      name: nameCandidate,
      username: typeof userSource.username === 'string' ? userSource.username : undefined,
      email: typeof userSource.email === 'string' ? userSource.email : undefined,
    },
    accessToken,
    refreshToken,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem(AUTH_SESSION_KEY);
    if (savedSession) {
      const parsed = normalizeStoredSession(savedSession);
      if (parsed) {
        setSession(parsed);
        setUser(parsed.user);
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(parsed));
      } else {
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
    }

    const handleSessionExpired = () => {
      setUser(null);
      setSession(null);
      localStorage.removeItem(AUTH_SESSION_KEY);
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    setLoading(false);

    return () => {
      window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  const login = (sessionData: AuthSession) => {
    setSession(sessionData);
    setUser(sessionData.user);
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData));
  };

  const logout = () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem(AUTH_SESSION_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        accessToken: session?.accessToken || null,
        refreshToken: session?.refreshToken || null,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
