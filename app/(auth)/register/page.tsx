"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import AuthLayout from "@/components/layouts/AuthLayout";
import useAuthStore from "@/lib/store/authStore";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

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
    isAuthenticated,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: RegisterFormValues) => {
    await registerUser(data.username, data.email, data.password);
  };

  return (
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
  );
}
