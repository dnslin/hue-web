import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  role: string;
}

/**
 * 认证状态接口
 */
interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean; // 新增：标识状态是否已从持久化存储中恢复
  error: string | null;

  // 操作方法
  setAuth: (user: UserInfo) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<UserInfo>) => void;
  login: (username_or_email: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>; // 新增：初始化认证状态
  setHydrated: () => void; // 新增：设置水合完成状态
}

/**
 * 认证状态管理
 * 使用Zustand创建全局认证状态
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false, // 初始状态为未水合
      error: null,

      // 设置水合完成状态
      setHydrated: () => {
        console.log("💧 认证状态水合完成");
        set({ isHydrated: true });
      },

      // 设置认证信息（token通过HTTP-only cookie管理）
      setAuth: (user: UserInfo) => {
        console.log("🔐 设置用户认证信息:", user);
        set({
          user,
          isAuthenticated: true,
          error: null,
        });
      },

      // 清除认证信息
      clearAuth: () => {
        console.log("🚪 清除用户认证信息");
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // 更新用户信息
      updateUser: (userData: Partial<UserInfo>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      // 用户登录
      login: async (username_or_email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username_or_email, password }),
          });

          const data = await response.json();

          if (data && !data.error && data.data?.user) {
            set({
              user: data.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: data.message || "登录失败",
            });
            return false;
          }
        } catch {
          set({
            isLoading: false,
            error: "登录失败，请稍后重试",
          });
          return false;
        }
      },

      // 用户注册
      register: async (username: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
          });

          const data = await response.json();

          if (data && !data.error) {
            // 如果注册成功且返回用户信息，自动登录
            if (data.data?.user) {
              set({
                user: data.data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              set({ isLoading: false, error: null });
            }
            return true;
          } else {
            set({
              isLoading: false,
              error: data.message || "注册失败",
            });
            return false;
          }
        } catch {
          set({
            isLoading: false,
            error: "注册失败，请稍后重试",
          });
          return false;
        }
      },

      // 用户登出
      logout: async () => {
        try {
          set({ isLoading: true });

          await fetch("/api/auth/logout", {
            method: "POST",
          });

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch {
          // 即使API失败也清除本地状态
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 初始化认证状态 - 验证服务端状态
      initializeAuth: async () => {
        try {
          console.log("🔄 开始初始化认证状态");
          set({ isLoading: true });

          const response = await fetch("/api/auth/me", {
            method: "GET",
            credentials: "include", // 包含 HTTP-only cookies
          });

          if (response.ok) {
            const data = await response.json();
            if (data && !data.error && data.data?.user) {
              console.log("✅ 服务端认证状态验证成功:", data.data.user);
              set({
                user: data.data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              console.log("❌ 服务端认证状态无效，清除本地状态");
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              });
            }
          } else {
            console.log("⚠️ 服务端认证验证失败，保持本地状态");
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("❌ 认证状态初始化失败:", error);
          // 网络错误时保持本地状态，只更新加载状态
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage", // localStorage中的key名称
      // 持久化用户信息和认证状态
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // 水合完成后的回调
      onRehydrateStorage: () => {
        console.log("💧 认证状态开始水合");
        return (_, error) => {
          if (error) {
            console.error("❌ 认证状态水合失败:", error);
            // 水合失败时也要设置为已水合，避免无限等待
            setTimeout(() => {
              useAuthStore.getState().setHydrated();
            }, 0);
          } else {
            console.log("✅ 认证状态水合完成");
            // 使用 setTimeout 确保状态更新在下一个事件循环中执行
            setTimeout(() => {
              useAuthStore.getState().setHydrated();
            }, 0);
          }
        };
      },
    }
  )
);

// 获取用户角色权限辅助函数
export const getUserRole = () => {
  const { user } = useAuthStore.getState();
  return user?.role || "user";
};

// 检查是否为管理员
export const isAdmin = () => {
  return getUserRole() === "admin";
};

// 检查是否已登录
export const isLoggedIn = () => {
  const { isAuthenticated, user } = useAuthStore.getState();
  return isAuthenticated && !!user;
};
