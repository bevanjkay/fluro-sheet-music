"use client";

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
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
  const initializedToken = useRef<string>("");

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = useCallback(() => {
    setUser({ token: "", refreshToken: "" });
    setIsLoading(false);
    initializedToken.current = "";
  }, [setUser]);

  // Check authentication only when token actually changes
  useEffect(() => {
    if (initializedToken.current === user.token) {
      return; // Skip if token hasn't changed
    }

    initializedToken.current = user.token;

    const checkAuth = async () => {
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
              // Update token
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
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.token, user.refreshToken]); // Don't include user object to avoid infinite loop

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