import React, { createContext, useContext, useState, useEffect } from 'react';
import { type AppRole } from '../shared/config/roleConfig';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem('auth_session');
    if (savedSession) {
      const parsed = JSON.parse(savedSession) as AuthSession;
      setSession(parsed);
      setUser(parsed.user);
    }
    setLoading(false);
  }, []);

  const login = (sessionData: AuthSession) => {
    setSession(sessionData);
    setUser(sessionData.user);
    localStorage.setItem('auth_session', JSON.stringify(sessionData));
  };

  const logout = () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('auth_session');
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
