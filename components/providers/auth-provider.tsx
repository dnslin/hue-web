"use client";

import { useEffect, ReactNode, useState } from "react";
import { useAuthStore } from "@/lib/store/auth";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 全局认证提供者组件
 * 负责在应用启动时初始化认证状态
 * 优化了 SSR 水合兼容性
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth, isHydrated, setHydrated } = useAuthStore();
  const [isClientSide, setIsClientSide] = useState(false);

  // 确保只在客户端执行
  useEffect(() => {
    setIsClientSide(true);
  }, []);

  useEffect(() => {
    // 确保在客户端且状态已水合后才初始化认证
    if (isClientSide && !isHydrated) {
      // 如果状态尚未水合，先设置为已水合
      console.log("🔧 AuthProvider: 设置水合状态");
      setHydrated();
    }
  }, [isClientSide, isHydrated, setHydrated]);

  useEffect(() => {
    // 在状态水合完成后初始化认证状态
    if (isClientSide && isHydrated) {
      console.log("🚀 AuthProvider: 开始初始化认证状态");
      initializeAuth();
    }
  }, [isClientSide, isHydrated, initializeAuth]);

  // 在服务端或水合未完成时，直接渲染子组件
  // 避免在服务端执行认证逻辑
  return <>{children}</>;
}