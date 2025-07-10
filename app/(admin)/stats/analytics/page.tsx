"use client";

import React, { Suspense } from "react";
import { PieChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsContainer } from "@/components/stats/analytics/container";

// 加载状态组件
function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* 页面标题骨架 */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* 分析图表骨架 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-80 w-full" />
        </div>
        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>

      {/* 排行榜骨架 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <PieChart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">分布分析</h1>
        </div>
        <p className="text-muted-foreground">
          用户分布、来源分析和热门内容排行榜
        </p>
      </div>

      {/* 分析内容 */}
      <Suspense fallback={<AnalyticsPageSkeleton />}>
        <AnalyticsContainer />
      </Suspense>
    </div>
  );
}