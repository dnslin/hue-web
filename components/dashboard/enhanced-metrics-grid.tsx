"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Users,
  Image,
  HardDrive,
  Eye,
  Upload,
  Calendar,
  TrendingUp,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/magicui/number-ticker";
import { MiniChart } from "@/components/ui/mini-chart";
import {
  useSystemStats,
  useStatsLoading,
  useStatsError,
} from "@/lib/store/stats";
import { containerVariants, itemVariants } from "@/lib/dashboard/animations";
import { cn } from "@/lib/utils";

// 格式化字节大小
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const metricIcons = {
  users: Users,
  images: Image,
  storage: HardDrive,
  access: Eye,
  upload: Upload,
  monthly: Calendar,
  daily: TrendingUp,
  size: FileText,
};

// 模拟计算变化和趋势
const calculateChange = (): number => {
  return Math.round((Math.random() * 20 - 10) * 100) / 100;
};

const calculateTrend = (change: number): "up" | "down" | "stable" => {
  if (change > 2) return "up";
  if (change < -2) return "down";
  return "stable";
};

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
      return (
        <TrendingUp
          {...iconProps}
          className={cn(iconProps.className, "rotate-180")}
        />
      );
    default:
      return (
        <div
          {...iconProps}
          className={cn(iconProps.className, "bg-muted rounded-full")}
        />
      );
  }
};

// 获取趋势颜色
const getTrendColor = (trend: string) => {
  switch (trend) {
    case "up":
      return "text-green-600";
    case "down":
      return "text-red-600";
    default:
      return "text-muted-foreground";
  }
};

// 格式化变化百分比
const formatChange = (change: number): string => {
  const abs = Math.abs(change);
  return `${abs.toFixed(1)}%`;
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

interface EnhancedMetricsGridProps {
  className?: string;
}

export function EnhancedMetricsGrid({ className }: EnhancedMetricsGridProps) {
  const systemData = useSystemStats();
  const isLoading = useStatsLoading();
  const error = useStatsError();

  if (error || !systemData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full text-center text-muted-foreground py-8">
          无法加载统计数据
        </div>
      </div>
    );
  }

  const metrics = [
    {
      id: "users",
      title: "总用户数",
      value: systemData.totalUsers ?? 0,
      icon: metricIcons.users,
      description: "注册用户总数",
      bgColor: "bg-gradient-to-br from-blue-500/10 to-blue-600/30",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
      chartColor: "#3B82F6",
    },
    {
      id: "images",
      title: "图片总数",
      value: systemData.totalImages ?? 0,
      icon: metricIcons.images,
      description: "已上传图片数量",
      bgColor: "bg-gradient-to-br from-green-500/10 to-green-600/20",
      iconBg: "bg-gradient-to-br from-green-500 to-green-600",
      chartColor: "#10B981",
    },
    {
      id: "storage",
      title: "存储使用",
      value: formatBytes(systemData.totalStorage ?? 0),
      icon: metricIcons.storage,
      description: "当前存储空间使用",
      bgColor: "bg-gradient-to-br from-orange-500/10 to-orange-600/20",
      iconBg: "bg-gradient-to-br from-orange-500 to-orange-600",
      chartColor: "#F59E0B",
    },
    {
      id: "access",
      title: "总访问量",
      value: systemData.totalAccesses ?? 0,
      icon: metricIcons.access,
      description: "累计访问次数",
      bgColor: "bg-gradient-to-br from-purple-500/10 to-purple-600/20",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
      chartColor: "#8B5CF6",
    },
    {
      id: "upload",
      title: "总上传数",
      value: systemData.totalUploads ?? 0,
      icon: metricIcons.upload,
      description: "累计上传次数",
      bgColor: "bg-gradient-to-br from-indigo-500/10 to-indigo-600/20",
      iconBg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      chartColor: "#6366F1",
    },
    {
      id: "monthly",
      title: "月活用户",
      value: systemData.monthlyActiveUsers ?? 0,
      icon: metricIcons.monthly,
      description: "本月活跃用户",
      bgColor: "bg-gradient-to-br from-pink-500/10 to-pink-600/20",
      iconBg: "bg-gradient-to-br from-pink-500 to-pink-600",
      chartColor: "#EC4899",
    },
    {
      id: "daily",
      title: "日活用户",
      value: systemData.dailyActiveUsers ?? 0,
      icon: metricIcons.daily,
      description: "今日活跃用户",
      bgColor: "bg-gradient-to-br from-cyan-500/10 to-cyan-600/20",
      iconBg: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      chartColor: "#06B6D4",
    },
    {
      id: "size",
      title: "平均文件大小",
      value: formatBytes(systemData.averageFileSize ?? 0),
      icon: metricIcons.size,
      description: "文件平均大小",
      bgColor: "bg-gradient-to-br from-emerald-500/10 to-emerald-600/20",
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      chartColor: "#10B981",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20" />
              <div className="h-10 w-10 bg-muted rounded-lg" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2" />
              <div className="h-6 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={className}
    >
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const change = calculateChange();
          const trend = calculateTrend(change);
          const trendColor = getTrendColor(trend);
          const changeText = formatChange(change);
          const chartData = generateChartData(trend);

          return (
            <motion.div
              key={metric.id}
              variants={itemVariants}
              custom={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-lg border-0",
                  metric.bgColor
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-foreground leading-none">
                      {metric.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {metric.description}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl shadow-lg transition-all duration-300 hover:scale-110",
                        metric.iconBg
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 主要数值 */}
                  <div className="space-y-1">
                    <div className="text-2xl font-bold tracking-tight">
                      {typeof metric.value === "number" ? (
                        <NumberTicker
                          value={metric.value}
                          className="text-2xl font-bold tracking-tight"
                        />
                      ) : (
                        metric.value
                      )}
                    </div>

                    {/* 变化趋势 */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 border-0",
                          trend === "up" &&
                            "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                          trend === "down" &&
                            "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
                          trend === "stable" && "bg-muted text-muted-foreground"
                        )}
                      >
                        <TrendIcon trend={trend} className="mr-1" />
                        {changeText}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        较上月
                      </span>
                    </div>
                  </div>

                  {/* 迷你图表 */}
                  <div className="mt-3">
                    <MiniChart
                      data={chartData}
                      color={metric.chartColor}
                      height={32}
                      className="w-full"
                    />
                  </div>
                </CardContent>

                {/* 底部装饰线 */}
                <motion.div
                  className={cn(
                    "absolute bottom-0 left-0 h-1 rounded-full",
                    metric.iconBg
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                />
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default EnhancedMetricsGrid;
