import { NextRequest } from "next/server";
import { apiUtils } from "@/lib/api/apiUtils";

/**
 * 处理用户注册请求
 * 将请求转发到后端API
 */
export async function POST(request: NextRequest) {
  // 转发请求到后端API
  const data = await apiUtils.forwardRequest(request, "/auth/register");

  // 创建响应，状态码201表示创建成功
  return apiUtils.createResponse(data, { status: 201 });
}
