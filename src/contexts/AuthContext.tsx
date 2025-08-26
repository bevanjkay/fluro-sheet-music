"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getUserSession, refresh } from "@/lib/auth";
import { isAuthenticated } from "@/lib/helpers";

interface AuthContextType {
  user: User;
  setUser: (user: User) => void;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useLocalStorage<User>("_fluro_user", { token: "", refreshToken: "" });
  const [isLoading, setIsLoading] = useState(true);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser({ token: "", refreshToken: "" });
  };

  const checkAuth = useCallback(async () => {
    if (!user.token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await getUserSession(user);
      if (response.error && user.refreshToken) {
        try {
          const refreshResponse = await refresh(user.refreshToken);
          if (refreshResponse.token) {
            setUser({ ...user, token: refreshResponse.token });
          } else {
            logout();
          }
        } catch (refreshError) {
          console.error("Error refreshing token", refreshError);
          logout();
        }
      }
    } catch (sessionError) {
      console.error("Error fetching user session", sessionError);
      logout();
    }
    
    setIsLoading(false);
  }, [user, setUser]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    setUser,
    login,
    logout,
    isAuthenticated: isAuthenticated(user),
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}