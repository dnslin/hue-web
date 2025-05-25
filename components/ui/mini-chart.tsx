"use client";

import React from "react";
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
            <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#fillGradient)"
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
            <linearGradient
              id={`fillGradient-${color}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={color} stopOpacity={fillOpacity} />
              <stop offset="95%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={strokeWidth}
            fill={`url(#fillGradient-${color})`}
            fillOpacity={1}
            dot={showDots ? { fill: color, strokeWidth: 0, r: 2 } : false}
            activeDot={showDots ? { r: 3, fill: color } : false}
            isAnimationActive={animated}
            animationDuration={1200}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};
