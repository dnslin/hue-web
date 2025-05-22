import { create } from "zustand";
import { User } from "../api/authService";
import authService from "../api/authService";

/**
 * 认证状态接口
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 操作
  login: (username_or_email: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

/**
 * 认证状态管理
 * 使用Zustand创建全局认证状态
 */
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /**
   * 用户登录
   */
  login: async (username_or_email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authService.login({ username_or_email, password });
      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        isLoading: false,
        error: err.response?.data?.message || "登录失败，请检查用户名和密码",
      });
      return false;
    }
  },

  /**
   * 用户注册
   */
  register: async (username, email, password) => {
    try {
      set({ isLoading: true, error: null });
      await authService.register({ username, email, password });
      set({ isLoading: false });
      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      set({
        isLoading: false,
        error: err.response?.data?.message || "注册失败，请检查表单信息",
      });
      return false;
    }
  },

  /**
   * 用户登出
   */
  logout: async () => {
    try {
      set({ isLoading: true });
      await authService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error("登出失败:", error);
      set({ isLoading: false });
      // 即使API请求失败，也清除本地状态
      set({ user: null, isAuthenticated: false });
    }
  },

  /**
   * 加载用户信息
   */
  loadUser: async () => {
    try {
      set({ isLoading: true });
      const response = await authService.getCurrentUser();
      set({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      throw error; // 重新抛出错误，让调用者知道加载失败
    }
  },

  /**
   * 清除错误
   */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
