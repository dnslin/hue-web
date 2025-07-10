import { LucideIcon } from "lucide-react";
import React from "react";

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

// ====== 统计页面相关类型 ======

// 系统级统计数据 (对应新的 /admin/dashboard/system-stats 接口)
export interface SystemStatsData {
  totalUsers: number;
  totalImages: number;
  totalStorage: number;          // 存储使用总数 (字节)
  totalAccesses: number;         // 总访问量
  totalUploads: number;          // 总上传数
  monthlyActiveUsers: number;    // 月活用户数
  dailyActiveUsers: number;      // 日活用户数
  averageFileSize: number;       // 平均文件大小 (字节)
}

// 全局统计数据 (保持向后兼容)
export interface GlobalStatsData {
  totalUsers: number;
  totalImages: number;
  totalStorageUsed: number; // 字节
  totalViews: number;
  totalUploads: number;
  monthlyActiveUsers: number;
  dailyActiveUsers: number;
  averageFileSize: number; // 字节
  topStorageUser?: string;
  systemUptime?: string;
}

// 时间序列数据点
export interface TimeSeriesDataPoint {
  date: string; // YYYY-MM-DD
  value: number;
  label?: string;
}

// 访问统计数据
export interface AccessStatsData {
  period: 'daily' | 'weekly' | 'monthly';
  data: TimeSeriesDataPoint[];
  totalViews: number;
  averageDaily: number;
  peakDate?: string;
  peakValue?: number;
}

// 上传统计数据
export interface UploadStatsData {
  period: 'daily' | 'weekly' | 'monthly';
  data: TimeSeriesDataPoint[];
  totalUploads: number;
  totalSize: number; // 字节
  averageDaily: number;
  averageSize: number; // 字节
  peakDate?: string;
  peakValue?: number;
}

// 地理分布数据
export interface GeoDistributionItem {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
  visits: number;
  percentage: number;
  flag?: string;
}

export interface GeoDistributionData {
  data: GeoDistributionItem[];
  totalCountries: number;
  topCountry: string;
  topVisits: number;
}

// 来源分布数据
export interface ReferrerDistributionItem {
  domain: string;
  visits: number;
  percentage: number;
  type: 'search' | 'social' | 'direct' | 'referral' | 'other';
  icon?: string;
}

export interface ReferrerDistributionData {
  data: ReferrerDistributionItem[];
  totalReferrers: number;
  topReferrer: string;
  directTrafficPercentage: number;
}

// 热门图片数据
export interface TopImageItem {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  views: number;
  size: number; // 字节
  uploadDate: string;
  uploader: {
    id: number;
    username: string;
    avatar?: string;
  };
  mimeType: string;
  isPublic: boolean;
}

export interface TopImagesData {
  data: TopImageItem[];
  totalImages: number;
  mostViewed: TopImageItem | null;
  sortBy: 'views_total' | 'views_month' | 'views_day';
}

// 热门用户数据
export interface TopUserItem {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  totalUploads: number;
  totalViews: number;
  totalStorage: number; // 字节
  joinDate: string;
  lastActiveDate: string;
  rank: number;
  badge?: string;
}

export interface TopUsersData {
  data: TopUserItem[];
  totalUsers: number;
  topUser: TopUserItem | null;
  sortBy: 'uploads_total' | 'views_total';
}

// 统计页面完整数据类型
export interface StatsData {
  systemStats: SystemStatsData;
  globalStats: GlobalStatsData;
  accessStats: AccessStatsData;
  uploadStats: UploadStatsData;
  geoDistribution: GeoDistributionData;
  referrerDistribution: ReferrerDistributionData;
  topImages: TopImagesData;
  topUsers: TopUsersData;
}

// API请求参数类型
export interface StatsApiParams {
  period?: 'daily' | 'weekly' | 'monthly';
  days?: number;
  limit?: number;
  sortBy?: string;
}

// 统计API响应类型
export interface StatsApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// 统计组件Props类型
export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: TrendDirection;
  icon: LucideIcon;
  loading?: boolean;
  className?: string;
  unit?: string;
  format?: 'number' | 'bytes' | 'percentage';
}

export interface ChartContainerProps {
  title: string;
  data: unknown[];
  loading?: boolean;
  error?: string;
  className?: string;
  height?: number;
  children: React.ReactNode;
}

export interface TrendChartProps {
  data: TimeSeriesDataPoint[];
  title: string;
  valueKey?: string;
  color?: string;
  loading?: boolean;
  height?: number;
  className?: string;
}

export interface DistributionChartProps {
  data: Array<{ name: string; value: number; percentage?: number }>;
  title: string;
  loading?: boolean;
  height?: number;
  className?: string;
}

export interface RankingTableProps {
  data: Array<Record<string, unknown>>;
  columns: Array<{
    key: string;
    title: string;
    render?: (value: unknown, record: Record<string, unknown>) => React.ReactNode;
  }>;
  loading?: boolean;
  className?: string;
}

