import { showToast } from "./toast";
/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  SERVER = "server",
  BUSINESS = "business",
  UNKNOWN = "unknown",
}

/**
 * 标准化错误对象
 */
export interface StandardError {
  type: ErrorType;
  msg: string;
  code?: number;
  originalError?: any;
  shouldRedirect?: boolean;
  shouldClearAuth?: boolean;
}

/**
 * 错误处理器类
 */

/**
 * 简化版的Store错误处理函数
 * 基于新的重构架构，提供统一的错误处理接口
 */
export const handleStoreError = (
  error: any,
  operation: string
): Promise<{ error: string }> => {
  // 处理 API 错误响应（ErrorApiResponse 格式）
  if (error?.msg) {
    const errorMessage = `${operation}失败: ${error.msg}`;
    showToast.error(errorMessage);
    return Promise.resolve({ error: errorMessage });
  }

  // 处理其他类型的错误
  if (typeof error === "string") {
    const errorMessage = `${operation}失败: ${error}`;
    showToast.error(errorMessage);
    return Promise.resolve({ error: errorMessage });
  }

  // 处理未知错误
  const fallbackMessage = `${operation}失败: 未知错误`;
  showToast.error(fallbackMessage);
  return Promise.resolve({ error: fallbackMessage });
};

