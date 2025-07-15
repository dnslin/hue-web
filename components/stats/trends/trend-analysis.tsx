"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { 
  Area, 
  AreaChart, 
  Line, 
  ComposedChart,
  XAxis, 
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";
import { useAccessStats, useUploadStats, useStatsLoading } from "@/lib/store/stats";
import { TrendingUp, TrendingDown, Eye, Upload, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TrendAnalysisProps {
  period: 7 | 30 | 365;
}

// 定义图表颜色映射，确保在不同主题下都有良好的可见性
const getChartColor = (colorKey: string, isDark: boolean) => {
  const colorMap: Record<string, { light: string; dark: string }> = {
    access: { light: "#3B82F6", dark: "#60A5FA" }, // 蓝色 - 访问量
    upload: { light: "#10B981", dark: "#34D399" }, // 绿色 - 上传数
    size: { light: "#F59E0B", dark: "#FBBF24" }, // 橙色 - 文件大小
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
  size: {
    label: "文件大小",
    color: "hsl(var(--chart-3))",
  },
};

export function TrendAnalysis({ period }: TrendAnalysisProps) {
  const accessData = useAccessStats();
  const uploadData = useUploadStats();
  const isLoading = useStatsLoading();

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

  // X轴时间格式化函数
  const formatXAxisTick = (value: string) => {
    const date = new Date(value);
    if (period === 7) {
      return date.toLocaleDateString("zh-CN", {
        month: isMobile ? "numeric" : "short",
        day: "numeric",
      });
    } else if (period === 30) {
      return date.toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
      });
    } else { // 365
      return date.toLocaleDateString("zh-CN", {
        year: "2-digit",
        month: "short",
      });
    }
  };

  // 工具提示格式化函数
  const formatTooltipLabel = (value: string) => {
    const date = new Date(value);
    if (period === 7 || period === 30) {
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else { // 365
      return date.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
      });
    }
  };

  // 获取时间范围显示文本
  const getPeriodLabel = () => {
    switch (period) {
      case 7: return "7天";
      case 30: return "30天";
      case 365: return "1年";
      default: return "未知";
    }
  };

  // 计算趋势统计
  const calculateTrendStats = (data: any[]) => {
    if (!data || data.length < 2) {
      return { change: 0, isPositive: true, total: 0, average: 0 };
    }

    // 适配不同的数据字段名格式
    const getValueFromItem = (item: any) => {
      // 支持 camelCase 格式（后端返回格式）
      if (item.accessCount !== undefined) return item.accessCount;
      if (item.uploadCount !== undefined) return item.uploadCount;
      // 支持 snake_case 格式（向后兼容）
      if (item.access_count !== undefined) return item.access_count;
      if (item.upload_count !== undefined) return item.upload_count;
      return item.value || 0;
    };

    const total = data.reduce((sum, item) => sum + getValueFromItem(item), 0);
    const average = total / data.length;
    
    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    
    if (!latest || !previous) {
      return { change: 0, isPositive: true, total, average };
    }
    
    const latestValue = getValueFromItem(latest);
    const previousValue = getValueFromItem(previous);
    
    if (previousValue === 0) {
      if (latestValue > 0) {
        return { change: 100, isPositive: true, total, average: Math.round(average) };
      }
      return { change: 0, isPositive: true, total, average: Math.round(average) };
    }
    
    const change = ((latestValue - previousValue) / previousValue) * 100;
    
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
              {getPeriodLabel()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 md:h-64 w-full">
            <AreaChart
              data={accessData?.data || []}
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
                tickFormatter={formatXAxisTick}
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
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length > 0) {
                    return (
                      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
                        <p className="text-sm font-medium text-foreground mb-2">
                          {formatTooltipLabel(label)}
                        </p>
                        <div className="space-y-2">
                          {payload.map((entry, index) => {
                            const { dataKey, value, color } = entry;
                            let displayText = "";
                            let displayValue = "";
                            let icon = null;
                            
                            if (dataKey === "accessCount") {
                              displayText = "访问数量";
                              displayValue = `${value}次`;
                              icon = <Eye className="h-3 w-3" style={{ color }} />;
                            }
                            
                            return (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {icon}
                                  <span className="text-xs text-muted-foreground">{displayText}:</span>
                                </div>
                                <span className="text-xs font-medium" style={{ color }}>
                                  {displayValue}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="accessCount"
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
          <ChartContainer config={chartConfig} className="h-48 md:h-64 w-full">
            <ComposedChart
              data={uploadData?.data || []}
              margin={isMobile ? { top: 5, right: 5, left: 5, bottom: 50 } : { top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                tickFormatter={formatXAxisTick}
              />
              <YAxis
                yAxisId="left"
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
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  // 统一以MB为单位显示
                  return `${(value / (1024 * 1024)).toFixed(2)}MB`;
                }}
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length > 0) {
                    return (
                      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[180px]">
                        <p className="text-sm font-medium text-foreground mb-2">
                          {formatTooltipLabel(label)}
                        </p>
                        <div className="space-y-2">
                          {payload.map((entry, index) => {
                            const { dataKey, value, color } = entry;
                            let displayText = "";
                            let displayValue = "";
                            let icon = null;
                            
                            if (dataKey === "uploadCount") {
                              displayText = "上传数量";
                              displayValue = `${value}个`;
                              icon = <Upload className="h-3 w-3" style={{ color }} />;
                            } else if (dataKey === "uploadSize") {
                              displayText = "文件大小";
                              displayValue = `${(Number(value) / (1024 * 1024)).toFixed(2)}MB`;
                              icon = <BarChart3 className="h-3 w-3" style={{ color }} />;
                            }
                            
                            return (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {icon}
                                  <span className="text-xs text-muted-foreground">{displayText}:</span>
                                </div>
                                <span className="text-xs font-medium" style={{ color }}>
                                  {displayValue}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              {/* 上传数量的背景填充 */}
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="uploadCount"
                stroke={getChartColor("upload", isDark)}
                fill={getChartColor("upload", isDark)}
                fillOpacity={isDark ? 0.3 : 0.2}
                strokeWidth={0}
                legendType="none"
              />
              {/* 文件大小的背景填充 */}
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="uploadSize"
                stroke={getChartColor("size", isDark)}
                fill={getChartColor("size", isDark)}
                fillOpacity={isDark ? 0.2 : 0.15}
                strokeWidth={0}
                legendType="none"
              />
              {/* 上传数量的线条 */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="uploadCount"
                stroke={getChartColor("upload", isDark)}
                strokeWidth={isDark ? 3 : 2}
                dot={isMobile ? { fill: getChartColor("upload", isDark), strokeWidth: 2, r: 4 } : false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="上传数量"
              />
              {/* 文件大小线条 */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="uploadSize"
                stroke={getChartColor("size", isDark)}
                strokeWidth={isDark ? 3 : 2}
                dot={isMobile ? { fill: getChartColor("size", isDark), strokeWidth: 2, r: 4 } : false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="文件大小(MB)"
              />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}