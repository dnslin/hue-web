"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

/**
 * 通用页面容器组件
 * 为管理后台页面提供基础的布局和样式
 * 不包含dashboard特定的内容（如指标、快捷操作等）
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  title,
  description,
}) => {
  return (
    <div className={cn("relative w-full", className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative z-10 p-6 space-y-6 pb-safe min-h-screen"
      >
        {/* 页面标题区域 */}
        {(title || description) && (
          <div className="space-y-2">
            {title && (
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        {/* 页面内容 */}
        <div className="space-y-6">{children}</div>
      </motion.div>
    </div>
  );
};

export default PageContainer;
