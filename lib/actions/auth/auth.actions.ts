// lib/actions/auth/auth.actions.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation"; // 暂时不直接使用，但根据计划导入
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
  ServerActionResponse,
  ActionErrorResponse,
} from "@/lib/types/auth";

const AUTH_COOKIE_NAME = "auth_token";
const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 天

/**
 * 用户登录 Action
 * @param credentials 登录凭据 (用户名/邮箱 和 密码)
 * @returns ServerActionResponse 包含认证结果或错误信息
 */
export async function loginAction(
  credentials: LoginRequest
): Promise<ServerActionResponse<AuthResponseData>> {
  try {
    // console.log('[Auth Action] Attempting login for:', credentials.username_or_email); // 中文注释：尝试登录日志
    const response = await publicApiService.post<AuthResponseData>(
      "/auth/login",
      credentials
    );
    const responseData = response.data; // 显式访问 .data
    // console.log('[Auth Action] Login API Response Data:', responseData);

    if (responseData && responseData.token && responseData.user) {
      const cookieStore = await cookies(); // 尝试 await
      cookieStore.set(AUTH_COOKIE_NAME, responseData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: AUTH_COOKIE_MAX_AGE,
        sameSite: "lax",
      });
      // console.log('[Auth Action] Auth token set in cookie.');
      return {
        success: true,
        data: responseData,
        message: responseData.message || "登录成功",
      };
    }
    // console.error('[Auth Action] Login failed: Invalid response structure from API', response); // 中文注释：登录失败，API响应结构无效
    return {
      success: false,
      message: "登录失败：服务器响应格式不正确。",
      code: 500, // 假设是服务器端问题
    };
  } catch (error: any) {
    console.error("[Auth Action] Login error:", error); // 中文注释：登录错误日志

    // 处理认证错误（主要是401错误）
    if (error instanceof AuthenticationError) {
      return {
        success: false,
        message: error.message || "用户名或密码错误，请重新输入。",
        code: error.status,
      };
    }

    // 处理其他结构化错误
    if (error && typeof error === "object") {
      // 根据错误代码提供合适的用户提示
      let userMessage = "登录失败，请稍后重试。";

      if (error.code === 400) {
        userMessage = error.message || "请求参数有误，请检查输入信息。";
      } else if (error.code === 422) {
        userMessage = error.message || "输入信息格式有误，请重新检查。";
      } else if (error.code === 500) {
        userMessage = "服务器繁忙，请稍后重试。";
      } else if (error.code === 0) {
        userMessage = error.message || "网络连接失败，请检查网络后重试。";
      } else if (error.message && !error.message.includes("status code")) {
        // 如果有自定义错误消息且不包含技术性状态码信息，则使用它
        userMessage = error.message;
      }

      return {
        success: false,
        message: userMessage,
        code: error.code || 500,
        error: error.data || error,
      };
    }

    // 处理未知错误类型
    const fallbackMessage =
      typeof error === "string" ? error : "登录时发生未知错误，请稍后重试。";
    return {
      success: false,
      message: fallbackMessage,
      code: 500,
      error,
    };
  }
}

/**
 * 用户注册 Action
 * @param userData 注册信息 (用户名, 邮箱, 密码)
 * @returns ServerActionResponse 包含认证结果或错误信息
 */
export async function registerAction(
  userData: RegisterRequest
): Promise<ServerActionResponse<AuthResponseData | { message: string }>> {
  try {
    const response = await publicApiService.post<
      AuthResponseData | { message: string }
    >("/auth/register", userData);
    const responseData = response.data; // 显式访问 .data
    // 检查后端是否返回了token和user，如果是，则可以考虑自动登录
    if (responseData && "token" in responseData && "user" in responseData) {
      const cookieStore = await cookies(); // 尝试 await
      cookieStore.set(AUTH_COOKIE_NAME, responseData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: AUTH_COOKIE_MAX_AGE,
        sameSite: "lax",
      });
      return {
        success: true,
        data: responseData as AuthResponseData,
        message:
          (responseData as AuthResponseData).message || "注册成功并已登录。",
      };
    } else if (responseData && "message" in responseData) {
      // 仅返回消息，例如需要邮箱验证
      return {
        success: true,
        data: { message: responseData.message as string },
        message: responseData.message as string,
      };
    }

    // console.error('[Auth Action] Registration failed: Invalid response structure from API', responseData);
    return {
      success: false,
      message: "注册失败：服务器响应格式不正确。",
      code: 500,
    };
  } catch (error: any) {
    console.error("[Auth Action] Registration error:", error); // 中文注释：注册错误日志

    // 处理认证错误（可能在某些注册流程中出现）
    if (error instanceof AuthenticationError) {
      return {
        success: false,
        message: error.message || "注册失败，认证信息有误。",
        code: error.status,
      };
    }

    // 处理其他结构化错误
    if (error && typeof error === "object") {
      // 根据错误代码提供合适的用户提示
      let userMessage = "注册失败，请稍后重试。";

      if (error.code === 400) {
        userMessage = error.message || "请求参数有误，请检查输入信息。";
      } else if (error.code === 422) {
        userMessage = error.message || "输入信息验证失败，请检查格式。";
      } else if (error.code === 409) {
        userMessage = error.message || "用户名或邮箱已存在，请使用其他信息。";
      } else if (error.code === 500) {
        userMessage = "服务器繁忙，请稍后重试。";
      } else if (error.code === 0) {
        userMessage = error.message || "网络连接失败，请检查网络后重试。";
      } else if (error.message && !error.message.includes("status code")) {
        // 如果有自定义错误消息且不包含技术性状态码信息，则使用它
        userMessage = error.message;
      }

      return {
        success: false,
        message: userMessage,
        code: error.code || 500,
        error: error.data || error,
      };
    }

    // 处理未知错误类型
    const fallbackMessage =
      typeof error === "string" ? error : "注册时发生未知错误，请稍后重试。";
    return {
      success: false,
      message: fallbackMessage,
      code: 500,
      error,
    };
  }
}

