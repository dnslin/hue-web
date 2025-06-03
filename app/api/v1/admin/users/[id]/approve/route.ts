import { NextRequest } from "next/server";
import { apiUtils } from "@/lib/api/apiUtils";

/**
 * 批准用户
 * POST /api/v1/admin/users/[id]/approve
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await apiUtils.forwardRequest(
      request,
      `/admin/users/${id}/approve`
    );

    if (data.error) {
      return apiUtils.createResponse(data, { status: data.code || 400 });
    }

    return apiUtils.createResponse(data);
  } catch (error) {
    console.error("批准用户失败:", error);
    return apiUtils.createResponse({
      error: true,
      message: "批准用户失败",
      code: 500,
    });
  }
}

