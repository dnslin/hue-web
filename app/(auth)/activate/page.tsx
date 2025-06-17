"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthLayout from "@/components/layouts/auth-layout";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Mail,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// 账户激活表单验证模式
const activationSchema = z.object({
  email: z.string().min(1, "请输入邮箱").email("请输入有效的邮箱地址"),
  code: z.string().min(1, "请输入验证码").min(6, "验证码至少6位"),
});

type ActivationFormValues = z.infer<typeof activationSchema>;

export default function AccountActivationPage() {
  const router = useRouter();
  const {
    activateAccount,
    resendActivationEmail,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const [activationStatus, setActivationStatus] = useState<"form" | "success">(
    "form"
  );
  const [resendCooldown, setResendCooldown] = useState(0);

  // 激活表单
  const activationForm = useForm<ActivationFormValues>({
    resolver: zodResolver(activationSchema),
  });

  // 重发验证码冷却时间管理
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // 提交激活表单
  const onActivationSubmit = async (data: ActivationFormValues) => {
    clearError();
    try {
      const success = await activateAccount(data.email, data.code);
      if (success) {
        setActivationStatus("success");
        // 3秒后跳转到登录页
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err) {
      console.error("账户激活失败:", err);
    }
  };

  // 重发激活邮件
  const handleResendActivation = async () => {
    const emailValue = activationForm.getValues("email");
    if (resendCooldown > 0 || !emailValue) return;

    clearError();
    try {
      const success = await resendActivationEmail(emailValue);
      if (success) {
        setResendCooldown(60); // 设置60秒冷却时间
      }
    } catch (err) {
      console.error("重发激活邮件失败:", err);
    }
  };

  // 激活成功页面
  if (activationStatus === "success") {
    return (
      <ProtectedRoute requireAuth={false}>
        <AuthLayout
          title="激活成功！"
          subtitle="您的账户已成功激活，即将跳转到登录页面"
        >
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <Alert className="mb-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  欢迎加入！现在可以使用您的账户登录了
                </AlertDescription>
              </Alert>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">立即登录</Link>
            </Button>
          </div>
        </AuthLayout>
      </ProtectedRoute>
    );
  }

  // 激活表单页面
  return (
    <ProtectedRoute requireAuth={false}>
      <AuthLayout
        title="激活账户"
        subtitle="请输入您的邮箱和收到的验证码来激活账户"
      >
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

          <form
            onSubmit={activationForm.handleSubmit(onActivationSubmit)}
            className="space-y-4"
          >
            {/* 邮箱输入 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">邮箱地址</label>
              <Input
                type="email"
                placeholder="请输入注册时使用的邮箱"
                {...activationForm.register("email")}
                className={
                  activationForm.formState.errors.email
                    ? "border-destructive"
                    : ""
                }
                onChange={() => error && clearError()}
              />
              {activationForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {activationForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* 验证码输入 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">激活验证码</label>
              <Input
                type="text"
                placeholder="请输入邮件中的验证码"
                {...activationForm.register("code")}
                className={
                  activationForm.formState.errors.code
                    ? "border-destructive"
                    : ""
                }
                onChange={() => error && clearError()}
              />
              {activationForm.formState.errors.code && (
                <p className="text-xs text-destructive">
                  {activationForm.formState.errors.code.message}
                </p>
              )}
            </div>

            {/* 提示信息 */}
            <div className="text-sm text-muted-foreground space-y-2 bg-muted/50 p-4 rounded-lg">
              <p className="font-medium text-foreground mb-2">激活提示：</p>
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  <span>请检查您的邮箱（包括垃圾邮件箱）</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                  <span>验证码通常为6位数字或字母</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                  <span>验证码有效期为24小时</span>
                </div>
              </div>
            </div>

            {/* 激活按钮 */}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  激活中...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  激活账户
                </>
              )}
            </Button>

            {/* 重发激活邮件 */}
            <div className="space-y-3">
              <div className="text-center text-sm text-muted-foreground">
                没有收到验证码？
              </div>
              <Button
                type="button"
                onClick={handleResendActivation}
                variant="outline"
                className="w-full"
                disabled={
                  isLoading ||
                  resendCooldown > 0 ||
                  !activationForm.getValues("email")
                }
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                    发送中...
                  </>
                ) : resendCooldown > 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重发验证码 ({resendCooldown}s)
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    重发验证码
                  </>
                )}
              </Button>
            </div>

            {/* 导航链接 */}
            <div className="flex gap-2 pt-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/register">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  重新注册
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/login">去登录</Link>
              </Button>
            </div>
          </form>
        </div>
      </AuthLayout>
    </ProtectedRoute>
  );
}
