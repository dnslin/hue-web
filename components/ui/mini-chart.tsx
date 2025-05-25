"use client";

import React, { useState, useEffect } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
  animated?: boolean;
  type?: "area" | "line" | "bar";
}

export const MiniChart: React.FC<MiniChartProps> = ({
  data,
  color = "hsl(var(--chart-1))",
  height = 40,
  className,
  animated = true,
  type = "area",
}) => {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 生成唯一ID避免SVG渐变冲突
  const gradientId = React.useMemo(
    () => `fillGradient-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  // 检测暗色模式 - 使用DOM类检测而非状态依赖
  useEffect(() => {
    setIsMounted(true);

    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };

    // 初始检测
    checkDarkMode();

    // 监听类变化
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ height }}
      >
        <div className="text-xs text-muted-foreground">无数据</div>
      </div>
    );
  }

  // 转换数据格式为 Recharts 需要的格式
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  // 根据主题调整渐变透明度 - 确保最小可见度
  const gradientStartOpacity = isMounted && isDark ? 0.8 : Math.max(0.4, 0.3);
  const gradientEndOpacity = isMounted && isDark ? 0.2 : Math.max(0.1, 0.05);

  // 在暗色模式下使用更明亮的颜色
  const effectiveColor =
    isMounted && isDark
      ? color.includes("--chart-1")
        ? "#8B5CF6" // 紫色
        : color.includes("--chart-2")
        ? "#10B981" // 绿色
        : color.includes("--chart-3")
        ? "#F59E0B" // 橙色
        : color.includes("--chart-4")
        ? "#EF4444" // 红色
        : color
      : color;

  const chartConfig = {
    value: {
      label: "数值",
      color,
    },
  } satisfies ChartConfig;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart
          width={405}
          height={height}
          data={chartData}
          margin={{
            top: 2,
            right: 2,
            left: 2,
            bottom: 2,
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={effectiveColor}
                stopOpacity={gradientStartOpacity}
              />
              <stop
                offset="95%"
                stopColor={effectiveColor}
                stopOpacity={gradientEndOpacity}
              />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={effectiveColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            dot={false}
            activeDot={false}
            isAnimationActive={animated}
            animationDuration={1200}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

// 预设的图表类型
export const TrendChart: React.FC<Omit<MiniChartProps, "color">> = (props) => (
  <MiniChart {...props} color="hsl(var(--chart-1))" />
);

export const PerformanceChart: React.FC<Omit<MiniChartProps, "color">> = (
  props
) => <MiniChart {...props} color="hsl(var(--chart-2))" />;

export const UsageChart: React.FC<Omit<MiniChartProps, "color">> = (props) => (
  <MiniChart {...props} color="hsl(var(--chart-3))" />
);

export const ErrorChart: React.FC<Omit<MiniChartProps, "color">> = (props) => (
  <MiniChart {...props} color="hsl(var(--chart-4))" />
);

// 高级迷你图表组件，支持多种图表类型
interface AdvancedMiniChartProps extends MiniChartProps {
  showDots?: boolean;
  strokeWidth?: number;
  fillOpacity?: number;
}

export const AdvancedMiniChart: React.FC<AdvancedMiniChartProps> = ({
  data,
  color = "hsl(var(--chart-1))",
  height = 40,
  className,
  animated = true,
  showDots = false,
  strokeWidth = 2,
  fillOpacity = 0.3,
}) => {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 生成唯一ID避免SVG渐变冲突
  const gradientId = React.useMemo(
    () => `advancedFillGradient-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  // 检测暗色模式 - 使用DOM类检测而非状态依赖
  useEffect(() => {
    setIsMounted(true);

    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };

    // 初始检测
    checkDarkMode();

    // 监听类变化
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ height }}
      >
        <div className="text-xs text-muted-foreground">无数据</div>
      </div>
    );
  }

  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  // 根据主题调整渐变透明度 - 确保最小可见度
  const adjustedFillOpacity =
    isMounted && isDark
      ? Math.min(Math.max(fillOpacity * 2, 0.6), 0.8)
      : Math.max(fillOpacity, 0.3);
  const gradientEndOpacity = isMounted && isDark ? 0.2 : Math.max(0.1, 0.05);

  // 在暗色模式下使用更明亮的颜色
  const effectiveColor =
    isMounted && isDark
      ? color.includes("--chart-1")
        ? "#8B5CF6" // 紫色
        : color.includes("--chart-2")
        ? "#10B981" // 绿色
        : color.includes("--chart-3")
        ? "#F59E0B" // 橙色
        : color.includes("--chart-4")
        ? "#EF4444" // 红色
        : color
      : color;

  const chartConfig = {
    value: {
      label: "数值",
      color,
    },
  } satisfies ChartConfig;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ChartContainer config={chartConfig} className="h-full w-full">
        <AreaChart
          width={405}
          height={height}
          data={chartData}
          margin={{
            top: 4,
            right: 4,
            left: 4,
            bottom: 4,
          }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={effectiveColor}
                stopOpacity={adjustedFillOpacity}
              />
              <stop
                offset="95%"
                stopColor={effectiveColor}
                stopOpacity={gradientEndOpacity}
              />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={effectiveColor}
            strokeWidth={strokeWidth}
            fill={`url(#${gradientId})`}
            fillOpacity={1}
            dot={
              showDots ? { fill: effectiveColor, strokeWidth: 0, r: 2 } : false
            }
            activeDot={showDots ? { r: 3, fill: effectiveColor } : false}
            isAnimationActive={animated}
            animationDuration={1200}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};
