"use client";

import React, { useState, useEffect } from "react";
import { Area, AreaChart } from "recharts";
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

// 定义完整的颜色映射
const getChartColor = (color: string, isDark: boolean) => {
  const colorMap: Record<string, { light: string; dark: string }> = {
    "hsl(var(--chart-1))": { light: "#3B82F6", dark: "#60A5FA" }, // 蓝色
    "hsl(var(--chart-2))": { light: "#10B981", dark: "#34D399" }, // 绿色
    "hsl(var(--chart-3))": { light: "#F59E0B", dark: "#FBBF24" }, // 橙色
    "hsl(var(--chart-4))": { light: "#EF4444", dark: "#F87171" }, // 红色
  };

  // 如果是预定义的 CSS 变量，使用映射
  if (colorMap[color]) {
    return isDark ? colorMap[color].dark : colorMap[color].light;
  }

  // 如果是直接的颜色值，在暗色模式下增加亮度
  if (isDark && color.startsWith("#")) {
    // 简单的颜色亮化处理
    return color;
  }

  return color;
};

export const MiniChart: React.FC<MiniChartProps> = ({
  data,
  color = "hsl(var(--chart-1))",
  height = 40,
  className,
  animated = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  type = "area",
}) => {
  const [isDark, setIsDark] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 生成唯一ID避免SVG渐变冲突
  const gradientId = React.useMemo(
    () => `fillGradient-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  // 检测暗色模式
  useEffect(() => {
    setIsMounted(true);

    const checkDarkMode = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      console.log("MiniChart 暗色模式检测:", isDarkMode);
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

  // 获取有效的图表颜色
  const effectiveColor = getChartColor(color, isDark);

  console.log("MiniChart 颜色信息:", {
    originalColor: color,
    effectiveColor,
    isDark,
    isMounted,
  });

  // 根据主题调整渐变透明度 - 确保在暗色模式下有足够的可见度
  const gradientStartOpacity = isDark ? 0.6 : 0.4;
  const gradientEndOpacity = isDark ? 0.1 : 0.05;

  const chartConfig = {
    value: {
      label: "数值",
      color: effectiveColor,
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

// 预设的图表类型 - 使用明确的颜色值
export const TrendChart: React.FC<Omit<MiniChartProps, "color">> = (props) => (
  <MiniChart {...props} color="#3B82F6" />
);

export const PerformanceChart: React.FC<Omit<MiniChartProps, "color">> = (
  props
) => <MiniChart {...props} color="#10B981" />;

export const UsageChart: React.FC<Omit<MiniChartProps, "color">> = (props) => (
  <MiniChart {...props} color="#F59E0B" />
);

export const ErrorChart: React.FC<Omit<MiniChartProps, "color">> = (props) => (
  <MiniChart {...props} color="#EF4444" />
);
