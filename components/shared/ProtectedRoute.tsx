"use client";

import React from "react";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

/**
 * 路由保护组件
 * 用于包装需要认证的页面
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/login",
  requireAuth = true,
  fallback,
}) => {
  const { isLoading, isAuthorized } = useAuthGuard({
    redirectTo,
    requireAuth,
  });

  // 显示加载状态
  if (isLoading) {
    return (
      fallback || (
        <div className="flex flex-col space-y-4 p-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[160px]" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      )
    );
  }

  // 如果未授权，不渲染任何内容（重定向会在 useAuthGuard 中处理）
  if (!isAuthorized) {
    return null;
  }

  // 渲染受保护的内容
  return <>{children}</>;
};

/**
 * 高阶组件版本的路由保护
 */
export const withAuthGuard = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    requireAuth?: boolean;
    fallback?: React.ReactNode;
  }
) => {
  const WrappedComponent = (props: P) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  WrappedComponent.displayName = `withAuthGuard(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};
