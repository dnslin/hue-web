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
      console.error("[API Response Error] Full error object:", error); // 中文注释：完整错误对象日志

      // 优先从响应数据中获取错误信息
      let errorMessage = "发生未知错误，请稍后重试。";
      let errorDetails = null;

      if (error.response?.data) {
        // 处理不同格式的后端错误响应
        const responseData = error.response.data;
        if (typeof responseData === "string") {
          errorMessage = responseData;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else if (responseData.detail) {
          errorMessage = responseData.detail;
        }
        errorDetails = responseData;
      } else if (error.message) {
        errorMessage = error.message;
      }

      const statusCode = error.response?.status;

      console.error(
        `[API Response Error] Status: ${statusCode}, Message: ${errorMessage}`,
        errorDetails
      ); // 中文注释：API响应错误日志

      // 处理401认证错误
      if (statusCode === 401) {
        // 为401错误提供更友好的默认消息
        const authErrorMessage =
          errorMessage.includes("401") || errorMessage.includes("status code")
            ? "用户名或密码错误，请重新输入。"
            : errorMessage;

        return Promise.reject(
          new AuthenticationError(authErrorMessage, statusCode)
        );
      }

      // 处理其他HTTP错误状态码
      if (statusCode === 400) {
        // 400错误通常是请求参数错误
        const badRequestMessage =
          errorMessage.includes("400") || errorMessage.includes("status code")
            ? "请求参数有误，请检查输入信息。"
            : errorMessage;
        return Promise.reject({
          message: badRequestMessage,
          code: statusCode,
          data: errorDetails,
        });
      }

      if (statusCode === 422) {
        // 422错误通常是验证失败
        const validationMessage =
          errorMessage.includes("422") || errorMessage.includes("status code")
            ? "输入信息验证失败，请检查格式。"
            : errorMessage;
        return Promise.reject({
          message: validationMessage,
          code: statusCode,
          data: errorDetails,
        });
      }

      if (statusCode === 500) {
        // 500错误是服务器内部错误
        const serverErrorMessage =
          errorMessage.includes("500") || errorMessage.includes("status code")
            ? "服务器内部错误，请稍后重试。"
            : errorMessage;
        return Promise.reject({
          message: serverErrorMessage,
          code: statusCode,
          data: errorDetails,
        });
      }

      // 对于网络错误或其他未知错误
      if (!statusCode) {
        const networkErrorMessage =
          error.code === "NETWORK_ERROR" ||
          error.message.includes("Network Error")
            ? "网络连接失败，请检查网络后重试。"
            : errorMessage;
        return Promise.reject({
          message: networkErrorMessage,
          code: 0, // 网络错误代码
          data: errorDetails,
        });
      }

      // 其他状态码的通用处理
      return Promise.reject({
        message: errorMessage,
        code: statusCode,
        data: errorDetails,
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
