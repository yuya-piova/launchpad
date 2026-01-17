'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // useStateの初期値として関数を渡す（Lazy initializer）ことで
  // useEffectを使わずに同期的に初期状態を決定し、警告を回避します
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // マウント時に一度だけ確認（ブラウザ環境のみで実行）
  useEffect(() => {
    const auth =
      typeof window !== 'undefined' ? sessionStorage.getItem('is_auth') : null;
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (password: string) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('is_auth', 'true');
        }
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
