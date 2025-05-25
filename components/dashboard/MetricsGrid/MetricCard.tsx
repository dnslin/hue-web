"use client";

import React from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { MagicCard } from "@/components/magicui/magic-card";
import { MiniChart } from "@/components/ui/mini-chart";
import { cn } from "@/lib/utils";
import { MetricCardProps } from "@/lib/types/dashboard";
import { formatChange, getTrendColor } from "@/lib/dashboard/formatters";
import { cardVariants } from "@/lib/dashboard/animations";

// 趋势图标组件
const TrendIcon: React.FC<{ trend: string; className?: string }> = ({
  trend,
  className,
}) => {
  const iconProps = { className: cn("h-3 w-3", className) };

  switch (trend) {
    case "up":
      return <TrendingUp {...iconProps} />;
    case "down":
      return <TrendingDown {...iconProps} />;
    default:
      return <Minus {...iconProps} />;
  }
};

// 图标颜色映射
const getIconColors = (title: string) => {
  const colorMap: Record<
    string,
    { bg: string; text: string; gradient: string }
  > = {
    总用户数: {
      bg: "bg-blue-100 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500 to-blue-600",
    },
    图片总数: {
      bg: "bg-green-100 dark:bg-green-900/20",
      text: "text-green-600 dark:text-green-400",
      gradient: "from-green-500 to-green-600",
    },
    存储使用: {
      bg: "bg-orange-100 dark:bg-orange-900/20",
      text: "text-orange-600 dark:text-orange-400",
      gradient: "from-orange-500 to-orange-600",
    },
    今日访问: {
      bg: "bg-purple-100 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
      gradient: "from-purple-500 to-purple-600",
    },
  };

  return (
    colorMap[title] || {
      bg: "bg-gray-100 dark:bg-gray-900/20",
      text: "text-gray-600 dark:text-gray-400",
      gradient: "from-gray-500 to-gray-600",
    }
  );
};

// 生成模拟图表数据
const generateChartData = (trend: string): number[] => {
  const baseData = Array.from({ length: 7 }, () => Math.random() * 100);

  if (trend === "up") {
    return baseData.map((val, i) => val + i * 5);
  } else if (trend === "down") {
    return baseData.map((val, i) => val - i * 3);
  }

  return baseData;
};

// 加载骨架组件
const MetricCardSkeleton: React.FC = () => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      <div className="h-10 w-10 bg-muted animate-pulse rounded-lg" />
    </CardHeader>
    <CardContent>
      <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
      <div className="h-6 w-full bg-muted animate-pulse rounded mb-2" />
      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
    </CardContent>
  </Card>
);

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = "stable",
  icon: Icon,
  loading = false,
  className,
  description,
}) => {
  if (loading) {
    return <MetricCardSkeleton />;
  }

  const trendColor = getTrendColor(trend);
  const changeText = change !== undefined ? formatChange(change) : null;
  const iconColors = getIconColors(title);
  const chartData = generateChartData(trend);

  // 获取图表颜色
  const chartColor =
    trend === "up"
      ? "hsl(var(--chart-1))"
      : trend === "down"
      ? "hsl(var(--chart-4))"
      : "hsl(var(--chart-2))";

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      className={cn("group", className)}
    >
      <MagicCard
        className="h-full"
        gradientSize={150}
        gradientColor="#262626"
        gradientOpacity={0.05}
      >
        <Card className="relative overflow-hidden border-0 bg-transparent h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium text-muted-foreground leading-none">
                {title}
              </p>
              {description && (
                <p className="text-xs text-muted-foreground/70">
                  {description}
                </p>
              )}
            </div>

            <div className="flex-shrink-0">
              <div
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110",
                  iconColors.bg,
                  "bg-gradient-to-br",
                  iconColors.gradient,
                  "shadow-lg"
                )}
              >
                <Icon className={cn("h-5 w-5 text-white")} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 space-y-4">
            {/* 主要数值 */}
            <div className="space-y-1">
              <div className="text-2xl font-bold tracking-tight">
                {typeof value === "number" ? (
                  <NumberTicker
                    value={value}
                    className="text-2xl font-bold tracking-tight"
                  />
                ) : (
                  value
                )}
              </div>

              {/* 变化趋势 */}
              {changeText && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 border-0",
                      trendColor,
                      trend === "up" && "bg-green-100 dark:bg-green-900/20",
                      trend === "down" && "bg-red-100 dark:bg-red-900/20",
                      trend === "stable" && "bg-muted"
                    )}
                  >
                    <TrendIcon trend={trend} className="mr-1" />
                    {changeText}
                  </Badge>
                  <span className="text-xs text-muted-foreground">较上月</span>
                </div>
              )}
            </div>

            {/* 迷你图表 */}
            <div className="mt-3">
              <MiniChart
                data={chartData}
                color={chartColor}
                height={32}
                className="w-full"
              />
            </div>
          </CardContent>

          {/* 底部装饰线 */}
          <motion.div
            className={cn(
              "absolute bottom-0 left-0 h-1 bg-gradient-to-r rounded-full",
              iconColors.gradient
            )}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </Card>
      </MagicCard>
    </motion.div>
  );
};

export default MetricCard;
