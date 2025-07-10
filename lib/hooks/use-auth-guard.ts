"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";

/**
 * 认证守卫 Hook
 * 用于保护需要登录的路由
 */
export const useAuthGuard = (options?: {
  redirectTo?: string;
  requireAuth?: boolean;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isLoadingInitAuth, isHydrated } =
    useAuthStore();
  // 路由守卫只关心认证状态初始化，不关心具体业务操作（如登录/注册）
  const isLoading = isLoadingInitAuth;

  const { redirectTo = "/login", requireAuth = true } = options || {};

  useEffect(() => {
    // 如果状态还未水合完成，先初始化认证状态
    if (!isHydrated) {
      console.log("⏳ 等待认证状态水合完成...");
      return;
    }

    // 如果正在加载认证状态，不做任何操作
    if (isLoading) {
      return;
    }

    // 如果需要认证但用户未登录
    if (requireAuth && !isAuthenticated) {
      console.log("🔒 未登录用户尝试访问受保护页面:", pathname);

      // 保存当前路径，登录后可以重定向回来
      const returnUrl = encodeURIComponent(pathname);
      const loginUrl = `${redirectTo}?returnUrl=${returnUrl}`;

      router.replace(loginUrl);
      return;
    }

    // 如果不需要认证但用户已登录（例如登录页面）
    if (!requireAuth && isAuthenticated) {
      console.log("✅ 已登录用户访问公开页面，重定向到后台");

      // 检查是否有 returnUrl 参数
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get("returnUrl");

      if (returnUrl) {
        console.log(
          "🔄 检测到 returnUrl，重定向到:",
          decodeURIComponent(returnUrl)
        );
        router.replace(decodeURIComponent(returnUrl));
      } else {
        router.replace("/dashboard");
      }
      return;
    }

    console.log("✅ 路由访问权限验证通过:", pathname);
  }, [
    isAuthenticated,
    isLoading,
    isHydrated,
    pathname,
    router,
    redirectTo,
    requireAuth,
  ]);

  // 计算是否应该显示内容
  const shouldShowContent = () => {
    // 如果状态还未水合完成，不显示内容
    if (!isHydrated) {
      return false;
    }

    // 如果正在加载，不显示内容
    if (isLoading) {
      return false;
    }

    // 如果需要认证且用户已认证，显示内容
    if (requireAuth && isAuthenticated) {
      return true;
    }

    // 如果不需要认证且用户未认证，显示内容
    if (!requireAuth && !isAuthenticated) {
      return true;
    }

    // 其他情况（需要重定向）不显示内容
    return false;
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    isAuthorized: shouldShowContent(),
  };
};

/**
 * 检查路径是否需要认证
 */
export const isProtectedRoute = (pathname: string): boolean => {
  // 定义需要认证的路径模式
  const protectedPatterns = [
    "/dashboard",
    "/admin",
    "/users",
    "/settings",
    "/profile",
    "/storage",
    "/stats",
  ];

  return protectedPatterns.some((pattern) => pathname.startsWith(pattern));
};

/**
 * 检查路径是否为公开路由（已登录用户不应访问）
 */
export const isPublicOnlyRoute = (pathname: string): boolean => {
  // 定义只有未登录用户才能访问的路径
  const publicOnlyPatterns = ["/login", "/register", "/forgot-password"];

  return publicOnlyPatterns.some((pattern) => pathname.startsWith(pattern));
};

