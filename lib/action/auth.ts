"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// API基础URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080/api/v1";

// 认证响应类型
interface AuthResponse {
  code: number;
  message: string;
  error?: boolean;
  data?: {
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      role: string;
      status: number;
    };
  };
}

// 登录表单数据类型
interface LoginFormData {
  email: string;
  password: string;
}

// 注册表单数据类型
interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

/**
 * 用户登录Server Action
 */
export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return {
        error: true,
        message: "邮箱和密码不能为空",
      };
    }

    console.log("🔐 处理用户登录请求");

    // 调用后端登录API
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok || data.error) {
      console.log("❌ 登录失败:", data.message);
      return {
        error: true,
        message: data.message || "登录失败",
      };
    }

    // 登录成功，设置HTTP-only cookie
    if (data.data?.token) {
      console.log("✅ 登录成功，设置认证cookie");

      const cookieStore = await cookies();
      cookieStore.set({
        name: "auth_token",
        value: data.data.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30天
      });

      // 根据用户角色重定向
      const redirectPath =
        data.data.user.role === "admin" ? "/dashboard" : "/dashboard";
      redirect(redirectPath);
    }

    return {
      error: false,
      message: "登录成功",
      user: data.data?.user,
    };
  } catch (error) {
    console.error("登录Server Action错误:", error);
    return {
      error: true,
      message: "登录服务暂时不可用，请稍后重试",
    };
  }
}

/**
 * 用户注册Server Action
 */
export async function registerAction(formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!username || !email || !password) {
      return {
        error: true,
        message: "所有字段都不能为空",
      };
    }

    console.log("📝 处理用户注册请求");

    // 调用后端注册API
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data: AuthResponse = await response.json();

    if (!response.ok || data.error) {
      console.log("❌ 注册失败:", data.message);
      return {
        error: true,
        message: data.message || "注册失败",
      };
    }

    console.log("✅ 注册成功");

    // 如果注册成功后返回了token，自动登录
    if (data.data?.token) {
      console.log("🔐 注册成功，自动登录");

      const cookieStore = await cookies();
      cookieStore.set({
        name: "auth_token",
        value: data.data.token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30天
      });

      redirect("/dashboard");
    }

    return {
      error: false,
      message: "注册成功",
      user: data.data?.user,
    };
  } catch (error) {
    console.error("注册Server Action错误:", error);
    return {
      error: true,
      message: "注册服务暂时不可用，请稍后重试",
    };
  }
}

/**
 * 用户登出Server Action
 */
export async function logoutAction() {
  try {
    console.log("🚪 处理用户登出请求");

    // 获取当前token
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    // 可选：通知后端用户登出
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch {
        // 即使后端登出失败，也要清除前端cookie
        console.log("后端登出请求失败，但继续清除前端认证状态");
      }
    }

    // 删除认证cookie
    cookieStore.delete("auth_token");

    console.log("✅ 登出成功");
    redirect("/login");
  } catch (error) {
    console.error("登出Server Action错误:", error);
    // 即使出错也要尝试清除cookie
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    redirect("/login");
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    console.log("👤 获取当前用户信息");

    const response = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Token可能已过期，清除cookie
      cookieStore.delete("auth_token");
      return null;
    }

    const data = await response.json();

    if (data.error) {
      return null;
    }

    return data.data;
  } catch (error) {
    console.error("获取用户信息错误:", error);
    return null;
  }
}

/**
 * 检查用户是否已认证
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}
