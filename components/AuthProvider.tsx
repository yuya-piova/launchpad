'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Contextの型定義
interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
}

// Contextの作成
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
});

// Providerコンポーネントのエクスポート
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('is_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const login = async (password: string) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setIsAuthenticated(true);
      sessionStorage.setItem('is_auth', 'true');
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hookのエクスポート
export const useAuth = () => useContext(AuthContext);
