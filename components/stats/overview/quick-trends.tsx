"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { useAccessStats, useUploadStats, useStatsLoading } from "@/lib/store/stats";
import { TrendingUp, TrendingDown } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-24" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded" />
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-24" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded" />
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

  const accessTrend = calculateTrend(accessData?.data || []);
  const uploadTrend = calculateTrend(uploadData?.data || []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 访问趋势 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">访问趋势</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            {accessTrend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span className={accessTrend.isPositive ? "text-green-600" : "text-red-600"}>
              {accessTrend.trend.toFixed(1)}%
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <AreaChart data={accessData?.data || []}>
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">上传趋势</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            {uploadTrend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span className={uploadTrend.isPositive ? "text-green-600" : "text-red-600"}>
              {uploadTrend.trend.toFixed(1)}%
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <AreaChart data={uploadData?.data || []}>
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