"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/lib/store/authStore";

// 定义保护路由组件的属性
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * 保护路由组件
 * 确保只有已认证的用户才能访问被保护的页面
 * 如果用户未登录，重定向到登录页
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const { loadUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 在组件挂载时检查认证状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 加载用户信息
        await loadUser();
        setIsAuthenticated(true);
      } catch (error) {
        // 认证失败，重定向到登录页
        console.error("认证失败:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [loadUser, router]);

  // 加载中显示空白
  if (isLoading) {
    return null; // 或者显示加载指示器
  }

  // 未认证不渲染内容
  if (!isAuthenticated) {
    return null;
  }

  // 认证成功，渲染子组件
  return <>{children}</>;
};

export default ProtectedRoute;
