"use client";

import React from "react";
import {
  Users,
  Image,
  HardDrive,
  Eye,
  Upload,
  Calendar,
  TrendingUp,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberTicker } from "@/components/magicui/number-ticker";
import {
  useSystemStats,
  useStatsLoading,
  useStatsError,
} from "@/lib/store/stats";

// 格式化字节大小
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const metricIcons = {
  users: Users,
  images: Image,
  storage: HardDrive,
  access: Eye,
  upload: Upload,
  monthly: Calendar,
  daily: TrendingUp,
  size: FileText,
};

const formatMetricValue = (value: number, type: string) => {
  if (type === "storage" || type === "size") {
    return formatBytes(value);
  }

  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }

  return value.toLocaleString();
};

export function KeyMetrics() {
  const systemData = useSystemStats();
  const isLoading = useStatsLoading();
  const error = useStatsError();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-muted rounded w-20" />
              </CardTitle>
              <div className="h-5 w-5 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-1" />
              <div className="h-4 bg-muted rounded w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !systemData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              无法加载统计数据
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics = [
    {
      id: "users",
      label: "总用户数",
      value: systemData.totalUsers ?? 0,
      icon: metricIcons.users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      id: "images",
      label: "总图片数",
      value: systemData.totalImages ?? 0,
      icon: metricIcons.images,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      id: "storage",
      label: "存储使用",
      value: systemData.totalStorage ?? 0,
      icon: metricIcons.storage,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      id: "access",
      label: "总访问量",
      value: systemData.totalAccesses ?? 0,
      icon: metricIcons.access,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      id: "upload",
      label: "总上传数",
      value: systemData.totalUploads ?? 0,
      icon: metricIcons.upload,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
    },
    {
      id: "monthly",
      label: "月活用户",
      value: systemData.monthlyActiveUsers ?? 0,
      icon: metricIcons.monthly,
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-950",
    },
    {
      id: "daily",
      label: "日活用户",
      value: systemData.dailyActiveUsers ?? 0,
      icon: metricIcons.daily,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
    },
    {
      id: "size",
      label: "平均文件大小",
      value: systemData.averageFileSize ?? 0,
      icon: metricIcons.size,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card
            key={metric.id}
            className="transition-all duration-200 hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                {metric.label}
              </CardTitle>
              <div
                className={`p-1.5 sm:p-2 rounded-md ${metric.bgColor} flex-shrink-0`}
              >
                <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold leading-none">
                {metric.id === "storage" || metric.id === "size" ? (
                  formatMetricValue(metric.value, metric.id)
                ) : (
                  <NumberTicker value={metric.value} />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                {metric.id === "storage" || metric.id === "size"
                  ? ""
                  : metric.id === "daily"
                  ? "今日活跃"
                  : metric.id === "monthly"
                  ? "本月活跃"
                  : "累计数据"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
