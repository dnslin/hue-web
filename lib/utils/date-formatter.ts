/**
 * 时间格式化工具函数
 * 用于统一处理应用中的时间显示格式
 */

/**
 * 格式化日期时间字符串为中文本地化格式
 * @param dateString - ISO 8601格式的时间字符串，如 "2025-05-27T17:29:22.564+08:00"
 * @param options - 可选的格式化选项
 * @returns 格式化后的时间字符串
 */
export function formatDate(
  dateString: string,
  options: {
    includeTime?: boolean;
    includeSeconds?: boolean;
    format?: "short" | "long";
  } = {}
): string {
  const {
    includeTime = true,
    includeSeconds = false,
    format = "short",
  } = options;

  try {
    const date = new Date(dateString);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: ${dateString}`);
      return "无效日期";
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: format === "long" ? "long" : "2-digit",
      day: "2-digit",
    };

    if (includeTime) {
      formatOptions.hour = "2-digit";
      formatOptions.minute = "2-digit";

      if (includeSeconds) {
        formatOptions.second = "2-digit";
      }
    }

    return date.toLocaleDateString("zh-CN", formatOptions);
  } catch (error) {
    console.error(`Error formatting date: ${dateString}`, error);
    return "格式化错误";
  }
}

/**
 * 格式化日期为简短格式（仅日期）
 * @param dateString - ISO 8601格式的时间字符串
 * @returns 格式化后的日期字符串，如 "2025/05/27"
 */
export function formatDateOnly(dateString: string): string {
  return formatDate(dateString, { includeTime: false });
}

/**
 * 格式化日期时间为完整格式
 * @param dateString - ISO 8601格式的时间字符串
 * @returns 格式化后的日期时间字符串，如 "2025/05/27 17:29"
 */
export function formatDateTime(dateString: string): string {
  return formatDate(dateString, { includeTime: true });
}

/**
 * 格式化日期时间为详细格式（包含秒）
 * @param dateString - ISO 8601格式的时间字符串
 * @returns 格式化后的详细日期时间字符串，如 "2025/05/27 17:29:22"
 */
export function formatDateTimeDetailed(dateString: string): string {
  return formatDate(dateString, { includeTime: true, includeSeconds: true });
}

/**
 * 格式化相对时间（如"3天前"）
 * @param dateString - ISO 8601格式的时间字符串
 * @returns 相对时间字符串
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "刚刚";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`;
    } else if (diffInHours < 24) {
      return `${diffInHours}小时前`;
    } else if (diffInDays < 7) {
      return `${diffInDays}天前`;
    } else {
      return formatDateOnly(dateString);
    }
  } catch (error) {
    console.error(`Error formatting relative time: ${dateString}`, error);
    return "时间错误";
  }
}

/**
 * 检查日期字符串是否有效
 * @param dateString - 要检查的日期字符串
 * @returns 是否为有效日期
 */
export function isValidDate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}
