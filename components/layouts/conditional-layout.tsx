"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { isAdminRoute } from "@/lib/utils/layout-utils";
import { MainLayout } from "./main-layout";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

/**
 * 条件性布局组件
 * 根据当前路径选择合适的布局包装器
 * 已优化SSR兼容性，消除布局闪烁问题
 */
export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // 直接使用路径检测结果，确保服务端客户端一致性
  const isAdmin = isAdminRoute(pathname);

  // 布局切换动画配置
  const layoutVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
  };

  const transition = {
    duration: 0.15,
    ease: "easeInOut",
  };

  if (isAdmin) {
    // 管理后台路由：直接渲染 children，不使用 MainLayout
    // AdminLayout 会在 app/(admin)/layout.tsx 中应用
    return (
      <Suspense fallback={<AdminLayoutFallback />}>
        <AnimatePresence mode="wait">
          <motion.div
            key="admin-layout"
            variants={layoutVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="h-screen overflow-hidden"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Suspense>
    );
  }

  // 前台路由：使用 MainLayout 包装
  return (
    <Suspense fallback={<MainLayoutFallback />}>
              <AnimatePresence mode="wait">
        <motion.div
          key="main-layout"
          variants={layoutVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className="h-screen overflow-hidden"
        >
          <MainLayout>{children}</MainLayout>
        </motion.div>
      </AnimatePresence>
    </Suspense>
  );
}

/**
 * 管理后台布局加载状态
 */
function AdminLayoutFallback() {
  return (
    <div className="h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">加载管理后台...</p>
      </div>
    </div>
  );
}

/**
 * 前台布局加载状态
 */
function MainLayoutFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">加载页面...</p>
      </div>
    </div>
  );
}
