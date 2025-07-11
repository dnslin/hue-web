"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import {
  useAccessStats,
  useUploadStats,
  useStatsLoading,
  useStatsActions,
  useStatsError,
} from "@/lib/store/stats";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const chartConfig = {
  access: {
    label: "访问量",
    color: "hsl(var(--chart-1))",
  },
  upload: {
    label: "上传数",
    color: "hsl(var(--chart-2))",
  },
};

export function QuickTrends() {
  const accessData = useAccessStats();
  const uploadData = useUploadStats();
  const isLoading = useStatsLoading();
  const { fetchAllStats } = useStatsActions();

  // 组件级数据获取 - 确保数据加载
  React.useEffect(() => {
    // 如果没有数据且不在加载中，尝试获取数据
    if (!accessData && !uploadData && !isLoading) {
      console.log("🔄 QuickTrends 组件主动获取数据");
      fetchAllStats();
    }
  }, [accessData, uploadData, isLoading, fetchAllStats]);

  // 调试日志 - 监控数据状态
  React.useEffect(() => {
    console.log("🔍 QuickTrends 数据状态:", {
      accessData,
      uploadData,
      isLoading,
      accessDataLength: accessData?.data?.length,
      uploadDataLength: uploadData?.data?.length,
    });
  }, [accessData, uploadData, isLoading]);

  // 数据验证和格式转换处理
  const validateAndProcessData = (data: any, dataType: "access" | "upload") => {
    if (!data || !Array.isArray(data.data)) {
      console.warn("⚠️ 数据格式无效或为空:", data);
      return [];
    }

    // 打印数据结构用于调试
    if (data.data.length > 0) {
      console.log(`📋 ${dataType} 数据结构示例:`, data.data[0]);
    }

    return data.data
      .map((item: any) => {
        if (!item || typeof item.date !== "string") {
          return null;
        }

        let value: number;

        // 根据实际数据字段进行转换
        if (dataType === "upload") {
          // 上传数据使用 uploadCount 字段（基于实际数据结构）
          value = item.uploadCount || 0;
        } else {
          // 访问数据 - 需要根据实际数据结构确定字段名
          // 请提供访问数据的实际结构以便正确映射
          value = item.value || 0;
        }

        // 确保 value 是有效数字
        if (typeof value !== "number" || isNaN(value)) {
          value = 0;
        }

        return {
          date: item.date,
          value: value,
          // 保留原始数据用于调试
          _original: item,
        };
      })
      .filter((item: any) => item !== null);
  };

  const processedAccessData = validateAndProcessData(accessData, "access");
  const processedUploadData = validateAndProcessData(uploadData, "upload");

  // 检查是否有数据
  const hasAccessData = processedAccessData.length > 0;
  const hasUploadData = processedUploadData.length > 0;
  const hasAnyData = hasAccessData || hasUploadData;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        <Card className="animate-pulse min-w-0">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-24" />
          </CardHeader>
          <CardContent>
            <div className="h-48 md:h-64 bg-muted rounded" />
          </CardContent>
        </Card>
        <Card className="animate-pulse min-w-0">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-24" />
          </CardHeader>
          <CardContent>
            <div className="h-48 md:h-64 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // 计算趋势变化
  const calculateTrend = (data: any[]) => {
    if (!data || data.length < 2) return { trend: 0, isPositive: true };

    const latest = data[data.length - 1];
    const previous = data[data.length - 2];

    if (!latest || !previous) return { trend: 0, isPositive: true };

    const change = ((latest.value - previous.value) / previous.value) * 100;
    return {
      trend: Math.abs(change),
      isPositive: change >= 0,
    };
  };

  const accessTrend = calculateTrend(processedAccessData);
  const uploadTrend = calculateTrend(processedUploadData);

  // 如果没有数据且不在加载中，显示无数据状态
  if (!isLoading && !hasAnyData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base font-medium">访问趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 md:h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-sm">暂无访问数据</div>
                <div className="text-xs mt-1">请稍后再试</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base font-medium">上传趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 md:h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-sm">暂无上传数据</div>
                <div className="text-xs mt-1">请稍后再试</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:gap-6 overflow-hidden">
      {/* 访问趋势 */}
      <Card className="min-w-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
          <CardTitle className="text-base font-medium">访问趋势</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            {accessTrend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span
              className={
                accessTrend.isPositive ? "text-green-600" : "text-red-600"
              }
            >
              {accessTrend.trend.toFixed(1)}%
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 md:h-64">
            <AreaChart data={processedAccessData}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("zh-CN", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}K`;
                  }
                  return value.toString();
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    }}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartConfig.access.color}
                fill={chartConfig.access.color}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
          <div className="mt-4 text-sm text-muted-foreground">
            过去 7 天的访问趋势
          </div>
        </CardContent>
      </Card>

      {/* 上传趋势 */}
      <Card className="min-w-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
          <CardTitle className="text-base font-medium">上传趋势</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            {uploadTrend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span
              className={
                uploadTrend.isPositive ? "text-green-600" : "text-red-600"
              }
            >
              {uploadTrend.trend.toFixed(1)}%
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 md:h-64">
            <AreaChart data={processedUploadData}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("zh-CN", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}K`;
                  }
                  return value.toString();
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      });
                    }}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartConfig.upload.color}
                fill={chartConfig.upload.color}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
          <div className="mt-4 text-sm text-muted-foreground">
            过去 7 天的上传趋势
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
