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
  gradientFrom?: string;
  gradientTo?: string;
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
  totalStorage: number; // 存储使用总数 (字节)
  totalAccesses: number; // 总访问量
  totalUploads: number; // 总上传数
  monthlyActiveUsers: number; // 月活用户数
  dailyActiveUsers: number; // 日活用户数
  averageFileSize: number; // 平均文件大小 (字节)
}

// 全局统计数据 (保持向后兼容)
export interface GlobalStatsData {
  totalAccesses: number; // 对应 total_accesses
  totalStorage: number; // 对应 total_storage
  totalUploads: number; // 对应 total_uploads
  // 以下字段GlobalStatsDTO不提供，组件应使用SystemStatsData
  totalUsers?: number;
  totalImages?: number;
  totalStorageUsed?: number; // 为兼容性保留
  totalViews?: number; // 为兼容性保留
  monthlyActiveUsers?: number;
  dailyActiveUsers?: number;
  averageFileSize?: number;
  topStorageUser?: string;
  systemUptime?: string;
}

// 时间序列数据点（前端统一格式）
export interface TimeSeriesDataPoint {
  date: string; // YYYY-MM-DD
  value: number;
  label?: string;
}

// 后端原始数据类型（与 swagger 定义一致）
export interface DailyAccessStatDTO {
  date: string; // YYYY-MM-DD
  access_count: number;
}

export interface DailyUploadStatDTO {
  date: string; // YYYY-MM-DD
  upload_count: number;
  upload_size: number; // 字节
}

// 访问统计数据（后端直接返回的格式）
export interface AccessStatsData {
  data: DailyAccessStatDTO[]; // 后端直接返回 DailyAccessStatDTO 数组
  // 以下字段可能需要前端计算或后端补充
  period?: "daily" | "weekly" | "monthly";
  totalViews?: number;
  averageDaily?: number;
  peakDate?: string;
  peakValue?: number;
}

// 上传统计数据（后端直接返回的格式）
export interface UploadStatsData {
  data: DailyUploadStatDTO[]; // 后端直接返回 DailyUploadStatDTO 数组
  // 以下字段可能需要前端计算或后端补充
  period?: "daily" | "weekly" | "monthly";
  totalUploads?: number;
  totalSize?: number; // 字节
  averageDaily?: number;
  averageSize?: number; // 字节
  peakDate?: string;
  peakValue?: number;
}

// 根据 Swagger DTO 定义的新分布统计类型

// 国家排行榜项 (对应 CountryRanking DTO - camelCase 版本)
export interface CountryRanking {
  country: string;
  countryCode: string; // 经过 case-converter 转换后的格式
  count: number;
  percentage: number;
}

// 地理位置信息 (对应 GeoLocationDTO - camelCase 版本)
export interface GeoLocationDTO {
  city: string;
  country: string;
  countryCode: string; // 经过 case-converter 转换后的格式
  ipAddress: string; // 经过 case-converter 转换后的格式
  latitude: number;
  longitude: number;
}

// 地理分布数据 (对应 GeoDistributionDTO - camelCase 版本)
export interface GeoDistributionDTO {
  countryRank: CountryRanking[]; // 经过 case-converter 转换后的格式
  locations: GeoLocationDTO[];
}

// 来源统计项 (对应 ReferrerSourceStat DTO)
export interface ReferrerSourceStat {
  source: string;
  count: number;
}

// 来源类型占比 (对应 ReferrerTypePercentage DTO)
export interface ReferrerTypePercentage {
  type: string;
  percentage: number;
}

// 来源分布数据 (对应 ReferrerDistributionDTO - camelCase 版本)
export interface ReferrerDistributionDTO {
  sources: ReferrerSourceStat[];
  typePercentage: ReferrerTypePercentage[]; // 经过 case-converter 转换后的格式
}

// 统一分布统计数据 (对应 DistributionDTO)
export interface DistributionDTO {
  geo: GeoDistributionDTO;
  referrer: ReferrerDistributionDTO;
}

// 为了保持组件兼容性，添加转换后的前端使用类型
export interface GeoDistributionItem {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
  visits: number;
  percentage: number;
  flag?: string;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
}

export interface GeoDistributionData {
  data: GeoDistributionItem[];
  locations: GeoLocationDTO[];
  totalCountries: number;
  topCountry: string;
  topVisits: number;
}

export interface ReferrerDistributionItem {
  domain: string;
  visits: number;
  percentage: number;
  type: "search" | "social" | "direct" | "referral" | "other";
  icon?: string;
}

export interface ReferrerDistributionData {
  data: ReferrerDistributionItem[];
  sources: ReferrerSourceStat[];
  typePercentage: ReferrerTypePercentage[];
  totalReferrers: number;
  topReferrer: string;
  directTrafficPercentage: number;
}

// 热门图片数据
export interface TopImageItem {
  imageId: number;
  fileName: string;
  size: number;
  uploadedAt: string;
  uploader: string;
  thumbnailUrl: string;
  viewCount: number;
}

export interface TopImagesData {
  data: TopImageItem[];
}

// 热门用户数据（匹配后端API结构）
export interface TopUserItem {
  userId: number;
  username: string;
  email: string;
  uploadCount: number;
  totalImageViews: number;
  totalImageSize: number;
}

export interface TopUsersData {
  data: TopUserItem[];
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
  // 新增：统一的分布统计数据
  distribution?: DistributionDTO;
}

// API请求参数类型
export interface StatsApiParams {
  period?: "daily" | "weekly" | "monthly";
  days?: number; // 保留以确保向后兼容
  range?: 7 | 30 | 365; // 新的时间范围参数，对应后端的range参数
  limit?: number;
  sortBy?: string;
  type?: "geo" | "referrer"; // 新增：分布统计类型参数
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
  format?: "number" | "bytes" | "percentage";
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
    render?: (
      value: unknown,
      record: Record<string, unknown>
    ) => React.ReactNode;
  }>;
  loading?: boolean;
  className?: string;
}

