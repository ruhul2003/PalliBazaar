"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export interface UserType {
  id: string;
  name: string;
  email: string;
  role: "customer" | "seller" | "admin";
  profilePicture?: string;
  phoneNumber?: string;
  addresses?: any[];
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: string) => Promise<{ success: boolean; message?: string; debugVerificationLink?: string; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshSession = async () => {
    try {
      const { data: session } = await authClient.getSession();
      if (session) {
        setUser({
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: (session.user as any).role || "customer",
          profilePicture: (session.user as any).profilePicture || session.user.image || undefined,
          phoneNumber: (session.user as any).phoneNumber || undefined,
        });
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Authentication check failed:", e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      });
      if (error) {
        return { success: false, error: error.message || "Login failed" };
      }
      await refreshSession();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "An error occurred during login" };
    }
  };

  const signup = async (name: string, email: string, password: string, role: string) => {
    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        role,
      });
      if (error) {
        return { success: false, error: error.message || "Signup failed" };
      }
      await refreshSession();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "An error occurred during signup" };
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
      setUser(null);
      router.push("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshSession }}>
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
