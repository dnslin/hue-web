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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AuthLayout from "@/components/layouts/auth-layout";
import { useAuthStore } from "@/lib/store/auth-store";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { Mail, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

// 注册表单验证模式
const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "用户名至少需要3个字符")
      .max(50, "用户名不能超过50个字符")
      .regex(/^[a-zA-Z0-9_-]+$/, "用户名只能包含字母、数字、下划线和连字符"),
    email: z.string().min(1, "请输入邮箱").email("请输入有效的邮箱地址"),
    password: z
      .string()
      .min(6, "密码至少需要6个字符")
      .max(100, "密码不能超过100个字符"),
    confirm_password: z.string().min(1, "请确认密码"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "两次输入的密码不一致",
    path: ["confirm_password"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register: registerUser,
    resendActivationEmail,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  // 状态管理
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  // 重发验证码冷却时间管理
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const onSubmit = async (data: RegisterFormValues) => {
    clearError();
    const success = await registerUser(
      data.username,
      data.email,
      data.password
    );
    if (success) {
      // 注册成功，显示激活提示
      setUserEmail(data.email);
      setIsRegistrationSuccess(true);
    }
  };

  // 重发激活邮件
  const handleResendActivation = async () => {
    if (resendCooldown > 0) return;

    clearError();
    try {
      const success = await resendActivationEmail(userEmail);
      if (success) {
        setResendCooldown(60); // 设置60秒冷却时间
      }
    } catch (err) {
      console.error("重发激活邮件失败:", err);
    }
  };

  // 返回注册表单
  const handleBackToRegistration = () => {
    setIsRegistrationSuccess(false);
    setUserEmail("");
    clearError();
  };

  // 如果注册成功，显示激活提示页面
  if (isRegistrationSuccess) {
    return (
      <ProtectedRoute requireAuth={false}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-600">
                注册成功！
              </CardTitle>
              <CardDescription>
                请查看您的邮箱并点击激活链接来完成账户激活
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  激活邮件已发送至 <strong>{userEmail}</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• 请检查您的邮箱（包括垃圾邮件箱）</p>
                <p>• 点击邮件中的激活链接完成注册</p>
                <p>• 激活链接有效期为24小时</p>
              </div>

              {/* 错误提示 */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 重发激活邮件 */}
              <div className="space-y-3">
                <Button
                  onClick={handleResendActivation}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading || resendCooldown > 0}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                      发送中...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      重发邮件 ({resendCooldown}s)
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      重发激活邮件
                    </>
                  )}
                </Button>

                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link href="/activate">手动激活账户</Link>
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleBackToRegistration}
                      variant="outline"
                      className="flex-1"
                    >
                      重新注册
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href="/login">去登录</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                <p>没有收到邮件？请检查垃圾邮件箱或联系客服</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  // 注册表单页面
  return (
    <ProtectedRoute requireAuth={false}>
      <AuthLayout title="注册">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md bg-destructive/15 p-3 text-sm text-destructive"
            >
              <p>{error}</p>
            </motion.div>
          )}

          <div className="space-y-2">
            <Input
              id="username"
              type="text"
              placeholder="用户名"
              {...register("username")}
              autoComplete="username"
              className={errors.username ? "border-destructive" : ""}
              onChange={() => error && clearError()}
            />
            {errors.username && (
              <p className="text-xs text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder="邮箱"
              {...register("email")}
              autoComplete="email"
              className={errors.email ? "border-destructive" : ""}
              onChange={() => error && clearError()}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="密码"
              {...register("password")}
              autoComplete="new-password"
              className={errors.password ? "border-destructive" : ""}
              onChange={() => error && clearError()}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Input
              id="confirm_password"
              type="password"
              placeholder="确认密码"
              {...register("confirm_password")}
              autoComplete="new-password"
              className={errors.confirm_password ? "border-destructive" : ""}
              onChange={() => error && clearError()}
            />
            {errors.confirm_password && (
              <p className="text-xs text-destructive">
                {errors.confirm_password.message}
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
              {isLoading ? "注册中..." : "注册"}
            </ShimmerButton>
          </div>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">已有账号？</span>{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              立即登录
            </Link>
          </div>
        </form>
      </AuthLayout>
    </ProtectedRoute>
  );
}
