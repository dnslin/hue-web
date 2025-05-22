import { NextRequest } from "next/server";
import { apiUtils } from "@/lib/api/apiUtils";

/**
 * 获取当前用户信息
 * 将请求转发到后端API，并处理认证错误
 */
export async function GET(request: NextRequest) {
  // 检查是否有认证令牌
  const token = request.cookies.get("auth_token")?.value;

  // 如果没有令牌，返回未授权错误
  if (!token) {
    return apiUtils.createResponse(
      { message: "未登录或会话已过期", error: true },
      { status: 401 }
    );
  }

  // 转发请求到后端API
  const data = await apiUtils.forwardRequest(request, "/me");

  // 如果响应有错误，并且是401未授权，清除cookie
  const options =
    data.error && data.code === 401
      ? { deleteCookie: "auth_token" }
      : undefined;

  return apiUtils.createResponse(data, options);
}
