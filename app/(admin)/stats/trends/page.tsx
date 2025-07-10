"use client";

import React, { Suspense } from "react";
import { PageContainer } from "@/components/layouts/page-container";
import { TrendsContainer } from "@/components/stats/trends/container";
import { Skeleton } from "@/components/ui/skeleton";

// 加载状态组件
function TrendsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* 时间选择器骨架 */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* 趋势图表骨架 */}
      <div className="grid gap-6">
        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-80 w-full" />
        </div>
        <div className="space-y-4 p-6 border rounded-lg">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function TrendsPage() {
  return (
    <PageContainer
      title="访问趋势"
      description="深入分析访问量和上传趋势的时间序列数据"
    >
      <Suspense fallback={<TrendsPageSkeleton />}>
        <TrendsContainer />
      </Suspense>
    </PageContainer>
  );
}