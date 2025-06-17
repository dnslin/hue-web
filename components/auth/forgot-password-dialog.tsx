"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";

// 忘记密码表单验证模式
const forgotPasswordSchema = z.object({
  email: z.string().min(1, "请输入邮箱").email("请输入有效的邮箱地址"),
});

// 重置密码表单验证模式
const resetPasswordSchema = z.object({
  email: z.string().min(1, "请输入邮箱").email("请输入有效的邮箱地址"),
  token: z.string().min(1, "请输入验证码"),
  newPassword: z
    .string()
    .min(8, "密码长度至少8位")
    .regex(/(?=.*[a-z])/, "密码必须包含小写字母")
    .regex(/(?=.*[A-Z])/, "密码必须包含大写字母")
    .regex(/(?=.*\d)/, "密码必须包含数字")
    .regex(/(?=.*[@$!%*?&])/, "密码必须包含特殊字符"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ForgotPasswordDialogProps {
  children: React.ReactNode;
}

export function ForgotPasswordDialog({ children }: ForgotPasswordDialogProps) {
  const { forgotPassword, resetPassword, isLoading, error, clearError } =
    useAuthStore();

  // 状态管理
  const [isOpen, setIsOpen] = useState(false);
  const [isResetStep, setIsResetStep] = useState(false);
  const [isSuccessStep, setIsSuccessStep] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // 忘记密码表单
  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // 重置密码表单
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // 提交忘记密码表单
  const onForgotPasswordSubmit = async (data: ForgotPasswordFormValues) => {
    clearError();
    try {
      await forgotPassword(data.email);
      setUserEmail(data.email);
      setIsResetStep(true);
    } catch (err) {
      console.error("忘记密码请求失败:", err);
    }
  };

  // 提交重置密码表单
  const onResetPasswordSubmit = async (data: ResetPasswordFormValues) => {
    clearError();
    try {
      await resetPassword(
        userEmail,
        data.newPassword,
        data.newPassword,
        data.token
      );
      setIsSuccessStep(true);

      setTimeout(() => {
        setIsOpen(false);
        resetState();
      }, 3000);
    } catch (err) {
      console.error("密码重置失败:", err);
    }
  };

  // 重置状态
  const resetState = () => {
    setIsResetStep(false);
    setIsSuccessStep(false);
    setUserEmail("");
    forgotPasswordForm.reset();
    resetPasswordForm.reset();
    clearError();
  };

  // 处理对话框关闭
  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetState();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center text-center">
            {isSuccessStep ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                密码重置成功
              </>
            ) : isResetStep ? (
              <>
                <Lock className="w-5 h-5 text-blue-600" />
                重置密码
              </>
            ) : (
              <>
                <Mail className="w-5 h-5 text-blue-600" />
                忘记密码
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isSuccessStep
              ? "您的密码已成功重置，现在可以使用新密码登录"
              : isResetStep
              ? "请输入邮箱收到的验证码和新密码"
              : "请输入您的邮箱地址，我们将发送密码重置验证码"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 成功状态 */}
          {isSuccessStep && (
            <div className="text-center py-8">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <Alert className="mb-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="text-base">
                  密码重置成功！对话框将在3秒后自动关闭
                </AlertDescription>
              </Alert>
              <div className="text-sm text-muted-foreground">
                <p>您可以使用新密码立即登录您的账户</p>
              </div>
            </div>
          )}

          {/* 重置密码步骤 */}
          {isResetStep && !isSuccessStep && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>我们已向您的邮箱发送了验证码</p>
                  <p className="mt-1">请查收并输入验证码来重置密码</p>
                </div>
              </div>

              <form
                onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)}
                className="space-y-5"
              >
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    确认邮箱
                  </label>
                  <Input
                    type="email"
                    value={userEmail}
                    disabled
                    className="bg-muted h-12"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    验证码
                  </label>
                  <Input
                    type="text"
                    placeholder="请输入邮箱收到的6位验证码"
                    {...resetPasswordForm.register("token")}
                    className={`h-12 text-center text-lg tracking-widest ${
                      resetPasswordForm.formState.errors.token
                        ? "border-destructive"
                        : ""
                    }`}
                    maxLength={6}
                  />
                  {resetPasswordForm.formState.errors.token && (
                    <p className="text-xs text-destructive">
                      {resetPasswordForm.formState.errors.token.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    新密码
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="请输入新密码"
                      {...resetPasswordForm.register("newPassword")}
                      className={`pr-12 h-12 ${
                        resetPasswordForm.formState.errors.newPassword
                          ? "border-destructive"
                          : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {resetPasswordForm.formState.errors.newPassword && (
                    <p className="text-xs text-destructive">
                      {resetPasswordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <input
                  type="hidden"
                  {...resetPasswordForm.register("email")}
                  value={userEmail}
                />

                {/* 密码规则提示 */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-3">
                    密码安全要求：
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                      <span>至少8位字符</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                      <span>包含大小写字母</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                      <span>包含数字</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                      <span>包含特殊字符</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsResetStep(false)}
                    className="flex-1 h-12"
                  >
                    返回上一步
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-12"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        重置中...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        重置密码
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* 忘记密码步骤 */}
          {!isResetStep && !isSuccessStep && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>输入您的邮箱地址</p>
                  <p className="mt-1">我们将发送验证码来帮助您重置密码</p>
                </div>
              </div>

              <form
                onSubmit={forgotPasswordForm.handleSubmit(
                  onForgotPasswordSubmit
                )}
                className="space-y-5"
              >
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">
                    邮箱地址
                  </label>
                  <Input
                    type="email"
                    placeholder="请输入注册时使用的邮箱"
                    {...forgotPasswordForm.register("email")}
                    className={`h-12 ${
                      forgotPasswordForm.formState.errors.email
                        ? "border-destructive"
                        : ""
                    }`}
                  />
                  {forgotPasswordForm.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {forgotPasswordForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* 提示信息 */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p className="font-medium text-foreground">
                      重置密码流程：
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        <span>输入注册邮箱</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                        <span>查收邮件中的验证码</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full"></div>
                        <span>设置新密码</span>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      发送中...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      发送验证码
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    验证码将在5分钟内发送到您的邮箱
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
