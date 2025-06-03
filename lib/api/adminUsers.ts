import {
  User,
  UserListParams,
  UserListResponse,
  AdminUserCreateRequest,
  UserUpdateRequest,
  BatchUserIDsRequest,
  BatchUserRejectRequest,
  UserApprovalRequest,
  SuccessResponse,
  BatchOperationResult,
} from "@/lib/types/user";
import apiClient from "./apiClient";

// API基础路径 - 注意：apiClient已经设置了baseURL为'/api'
const ADMIN_USERS_BASE = "/v1/admin/users";

/**
 * 管理员获取用户列表（支持筛选和排序）
 * GET /api/v1/admin/users
 */
export async function getAdminUserList(
  params: UserListParams = {}
): Promise<UserListResponse> {
  try {
    const searchParams = new URLSearchParams();

    // 处理查询参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString());
      }
    });

    const response = await apiClient.get(
      `${ADMIN_USERS_BASE}?${searchParams.toString()}`
    );

    return response.data;
  } catch (error) {
    console.error("获取用户列表失败:", error);
    throw error;
  }
}

/**
 * 管理员创建用户
 * POST /api/v1/admin/users
 */
export async function createAdminUser(
  userData: AdminUserCreateRequest
): Promise<SuccessResponse<User>> {
  try {
    const response = await apiClient.post(ADMIN_USERS_BASE, userData);
    return response.data;
  } catch (error) {
    console.error("创建用户失败:", error);
    throw error;
  }
}

/**
 * 管理员更新任意用户信息
 * PUT /api/v1/admin/users/{id}
 */
