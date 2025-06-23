// lib/actions/auth/auth.actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  publicApiService,
  getAuthenticatedApiService,
  AuthenticationError,
} from "@/lib/api/apiService";
import type { User } from "@/lib/types/user";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponseData,
  AuthApiResponse,
  AuthActionResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AccountActivationRequest,
  ResendActivationEmailRequest,
  UpdateMeRequest,
} from "@/lib/types/auth";
import type {
  ApiResponse,
  SuccessApiResponse,
  ErrorApiResponse,
} from "@/lib/types/common";

const AUTH_COOKIE_NAME = "auth_token";
const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 天

/**
 * 用户登录 Action
 * @param credentials 登录凭据 (用户名/邮箱 和 密码)
 * @returns AuthActionResponse 包含认证结果或错误信息
 */
export async function loginAction(
  credentials: LoginRequest
): Promise<AuthActionResponse> {
  try {
    const response = await publicApiService.post<ApiResponse<AuthResponseData>>(
      "/auth/login",
      credentials
    );

    const apiResponse = response.data;

    // 检查业务层面的成功 (code === 0)
    if (
      apiResponse.code === 0 &&
      apiResponse.data?.token &&
      apiResponse.data?.user
    ) {
      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE_NAME, apiResponse.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: AUTH_COOKIE_MAX_AGE,
        sameSite: "lax",
      });

      return {
        code: 0,
        message: apiResponse.message || "登录成功",
        data: apiResponse.data,
      };
    }

    // 业务失败 (code !== 0)
    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "登录失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("[Auth Action] 登录错误:", error);

    // 处理认证错误（主要是401错误）
    if (error instanceof AuthenticationError) {
      return {
        code: error.status || 401,
        message: error.message || "用户名或密码错误，请重新输入",
        error: error,
      };
    }

    // 处理其他结构化错误
    if (error && typeof error === "object") {
      let userMessage = "登录失败，请稍后重试";

      if (error.code === 400) {
        userMessage = error.message || "请求参数有误，请检查输入信息";
      } else if (error.code === 422) {
        userMessage = error.message || "输入信息格式有误，请重新检查";
      } else if (error.code === 500) {
        userMessage = error.message || "服务器繁忙，请稍后重试";
      } else if (error.code === 0) {
        userMessage = error.message || "网络连接失败，请检查网络后重试";
      } else if (error.message && !error.message.includes("status code")) {
        userMessage = error.message;
      }

      return {
        code: error.code || 500,
        message: userMessage,
        error: error.data || error,
      };
    }

    // 处理未知错误类型
    const fallbackMessage =
      typeof error === "string" ? error : "登录时发生未知错误，请稍后重试";
    return {
      code: 500,
      message: fallbackMessage,
      error,
    };
  }
}

/**
 * 用户注册 Action
 * @param userData 注册信息 (用户名, 邮箱, 密码)
 * @returns AuthActionResponse 包含认证结果或错误信息
 */
export async function registerAction(
  userData: RegisterRequest
): Promise<AuthActionResponse> {
  try {
    const response = await publicApiService.post<ApiResponse<AuthResponseData>>(
      "/auth/register",
      userData
    );

    const apiResponse = response.data;

    // 检查业务层面的成功 (code === 0)
    if (apiResponse.code === 0) {
      // 如果返回了token和user，则自动登录
      if (apiResponse.data?.token && apiResponse.data?.user) {
        const cookieStore = await cookies();
        cookieStore.set(AUTH_COOKIE_NAME, apiResponse.data.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: AUTH_COOKIE_MAX_AGE,
          sameSite: "lax",
        });

        return {
          code: 0,
          message: apiResponse.message || "注册成功并已登录",
          data: apiResponse.data,
        };
      } else {
        // 仅返回消息，例如需要邮箱验证
        return {
          code: 0,
          message: apiResponse.message || "注册成功，请查收邮件进行验证",
          data: apiResponse.data,
        };
      }
    }

    // 业务失败 (code !== 0)
    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "注册失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("[Auth Action] 注册错误:", error);

    // 处理认证错误
    if (error instanceof AuthenticationError) {
      return {
        code: error.status || 401,
        message: error.message || "注册失败，认证信息有误",
        error: error,
      };
    }

    // 处理其他结构化错误
    if (error && typeof error === "object") {
      let userMessage = "注册失败，请稍后重试";

      if (error.code === 400) {
        userMessage = error.message || "请求参数有误，请检查输入信息";
      } else if (error.code === 422) {
        userMessage = error.message || "输入信息验证失败，请检查格式";
      } else if (error.code === 409) {
        userMessage = error.message || "用户名或邮箱已存在，请使用其他信息";
      } else if (error.code === 500) {
        userMessage = error.message || "服务器繁忙，请稍后重试";
      } else if (error.code === 0) {
        userMessage = error.message || "网络连接失败，请检查网络后重试";
      } else if (error.message && !error.message.includes("status code")) {
        userMessage = error.message;
      }

      return {
        code: error.code || 500,
        message: userMessage,
        error: error.data || error,
      };
    }

    // 处理未知错误类型
    const fallbackMessage =
      typeof error === "string" ? error : "注册时发生未知错误，请稍后重试";
    return {
      code: 500,
      message: fallbackMessage,
      error,
    };
  }
}

/**
 * 用户登出 Action
 * @returns AuthActionResponse 包含操作成功状态或错误信息
 */
