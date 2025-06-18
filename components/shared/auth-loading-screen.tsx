"use client";

import React from "react";

interface AuthLoadingScreenProps {
  message?: string;
  type?:
    | "auth"
    | "hydration"
    | "loading"
    | "forgot-password"
    | "reset-password";
}

/**
 * 认证加载屏幕组件
 * 用于在认证状态检查期间显示
 */
export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({
  message,
  type = "auth",
}) => {
  // 根据类型设置默认消息
  const defaultMessage = {
    auth: "正在验证身份...",
    hydration: "正在恢复用户状态...",
    loading: "正在加载...",
    "forgot-password": "正在发送密码重置邮件...",
    "reset-password": "正在重置密码...",
  }[type];

  const displayMessage = message || defaultMessage;
  return (
    <div className="min-h-screen flex items-center justify-center bg-background w-full">
      <div className="flex flex-col items-center space-y-4">
        {/* 加载动画 */}
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary"></div>
          <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-primary/30 animate-pulse"></div>
        </div>

        {/* 加载文字 */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            {displayMessage}
          </p>
          <p className="text-xs text-muted-foreground">请稍候...</p>
        </div>
      </div>
    </div>
  );
};
