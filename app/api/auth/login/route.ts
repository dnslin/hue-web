import { NextRequest } from "next/server";
import { apiUtils } from "@/lib/api/apiUtils";

/**
 * 处理用户登录请求
 * 将请求转发到后端API，并在成功时设置HTTP-only cookie
 */
export async function POST(request: NextRequest) {
  try {
    // 转发请求到后端API
    const data = await apiUtils.forwardRequest(request, "/auth/login");

    // 检查响应是否成功且包含token
    if (data && !data.error && data.data?.token) {
      console.log("登录成功，设置认证cookie");
      console.log("用户信息:", JSON.stringify(data.data.user, null, 2));

      // 返回完整的用户信息和token，前端可以缓存使用
      return apiUtils.createResponse(
        {
          ...data,
          // 添加跳转提示，前端可以根据用户角色决定跳转路径
          redirect:
            data.data.user?.role === "admin" ? "/dashboard" : "/dashboard",
        },
        {
          setCookie: {
            name: "auth_token",
            value: data.data.token,
            maxAge: 30 * 24 * 60 * 60, // 30天
          },
        }
      );
    } else {
      // 登录失败，返回错误信息
      console.log("登录失败:", data.message || "未知错误");
      return apiUtils.createResponse(data);
    }
  } catch (error) {
    console.error("登录API错误:", error);
    return apiUtils.createResponse({
      error: true,
      message: "登录服务暂时不可用，请稍后重试",
      code: 500,
    });
  }
}

