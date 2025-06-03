import { NextRequest } from "next/server";
import { apiUtils } from "@/lib/api/apiUtils";

/**
 * 更新用户信息
 * PUT /api/v1/admin/users/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await apiUtils.forwardRequest(request, `/admin/users/${id}`);

    if (data.error) {
      return apiUtils.createResponse(data, { status: data.code || 400 });
    }

    return apiUtils.createResponse(data);
  } catch (error) {
    console.error("更新用户失败:", error);
    return apiUtils.createResponse({
      error: true,
      message: "更新用户失败",
      code: 500,
    });
  }
}

/**
 * 删除用户
 * DELETE /api/v1/admin/users/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await apiUtils.forwardRequest(request, `/admin/users/${id}`);

    if (data.error) {
      return apiUtils.createResponse(data, { status: data.code || 400 });
    }

    return apiUtils.createResponse(data);
  } catch (error) {
    console.error("删除用户失败:", error);
    return apiUtils.createResponse({
      error: true,
      message: "删除用户失败",
      code: 500,
    });
  }
}

