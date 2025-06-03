// lib/api/apiService.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { cookies } from "next/headers"; // 用于 getAuthenticatedApiService

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
      // console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`); // 中文注释：API请求日志
      return config;
    },
    (error: AxiosError) => {
      console.error("[API Request Error Interceptor]", error); // 中文注释：API请求错误拦截器
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => response.data, // 直接返回data部分
    (error: AxiosError<any>) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown API error occurred";
      const statusCode = error.response?.status;

      console.error(
        `[API Response Error] Status: ${statusCode}, Message: ${errorMessage}`,
        error.response?.data
      ); // 中文注释：API响应错误日志

      if (statusCode === 401) {
        return Promise.reject(
          new AuthenticationError(errorMessage, statusCode)
        );
      }
      // 可以根据项目需求抛出自定义错误或返回特定格式
      return Promise.reject({
        message: errorMessage,
        code: statusCode,
        data: error.response?.data,
      });
    }
  );
  return instance;
};

export const getAuthenticatedApiService = async () => {
  // 根据 Next.js 15+，cookies() 返回 Promise，需要 await
  const cookieStore = await cookies(); // 在Server Action中调用
  const token = cookieStore.get("auth_token")?.value;
  // console.log('[API Service] Auth Token from cookie:', token ? 'Token Found' : 'No Token'); // 中文注释：从cookie获取的Auth Token日志
  return createApiService({ authToken: token });
};

export const publicApiService = createApiService(); // 用于公开接口

export default createApiService;
