import { showToast } from "./toast";
import { cacheManager } from "./cacheManager";

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
export class ErrorHandler {
  /**
   * 解析和分类错误
   */
  static parseError(error: any): StandardError {
    // AuthenticationError (401)
    if (
      error?.name === "AuthenticationError" ||
      error?.status === 401 ||
      error?.code === 401
    ) {
      // 区分认证失败和token过期
      const isTokenExpired =
        error?.message?.includes("Token") ||
        error?.message?.includes("token") ||
        error?.message?.includes("过期") ||
        error?.message?.includes("失效") ||
        error?.message?.includes("expired") ||
        error?.message?.includes("invalid") ||
        error?.message?.includes("登录已过期");

      return {
        type: ErrorType.AUTHENTICATION,
        message: isTokenExpired
          ? "登录已过期，请重新登录"
          : "用户名或密码错误，请重新输入",
        code: 401,
        originalError: error,
        shouldRedirect: isTokenExpired,
        shouldClearAuth: isTokenExpired,
      };
    }

    // 网络错误
    if (
      error?.code === 0 ||
      error?.message?.includes("Network Error") ||
      error?.code === "NETWORK_ERROR"
    ) {
      return {
        type: ErrorType.NETWORK,
        message: "网络连接失败，请检查网络后重试",
        code: 0,
        originalError: error,
      };
    }

    // 403 权限错误
    if (error?.code === 403 || error?.status === 403) {
      return {
        type: ErrorType.AUTHORIZATION,
        message: "权限不足，无法执行此操作",
        code: 403,
        originalError: error,
      };
    }

    // 400 验证错误
    if (error?.code === 400 || error?.status === 400) {
      return {
        type: ErrorType.VALIDATION,
        message: error?.message || "请求参数有误，请检查输入信息",
        code: 400,
        originalError: error,
      };
    }

    // 422 验证失败
    if (error?.code === 422 || error?.status === 422) {
      return {
        type: ErrorType.VALIDATION,
        message: error?.message || "输入信息验证失败，请检查格式",
        code: 422,
        originalError: error,
      };
    }

    // 500 服务器错误
    if (error?.code === 500 || error?.status === 500) {
      return {
        type: ErrorType.SERVER,
        message: "服务器内部错误，请稍后重试",
        code: 500,
        originalError: error,
      };
    }

    // 业务逻辑错误 - 但需要特殊检查认证相关消息
    if (error?.message && typeof error.message === "string") {
      // 检查是否为认证过期的业务错误
      const isAuthExpired =
        error.message.includes("登录已过期") ||
        error.message.includes("Token") ||
        error.message.includes("token") ||
        error.message.includes("过期") ||
        error.message.includes("失效") ||
        error.message.includes("expired") ||
        error.message.includes("invalid");

      if (isAuthExpired) {
        return {
          type: ErrorType.AUTHENTICATION,
          message: error.message,
          code: 401,
          originalError: error,
          shouldRedirect: true,
          shouldClearAuth: true,
        };
      }

      return {
        type: ErrorType.BUSINESS,
        message: error.message,
        code: error?.code,
        originalError: error,
      };
    }

    // 未知错误
    return {
      type: ErrorType.UNKNOWN,
      message: "发生未知错误，请稍后重试",
      originalError: error,
    };
  }

  /**
   * 处理错误并显示toast
   */
  static async handleError(
    error: any,
    context?: string
  ): Promise<StandardError> {
    const standardError = this.parseError(error);

    // 构建显示消息
    const displayMessage = context
      ? `${context}：${standardError.message}`
      : standardError.message;

    // 根据错误类型选择toast类型
    switch (standardError.type) {
      case ErrorType.NETWORK:
        showToast.warning(displayMessage);
        break;
      case ErrorType.AUTHENTICATION:
        if (standardError.shouldClearAuth) {
          // Token过期处理
          console.log("🚨 [ErrorHandler] 检测到Token过期，开始处理...");
          showToast.error("登录已过期", "即将跳转到登录页面");
          await this.handleTokenExpired();
        } else {
          // 登录失败
          console.log("🚨 [ErrorHandler] 认证失败，非Token过期");
          showToast.error(displayMessage);
        }
        break;
      case ErrorType.AUTHORIZATION:
        showToast.warning(displayMessage);
        break;
      case ErrorType.VALIDATION:
        showToast.warning(displayMessage);
        break;
      case ErrorType.SERVER:
        showToast.error(displayMessage);
        break;
      case ErrorType.BUSINESS:
        showToast.error(displayMessage);
        break;
      default:
        showToast.error(displayMessage);
    }

    // 记录到控制台供开发调试
    console.error(`[ErrorHandler] ${context || "Error"}:`, {
      type: standardError.type,
      message: standardError.message,
      code: standardError.code,
      originalError: standardError.originalError,
    });

    return standardError;
  }

  /**
   * 处理Token过期的清理和重定向
   */
  static async handleTokenExpired(): Promise<void> {
    console.log("🔥 [ErrorHandler] 开始处理Token过期");

    // 检查环境，只在浏览器环境中执行完整清理
    if (typeof window !== "undefined") {
      // 清理缓存
      cacheManager.clearAll();
      console.log("✅ [ErrorHandler] 已清理所有缓存");

      // 清理认证状态（动态导入避免循环依赖）
      try {
        const { useAuthStore } = await import("@/lib/store/auth-store");
        useAuthStore.getState().clearAuth();
        console.log("✅ [ErrorHandler] 已清理认证状态");
      } catch (err) {
        console.warn("⚠️ [ErrorHandler] 清理认证状态失败:", err);
      }

      // 立即跳转（去掉延迟，防止用户继续操作）
      const currentPath = window.location.pathname;
      const returnUrl = encodeURIComponent(currentPath);
      console.log(
        "🔄 [ErrorHandler] 即将重定向到登录页面，当前路径:",
        currentPath
      );

      // 直接使用 window.location 进行强制跳转
      const loginUrl = `/login?returnUrl=${returnUrl}`;
      console.log("🔄 [ErrorHandler] 跳转到:", loginUrl);
      window.location.href = loginUrl;
    } else {
      console.log(
        "🌐 [ErrorHandler] 服务端环境检测到Token过期，跳过客户端清理操作"
      );
    }
  }

  /**
   * 简化的错误处理接口，用于store中
   */
  static async handleStoreError(
    error: any,
    operation: string
  ): Promise<{ success: false; error: string }> {
    const standardError = await this.handleError(error, operation);
    return {
      success: false,
      error: standardError.message,
    };
  }
}

/**
 * 便捷的错误处理函数
 */
export const handleError = ErrorHandler.handleError.bind(ErrorHandler);
export const handleStoreError =
  ErrorHandler.handleStoreError.bind(ErrorHandler);
export const parseError = ErrorHandler.parseError.bind(ErrorHandler);
