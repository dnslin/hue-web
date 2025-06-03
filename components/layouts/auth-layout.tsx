"use client";

import React from "react";
import { motion } from "framer-motion";

import { Meteors } from "@/components/magicui/meteors";

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
      <div className="absolute inset-0 bg-gradient-to-br from-background to-secondary/20 dark:from-background dark:to-primary/10" />

      {/* 流星特效背景 */}
      <Meteors number={20} className="opacity-70" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-lg"
      >
        {/* 卡片光晕效果 - 仅在暗色模式下显示 */}
        <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 blur-sm dark:from-primary/30 dark:to-secondary/30 dark:opacity-75" />

        <div className="relative flex flex-col space-y-2 p-6 text-center">
          <h1 className="text-2xl font-bold text-card-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="relative p-6 pt-0">{children}</div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
