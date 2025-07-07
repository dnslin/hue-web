import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  loginAction,
  registerAction,
  logoutAction,
  getCurrentUserAction,
  forgotPasswordAction,
  resetPasswordAction,
  activateAccountAction,
  resendActivationEmailAction,
} from "@/lib/actions/auth/auth";
import type { User } from "@/lib/types/user";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponseData,
} from "@/lib/types/auth";
import { isSuccessApiResponse, isErrorApiResponse } from "@/lib/types/common";
import { cacheManager } from "@/lib/utils/cache-manager";
import { showToast } from "@/lib/utils/toast";

/**
 * 忘记密码状态接口
 */
interface ForgotPasswordState {
  isLoading: boolean;
  error: string | null;
  currentStep: "email" | "reset" | "success";
  userEmail: string;
}

/**
 * 认证操作结果接口 - 用于静默模式返回
 */
interface AuthOperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * 认证状态接口
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;

  // 细化的加载状态管理
  isLoadingLogin: boolean;
  isLoadingRegister: boolean;
  isLoadingLogout: boolean;
  isLoadingInitAuth: boolean;
  isLoadingOther: boolean; // 其他操作的加载状态（如激活、重发邮件等）
  isHydrated: boolean; // 标识状态是否已从持久化存储中恢复

  error: string | null;

  // 忘记密码专门状态
  forgotPasswordState: ForgotPasswordState;

  // 操作方法
  setAuth: (user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>; // 初始化认证状态
  setHydrated: () => void; // 设置水合完成状态

  // 密码重置和激活相关方法
  forgotPassword: (
    email: string,
    options?: { silent?: boolean }
  ) => Promise<boolean | AuthOperationResult>;
  resetPassword: (
    email: string,
    password: string,
    confirmPassword: string,
    code: string,
    options?: { silent?: boolean }
  ) => Promise<boolean | AuthOperationResult>;
  activateAccount: (email: string, code: string) => Promise<boolean>;
  resendActivationEmail: (email: string) => Promise<boolean>;

  // 忘记密码状态管理方法
  resetForgotPasswordState: () => void;
  setForgotPasswordStep: (step: ForgotPasswordState["currentStep"]) => void;
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

      // 细化的加载状态管理
      isLoadingLogin: false,
      isLoadingRegister: false,
      isLoadingLogout: false,
      isLoadingInitAuth: false,
      isLoadingOther: false,
      isHydrated: false, // 初始状态为未水合

      error: null,

      // 忘记密码专门状态
      forgotPasswordState: {
        isLoading: false,
        error: null,
        currentStep: "email",
        userEmail: "",
      },

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

        // 清理相关缓存 - 添加环境检测保护
        if (typeof window !== "undefined") {
          try {
            cacheManager.clearAuthRelatedCache();
            console.log("✅ 已清理认证相关缓存");
          } catch (err) {
            console.warn("⚠️ [AuthStore] 清理认证相关缓存失败:", err);
          }
        } else {
          console.log("🌐 [AuthStore] 服务端环境，跳过缓存清理");
        }

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
        usernameOrEmail: string,
        password: string
      ): Promise<boolean> => {
        set({ isLoadingLogin: true, error: null });

        const credentials: LoginRequest = { usernameOrEmail, password };
        const response = await loginAction(credentials);

        // 使用类型守卫检查成功/失败
        if (isSuccessApiResponse(response)) {
          const authData = response.data as AuthResponseData;
          if (authData?.user) {
            console.log("✅ 登录成功:", authData.user);
            set({
              user: authData.user,
              isAuthenticated: true,
              isLoadingLogin: false,
              error: null,
            });
            showToast.success("登录成功");
            return true;
          }
        }

        // 业务失败或错误响应
        if (isErrorApiResponse(response)) {
          console.error("❌ 登录失败:", response.msg);

          // 检查是否是认证过期（根据后端的业务码）
          if (response.code === 40101) {
            get().clearAuth();
            showToast.error(response.msg);
          } else {
            // 其他业务错误
            const errorMessage = response.msg || "登录失败";
            showToast.error(errorMessage);
            set({ error: errorMessage });
          }
        }

        set({ isLoadingLogin: false });
        return false;
      },

      // 用户注册
      register: async (
        username: string,
        email: string,
        password: string
      ): Promise<boolean> => {
        set({ isLoadingRegister: true, error: null });

        const userData: RegisterRequest = { username, email, password };
        const response = await registerAction(userData);

        // 使用类型守卫检查成功/失败
        if (isSuccessApiResponse(response)) {
          const authData = response.data as AuthResponseData;
          if (authData?.user) {
            console.log("✅ 注册成功并自动登录:", authData.user);
            set({
              user: authData.user,
              isAuthenticated: true,
              isLoadingRegister: false,
              error: null,
            });
            showToast.success("注册成功并已登录");
          } else {
            // 注册成功但未自动登录 (例如需要邮箱验证)
            console.log("📝 注册请求成功:", response.msg);
            set({ isLoadingRegister: false, error: null });
            showToast.success(response.msg || "注册成功，请查收邮件进行验证");
          }
          return true;
        }

        // 业务失败或错误响应
        if (isErrorApiResponse(response)) {
          console.error("❌ 注册失败:", response.msg);
          const errorMessage = response.msg || "注册失败";
          showToast.error(errorMessage);
          set({
            isLoadingRegister: false,
            error: errorMessage,
          });
        }

        return false;
      },

      // 用户登出
      logout: async () => {
        set({ isLoadingLogout: true });

        const response = await logoutAction();

        if (isSuccessApiResponse(response)) {
          console.log("🚪 用户已成功登出");
          showToast.success("登出成功");
        } else if (isErrorApiResponse(response)) {
          console.warn("⚠️ 登出操作在服务端可能未完全成功:", response.msg);
          // 即使服务端失败，客户端也应清除状态
        }

        // 始终清除客户端状态
        get().clearAuth();
        set({
          isLoadingLogout: false,
          error: null,
        });
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 初始化认证状态 - 验证服务端状态
      initializeAuth: async () => {
        console.log("🔄 开始初始化认证状态");
        set({ isLoadingInitAuth: true });

        try {
          const currentUser = await getCurrentUserAction();
          if (currentUser) {
            console.log("✅ 服务端认证状态验证成功:", currentUser);
            set({
              user: currentUser,
              isAuthenticated: true,
              isLoadingInitAuth: false,
              error: null,
            });
          } else {
            console.log("❌ 服务端认证状态无效或未登录，清除本地状态");
            set({
              user: null,
              isAuthenticated: false,
              isLoadingInitAuth: false,
              error: null,
            });
          }
        } catch (error: any) {
          console.error("❌ 认证状态初始化失败:", error);
          // 初始化失败时不显示TOAST，只记录日志
          set({
            user: null,
            isAuthenticated: false,
            isLoadingInitAuth: false,
            error: null, // 不在界面显示初始化错误
          });
        }
      },

      // 新增：密码重置和激活相关方法
      forgotPassword: async (email: string, options?: { silent?: boolean }) => {
        const silent = options?.silent || false;

        // 更新忘记密码专门状态
        set({
          forgotPasswordState: {
            ...get().forgotPasswordState,
            isLoading: true,
            error: null,
            userEmail: email,
          },
        });

        const response = await forgotPasswordAction(email);

        if (isSuccessApiResponse(response)) {
          console.log(`✅ 忘记密码请求成功${silent ? "（静默模式）" : ""}`);

          // 更新忘记密码专门状态
          set({
            forgotPasswordState: {
              ...get().forgotPasswordState,
              isLoading: false,
              error: null,
              currentStep: "reset",
            },
          });

          if (!silent) {
            showToast.success(response.msg || "密码重置邮件已发送");
          }

          // 根据是否静默模式返回不同格式的结果
          if (silent) {
            return {
              success: true,
              data: response.data,
            } as AuthOperationResult;
          }
          return true;
        }

        // 业务失败或错误响应
        if (isErrorApiResponse(response)) {
          console.error(
            `❌ 忘记密码请求失败${silent ? "（静默模式）" : ""}:`,
            response.msg
          );
          const errorMessage = response.msg || "忘记密码请求失败";

          // 更新忘记密码专门状态
          set({
            forgotPasswordState: {
              ...get().forgotPasswordState,
              isLoading: false,
              error: errorMessage,
            },
          });

          if (!silent) {
            showToast.error(errorMessage);
          }

          // 根据是否静默模式返回不同格式的结果
          if (silent) {
            return {
              success: false,
              error: errorMessage,
            } as AuthOperationResult;
          }
        }

        return false;
      },

      resetPassword: async (
        email: string,
        password: string,
        confirmPassword: string,
        code: string,
        options?: { silent?: boolean }
      ): Promise<boolean | AuthOperationResult> => {
        const silent = options?.silent || false;

        // 更新忘记密码专门状态
        set({
          forgotPasswordState: {
            ...get().forgotPasswordState,
            isLoading: true,
            error: null,
          },
        });

        const response = await resetPasswordAction(
          email,
          password,
          confirmPassword,
          code
        );

        if (isSuccessApiResponse(response)) {
          console.log(`✅ 密码重置成功${silent ? "（静默模式）" : ""}`);

          // 更新忘记密码专门状态
          set({
            forgotPasswordState: {
              ...get().forgotPasswordState,
              isLoading: false,
              error: null,
              currentStep: "success",
            },
          });

          if (!silent) {
            showToast.success(response.msg || "密码重置成功");
          }

          // 根据是否静默模式返回不同格式的结果
          if (silent) {
            return {
              success: true,
              data: response.data,
            } as AuthOperationResult;
          }
          return true;
        }

        // 业务失败或错误响应
        if (isErrorApiResponse(response)) {
          console.error(
            `❌ 密码重置失败${silent ? "（静默模式）" : ""}:`,
            response.msg
          );
          const errorMessage = response.msg || "密码重置失败";

          // 更新忘记密码专门状态
          set({
            forgotPasswordState: {
              ...get().forgotPasswordState,
              isLoading: false,
              error: errorMessage,
            },
          });

          if (!silent) {
            showToast.error(errorMessage);
          }

          // 根据是否静默模式返回不同格式的结果
          if (silent) {
            return {
              success: false,
              error: errorMessage,
            } as AuthOperationResult;
          }
        }

        return false;
      },

      activateAccount: async (
        email: string,
        code: string
      ): Promise<boolean> => {
        set({ isLoadingOther: true, error: null });

        const response = await activateAccountAction(email, code);

        if (isSuccessApiResponse(response)) {
          console.log("✅ 账户激活成功");
          set({ isLoadingOther: false, error: null });
          showToast.success(response.msg || "账户激活成功");
          return true;
        }

        // 业务失败或错误响应
        if (isErrorApiResponse(response)) {
          console.error("❌ 账户激活失败:", response.msg);
          const errorMessage = response.msg || "账户激活失败";
          showToast.error(errorMessage);
          set({
            isLoadingOther: false,
            error: errorMessage,
          });
        }

        return false;
      },

      resendActivationEmail: async (email: string): Promise<boolean> => {
        set({ isLoadingOther: true, error: null });

        const response = await resendActivationEmailAction(email);

        if (isSuccessApiResponse(response)) {
          console.log("✅ 激活邮件重发成功");
          set({ isLoadingOther: false, error: null });
          showToast.success(response.msg || "激活邮件已重新发送");
          return true;
        }

        // 业务失败或错误响应
        if (isErrorApiResponse(response)) {
          console.error("❌ 激活邮件重发失败:", response.msg);
          const errorMessage = response.msg || "激活邮件重发失败";
          showToast.error(errorMessage);
          set({
            isLoadingOther: false,
            error: errorMessage,
          });
        }

        return false;
      },

      // 新增：忘记密码状态管理方法
      resetForgotPasswordState: () => {
        set({
          forgotPasswordState: {
            isLoading: false,
            error: null,
            currentStep: "email",
            userEmail: "",
          },
        });
      },

      setForgotPasswordStep: (step: ForgotPasswordState["currentStep"]) => {
        set({
          forgotPasswordState: {
            ...get().forgotPasswordState,
            currentStep: step,
          },
        });
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
  if (user && user.role && typeof user.role === "object") {
    return user.role.name;
  }
  // 兼容旧的或未登录的状态
  return "user";
};

// 检查是否为管理员
export const isAdmin = () => {
  // 现在 getUserRole 返回的是字符串名称，可以直接比较
  return getUserRole() === "admin";
};

// 检查是否已登录
export const isLoggedIn = () => {
  const { isAuthenticated, user } = useAuthStore.getState();
  return isAuthenticated && !!user;
};

