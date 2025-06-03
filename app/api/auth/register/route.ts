import { NextRequest } from "next/server";
import { apiUtils } from "@/lib/api/apiUtils";

/**
 * 处理用户注册请求
 * 将请求转发到后端API，注册成功时自动设置认证cookie
 */
export async function POST(request: NextRequest) {
  try {
    // 转发请求到后端API
    const data = await apiUtils.forwardRequest(request, "/auth/register");

    // 检查注册是否成功
    if (data && !data.error) {
      console.log("注册成功");

      // 如果注册成功后返回了token，设置cookie（自动登录）
      if (data.data?.token) {
        console.log("注册成功，自动登录并设置认证cookie");

        return apiUtils.createResponse(data, {
          status: 201,
          setCookie: {
            name: "auth_token",
            value: data.data.token,
            maxAge: 30 * 24 * 60 * 60, // 30天
          },
        });
      } else {
        // 注册成功但没有token，返回成功响应
        return apiUtils.createResponse(data, { status: 201 });
      }
    } else {
      // 注册失败，返回错误信息
      console.log("注册失败:", data.message || "未知错误");
      return apiUtils.createResponse(data);
    }
  } catch (error) {
    console.error("注册API错误:", error);
    return apiUtils.createResponse({
      error: true,
      message: "注册服务暂时不可用，请稍后重试",
      code: 500,
    });
  }
}

