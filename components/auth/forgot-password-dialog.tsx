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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  token: z.string().min(8, "验证码必须是8位").max(8, "验证码必须是8位"),
  newPassword: z
    .string()
    .min(6, "密码长度至少6位")
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
  const {
    forgotPassword,
    resetPassword,
    clearError,
    forgotPasswordState,
    resetForgotPasswordState,
    setForgotPasswordStep,
  } = useAuthStore();

  // 状态管理 - 使用 Store 状态
  const [isOpen, setIsOpen] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 从 Store 状态中获取当前步骤和用户邮箱
  const { isLoading, error, currentStep, userEmail } = forgotPasswordState;
  const isResetStep = currentStep === "reset";
  const isSuccessStep = currentStep === "success";

  // 忘记密码表单
  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // 重置密码表单
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      token: "",
      newPassword: "",
    },
  });

  // 当用户邮箱改变时，更新重置密码表单的邮箱字段
  React.useEffect(() => {
    if (userEmail) {
      resetPasswordForm.setValue("email", userEmail);
    }
  }, [userEmail, resetPasswordForm]);

  // 提交忘记密码表单
  const onForgotPasswordSubmit = async (
    data: ForgotPasswordFormValues,
    event?: React.BaseSyntheticEvent
  ) => {
    // 显式阻止表单默认提交行为
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log("🔄 开始处理忘记密码请求:", data.email);
    clearError();

    try {
      const result = await forgotPassword(data.email, { silent: true });
      console.log("✅ 忘记密码请求结果:", result);

      // 检查结果是否为 AuthActionResult 对象
      const isSuccess = typeof result === "boolean" ? result : result.success;

      if (isSuccess) {
        console.log("📧 验证码发送成功，切换到重置步骤");
        // 成功时会自动通过 Store 更新到 'reset' 步骤
      } else {
        console.error("❌ 忘记密码请求失败，但没有抛出异常");
        // 错误信息已通过 Store 设置，不需要手动设置步骤
      }
    } catch (err) {
      console.error("❌ 忘记密码请求失败:", err);
      // 错误信息已通过 Store 设置，不需要手动设置步骤
    }
  };

  // 提交重置密码表单
  const onResetPasswordSubmit = async (data: ResetPasswordFormValues) => {
    clearError();

    try {
      const result = await resetPassword(
        userEmail,
        data.newPassword,
        data.newPassword,
        data.token,
        { silent: true }
      );

      // 检查结果是否为 AuthActionResult 对象
      const isSuccess = typeof result === "boolean" ? result : result.success;

      if (isSuccess) {
        // 成功时会自动通过 Store 更新到 'success' 步骤
        setTimeout(() => {
          setIsOpen(false);
          resetForgotPasswordState();
        }, 3000);
      }
    } catch (err) {
      console.error("密码重置失败:", err);
    }
  };

  // 处理对话框关闭
  const handleDialogClose = (open: boolean) => {
    console.log("🔄 对话框状态变化:", { open, isResetStep, isSuccessStep });
    setIsOpen(open);
    if (!open) {
      console.log("❌ 对话框关闭，重置状态");
      resetForgotPasswordState();
      // 清空所有表单数据
      forgotPasswordForm.reset();
      resetPasswordForm.reset();
    } else if (open && !isOpen) {
      // 对话框从关闭状态变为打开状态时，重置状态和表单
      console.log("🔄 对话框打开，重置状态和表单");
      resetForgotPasswordState();
      forgotPasswordForm.reset();
      resetPasswordForm.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          // 防止在重置密码或成功步骤时意外关闭对话框
          if (isResetStep || isSuccessStep) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          // 防止在重置密码或成功步骤时按 ESC 关闭对话框
          if (isResetStep || isSuccessStep) {
            e.preventDefault();
          }
        }}
      >
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
                  <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                    💡 提示：此对话框在重置过程中不会意外关闭
                  </p>
                </div>
              </div>

              <Form {...resetPasswordForm}>
                <form
                  onSubmit={resetPasswordForm.handleSubmit(
                    onResetPasswordSubmit
                  )}
                  className="space-y-5"
                >
                  <FormField
                    control={resetPasswordForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>确认邮箱</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            disabled
                            className="bg-muted h-12"
                            {...field}
                            value={userEmail}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resetPasswordForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>验证码</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="请输入邮箱收到的8位验证码"
                            className="h-12 text-center text-lg tracking-widest"
                            maxLength={8}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={resetPasswordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>新密码</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="请输入新密码"
                              className="pr-12 h-12"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
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
                      onClick={() => {
                        setForgotPasswordStep("email");
                        // 清空重置密码表单数据
                        resetPasswordForm.reset();
                      }}
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
              </Form>
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

              <Form {...forgotPasswordForm}>
                <form
                  onSubmit={forgotPasswordForm.handleSubmit(
                    onForgotPasswordSubmit
                  )}
                  className="space-y-5"
                >
                  <FormField
                    control={forgotPasswordForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮箱地址</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="请输入注册时使用的邮箱"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
              </Form>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
