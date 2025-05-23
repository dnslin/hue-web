"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isAdminRoute } from "@/lib/utils/layout-utils";
import { MainLayout } from "./main-layout";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

/**
 * 条件性布局组件
 * 根据当前路径选择合适的布局包装器
 */
export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // 处理 SSR 兼容性
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 在服务端渲染期间，默认使用前台布局避免闪烁
  if (!isClient) {
    return <MainLayout>{children}</MainLayout>;
  }

  // 客户端渲染时根据路径选择布局
  const isAdmin = isAdminRoute(pathname);

  if (isAdmin) {
    // 管理后台路由：直接渲染 children，不使用 MainLayout
    // AdminLayout 会在 app/(admin)/layout.tsx 中应用
    return <>{children}</>;
  }

  // 前台路由：使用 MainLayout 包装
  return <MainLayout>{children}</MainLayout>;
}
