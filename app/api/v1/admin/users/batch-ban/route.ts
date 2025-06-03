import { NextRequest } from "next/server";
import { apiUtils } from "@/lib/api/apiUtils";

/**
 * 批量封禁用户
 * POST /api/v1/admin/users/batch-ban
 */
export async function POST(request: NextRequest) {
  try {
    const data = await apiUtils.forwardRequest(
      request,
      "/admin/users/batch-ban"
    );

    if (data.error) {
      return apiUtils.createResponse(data, { status: data.code || 400 });
    }

    return apiUtils.createResponse(data);
  } catch (error) {
    console.error("批量封禁用户失败:", error);
    return apiUtils.createResponse({
      error: true,
      message: "批量封禁用户失败",
      code: 500,
    });
  }
}

