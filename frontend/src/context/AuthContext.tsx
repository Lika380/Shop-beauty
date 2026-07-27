import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import { getToken, setToken, setUnauthorizedHandler } from '../api/client';
import type { RegisterStepResponse, User } from '../types';

function decodeUserFromToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.user_id || !payload.role) return null;
    return { id: payload.user_id, email: payload.email ?? '', role: payload.role };
  } catch {
    return null;
  }
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<RegisterStepResponse>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<RegisterStepResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function initialUser(): User | null {
  const token = getToken();
  if (!token) return null;
  const user = decodeUserFromToken(token);
  if (!user) {
    setToken(null);
    return null;
  }
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(initialUser);
  const navigate = useNavigate();

  const applyAuth = useCallback((token: string, apiUser?: User) => {
    setToken(token);
    setUser(apiUser ?? decodeUserFromToken(token));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      navigate('/login');
    });
    return () => setUnauthorizedHandler(null);
  }, [logout, navigate]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      applyAuth(res.token, res.user);
    },
    [applyAuth],
  );

  const register = useCallback((email: string, password: string) => authApi.register(email, password), []);

  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      const res = await authApi.verify(email, code);
      applyAuth(res.token, res.user);
    },
    [applyAuth],
  );

  const resendVerification = useCallback((email: string) => authApi.resendVerification(email), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      register,
      verifyEmail,
      resendVerification,
      logout,
    }),
    [user, login, register, verifyEmail, resendVerification, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
