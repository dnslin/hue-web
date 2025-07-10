"use client";

import React, { Suspense, useEffect } from "react";
import { BoxReveal } from "@/components/magicui/box-reveal";
import { TextAnimate } from "@/components/magicui/text-animate";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { EnhancedMetricsGrid } from "@/components/dashboard/enhanced-metrics-grid";
import { QuickTrends } from "@/components/stats/overview/quick-trends";
import { Skeleton } from "@/components/ui/skeleton";
import { useStatsActions } from "@/lib/store/stats";

// 加载状态组件
function DashboardSkeleton() {
  return (
    <div className="relative p-6 space-y-6 overflow-hidden h-full">
      {/* 页面标题骨架 */}
      <div className="space-y-4 relative z-10">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* 指标卡片骨架 */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 relative z-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3 p-6 border rounded-lg">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { fetchAllStats } = useStatsActions();

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  return (
    <div className="relative overflow-hidden h-full">
      {/* 背景网格动画 */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.08}
        duration={3}
        className="inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
      />

      {/* 主要内容 - 修正滚动高度计算 */}
      <div className="relative z-10 h-screen overflow-y-auto custom-scrollbar">
        <div className="p-4 md:p-6 space-y-6 min-h-full">
          {/* 页面标题 */}
          <div className="space-y-4">
            <BoxReveal boxColor="#3b82f6" duration={0.5}>
              <TextAnimate
                animation="slideUp"
                by="word"
                className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
              >
                控制台
              </TextAnimate>
            </BoxReveal>
            <BoxReveal boxColor="#3b82f6" duration={0.7}>
              <TextAnimate
                animation="fadeIn"
                by="word"
                delay={0.3}
                className="text-muted-foreground text-base md:text-lg"
              >
                欢迎回来！这里是您的 Lsky Pro 管理中心。
              </TextAnimate>
            </BoxReveal>
          </div>

          {/* 关键指标展示 */}
          <Suspense fallback={<DashboardSkeleton />}>
            <EnhancedMetricsGrid />
          </Suspense>

          {/* 快速趋势 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">快速趋势</h2>
            <Suspense
              fallback={
                <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
                  <div className="animate-pulse min-w-0">
                    <div className="space-y-4 p-6 border rounded-lg">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-48 md:h-64 w-full" />
                    </div>
                  </div>
                  <div className="animate-pulse min-w-0">
                    <div className="space-y-4 p-6 border rounded-lg">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-48 md:h-64 w-full" />
                    </div>
                  </div>
                </div>
              }
            >
              <QuickTrends />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
