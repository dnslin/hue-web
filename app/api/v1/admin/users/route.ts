import { NextRequest } from "next/server";
import { apiUtils } from "@/lib/api/apiUtils";

/**
 * 获取用户列表
 * GET /api/v1/admin/users
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/admin/users?${queryString}`
      : "/admin/users";

    const data = await apiUtils.forwardRequest(request, endpoint);

    if (data.error) {
      return apiUtils.createResponse(data, { status: data.code || 400 });
    }

    return apiUtils.createResponse(data);
  } catch (error) {
    console.error("获取用户列表失败:", error);
    return apiUtils.createResponse({
      error: true,
      message: "获取用户列表失败",
      code: 500,
    });
  }
}

/**
 * 创建用户
 * POST /api/v1/admin/users
 */
export async function POST(request: NextRequest) {
  try {
    const data = await apiUtils.forwardRequest(request, "/admin/users");

    if (data.error) {
      return apiUtils.createResponse(data, { status: data.code || 400 });
    }

    return apiUtils.createResponse(data, { status: 201 });
  } catch (error) {
    console.error("创建用户失败:", error);
    return apiUtils.createResponse({
      error: true,
      message: "创建用户失败",
      code: 500,
    });
  }
}

