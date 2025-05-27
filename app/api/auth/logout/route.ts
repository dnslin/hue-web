import { NextRequest } from "next/server";
import { apiUtils } from "@/lib/api/apiUtils";

/**
 * 处理用户登出请求
 * 清除认证cookie并可选择性地通知后端
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🚪 处理用户登出请求");

    // 可选：通知后端用户登出（如果后端需要处理登出逻辑）
    // 注意：某些后端可能不需要登出接口，因为JWT是无状态的
    try {
      await apiUtils.forwardRequest(request, "/auth/logout");
    } catch {
      // 即使后端登出失败，也要清除前端cookie
      console.log("后端登出请求失败，但继续清除前端认证状态");
    }

    // 返回成功响应并删除认证cookie
    return apiUtils.createResponse(
      {
        message: "登出成功",
        code: 200,
      },
      {
        deleteCookie: "auth_token",
      }
    );
  } catch (error) {
    console.error("登出API错误:", error);

    // 即使出错也要尝试清除cookie
    return apiUtils.createResponse(
      {
        message: "登出成功",
        code: 200,
      },
      {
        deleteCookie: "auth_token",
      }
    );
  }
}
