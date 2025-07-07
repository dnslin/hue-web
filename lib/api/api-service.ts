import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { cookies } from "next/headers";
import {
  deepConvertToCamelCase,
  deepConvertToSnakeCase,
} from "@/lib/utils/case-converter";
import type { ApiResponse, ErrorApiResponse } from "@/lib/types/common";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class AuthenticationError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * 处理认证错误的全局函数
 * 在检测到 401 错误时自动清理认证状态并跳转到登录页
 */
function handleAuthenticationError() {
  try {
    console.log("🔄 [API] 开始处理认证失效");

    // 动态导入 auth store 以避免循环依赖
    import("@/lib/store/auth")
      .then(({ useAuthStore }) => {
        const { clearAuth, isAuthenticated } = useAuthStore.getState();

        // 如果当前确实是已认证状态，才进行清理和跳转
        if (isAuthenticated) {
          console.log("🚪 [API] 清理过期的认证状态");
          clearAuth();

          // 保存当前页面路径用于登录后跳转
          const currentPath = window.location.pathname;
          const isLoginPage = currentPath === "/login";

          // 如果当前不在登录页，则跳转到登录页
          if (!isLoginPage) {
            const loginUrl = `/login?returnUrl=${encodeURIComponent(
              currentPath
            )}`;
            console.log("🔄 [API] 重定向到登录页:", loginUrl);
            window.location.href = loginUrl;
          }
        }
      })
      .catch((error) => {
        console.error("❌ [API] 处理认证失效时发生错误:", error);
      });
  } catch (error) {
    console.error("❌ [API] 处理认证失效失败:", error);
  }
}

interface ApiServiceOptions {
  authToken?: string;
}

const createApiService = (options?: ApiServiceOptions): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 15000, // 15秒超时
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const tokenToUse = options?.authToken;
      if (tokenToUse) {
        config.headers.Authorization = `Bearer ${tokenToUse}`;
      }

      // 将请求数据转换为 snake_case
      if (config.data) {
        config.data = deepConvertToSnakeCase(config.data);
      }
      if (config.params) {
        config.params = deepConvertToSnakeCase(config.params);
      }

      return config;
    },
    (error: AxiosError) => {
      console.error("[API Request Error Interceptor]", error); // 中文注释：API请求错误拦截器
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<any>>) => {
      // 将响应数据转换为 camelCase (msg -> message, request_id -> requestId)
      response.data = deepConvertToCamelCase(response.data);
      return response;
    },
    (error: AxiosError) => {
      console.error("[API Response Error]:", error.message);

      // 网络错误（无响应）
      if (!error.response) {
        const networkError: ErrorApiResponse = {
          code: 500, // 网络错误使用 500
          message: "Network Error 网络连接失败，请检查网络后重试",
        };
        return Promise.reject(networkError);
      }

      // 特殊处理 401 认证错误
      if (error.response.status === 401) {
        console.warn("⚠️ [API] 检测到 401 认证错误，开始处理认证失效");

        // 在客户端环境下处理认证失效
        if (typeof window !== "undefined") {
          // 延迟处理以避免在拦截器中直接操作 store
          setTimeout(() => {
            handleAuthenticationError();
          }, 0);
        }
      }

      // HTTP错误但有响应体
      if (error.response.data) {
        // 转换响应数据格式
        const convertedData = deepConvertToCamelCase(
          error.response.data
        ) as ErrorApiResponse;
        return Promise.reject(convertedData);
      }

      // 没有响应体的HTTP错误
      const httpError: ErrorApiResponse = {
        code: error.response.status,
        message: `HTTP错误: ${error.response.status}`,
      };
      return Promise.reject(httpError);
    }
  );
  return instance;
};

export const getAuthenticatedApiService = async () => {
  try {
    console.log("[Debug API] getAuthenticatedApiService: 开始执行。");
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    console.log(
      `[Debug API] getAuthenticatedApiService: 获取到 token: ${
        token ? "存在" : "不存在"
      }`
    );
    return createApiService({ authToken: token });
  } catch (error) {
    console.error(
      "[Debug API] getAuthenticatedApiService: 捕获到致命错误:",
      error
    );
    // 抛出一个 ErrorApiResponse 格式的错误
    const apiError: ErrorApiResponse = {
      code: 500,
      message: "在服务器端获取认证信息时失败",
    };
    throw apiError;
  }
};

export const publicApiService = createApiService(); // 用于公开接口

export default createApiService;

