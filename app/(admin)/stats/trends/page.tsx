"use client";

import React, { Suspense } from "react";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendsContainer } from "@/components/stats/trends/container";

// 加载状态组件
function TrendsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* 页面标题骨架 */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-96" />
      </div>

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
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">访问趋势</h1>
        </div>
        <p className="text-muted-foreground">
          深入分析访问量和上传趋势的时间序列数据
        </p>
      </div>

      {/* 趋势分析内容 */}
      <Suspense fallback={<TrendsPageSkeleton />}>
        <TrendsContainer />
      </Suspense>
    </div>
  );
}