import { LucideIcon } from "lucide-react";

// 基础数据类型
export type TrendDirection = "up" | "down" | "stable";
export type SystemStatus = "healthy" | "warning" | "error";

// 指标数据类型
export interface MetricData {
  value: number | string;
  change: number;
  trend: TrendDirection;
  label?: string;
}

// 统计指标类型
export interface DashboardMetrics {
  users: MetricData;
  images: MetricData;
  storage: MetricData;
  activity: MetricData;
}

// 系统状态类型
export interface SystemStatusData {
  cpu: number;
  memory: number;
  disk: number;
  status: SystemStatus;
  uptime?: string;
  lastUpdate?: Date;
}

// 活动项类型
export interface ActivityItem {
  id: string;
  type: "upload" | "user_register" | "system" | "error";
  title: string;
  description?: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, unknown>;
}

// 快捷操作类型
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  variant?: "default" | "primary" | "secondary";
  disabled?: boolean;
  badge?: string;
}

// Dashboard 完整数据类型
export interface DashboardData {
  metrics: DashboardMetrics;
  systemStatus: SystemStatusData;
  recentActivity: ActivityItem[];
  quickActions: QuickAction[];
}

// 组件 Props 类型
export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: TrendDirection;
  icon: LucideIcon;
  loading?: boolean;
  className?: string;
  description?: string;
}

export interface ActionCardProps {
  action: QuickAction;
  onClick?: () => void;
  className?: string;
}

export interface StatusIndicatorProps {
  label: string;
  value: number;
  status?: SystemStatus;
  className?: string;
}

// API 响应类型
export interface DashboardApiResponse {
  success: boolean;
  data: DashboardData;
  timestamp: string;
}

// 错误类型
export interface DashboardError {
  code: string;
  msg: string;
  details?: unknown;
}

