import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  loginAction,
  registerAction,
  logoutAction,
  getCurrentUserAction,
} from "@/lib/actions/auth/auth.actions";
import type { User } from "@/lib/types/user";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponseData,
} from "@/lib/types/auth";

/**
 * 认证状态接口
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean; // 新增：标识状态是否已从持久化存储中恢复
  error: string | null;

  // 操作方法
  setAuth: (user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
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
      setAuth: (user: User) => {
        console.log("🔐 设置用户认证信息:", user); // 中文注释：设置用户认证信息
        set({
          user,
          isAuthenticated: true,
          error: null,
        });
      },

      // 清除认证信息
      clearAuth: () => {
        console.log("🚪 清除用户认证信息"); // 中文注释：清除用户认证信息
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // 更新用户信息
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      // 用户登录
      login: async (
        username_or_email: string,
        password: string
      ): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
          const credentials: LoginRequest = { username_or_email, password };
          const response = await loginAction(credentials);

          if (response.success && response.data?.user) {
            console.log("✅ 登录成功:", response.data.user); // 中文注释：登录成功
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            console.error("❌ 登录失败:", response.message); // 中文注释：登录失败
            set({
              isLoading: false,
              error: response.message || "登录失败，请检查您的凭据。",
            });
            return false;
          }
        } catch (err: any) {
          console.error("❌ 登录时发生意外错误:", err); // 中文注释：登录时发生意外错误
          set({
            isLoading: false,
            error: err.message || "登录失败，请稍后重试。",
          });
          return false;
        }
      },

      // 用户注册
      register: async (
        username: string,
        email: string,
        password: string
      ): Promise<boolean> => {
        set({ isLoading: true, error: null });
        try {
          const userData: RegisterRequest = { username, email, password };
          const response = await registerAction(userData);

          if (response.success) {
            // 注册成功，后端可能返回用户信息（自动登录）或仅返回消息（如需邮箱验证）
            const responseData = response.data as
              | AuthResponseData
              | { message: string };
            if ("user" in responseData && responseData.user) {
              console.log("✅ 注册成功并自动登录:", responseData.user); // 中文注释：注册成功并自动登录
              set({
                user: responseData.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              // 注册成功但未自动登录 (例如需要邮箱验证)
              console.log(
                "📝 注册请求成功:",
                response.message ||
                  (responseData as { message: string }).message
              ); // 中文注释：注册请求成功
              set({ isLoading: false, error: null });
              // 可以在这里设置一个临时消息给UI提示用户检查邮箱等
            }
            return true; // Action本身是成功的
          } else {
            console.error("❌ 注册失败:", response.message); // 中文注释：注册失败
            set({
              isLoading: false,
              error: response.message || "注册失败，请检查输入信息。",
            });
            return false;
          }
        } catch (err: any) {
          console.error("❌ 注册时发生意外错误:", err); // 中文注释：注册时发生意外错误
          set({
            isLoading: false,
            error: err.message || "注册失败，请稍后重试。",
          });
          return false;
        }
      },

      // 用户登出
      logout: async () => {
        set({ isLoading: true });
        try {
          const response = await logoutAction();
          if (response.success) {
            console.log("🚪 用户已成功登出"); // 中文注释：用户已成功登出
          } else {
            console.warn(
              "⚠️ 登出操作在服务端可能未完全成功:",
              response.message
            ); // 中文注释：登出操作在服务端可能未完全成功
            // 即使服务端失败，客户端也应清除状态
          }
        } catch (err: any) {
          console.error("❌ 登出时发生意外错误:", err); // 中文注释：登出时发生意外错误
          // 即使捕获到错误，也应清除客户端状态
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null, // 清除登出相关的错误，避免影响下次操作
          });
        }
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 初始化认证状态 - 验证服务端状态
      initializeAuth: async () => {
        console.log("🔄 开始初始化认证状态"); // 中文注释：开始初始化认证状态
        set({ isLoading: true });
        try {
          const currentUser = await getCurrentUserAction();
          if (currentUser) {
            console.log("✅ 服务端认证状态验证成功:", currentUser); // 中文注释：服务端认证状态验证成功
            set({
              user: currentUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            console.log("❌ 服务端认证状态无效或未登录，清除本地状态"); // 中文注释：服务端认证状态无效或未登录，清除本地状态
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          console.error("❌ 认证状态初始化失败:", error); // 中文注释：认证状态初始化失败
          // 网络错误或其他错误时，也清除本地状态以保持一致性
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: "认证状态初始化失败，请稍后重试。",
          });
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
