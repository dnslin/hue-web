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
    // 抛出一个可被下游捕获的、结构化的错误
    throw {
      code: 500,
      message: "在服务器端获取认证信息时失败",
      name: "ApiServiceSetupError",
    };
  }
};

export const publicApiService = createApiService(); // 用于公开接口

export default createApiService;
