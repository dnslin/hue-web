"use client";

import React from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MetricCardProps } from "../../types/dashboard.types";
import { formatChange, getTrendColor } from "../../utils/formatters";
import { cardVariants } from "../../utils/animations";

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

// 加载骨架组件
const MetricCardSkeleton: React.FC = () => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
      <div className="h-8 w-8 bg-muted animate-pulse rounded-lg" />
    </CardHeader>
    <CardContent>
      <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
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

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      className={cn("group", className)}
    >
      <Card className="relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card/80 hover:shadow-lg">
        {/* 微妙的背景渐变 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground leading-none">
              {title}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground/70">{description}</p>
            )}
          </div>

          <div className="flex-shrink-0">
            <div className="p-2 rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="space-y-2">
            {/* 主要数值 */}
            <div className="text-2xl font-bold tracking-tight">
              {typeof value === "number" ? value.toLocaleString() : value}
            </div>

            {/* 变化趋势 */}
            {changeText && (
              <div className="flex items-center gap-1">
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
        </CardContent>

        {/* 底部装饰线 */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary/50 to-primary/20"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </Card>
    </motion.div>
  );
};

export default MetricCard;
