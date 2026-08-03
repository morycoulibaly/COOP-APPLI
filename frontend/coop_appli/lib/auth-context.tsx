"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, tokenStorage } from "./api";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USER_KEY = "coopappli_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = tokenStorage.get();
    const storedUser = localStorage.getItem(USER_KEY);
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, newUser: User) => {
    tokenStorage.save(token);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    tokenStorage.clear();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
}