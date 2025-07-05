"use client";

import { useEffect, ReactNode } from "react";
import { useAuthStore } from "@/lib/store/auth-store";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 全局认证提供者组件
 * 负责在应用启动时初始化认证状态
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth, isHydrated, setHydrated } = useAuthStore();

  useEffect(() => {
    // 确保在客户端且状态已水合后才初始化认证
    if (typeof window !== "undefined" && !isHydrated) {
      // 如果状态尚未水合，先设置为已水合
      setHydrated();
    }
  }, [isHydrated, setHydrated]);

  useEffect(() => {
    // 在状态水合完成后初始化认证状态
    if (isHydrated) {
      console.log("🚀 AuthProvider: 开始初始化认证状态");
      initializeAuth();
    }
  }, [isHydrated, initializeAuth]);

  return <>{children}</>;
}