export async function updateAdminUser(
  id: number,
  userData: UserUpdateRequest
): Promise<SuccessResponse<User>> {
  try {
    const response = await apiClient.put(`${ADMIN_USERS_BASE}/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error("更新用户失败:", error);
    throw error;
  }
}

/**
 * 管理员逻辑删除用户
 * DELETE /api/v1/admin/users/{id}
 */
export async function deleteAdminUser(id: number): Promise<SuccessResponse> {
  try {
    const response = await apiClient.delete(`${ADMIN_USERS_BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error("删除用户失败:", error);
    throw error;
  }
}

/**
 * 批准用户
 * POST /api/v1/admin/users/{id}/approve
 */
export async function approveUser(id: number): Promise<SuccessResponse<User>> {
  try {
    const response = await apiClient.post(`${ADMIN_USERS_BASE}/${id}/approve`);
    return response.data;
  } catch (error) {
    console.error("批准用户失败:", error);
    throw error;
  }
}

/**
 * 封禁用户
 * POST /api/v1/admin/users/{id}/ban
 */
export async function banUser(id: number): Promise<SuccessResponse<User>> {
  try {
    const response = await apiClient.post(`${ADMIN_USERS_BASE}/${id}/ban`);
    return response.data;
  } catch (error) {
    console.error("封禁用户失败:", error);
    throw error;
  }
}

/**
 * 拒绝用户
 * POST /api/v1/admin/users/{id}/reject
 */
export async function rejectUser(
  id: number,
  reason?: string
): Promise<SuccessResponse<User>> {
  try {
    const requestData: UserApprovalRequest = reason ? { reason } : {};
    const response = await apiClient.post(
      `${ADMIN_USERS_BASE}/${id}/reject`,
      requestData
    );
    return response.data;
  } catch (error) {
    console.error("拒绝用户失败:", error);
    throw error;
  }
}

/**
 * 解封用户
 * POST /api/v1/admin/users/{id}/unban
 */
export async function unbanUser(id: number): Promise<SuccessResponse<User>> {
  try {
    const response = await apiClient.post(`${ADMIN_USERS_BASE}/${id}/unban`);
    return response.data;
  } catch (error) {
    console.error("解封用户失败:", error);
    throw error;
  }
}

/**
 * 批量批准用户
 * POST /api/v1/admin/users/batch-approve
 */
export async function batchApproveUsers(
  userIds: number[]
): Promise<SuccessResponse<BatchOperationResult>> {
  try {
    const requestData: BatchUserIDsRequest = { user_ids: userIds };
    const response = await apiClient.post(
      `${ADMIN_USERS_BASE}/batch-approve`,
      requestData
    );
    return response.data;
  } catch (error) {
    console.error("批量批准用户失败:", error);
    throw error;
  }
}

/**
 * 批量封禁用户
 * POST /api/v1/admin/users/batch-ban
 */
export async function batchBanUsers(
  userIds: number[]
): Promise<SuccessResponse<BatchOperationResult>> {
  try {
    const requestData: BatchUserIDsRequest = { user_ids: userIds };
    const response = await apiClient.post(
      `${ADMIN_USERS_BASE}/batch-ban`,
      requestData
    );
    return response.data;
  } catch (error) {
    console.error("批量封禁用户失败:", error);
    throw error;
  }
}

/**
 * 批量拒绝用户
 * POST /api/v1/admin/users/batch-reject
 */
export async function batchRejectUsers(
  userIds: number[],
  reason?: string
): Promise<SuccessResponse<BatchOperationResult>> {
  try {
    const requestData: BatchUserRejectRequest = {
      user_ids: userIds,
      ...(reason && { reason }),
    };
    const response = await apiClient.post(
      `${ADMIN_USERS_BASE}/batch-reject`,
      requestData
    );
    return response.data;
  } catch (error) {
    console.error("批量拒绝用户失败:", error);
    throw error;
  }
}

/**
 * 批量解封用户
 * POST /api/v1/admin/users/batch-unban
 */
export async function batchUnbanUsers(
  userIds: number[]
): Promise<SuccessResponse<BatchOperationResult>> {
  try {
    const requestData: BatchUserIDsRequest = { user_ids: userIds };
    const response = await apiClient.post(
      `${ADMIN_USERS_BASE}/batch-unban`,
      requestData
    );
    return response.data;
  } catch (error) {
    console.error("批量解封用户失败:", error);
    throw error;
  }
}

/**
 * 获取待审核用户列表
 * GET /api/v1/admin/users/pending
 */
export async function getPendingUsers(
  page: number = 1,
  pageSize: number = 10
): Promise<UserListResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await apiClient.get(
      `${ADMIN_USERS_BASE}/pending?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("获取待审核用户列表失败:", error);
    throw error;
  }
}

/**
 * 通用状态转换函数
 * 根据当前状态和目标状态自动选择合适的API
 */
export async function changeUserStatus(
  userId: number,
  fromStatus: number,
  toStatus: number,
  reason?: string
): Promise<SuccessResponse<User>> {
  try {
    // 根据状态转换选择对应的API
    if (fromStatus === 2 && toStatus === 0) {
      // 待审核 -> 正常：批准
      return await approveUser(userId);
    } else if (fromStatus === 2 && toStatus === 4) {
      // 待审核 -> 拒绝：拒绝
      return await rejectUser(userId, reason);
    } else if (fromStatus === 0 && toStatus === 1) {
      // 正常 -> 禁用：封禁
      return await banUser(userId);
    } else if (fromStatus === 1 && toStatus === 0) {
      // 禁用 -> 正常：解封
      return await unbanUser(userId);
    } else {
      throw new Error(`不支持的状态转换: ${fromStatus} -> ${toStatus}`);
    }
  } catch (error) {
    console.error("状态转换失败:", error);
    throw error;
  }
}

/**
 * 批量状态转换函数
 */
export async function batchChangeUserStatus(
  userIds: number[],
  action: "approve" | "reject" | "ban" | "unban",
  reason?: string
): Promise<SuccessResponse<BatchOperationResult>> {
  try {
    switch (action) {
      case "approve":
        return await batchApproveUsers(userIds);
      case "reject":
        return await batchRejectUsers(userIds, reason);
      case "ban":
        return await batchBanUsers(userIds);
      case "unban":
        return await batchUnbanUsers(userIds);
      default:
        throw new Error(`不支持的批量操作: ${action}`);
    }
  } catch (error) {
    console.error("批量状态转换失败:", error);
    throw error;
  }
}

/**
 * 导出用户数据
 * 注意：这个接口在swagger中没有定义，可能需要后端添加
 */
export async function exportAdminUsers(
  params: UserListParams = {}
): Promise<Blob> {
  try {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString());
      }
    });

    const response = await apiClient.get(
      `${ADMIN_USERS_BASE}/export?${searchParams.toString()}`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  } catch (error) {
    console.error("导出用户数据失败:", error);
    throw error;
  }
}

/**
 * 获取用户统计信息
 * 注意：这个接口在swagger中没有定义，可能需要后端添加
 */
export async function getAdminUserStats(): Promise<Record<string, unknown>> {
  try {
    const response = await apiClient.get(`${ADMIN_USERS_BASE}/stats`);
    return response.data;
  } catch (error) {
    console.error("获取用户统计失败:", error);
    throw error;
  }
}

