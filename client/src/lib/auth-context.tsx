"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginUser as apiLogin, registerUser as apiRegister } from "./api";
import { toast } from "sonner";

interface AuthState {
  token: string | null;
  username: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("username");
    const storedIsAdmin = localStorage.getItem("isAdmin") === "true";
    if (storedToken) {
      setToken(storedToken);
      setUsername(storedUser);
      setIsAdmin(storedIsAdmin);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin({ username, password });
    const { token: jwt, is_admin } = res.data;
    localStorage.setItem("token", jwt);
    localStorage.setItem("username", username);
    localStorage.setItem("isAdmin", is_admin ? "true" : "false");
    setToken(jwt);
    setUsername(username);
    setIsAdmin(!!is_admin);
    toast.success("Welcome back!", { description: `Logged in as ${username}` });
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await apiRegister({ username, email, password });
      toast.success("Registration successful!", {
        description: "You can now log in with your credentials.",
      });
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    setToken(null);
    setUsername(null);
    setIsAdmin(false);
    toast("Logged out", { description: "See you next time!" });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        isAdmin,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
