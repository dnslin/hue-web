"use client";

import { ReactNode, useEffect } from "react";
import { UseFormReturn, SubmitHandler } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsFormWrapperProps<T extends Record<string, any>> {
  form: UseFormReturn<T, any>;
  onSubmit: SubmitHandler<T>;
  title: string;
  description?: string;
  children: ReactNode;
  isSubmitting?: boolean;
  error?: string | null;
  successMessage?: string | null;
  className?: string;
  showSaveButton?: boolean;
  saveButtonText?: string;
  resetOnSuccess?: boolean;
  footer?: ReactNode;
}

export function SettingsFormWrapper<T extends Record<string, any>>({
  form,
  onSubmit,
  title,
  description,
  children,
  isSubmitting = false,
  error = null,
  successMessage = null,
  className,
  showSaveButton = true,
  saveButtonText = "保存设置",
  resetOnSuccess = false,
  footer,
}: SettingsFormWrapperProps<T>) {
  const { handleSubmit, formState, reset } = form;
  const { isDirty } = formState;

  // 成功后重置表单
  useEffect(() => {
    if (successMessage && resetOnSuccess) {
      const timer = setTimeout(() => {
        reset();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, resetOnSuccess, reset]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 错误提示 */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 成功提示 */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {children}

          {/* 分隔线 */}
          {showSaveButton && <Separator />}

          {/* 表单底部 */}
          {(showSaveButton || footer) && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex-1">{footer}</div>

              {showSaveButton && (
                <div className="flex items-center gap-3">
                  {/* 表单状态指示 */}
                  {isDirty && (
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-sm text-muted-foreground"
                    >
                      有未保存的更改
                    </motion.span>
                  )}

                  {/* 保存按钮 */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isDirty}
                    className="min-w-[100px]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>保存中...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        <span>{saveButtonText}</span>
                      </div>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

// 带动画的设置表单项
interface AnimatedFormItemProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const AnimatedFormItem = ({
  children,
  delay = 0,
  className,
}: AnimatedFormItemProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// 设置表单区域组件
interface SettingsFormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const SettingsFormSection = ({
  title,
  description,
  children,
  className,
  collapsible = false,
  defaultCollapsed = false,
}: SettingsFormSectionProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4 pl-0">{children}</div>
    </div>
  );
};

// 表单状态指示器
interface FormStatusIndicatorProps {
  isDirty: boolean;
  isSubmitting: boolean;
  error?: string | null;
  lastSaved?: number | null;
}

export const FormStatusIndicator = ({
  isDirty,
  isSubmitting,
  error,
  lastSaved,
}: FormStatusIndicatorProps) => {
  const getStatus = () => {
    if (error) return { text: "保存失败", color: "text-red-500" };
    if (isSubmitting) return { text: "保存中...", color: "text-blue-500" };
    if (isDirty) return { text: "有未保存的更改", color: "text-orange-500" };
    if (lastSaved) {
      const timeDiff = Date.now() - lastSaved;
      const minutes = Math.floor(timeDiff / 60000);
      if (minutes < 1) {
        return { text: "刚刚保存", color: "text-green-500" };
      } else {
        return { text: `${minutes}分钟前保存`, color: "text-muted-foreground" };
      }
    }
    return null;
  };

  const status = getStatus();
  if (!status) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("flex items-center gap-2 text-sm", status.color)}
    >
      {isSubmitting && <Loader2 className="h-3 w-3 animate-spin" />}
      {error && <AlertCircle className="h-3 w-3" />}
      {!error && !isSubmitting && isDirty && (
        <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
      )}
      {!error && !isSubmitting && !isDirty && lastSaved && (
        <CheckCircle2 className="h-3 w-3 text-green-500" />
      )}
      <span>{status.text}</span>
    </motion.div>
  );
};

// 快捷保存按钮
interface QuickSaveButtonProps {
  onSave: () => void;
  isDirty: boolean;
  isSubmitting: boolean;
  className?: string;
}

export const QuickSaveButton = ({
  onSave,
  isDirty,
  isSubmitting,
  className,
}: QuickSaveButtonProps) => {
  if (!isDirty) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn("fixed bottom-6 right-6 z-50", className)}
    >
      <Button
        onClick={onSave}
        disabled={isSubmitting}
        size="lg"
        className="shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            保存中...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            快速保存
          </>
        )}
      </Button>
    </motion.div>
  );
};
