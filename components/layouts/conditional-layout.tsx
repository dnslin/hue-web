"use client";

import React, { Suspense, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { isAdminRoute } from "@/lib/utils/layout-utils";
import { MainLayout } from "./main-layout";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

// 动态导入 Framer Motion 组件，避免 SSR 问题
const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  {
    ssr: false,
    loading: () => <div className="h-screen overflow-hidden" />,
  }
);

const AnimatePresence = dynamic(
  () => import("framer-motion").then((mod) => mod.AnimatePresence),
  {
    ssr: false,
    loading: () => <></>,
  }
);

/**
 * 条件性布局组件
 * 根据当前路径选择合适的布局包装器
 * 已优化SSR兼容性，消除布局闪烁问题
 */
export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  // 确保客户端水合完成
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 在水合完成前返回一个通用的加载状态
  if (!isHydrated) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // 客户端水合完成后进行路径检测
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
          <MotionDiv
            key="admin-layout"
            variants={layoutVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="h-screen overflow-hidden"
          >
            {children}
          </MotionDiv>
        </AnimatePresence>
      </Suspense>
    );
  }

  // 前台路由：使用 MainLayout 包装
  return (
    <Suspense fallback={<MainLayoutFallback />}>
      <AnimatePresence mode="wait">
        <MotionDiv
          key="main-layout"
          variants={layoutVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          className="h-screen overflow-hidden"
        >
          <MainLayout>{children}</MainLayout>
        </MotionDiv>
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
