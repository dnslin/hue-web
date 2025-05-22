"use client";

import React from "react";
import { motion } from "framer-motion";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle = "欢迎使用兰空图床",
}) => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      {/* 背景渐变 - 使用响应式颜色 */}
      <div className="absolute inset-0 bg-gradient-to-br from-background to-secondary/20 dark:from-background dark:to-secondary/10" />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl bg-card shadow-xl"
      >
        {/* Header */}
        <div className="p-6 sm:p-8">
          <div className="mb-2 text-center">
            <h1 className="text-2xl font-bold text-card-foreground">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {/* Content */}
          <div className="mt-6">{children}</div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted p-4 text-center text-sm text-muted-foreground">
          <p>Lsky Pro 图床 &copy; {new Date().getFullYear()}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
