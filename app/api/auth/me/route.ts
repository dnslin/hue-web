import { NextRequest } from "next/server";
import { apiUtils } from "@/lib/api/apiUtils";

/**
 * 获取当前登录用户信息
 * 转发请求到后端/me接口
 */
export async function GET(request: NextRequest) {
  try {
    console.log("👤 获取当前用户信息");

    // 转发请求到后端API
    const data = await apiUtils.forwardRequest(request, "/me");

    // 检查响应是否成功
    if (data && !data.error) {
      console.log("✅ 成功获取用户信息");
      return apiUtils.createResponse(data);
    } else {
      // 获取用户信息失败，可能是token无效
      console.log("❌ 获取用户信息失败:", data.message || "未知错误");
      return apiUtils.createResponse(data, { status: 401 });
    }
  } catch (error) {
    console.error("获取用户信息API错误:", error);
    return apiUtils.createResponse({
      error: true,
      message: "获取用户信息失败",
      code: 500,
    });
  }
}
