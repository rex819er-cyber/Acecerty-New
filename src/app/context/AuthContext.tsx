import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiLogin, apiRegister, apiGetMe, storeStudentToken, clearStudentToken, getStudentToken } from '../lib/api';
import type { ApiUser } from '../lib/api';

interface AuthState {
  user: ApiUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<ApiUser>;
  register: (fullName: string, email: string, password: string) => Promise<ApiUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, token: getStudentToken(), loading: true, isAuthenticated: false,
  });

  /* Restore session on mount */
  useEffect(() => {
    const token = getStudentToken();
    if (!token) { setState(s => ({ ...s, loading: false })); return; }
    apiGetMe()
      .then(user => setState({ user, token, loading: false, isAuthenticated: true }))
      .catch(() => { clearStudentToken(); setState({ user: null, token: null, loading: false, isAuthenticated: false }); });
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<ApiUser> => {
    const { token, user } = await apiLogin(email, password);
    storeStudentToken(token);
    setState({ user, token, loading: false, isAuthenticated: true });
    return user;
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string): Promise<ApiUser> => {
    const { token, user } = await apiRegister(fullName, email, password);
    storeStudentToken(token);
    setState({ user, token, loading: false, isAuthenticated: true });
    return user;
  }, []);

  const logout = useCallback(() => {
    clearStudentToken();
    setState({ user: null, token: null, loading: false, isAuthenticated: false });
  }, []);

  return <AuthContext.Provider value={{ ...state, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