/**
 * 用户登出 Action
 * @returns ServerActionResponse 包含操作成功状态或错误信息
 */
export async function logoutAction(): Promise<
  ServerActionResponse<{ success: boolean; message?: string }>
> {
  try {
    // console.log('[Auth Action] Attempting logout.'); // 中文注释：尝试登出日志
    const apiService = await getAuthenticatedApiService(); // 修正: getAuthenticatedApiService 现在是异步的
    // 可选：调用后端登出接口，如果后端有会话管理
    // 根据 plan.md，这里是可选的。如果 swagger.yaml 中没有 /auth/logout, 则跳过
    // 假设 swagger.yaml 中没有 /auth/logout 端点，或者调用失败不影响前端登出
    try {
      await apiService.post("/auth/logout"); // 假设端点存在
      // console.log('[Auth Action] Backend logout successful.');
    } catch (backendLogoutError: any) {
      // console.warn('[Auth Action] Backend logout failed or endpoint not available, proceeding with client-side logout.', backendLogoutError.message); // 中文注释：后端登出失败或接口不可用
      // 即使后端登出失败，也继续清除客户端cookie
    }

    const cookieStore = await cookies(); // 修正: 获取 cookieStore 实例
    cookieStore.delete({ name: AUTH_COOKIE_NAME, path: "/" }); // 修正: 将 name 和 path 放入一个对象
    // console.log('[Auth Action] Auth token cookie deleted.'); // 中文注释：Cookie删除日志
    return {
      success: true,
      data: { success: true, message: "登出成功" },
      message: "登出成功",
    };
  } catch (error: any) {
    // console.error('[Auth Action] Logout error:', error); // 中文注释：登出错误日志
    // 登出操作本身不太可能因为apiService获取失败而出错，除非cookies()出问题
    return {
      success: false,
      message: error.message || "登出时发生未知错误。",
      code: 500, // 假设是服务器端问题
      error,
    };
  }
}

/**
 * 获取当前登录用户信息 Action
 * @returns Promise<User | null> 当前用户信息或null
 */
export async function getCurrentUserAction(): Promise<User | null> {
  // console.log('[Auth Action] Attempting to get current user.'); // 中文注释：尝试获取当前用户日志
  const cookieStore = await cookies(); // 尝试 await
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    // console.log('[Auth Action] No auth token found in cookies.');
    return null;
  }

  try {
    const apiService = await getAuthenticatedApiService(); // 修正: getAuthenticatedApiService 现在是异步的
    const response = await apiService.get<User>("/me");
    const userData = response.data; // 显式访问 .data
    // console.log('[Auth Action] Current user fetched:', userData?.username);
    return userData;
  } catch (error: any) {
    // console.error('[Auth Action] Get current user error:', error.message);
    if (error instanceof AuthenticationError) {
      // console.log('[Auth Action] AuthenticationError while fetching current user, clearing cookie.');
      // Token 无效或过期，清除 cookie
      // const cookieStore = await cookies();
      cookieStore.delete({ name: AUTH_COOKIE_NAME, path: "/" }); // 修正: 将 name 和 path 放入一个对象
    }
    // 对于其他错误，也返回 null，让调用方处理
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
  const cookieStore = await cookies(); // 尝试 await
  return !!cookieStore.get(AUTH_COOKIE_NAME)?.value;
}
