"use client";

import React from "react";
import { motion } from "motion/react";
import { Users, Images, HardDrive, Activity } from "lucide-react";
import { MetricCard } from "./metric-card";
import { DashboardMetrics } from "@/lib/types/dashboard";
import { containerVariants, itemVariants } from "@/lib/dashboard/animations";

interface MetricsGridProps {
  metrics: DashboardMetrics | null;
  loading?: boolean;
  className?: string;
}

// 指标配置映射
const METRIC_CONFIG = {
  users: {
    title: "总用户数",
    icon: Users,
    description: "注册用户总数",
  },
  images: {
    title: "图片总数",
    icon: Images,
    description: "已上传图片数量",
  },
  storage: {
    title: "存储使用",
    icon: HardDrive,
    description: "当前存储空间使用",
  },
  activity: {
    title: "今日访问",
    icon: Activity,
    description: "今日活跃访问量",
  },
} as const;

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  loading = false,
  className,
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={className}
    >
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(METRIC_CONFIG).map(([key, config], index) => {
          const metricData = metrics?.[key as keyof DashboardMetrics];

          return (
            <motion.div key={key} variants={itemVariants} custom={index}>
              <MetricCard
                title={config.title}
                description={config.description}
                icon={config.icon}
                value={metricData?.value ?? 0}
                change={metricData?.change}
                trend={metricData?.trend}
                loading={loading}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MetricsGrid;
