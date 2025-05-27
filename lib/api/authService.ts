import apiClient from "./apiClient";
import { useAuthStore, UserInfo } from "@/lib/store/authStore";

// API 类型定义，基于Swagger API模式
export interface LoginRequest {
  username_or_email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  roleID: number;
  role?: {
    id: number;
    name: string;
    permissions?: string;
  };
}

export interface AuthResponse {
  code: number;
  message: string;
  data: {
    user: UserInfo;
    token: string;
  };
  redirect?: string;
}

/**
 * 身份验证服务
 * 负责处理登录、注册、获取用户信息等认证相关功能
 * 注意：所有请求都通过Next.js API路由处理，以便管理HTTP-only cookies
 */
const authService = {
  /**
   * 用户登录
   * @param data 登录请求数据
   * @returns 登录响应
   */
  login: async (data: LoginRequest) => {
    // 通过Next.js API路由发送请求
    const response = await apiClient.post<AuthResponse>("/auth/login", data);

    // 如果登录成功，缓存用户信息到store
    if (response.data && response.data.data?.user) {
      const { setAuth } = useAuthStore.getState();
      setAuth(response.data.data.user);
    }

    return response.data;
  },

  /**
   * 用户注册
   * @param data 注册请求数据
   * @returns 注册响应
   */
  register: async (data: RegisterRequest) => {
    // 通过Next.js API路由发送请求
    const response = await apiClient.post<AuthResponse>("/auth/register", data);

    // 如果注册成功且返回用户信息，缓存到store（自动登录）
    if (response.data && response.data.data?.user) {
      const { setAuth } = useAuthStore.getState();
      setAuth(response.data.data.user);
    }

    return response.data;
  },

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  getCurrentUser: async () => {
    // 通过Next.js API路由发送请求
    const response = await apiClient.get<{ data: User }>("/auth/me");
    return response.data;
  },

  /**
   * 用户登出
   */
  logout: async () => {
    // 清除本地用户状态
    const { clearAuth } = useAuthStore.getState();
    clearAuth();

    // 通过Next.js API路由发送请求
    await apiClient.post("/auth/logout");

    // 重定向到登录页
    window.location.href = "/login";
  },

  /**
   * 检查用户是否已登录
   * 通过发送请求到/auth/me检查当前会话是否有效
   * @returns Promise<boolean> 是否已登录
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      // 尝试获取用户信息
      await authService.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  },
};

export default authService;
