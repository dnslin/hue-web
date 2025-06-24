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
} from "@/lib/actions/auth/auth.actions";
import type { User } from "@/lib/types/user";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponseData,
} from "@/lib/types/auth";
import { isSuccessApiResponse } from "@/lib/types/common";
import { cacheManager } from "@/lib/utils/cache-manager";
import { handleStoreError } from "@/lib/utils/error-handler";

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
        try {
          const credentials: LoginRequest = { usernameOrEmail, password };
          const response = await loginAction(credentials);

          // 使用类型守卫检查业务成功 (code === 0)
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
              return true;
            }
          }

          // 业务失败或数据不完整
          console.error("❌ 登录失败:", response.message);
          const errorResult = await handleStoreError(response, "登录");
          set({
            isLoadingLogin: false,
            error: errorResult.error,
          });
          return false;
        } catch (err: any) {
          console.error("❌ 登录时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "登录");
          set({
            isLoadingLogin: false,
            error: errorResult.error,
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
        set({ isLoadingRegister: true, error: null });
        try {
          const userData: RegisterRequest = { username, email, password };
          const response = await registerAction(userData);

          // 使用类型守卫检查业务成功 (code === 0)
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
            } else {
              // 注册成功但未自动登录 (例如需要邮箱验证)
              console.log("📝 注册请求成功:", response.message);
              set({ isLoadingRegister: false, error: null });
            }
            return true;
          }

          // 业务失败
          console.error("❌ 注册失败:", response.message);
          const errorResult = await handleStoreError(response, "注册");
          set({
            isLoadingRegister: false,
            error: errorResult.error,
          });
          return false;
        } catch (err: any) {
          console.error("❌ 注册时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "注册");
          set({
            isLoadingRegister: false,
            error: errorResult.error,
          });
          return false;
        }
      },

      // 用户登出
      logout: async () => {
        set({ isLoadingLogout: true });
        try {
          const response = await logoutAction();
          if (isSuccessApiResponse(response)) {
            console.log("🚪 用户已成功登出");
          } else {
            console.warn(
              "⚠️ 登出操作在服务端可能未完全成功:",
              response.message
            );
            // 即使服务端失败，客户端也应清除状态
          }
        } catch (err: any) {
          console.error("❌ 登出时发生意外错误:", err);
          // 即使捕获到错误，也应清除客户端状态
        } finally {
          // 使用clearAuth来确保清理缓存
          get().clearAuth();
          set({
            isLoadingLogout: false,
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
          const errorResult = await handleStoreError(error, "认证状态初始化");
          set({
            user: null,
            isAuthenticated: false,
            isLoadingInitAuth: false,
            error: errorResult.error,
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

        try {
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

            // 根据是否静默模式返回不同格式的结果
            if (silent) {
              return {
                success: true,
                data: response.data,
              } as AuthOperationResult;
            }
            return true;
          } else {
            console.error(
              `❌ 忘记密码请求失败${silent ? "（静默模式）" : ""}:`,
              response.message
            );
            const errorMessage =
              response.message || "忘记密码请求失败，请检查输入信息。";

            // 更新忘记密码专门状态
            set({
              forgotPasswordState: {
                ...get().forgotPasswordState,
                isLoading: false,
                error: errorMessage,
              },
            });

            // 根据是否静默模式返回不同格式的结果
            if (silent) {
              return {
                success: false,
                error: errorMessage,
              } as AuthOperationResult;
            }
            return false;
          }
        } catch (err: any) {
          console.error(
            `❌ 忘记密码时发生意外错误${silent ? "（静默模式）" : ""}:`,
            err
          );
          const errorResult = await handleStoreError(err, "忘记密码");

          // 更新忘记密码专门状态
          set({
            forgotPasswordState: {
              ...get().forgotPasswordState,
              isLoading: false,
              error: errorResult.error,
            },
          });

          // 根据是否静默模式返回不同格式的结果
          if (silent) {
            return {
              success: false,
              error: errorResult.error,
            } as AuthOperationResult;
          }
          return false;
        }
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

        try {
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

            // 根据是否静默模式返回不同格式的结果
            if (silent) {
              return {
                success: true,
                data: response.data,
              } as AuthOperationResult;
            }
            return true;
          } else {
            console.error(
              `❌ 密码重置失败${silent ? "（静默模式）" : ""}:`,
              response.message
            );
            const errorMessage =
              response.message || "密码重置失败，请检查输入信息。";

            // 更新忘记密码专门状态
            set({
              forgotPasswordState: {
                ...get().forgotPasswordState,
                isLoading: false,
                error: errorMessage,
              },
            });

            // 根据是否静默模式返回不同格式的结果
            if (silent) {
              return {
                success: false,
                error: errorMessage,
              } as AuthOperationResult;
            }
            return false;
          }
        } catch (err: any) {
          console.error(
            `❌ 密码重置时发生意外错误${silent ? "（静默模式）" : ""}:`,
            err
          );
          const errorResult = await handleStoreError(err, "密码重置");

          // 更新忘记密码专门状态
          set({
            forgotPasswordState: {
              ...get().forgotPasswordState,
              isLoading: false,
              error: errorResult.error,
            },
          });

          // 根据是否静默模式返回不同格式的结果
          if (silent) {
            return {
              success: false,
              error: errorResult.error,
            } as AuthOperationResult;
          }
          return false;
        }
      },

      activateAccount: async (
        email: string,
        code: string
      ): Promise<boolean> => {
        set({ isLoadingOther: true, error: null });
        try {
          const response = await activateAccountAction(email, code);
          if (isSuccessApiResponse(response)) {
            console.log("✅ 账户激活成功");
            set({ isLoadingOther: false, error: null });
            return true;
          } else {
            console.error("❌ 账户激活失败:", response.message);
            const errorResult = await handleStoreError(response, "账户激活");
            set({
              isLoadingOther: false,
              error: errorResult.error,
            });
            return false;
          }
        } catch (err: any) {
          console.error("❌ 账户激活时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "账户激活");
          set({
            isLoadingOther: false,
            error: errorResult.error,
          });
          return false;
        }
      },

      resendActivationEmail: async (email: string): Promise<boolean> => {
        set({ isLoadingOther: true, error: null });
        try {
          const response = await resendActivationEmailAction(email);
          if (isSuccessApiResponse(response)) {
            console.log("✅ 激活邮件重发成功");
            set({ isLoadingOther: false, error: null });
            return true;
          } else {
            console.error("❌ 激活邮件重发失败:", response.message);
            const errorResult = await handleStoreError(
              response,
              "激活邮件重发"
            );
            set({
              isLoadingOther: false,
              error: errorResult.error,
            });
            return false;
          }
        } catch (err: any) {
          console.error("❌ 激活邮件重发时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "激活邮件重发");
          set({
            isLoadingOther: false,
            error: errorResult.error,
          });
          return false;
        }
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
