import { NextRequest } from "next/server";
import { apiUtils } from "@/lib/api/apiUtils";

/**
 * 处理用户登出请求
 * 清除认证cookie
 */
export async function POST() {
  return apiUtils.createResponse(
    { message: "退出成功" },
    { deleteCookie: "auth_token" }
  );
}
