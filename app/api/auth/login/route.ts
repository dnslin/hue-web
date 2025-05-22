import { NextRequest } from "next/server";
import { apiUtils } from "@/lib/api/apiUtils";

/**
 * 处理用户登录请求
 * 将请求转发到后端API，并在成功时设置HTTP-only cookie
 */
export async function POST(request: NextRequest) {
  // 转发请求到后端API
  const data = await apiUtils.forwardRequest(request, "/auth/login");

  // 检查是否有令牌，并创建响应
  const options = data.data?.token
    ? {
        setCookie: {
          name: "auth_token",
          value: data.data.token,
        },
      }
    : undefined;

  return apiUtils.createResponse(data, options);
}
