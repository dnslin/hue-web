"use client";

import React, { Suspense } from "react";
import { PageContainer } from "@/components/layouts/page-container";
import { AnalyticsContainer } from "@/components/stats/analytics/container";
import { Skeleton } from "@/components/ui/skeleton";

// 加载状态组件
function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6">
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
    <PageContainer
      title="分布分析"
      description="用户分布、来源分析和热门内容排行榜"
    >
      <Suspense fallback={<AnalyticsPageSkeleton />}>
        <AnalyticsContainer />
      </Suspense>
    </PageContainer>
  );
}