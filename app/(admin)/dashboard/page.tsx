"use client";

import React, { Suspense } from "react";
import { BoxReveal } from "@/components/magicui/box-reveal";
import { TextAnimate } from "@/components/magicui/text-animate";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { DashboardContainer } from "./components/DashboardContainer";
import { Skeleton } from "@/components/ui/skeleton";

// 加载状态组件
function DashboardSkeleton() {
  return (
    <div className="relative p-6 space-y-6 overflow-hidden h-full">
      {/* 背景网格动画 */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.05}
        duration={3}
        className="inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
      />

      {/* 页面标题骨架 */}
      <div className="space-y-4 relative z-10">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* 指标卡片骨架 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        {Array.from({ length: 4 }).map((_, i) => (
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

      {/* 其他内容骨架 */}
      <div className="grid gap-6 lg:grid-cols-2 relative z-10">
        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="relative overflow-hidden h-full">
      {/* 背景网格动画 */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.08}
        duration={3}
        className="inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
      />

      <div className="relative z-10 p-6 space-y-6">
        {/* 页面标题 */}
        <div className="space-y-4">
          <BoxReveal boxColor="#3b82f6" duration={0.5}>
            <TextAnimate
              animation="slideUp"
              by="word"
              className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
            >
              控制台
            </TextAnimate>
          </BoxReveal>
          <BoxReveal boxColor="#3b82f6" duration={0.7}>
            <TextAnimate
              animation="fadeIn"
              by="word"
              delay={0.3}
              className="text-muted-foreground text-lg"
            >
              欢迎回来！这里是您的 Lsky Pro 管理中心。
            </TextAnimate>
          </BoxReveal>
        </div>

        {/* Dashboard 主要内容 */}
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContainer />
        </Suspense>
      </div>
    </div>
  );
}
