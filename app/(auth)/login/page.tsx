"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/layouts/auth-layout";
import { useAuthStore } from "@/lib/store/auth-store";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { ForgotPasswordDialog } from "@/components/auth/forgot-password-dialog";

// 登录表单验证模式
const loginSchema = z.object({
  username_or_email: z.string().min(1, "请输入用户名或邮箱"),
  password: z.string().min(1, "请输入密码"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoadingLogin, error, clearError, isAuthenticated } =
    useAuthStore();

  // 添加调试信息
  React.useEffect(() => {
    console.log("🔍 登录页面状态:", { isAuthenticated, isLoadingLogin });
  }, [isAuthenticated, isLoadingLogin]);

  // 登录表单
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // 提交登录表单
  const onLoginSubmit = async (data: LoginFormValues) => {
    clearError();
    const success = await login(data.username_or_email, data.password);
    if (success) {
      // 检查是否有 returnUrl 参数
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get("returnUrl");

      if (returnUrl) {
        console.log(
          "🔄 登录成功，重定向到 returnUrl:",
          decodeURIComponent(returnUrl)
        );
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
              className="relative rounded-lg bg-gradient-to-r from-destructive/10 via-destructive/15 to-destructive/10 border border-destructive/20 p-4 text-sm text-destructive"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                <span className="font-medium">{error}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-destructive/5 to-transparent rounded-lg" />
            </motion.div>
          )}

          <form
            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
            className="space-y-4"
          >
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
                className={`transition-all duration-300 text-base sm:text-sm min-h-[48px] sm:min-h-[36px] focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  loginForm.formState.errors.username_or_email
                    ? "border-destructive ring-destructive/20"
                    : "focus:shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]"
                }`}
                {...loginForm.register("username_or_email")}
                autoComplete="username"
                onChange={() => error && clearError()}
              />
              {loginForm.formState.errors.username_or_email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive flex items-center gap-1"
                >
                  <span className="w-1 h-1 bg-destructive rounded-full" />
                  {loginForm.formState.errors.username_or_email.message}
                </motion.p>
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
                className={`transition-all duration-300 text-base sm:text-sm min-h-[48px] sm:min-h-[36px] focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                  loginForm.formState.errors.password
                    ? "border-destructive ring-destructive/20"
                    : "focus:shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]"
                }`}
                {...loginForm.register("password")}
                autoComplete="current-password"
                onChange={() => error && clearError()}
              />
              {loginForm.formState.errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive flex items-center gap-1"
                >
                  <span className="w-1 h-1 bg-destructive rounded-full" />
                  {loginForm.formState.errors.password.message}
                </motion.p>
              )}
            </div>

            <div className="pt-2">
              <ShimmerButton
                type="submit"
                className="w-full text-white dark:text-white"
                disabled={isLoadingLogin}
                borderRadius="10px"
              >
                {isLoadingLogin ? "登录中..." : "登录"}
              </ShimmerButton>
            </div>
          </form>

          {/* 忘记密码链接 */}
          <div className="text-center">
            <ForgotPasswordDialog>
              <Button
                variant="link"
                className="group relative px-0 text-sm text-muted-foreground hover:text-primary h-auto transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10 transition-colors duration-300">
                  忘记密码？
                </span>
                <div className="absolute inset-0 -z-10 rounded-md bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute -bottom-1 left-1/2 h-0.5 w-0 bg-gradient-to-r from-primary/60 via-primary to-primary/60 transition-all duration-300 -translate-x-1/2 group-hover:w-full" />
              </Button>
            </ForgotPasswordDialog>
          </div>

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