export async function logoutAction(): Promise<AuthActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();

    // 可选：调用后端登出接口
    try {
      const response = await apiService.post<ApiResponse<any>>("/auth/logout");
      console.log("[Auth Action] 后端登出成功");
    } catch (backendLogoutError: any) {
      console.warn(
        "[Auth Action] 后端登出失败或接口不可用，继续客户端登出",
        backendLogoutError.message
      );
      // 即使后端登出失败，也继续清除客户端cookie
    }

    const cookieStore = await cookies();
    cookieStore.delete({ name: AUTH_COOKIE_NAME, path: "/" });

    return {
      code: 0,
      message: "登出成功",
      data: { success: true },
    };
  } catch (error: any) {
    console.error("[Auth Action] 登出错误:", error);

    // 即使出错也要尝试清除cookie
    try {
      const cookieStore = await cookies();
      cookieStore.delete({ name: AUTH_COOKIE_NAME, path: "/" });
    } catch (cookieError) {
      console.error("[Auth Action] 清除Cookie失败:", cookieError);
    }

    return {
      code: 500,
      message: error.message || "登出时发生未知错误",
      error,
    };
  }
}

/**
 * 获取当前登录用户信息 Action
 * @returns Promise<User | null> 当前用户信息或null
 */
export async function getCurrentUserAction(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<ApiResponse<User>>("/me");
    const apiResponse = response.data;

    // 检查业务层面的成功 (code === 0)
    if (apiResponse.code === 0 && apiResponse.data) {
      return apiResponse.data;
    }

    // 业务失败，清除cookie
    cookieStore.delete({ name: AUTH_COOKIE_NAME, path: "/" });
    return null;
  } catch (error: any) {
    console.error("[Auth Action] 获取当前用户错误:", error.message);

    if (error instanceof AuthenticationError) {
      // Token 无效或过期，清除 cookie
      cookieStore.delete({ name: AUTH_COOKIE_NAME, path: "/" });
    }

    return null;
  }
}

/**
 * 辅助函数：检查用户是否已认证 (基于cookie)
 * 注意：这只检查cookie是否存在，不保证token有效性。
 * 更可靠的检查是通过 getCurrentUserAction。
 * @returns boolean 是否存在认证cookie
 */
export async function isAuthenticatedCookieCheck(): Promise<boolean> {
  const cookieStore = await cookies();
  return !!cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

/**
 * 忘记密码 Action
 * @param email 用户邮箱
 * @returns AuthActionResponse 包含操作结果或错误信息
 */
export async function forgotPasswordAction(
  email: string
): Promise<AuthActionResponse> {
  try {
    const requestData: ForgotPasswordRequest = { email };
    const response = await publicApiService.post<ApiResponse<any>>(
      "/auth/forgot-password",
      requestData
    );

    const apiResponse = response.data;

    // 检查业务层面的成功 (code === 0)
    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "密码重置邮件已发送",
        data: apiResponse.data,
      };
    }

    // 业务失败 (code !== 0)
    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "忘记密码请求失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("[Auth Action] 忘记密码错误:", error);

    return {
      code: error.code || 500,
      message: error.message || "忘记密码时发生未知错误，请稍后重试",
      error,
    };
  }
}

/**
 * 重置密码 Action
 * @param email 用户邮箱
 * @param password 新密码
 * @param confirmPassword 确认密码
 * @param code 重置验证码
 * @returns AuthActionResponse 包含操作结果或错误信息
 */
export async function resetPasswordAction(
  email: string,
  password: string,
  confirmPassword: string,
  code: string
): Promise<AuthActionResponse> {
  try {
    const requestData: ResetPasswordRequest = {
      email,
      password,
      confirmPassword,
      code,
    };
    const response = await publicApiService.post<ApiResponse<any>>(
      "/auth/reset-password",
      requestData
    );

    const apiResponse = response.data;

    // 检查业务层面的成功 (code === 0)
    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "密码重置成功",
        data: apiResponse.data,
      };
    }

    // 业务失败 (code !== 0)
    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "密码重置失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("[Auth Action] 密码重置错误:", error);

    return {
      code: error.code || 500,
      message: error.message || "密码重置时发生未知错误，请稍后重试",
      error,
    };
  }
}

/**
 * 账户激活 Action
 */
export async function activateAccountAction(
  email: string,
  code: string
): Promise<AuthActionResponse> {
  try {
    const requestData: AccountActivationRequest = { email, code };
    const response = await publicApiService.post<ApiResponse<any>>(
      "/auth/activate",
      requestData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "账户激活成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "账户激活失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("[Auth Action] 账户激活错误:", error);

    return {
      code: error.code || 500,
      message: error.message || "账户激活时发生未知错误，请稍后重试",
      error,
    };
  }
}

/**
 * 重发激活邮件 Action
 */
export async function resendActivationEmailAction(
  email: string
): Promise<AuthActionResponse> {
  try {
    const requestData: ResendActivationEmailRequest = { email };
    const response = await publicApiService.post<ApiResponse<any>>(
      "/auth/resend-activation-email",
      requestData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "激活邮件已重新发送",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "重发激活邮件失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("[Auth Action] 重发激活邮件错误:", error);

    return {
      code: error.code || 500,
      message: error.message || "重发激活邮件时发生未知错误，请稍后重试",
      error,
    };
  }
}

/**
 * 更新个人信息 Action
 */
export async function updateMeAction(
  userData: UpdateMeRequest
): Promise<AuthActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<ApiResponse<User>>("/me", userData);

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "个人信息更新成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "个人信息更新失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("[Auth Action] 更新个人信息错误:", error);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "更新个人信息时发生未知错误，请稍后重试",
      error,
    };
  }
}
