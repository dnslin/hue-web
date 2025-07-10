"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  Area, 
  AreaChart, 
  Line, 
  LineChart, 
  XAxis, 
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";
import { useAccessStats, useUploadStats, useStatsLoading } from "@/lib/store/stats";
import { TrendingUp, TrendingDown, Eye, Upload, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TrendAnalysisProps {
  period: "7d" | "30d" | "90d" | "1y";
}

const chartConfig = {
  access: {
    label: "访问量",
    color: "hsl(var(--chart-1))",
  },
  upload: {
    label: "上传数", 
    color: "hsl(var(--chart-2))",
  },
  size: {
    label: "文件大小",
    color: "hsl(var(--chart-3))",
  },
};

export function TrendAnalysis({ period }: TrendAnalysisProps) {
  const accessData = useAccessStats();
  const uploadData = useUploadStats();
  const isLoading = useStatsLoading();

  // 计算趋势统计
  const calculateTrendStats = (data: any[]) => {
    if (!data || data.length < 2) {
      return { change: 0, isPositive: true, total: 0, average: 0 };
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const average = total / data.length;
    
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    
    if (!latest || !previous) {
      return { change: 0, isPositive: true, total, average };
    }
    
    const change = ((latest.value - previous.value) / previous.value) * 100;
    
    return {
      change: Math.abs(change),
      isPositive: change >= 0,
      total,
      average: Math.round(average),
    };
  };

  const accessStats = calculateTrendStats(accessData?.data || []);
  const uploadStats = calculateTrendStats(uploadData?.data || []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32" />
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 趋势概览卡片 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">访问量趋势</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{accessStats.total.toLocaleString()}</div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>总计</span>
              <div className="flex items-center">
                {accessStats.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={accessStats.isPositive ? "text-green-600" : "text-red-600"}>
                  {accessStats.change.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              平均每日: {accessStats.average.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">上传量趋势</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{uploadStats.total.toLocaleString()}</div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>总计</span>
              <div className="flex items-center">
                {uploadStats.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={uploadStats.isPositive ? "text-green-600" : "text-red-600"}>
                  {uploadStats.change.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              平均每日: {uploadStats.average.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细趋势图表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>访问量趋势</span>
            </CardTitle>
            <Badge variant="outline">
              {period === "7d" ? "7天" : period === "30d" ? "30天" : period === "90d" ? "90天" : "1年"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 sm:h-80">
            <AreaChart data={accessData?.data || []} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
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
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `${(value / 1000000).toFixed(1)}M`;
                    } else if (value >= 1000) {
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
        </CardContent>
      </Card>

      {/* 上传趋势图表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>上传量趋势</span>
            </CardTitle>
            <Badge variant="outline">包含文件大小</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 sm:h-80">
            <LineChart data={uploadData?.data || []} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("zh-CN", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => {
                    if (value >= 1000) {
                      return `${(value / 1000).toFixed(1)}K`;
                    }
                    return value.toString();
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `${(value / 1000000).toFixed(1)}MB`;
                    } else if (value >= 1000) {
                      return `${(value / 1000).toFixed(1)}KB`;
                    }
                    return `${value}B`;
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
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="value"
                  stroke={chartConfig.upload.color}
                  strokeWidth={2}
                  dot={false}
                  name="上传数量"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="size"
                  stroke={chartConfig.size.color}
                  strokeWidth={2}
                  dot={false}
                  name="文件大小"
                />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}