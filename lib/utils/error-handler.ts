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
  message: string;
  code?: number;
  originalError?: any;
  shouldRedirect?: boolean;
  shouldClearAuth?: boolean;
}

/**
 * 错误处理器类
 */

