"use client";

import React from "react";
import { useAuth } from "./auth-provider";
import { Role, Permission } from "@/lib/auth";

interface ProtectedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  role?: Role | Role[];
  permission?: Permission | Permission[];
}

export function Protected({ children, fallback = null, role, permission }: ProtectedProps) {
  const { hasRole, hasPermission, isLoading } = useAuth();

  if (isLoading) return null;

  let isAuthorized = true;

  if (role) {
    isAuthorized = hasRole(role);
  }

  if (isAuthorized && permission) {
    if (Array.isArray(permission)) {
      isAuthorized = permission.every(p => hasPermission(p));
    } else {
      isAuthorized = hasPermission(permission);
    }
  }

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
