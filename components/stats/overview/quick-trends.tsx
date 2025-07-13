"use client";

import React, { useEffect, useState } from "react";
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
} from "@/lib/store/stats";
import { TrendingUp, TrendingDown } from "lucide-react";

// 定义图表颜色映射，确保在不同主题下都有良好的可见性
const getChartColor = (colorKey: string, isDark: boolean) => {
  const colorMap: Record<string, { light: string; dark: string }> = {
    access: { light: "#3B82F6", dark: "#60A5FA" }, // 蓝色 - 访问量
    upload: { light: "#10B981", dark: "#34D399" }, // 绿色 - 上传数
  };

  return isDark ? colorMap[colorKey].dark : colorMap[colorKey].light;
};

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

  // 主题检测状态
  const [isDark, setIsDark] = useState(false);
  // 屏幕尺寸状态
  const [isMobile, setIsMobile] = useState(false);

  // 检测暗色模式和屏幕尺寸
  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 初始检测
    checkDarkMode();
    checkScreenSize();

    // 监听类变化
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // 监听窗口大小变化
    window.addEventListener('resize', checkScreenSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // 组件级数据获取 - 确保数据加载，专门为快速趋势请求7天数据
  React.useEffect(() => {
    // 如果没有数据且不在加载中，尝试获取数据
    if (!accessData && !uploadData && !isLoading) {
      // 为快速趋势专门请求7天的数据
      fetchAllStats({ period: "daily", days: 7 });
    }
  }, [accessData, uploadData, isLoading, fetchAllStats]);


  // 获取最近7天的日期列表
  const getLast7Days = () => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }

    return days;
  };

  // 数据处理：将后端数据转换为图表格式，只取最近7天
  const processChartData = (data: any, dataType: "access" | "upload") => {
    const last7Days = getLast7Days();

    // 如果有真实数据，使用真实数据
    if (data?.data?.length) {
      // 支持两种字段名格式：驼峰命名和下划线命名
      const valueField = dataType === "upload"
        ? (data.data[0].uploadCount !== undefined ? "uploadCount" : "upload_count")
        : (data.data[0].accessCount !== undefined ? "accessCount" : "access_count");

      // 创建一个日期到数据的映射
      const dataMap = new Map();
      data.data.forEach((item: any) => {
        if (item?.date) {
          dataMap.set(item.date, Number(item[valueField]) || 0);
        }
      });

      // 生成最近7天的完整数据，缺失的日期补0
      const processedData = last7Days.map(date => ({
        date: date,
        value: dataMap.get(date) || 0,
      }));

      return processedData;
    }

    // 如果没有数据，返回空的7天数据结构
    return last7Days.map(date => ({
      date: date,
      value: 0,
    }));
  };

  const processedAccessData = processChartData(accessData, "access");
  const processedUploadData = processChartData(uploadData, "upload");

  // 检查是否有任何数据结构（包括全0数据）
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

    // 避免除以0的情况
    if (previous.value === 0) {
      // 如果前一个值为0，当前值大于0，则为100%增长
      if (latest.value > 0) {
        return { trend: 100, isPositive: true };
      }
      // 如果都为0，则无变化
      return { trend: 0, isPositive: true };
    }

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
      <Card className="min-w-0 hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
          <CardTitle className="text-base font-medium">访问趋势</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            {accessTrend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1 animate-pulse" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1 animate-pulse" />
            )}
            <span
              className={
                accessTrend.isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"
              }
            >
              {accessTrend.trend.toFixed(1)}%
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 md:h-64 w-full">
            <AreaChart
              data={processedAccessData}
              margin={isMobile ? { top: 5, right: 5, left: 5, bottom: 50 } : { top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                interval={isMobile ? 0 : "preserveStartEnd"}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 60 : 30}
                tickMargin={isMobile ? 10 : 5}
                minTickGap={isMobile ? 0 : 30}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("zh-CN", {
                    month: isMobile ? "numeric" : "short",
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
                stroke={getChartColor("access", isDark)}
                fill={getChartColor("access", isDark)}
                fillOpacity={isDark ? 0.3 : 0.2}
                strokeWidth={isDark ? 3 : 2}
                strokeDasharray="0"
                dot={isMobile ? { fill: getChartColor("access", isDark), strokeWidth: 2, r: 4 } : false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ChartContainer>
          <div className="mt-4 text-sm text-muted-foreground">
            过去 7 天的访问趋势
          </div>
        </CardContent>
      </Card>

      {/* 上传趋势 */}
      <Card className="min-w-0 hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
          <CardTitle className="text-base font-medium">上传趋势</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            {uploadTrend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1 animate-pulse" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1 animate-pulse" />
            )}
            <span
              className={
                uploadTrend.isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"
              }
            >
              {uploadTrend.trend.toFixed(1)}%
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 md:h-64 w-full">
            <AreaChart
              data={processedUploadData}
              margin={isMobile ? { top: 5, right: 5, left: 5, bottom: 50 } : { top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                interval={isMobile ? 0 : "preserveStartEnd"}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 60 : 30}
                tickMargin={isMobile ? 10 : 5}
                minTickGap={isMobile ? 0 : 30}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("zh-CN", {
                    month: isMobile ? "numeric" : "short",
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
                stroke={getChartColor("upload", isDark)}
                fill={getChartColor("upload", isDark)}
                fillOpacity={isDark ? 0.3 : 0.2}
                strokeWidth={isDark ? 3 : 2}
                strokeDasharray="0"
                dot={isMobile ? { fill: getChartColor("upload", isDark), strokeWidth: 2, r: 4 } : false}
                activeDot={{ r: 6, strokeWidth: 0 }}
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
