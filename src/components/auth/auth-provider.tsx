"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role, Permission, hasPermission } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: Role | Role[]) => boolean;
  login: (role: Role) => void; // Keep for mock/dev
  logout: () => void;
  realLogin: (user: User) => void;
  realLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session fetch failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSession();
  }, []);

  const realLogin = (userData: User) => {
    setUser(userData);
  };

  const realLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Keep mock login for the header role switcher dev tool
  const login = (role: Role) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${role.charAt(0) + role.slice(1).toLowerCase()} User`,
      role: role
    };
    setUser(newUser);
  };

  const logout = () => {
    realLogout();
  };

  const checkPermission = (permission: Permission) => {
    if (!user) return false;
    return hasPermission(user, permission);
  };

  const checkRole = (role: Role | Role[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      hasPermission: checkPermission, 
      hasRole: checkRole,
      login,
      logout,
      realLogin,
      realLogout
    }}>
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
