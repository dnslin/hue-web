import { TrendDirection, SystemStatus } from "@/lib/types/dashboard";

// 数字格式化函数
export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

// 文件大小格式化
export const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// 百分比格式化
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// 变化值格式化
export const formatChange = (change: number): string => {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
};

// 趋势方向判断
export const getTrendDirection = (change: number): TrendDirection => {
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "stable";
};

// 系统状态判断
export const getSystemStatus = (
  cpu: number,
  memory: number,
  disk: number
): SystemStatus => {
  const maxUsage = Math.max(cpu, memory, disk);

  if (maxUsage >= 90) return "error";
  if (maxUsage >= 75) return "warning";
  return "healthy";
};

// 时间格式化
export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "刚刚";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}天前`;
  }

  return date.toLocaleDateString("zh-CN");
};

// 运行时间格式化
export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}天 ${hours}小时`;
  }
  if (hours > 0) {
    return `${hours}小时 ${minutes}分钟`;
  }
  return `${minutes}分钟`;
};

// 状态颜色获取
export const getStatusColor = (status: SystemStatus): string => {
  switch (status) {
    case "healthy":
      return "text-green-600 dark:text-green-400";
    case "warning":
      return "text-yellow-600 dark:text-yellow-400";
    case "error":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-muted-foreground";
  }
};

// 趋势颜色获取
export const getTrendColor = (trend: TrendDirection): string => {
  switch (trend) {
    case "up":
      return "text-green-600 dark:text-green-400";
    case "down":
      return "text-red-600 dark:text-red-400";
    case "stable":
      return "text-muted-foreground";
    default:
      return "text-muted-foreground";
  }
};

// 进度条颜色获取
export const getProgressColor = (value: number): string => {
  if (value >= 90) return "bg-red-500";
  if (value >= 75) return "bg-yellow-500";
  if (value >= 50) return "bg-blue-500";
  return "bg-green-500";
};

// 活动类型图标颜色
export const getActivityTypeColor = (type: string): string => {
  switch (type) {
    case "upload":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
    case "user_register":
      return "text-green-600 bg-green-100 dark:bg-green-900/20";
    case "system":
      return "text-purple-600 bg-purple-100 dark:bg-purple-900/20";
    case "error":
      return "text-red-600 bg-red-100 dark:bg-red-900/20";
    default:
      return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
  }
};

// 数据验证函数
export const isValidNumber = (value: unknown): value is number => {
  return typeof value === "number" && !isNaN(value) && isFinite(value);
};

export const isValidPercentage = (value: number): boolean => {
  return isValidNumber(value) && value >= 0 && value <= 100;
};

// 安全的数字转换
export const safeNumber = (
  value: unknown,
  defaultValue: number = 0
): number => {
  if (isValidNumber(value)) return value;
  const parsed = parseFloat(String(value));
  return isValidNumber(parsed) ? parsed : defaultValue;
};

// 截断文本
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

// 生成随机 ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// 日期格式化
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
