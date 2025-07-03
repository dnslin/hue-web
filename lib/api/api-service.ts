// lib/api/apiService.ts
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
          code: 500, // 网络错误使用 0
          message: "Network Error 网络连接失败，请检查网络后重试",
        };
        return Promise.reject(networkError);
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

