"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role, Permission, hasPermission, ROLE_PERMISSIONS } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: Role | Role[]) => boolean;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user session
    const savedUser = localStorage.getItem("his_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Default to ADMIN for development purposes if nothing is set
      const defaultUser: User = {
        id: "1",
        name: "Admin User",
        role: "ADMIN"
      };
      setUser(defaultUser);
      localStorage.setItem("his_user", JSON.stringify(defaultUser));
    }
    setIsLoading(false);
  }, []);

  const login = (role: Role) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${role.charAt(0) + role.slice(1).toLowerCase()} User`,
      role: role
    };
    setUser(newUser);
    localStorage.setItem("his_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("his_user");
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
      logout
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
