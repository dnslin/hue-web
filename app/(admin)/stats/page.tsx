"use client";

import React, { Suspense } from "react";
import { PageContainer } from "@/components/layouts/page-container";
import { OverviewContainer } from "@/components/stats/overview/container";
import { Skeleton } from "@/components/ui/skeleton";

// 加载状态组件
function OverviewPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* 关键指标卡片骨架 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3 p-6 border rounded-lg">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-5 rounded" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>

      {/* 快速趋势图表骨架 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function StatsOverviewPage() {
  return (
    <PageContainer
      title="统计概览"
      description="快速了解您的 Lsky Pro 平台的关键指标和整体表现"
    >
      <Suspense fallback={<OverviewPageSkeleton />}>
        <OverviewContainer />
      </Suspense>
    </PageContainer>
  );
}