"use server";

import { getAuthenticatedApiService } from "@/lib/api/api-service";
import type { User } from "@/lib/types/user";
import type { UpdateMeRequest } from "@/lib/types/auth";
import type { ApiResponse } from "@/lib/types/common";

/**
 * 更新当前用户信息
 * 对应后端 PUT /me 接口
 */
export async function updateCurrentUserAction(
  updateData: UpdateMeRequest
): Promise<User | null> {
  try {
    console.log("🔄 开始更新用户信息:", updateData);

    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<ApiResponse<User>>("/me", updateData);

    const apiResponse = response.data;

    if (apiResponse.code === 0 && apiResponse.data) {
      console.log("✅ 用户信息更新成功:", apiResponse.data);
      return apiResponse.data;
    }

    // 处理业务错误
    console.error("❌ 用户信息更新失败:", apiResponse.msg);
    throw new Error(apiResponse.msg || "更新用户信息失败");
  } catch (error) {
    console.error("❌ 更新用户信息时发生错误:", error);
    throw error;
  }
}


/**
 * 更新用户邮箱
 */
export async function updateUserEmailAction(email: string): Promise<User | null> {
  return updateCurrentUserAction({ email });
}

/**
 * 更新用户密码
 */
export async function updateUserPasswordAction(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<User | null> {
  return updateCurrentUserAction({
    currentPassword,
    newPassword,
    confirmPassword,
  });
}