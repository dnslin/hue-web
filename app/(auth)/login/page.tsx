"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import AuthLayout from "@/components/layouts/auth-layout";
import { useAuthStore } from "@/lib/store/auth-store";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { ProtectedRoute } from "@/components/shared/protected-route";

// 登录表单验证模式
const loginSchema = z.object({
  username_or_email: z.string().min(1, "请输入用户名或邮箱"),
  password: z.string().min(1, "请输入密码"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  
  // 添加调试信息
  React.useEffect(() => {
    console.log("🔍 登录页面状态:", { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);

  // 设置表单
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // 提交表单
  const onSubmit = async (data: LoginFormValues) => {
    clearError();
    const success = await login(data.username_or_email, data.password);
    if (success) {
      // 检查是否有 returnUrl 参数
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get('returnUrl');
      
      if (returnUrl) {
        console.log("🔄 登录成功，重定向到 returnUrl:", decodeURIComponent(returnUrl));
        router.push(decodeURIComponent(returnUrl));
      } else {
        console.log("🔄 登录成功，重定向到默认页面");
        router.push("/dashboard");
      }
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <AuthLayout title="登录" subtitle="欢迎回来，请登录您的账号">
        <div className="space-y-6">
          {/* 错误提示 */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="username_or_email"
                className="text-sm font-medium text-foreground"
              >
                用户名或邮箱
              </label>
              <Input
                id="username_or_email"
                type="text"
                placeholder="请输入用户名或邮箱"
                className={errors.username_or_email ? "border-destructive" : ""}
                {...register("username_or_email")}
                autoComplete="username"
                onChange={() => error && clearError()}
              />
              {errors.username_or_email && (
                <p className="text-xs text-destructive">
                  {errors.username_or_email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                密码
              </label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                className={errors.password ? "border-destructive" : ""}
                {...register("password")}
                autoComplete="current-password"
                onChange={() => error && clearError()}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <ShimmerButton
                type="submit"
                className="w-full text-white dark:text-white"
                disabled={isLoading}
                borderRadius="10px"
              >
                {isLoading ? "登录中..." : "登录"}
              </ShimmerButton>
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            还没有账号？
            <Link
              href="/register"
              className="ml-1 font-medium text-primary hover:underline"
            >
              注册账号
            </Link>
          </p>
        </div>
      </AuthLayout>
    </ProtectedRoute>
  );
}
