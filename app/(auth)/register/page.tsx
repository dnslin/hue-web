"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "@/components/layouts/AuthLayout";
import useAuthStore from "@/lib/store/authStore";

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
    confirmPassword: z.string().min(1, "请确认密码"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不匹配",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register: registerUser,
    isAuthenticated,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/images");
    }
  }, [isAuthenticated, router]);

  // 设置表单
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  // 提交表单
  const onSubmit = async (data: RegisterFormValues) => {
    clearError();
    const success = await registerUser(
      data.username,
      data.email,
      data.password
    );
    if (success) {
      // 注册成功，跳转到登录页
      router.push("/login?registered=true");
    }
  };

  return (
    <AuthLayout title="注册账号" subtitle="创建您的兰空图床账号">
      <div className="space-y-6">
        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md bg-red-50 p-3 text-sm text-red-500"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-medium text-gray-700"
            >
              用户名
            </label>
            <Input
              id="username"
              type="text"
              placeholder="请输入用户名"
              className={errors.username ? "border-red-300" : ""}
              {...register("username")}
            />
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              邮箱
            </label>
            <Input
              id="email"
              type="email"
              placeholder="请输入邮箱"
              className={errors.email ? "border-red-300" : ""}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              密码
            </label>
            <Input
              id="password"
              type="password"
              placeholder="请输入密码"
              className={errors.password ? "border-red-300" : ""}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              确认密码
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              className={errors.confirmPassword ? "border-red-300" : ""}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "注册中..." : "注册"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          已经有账号？
          <Link
            href="/login"
            className="ml-1 font-medium text-blue-600 hover:text-blue-500"
          >
            登录
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
