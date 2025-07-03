// lib/actions/auth/auth.actions.ts
"use server";

import { cookies } from "next/headers";
import {
  publicApiService,
  getAuthenticatedApiService,
  AuthenticationError,
} from "@/lib/api/api-service";
import type { User } from "@/lib/types/user";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponseData,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AccountActivationRequest,
  ResendActivationEmailRequest,
  UpdateMeRequest,
} from "@/lib/types/auth";
import type {
  ApiResponse,
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
): Promise<ApiResponse<AuthResponseData>> {
  try {
    const response = await publicApiService.post<ApiResponse<AuthResponseData>>(
      "/auth/login",
      credentials
    );

    const apiResponse = response.data;

    // 如果成功，设置 cookie
    if (apiResponse.code === 0 && apiResponse.data?.token) {
      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE_NAME, apiResponse.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: AUTH_COOKIE_MAX_AGE,
        sameSite: "lax",
      });
    }

    // 直接返回 API 响应，让 Store 层处理成功/失败
    return apiResponse;
  } catch (error: any) {
    console.error("[Auth Action] 登录错误:", error);
    // 网络错误或HTTP错误，已经是 ErrorApiResponse 格式
    return error as ErrorApiResponse;
  }
}

/**
 * 用户注册 Action
 * @param userData 注册信息 (用户名, 邮箱, 密码)
 * @returns AuthActionResponse 包含认证结果或错误信息
 */
export async function registerAction(
  userData: RegisterRequest
): Promise<ApiResponse<AuthResponseData>> {
  try {
    const response = await publicApiService.post<ApiResponse<AuthResponseData>>(
      "/auth/register",
      userData
    );

    const apiResponse = response.data;

    // 如果成功且返回了token，设置 cookie
    if (apiResponse.code === 0 && apiResponse.data?.token) {
      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE_NAME, apiResponse.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: AUTH_COOKIE_MAX_AGE,
        sameSite: "lax",
      });
    }

    // 直接返回 API 响应
    return apiResponse;
  } catch (error: any) {
    console.error("[Auth Action] 注册错误:", error);
    return error as ErrorApiResponse;
  }
}

/**
 * 用户登出 Action
 * @returns AuthActionResponse 包含操作成功状态或错误信息
 */
export async function logoutAction(): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const apiService = await getAuthenticatedApiService();

    // 可选：调用后端登出接口
    try {
      await apiService.post<ApiResponse<any>>("/auth/logout");
      console.log("[Auth Action] 后端登出成功");
    } catch (backendLogoutError: any) {
      console.warn(
        "[Auth Action] 后端登出失败或接口不可用，继续客户端登出",
        backendLogoutError.message
      );
    }

    // 始终清除 cookie
    const cookieStore = await cookies();
    cookieStore.delete({ name: AUTH_COOKIE_NAME, path: "/" });

    return {
      code: 0,
      message: "登出成功",
      data: { success: true },
    };
  } catch (error: any) {
    console.error("[Auth Action] 登出错误:", error);

    // 即使出错也要清除cookie
    try {
      const cookieStore = await cookies();
      cookieStore.delete({ name: AUTH_COOKIE_NAME, path: "/" });
    } catch (cookieError) {
      console.error("[Auth Action] 清除Cookie失败:", cookieError);
    }

    // 返回错误响应
    return error as ErrorApiResponse;
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
): Promise<ApiResponse<any>> {
  try {
    const requestData: ForgotPasswordRequest = { email };
    const response = await publicApiService.post<ApiResponse<any>>(
      "/auth/forgot-password",
      requestData
    );
    return response.data;
  } catch (error: any) {
    console.error("[Auth Action] 忘记密码错误:", error);
    return error as ErrorApiResponse;
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
): Promise<ApiResponse<any>> {
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
    return response.data;
  } catch (error: any) {
    console.error("[Auth Action] 密码重置错误:", error);
    return error as ErrorApiResponse;
  }
}

/**
 * 账户激活 Action
 */
export async function activateAccountAction(
  email: string,
  code: string
): Promise<ApiResponse<any>> {
  try {
    const requestData: AccountActivationRequest = { email, code };
    const response = await publicApiService.post<ApiResponse<any>>(
      "/auth/activate",
      requestData
    );
    return response.data;
  } catch (error: any) {
    console.error("[Auth Action] 账户激活错误:", error);
    return error as ErrorApiResponse;
  }
}

/**
 * 重发激活邮件 Action
 */
export async function resendActivationEmailAction(
  email: string
): Promise<ApiResponse<any>> {
  try {
    const requestData: ResendActivationEmailRequest = { email };
    const response = await publicApiService.post<ApiResponse<any>>(
      "/auth/resend-activation-email",
      requestData
    );
    return response.data;
  } catch (error: any) {
    console.error("[Auth Action] 重发激活邮件错误:", error);
    return error as ErrorApiResponse;
  }
}

/**
 * 更新个人信息 Action
 */
export async function updateMeAction(
  userData: UpdateMeRequest
): Promise<ApiResponse<User>> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<ApiResponse<User>>("/me", userData);
    return response.data;
  } catch (error: any) {
    console.error("[Auth Action] 更新个人信息错误:", error);
    return error as ErrorApiResponse;
  }
}
