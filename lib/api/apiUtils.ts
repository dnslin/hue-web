import { NextRequest, NextResponse } from "next/server";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

// API 基础URL，从环境变量获取或使用默认值
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

/**
 * 统一的API请求处理工具，用于Next.js API路由
 */
export const apiUtils = {
  /**
   * 转发请求到后端API
   * @param request Next.js请求对象
   * @param endpoint API端点路径
   * @param config Axios请求配置
   * @returns API响应
   */
  async forwardRequest(
    request: NextRequest,
    endpoint: string,
    config?: AxiosRequestConfig
  ) {
    try {
      // 获取请求方法
      const method = request.method.toLowerCase();

      // 从cookie获取认证令牌
      const token = request.cookies.get("auth_token")?.value;

      // 准备请求头
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // 如果有令牌，添加到请求头
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // 合并请求配置
      const requestConfig: AxiosRequestConfig = {
        ...config,
        headers: {
          ...headers,
          ...config?.headers,
        },
      };

      let requestData;
      // 对于包含请求体的方法，获取请求体
      if (["post", "put", "patch"].includes(method)) {
        const contentType = request.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          requestData = await request.json().catch(() => ({}));
        } else if (contentType.includes("multipart/form-data")) {
          requestData = await request.formData().catch(() => ({}));
          // 对于multipart/form-data，不需要设置Content-Type，axios会自动设置
          delete requestConfig.headers!["Content-Type"];
        }
      }

      // 根据请求方法发送请求
      const response = await axios({
        method,
        url: `${API_BASE_URL}${endpoint}`,
        data: requestData,
        ...requestConfig,
      });

      return response.data;
    } catch (error) {
      console.error(`API请求转发错误: ${(error as Error).message}`);
      return this.handleError(error as AxiosError);
    }
  },

  /**
   * 处理API错误
   * @param error Axios错误
   * @returns 格式化的错误响应
   */
  handleError(error: AxiosError) {
    const status = error.response?.status || 500;
    // 安全地处理响应数据中的消息
    const responseData = error.response?.data as
      | Record<string, unknown>
      | undefined;
    const message = (responseData?.message as string) || "请求失败，请稍后重试";

    return {
      code: status,
      message,
      error: true,
    };
  },

  /**
   * 创建API响应
   * @param data 响应数据
   * @param options 响应选项
   * @returns Next.js响应对象
   */
  createResponse(
    data:
      | Record<string, unknown>
      | { error: boolean; message: string; code?: number },
    options?: {
      status?: number;
      setCookie?: {
        name: string;
        value: string;
        maxAge?: number;
        path?: string;
      };
      deleteCookie?: string;
    }
  ) {
    // 创建响应
    const response = NextResponse.json(data, {
      status: options?.status || (data.error ? 400 : 200),
    });

    // 设置cookie
    if (options?.setCookie) {
      const {
        name,
        value,
        maxAge = 30 * 24 * 60 * 60,
        path = "/",
      } = options.setCookie;
      response.cookies.set({
        name,
        value,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path,
        maxAge,
      });
    }

    // 删除cookie
    if (options?.deleteCookie) {
      response.cookies.delete(options.deleteCookie);
    }

    return response;
  },
};
