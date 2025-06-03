// lib/actions/users/user.actions.ts
"use server";

import {
  getAuthenticatedApiService,
  AuthenticationError,
} from "@/lib/api/apiService";
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
  ErrorResponse,
} from "@/lib/types/user";
// import { redirect } from "next/navigation"; // Not currently used

const USER_API_BASE = "/admin/users";

/**
 * 管理员获取用户列表
 * GET /api/v1/admin/users
 */
export async function getUsersAction(
  params: UserListParams = {}
): Promise<UserListResponse | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    // Explicitly access .data if the interceptor's type change isn't picked up
    const response = await apiService.get<UserListResponse>(USER_API_BASE, {
      params,
    });
    return response.data; // Assuming interceptor correctly returns data as T
  } catch (error: any) {
    console.error("[Action Error] getUsersAction:", error.message, error);
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to fetch users",
      error:
        error.data?.message ||
        error.data ||
        error.message ||
        "Unknown error details",
    };
  }
}

/**
 * 管理员创建用户
 * POST /api/v1/admin/users
 */
export async function createAdminUserAction(
  userData: AdminUserCreateRequest
): Promise<SuccessResponse<User> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<SuccessResponse<User>>(
      USER_API_BASE,
      userData
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "[Action Error] createAdminUserAction:",
      error.message,
      error
    );
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to create user",
      error: error.data?.message || error.data || error.message,
    };
  }
}

/**
 * 管理员更新任意用户信息
 * PUT /api/v1/admin/users/{id}
 */
export async function updateAdminUserAction(
  id: number,
  userData: UserUpdateRequest
): Promise<SuccessResponse<User> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<SuccessResponse<User>>(
      `${USER_API_BASE}/${id}`,
      userData
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "[Action Error] updateAdminUserAction:",
      error.message,
      error
    );
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to update user",
      error: error.data?.message || error.data || error.message,
    };
  }
}

/**
 * 管理员逻辑删除用户
 * DELETE /api/v1/admin/users/{id}
 */
export async function deleteAdminUserAction(
  id: number
): Promise<SuccessResponse | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.delete<SuccessResponse>(
      `${USER_API_BASE}/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "[Action Error] deleteAdminUserAction:",
      error.message,
      error
    );
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to delete user",
      error: error.data?.message || error.data || error.message,
    };
  }
}

/**
 * 批准用户
 * POST /api/v1/admin/users/{id}/approve
 */
export async function approveUserAction(
  id: number
): Promise<SuccessResponse<User> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<SuccessResponse<User>>(
      `${USER_API_BASE}/${id}/approve`
    );
    return response.data;
  } catch (error: any) {
    console.error("[Action Error] approveUserAction:", error.message, error);
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to approve user",
      error: error.data?.message || error.data || error.message,
    };
  }
}

/**
 * 封禁用户
 * POST /api/v1/admin/users/{id}/ban
 */
export async function banUserAction(
  id: number
): Promise<SuccessResponse<User> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<SuccessResponse<User>>(
      `${USER_API_BASE}/${id}/ban`
    );
    return response.data;
  } catch (error: any) {
    console.error("[Action Error] banUserAction:", error.message, error);
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to ban user",
      error: error.data?.message || error.data || error.message,
    };
  }
}

/**
 * 拒绝用户
 * POST /api/v1/admin/users/{id}/reject
 */
export async function rejectUserAction(
  id: number,
  reason?: string
): Promise<SuccessResponse<User> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestData: UserApprovalRequest = reason ? { reason } : {};
    const response = await apiService.post<SuccessResponse<User>>(
      `${USER_API_BASE}/${id}/reject`,
      requestData
    );
    return response.data;
  } catch (error: any) {
    console.error("[Action Error] rejectUserAction:", error.message, error);
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to reject user",
      error: error.data?.message || error.data || error.message,
    };
  }
}

/**
 * 解封用户
 * POST /api/v1/admin/users/{id}/unban
 */
export async function unbanUserAction(
  id: number
): Promise<SuccessResponse<User> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<SuccessResponse<User>>(
      `${USER_API_BASE}/${id}/unban`
    );
    return response.data;
  } catch (error: any) {
    console.error("[Action Error] unbanUserAction:", error.message, error);
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to unban user",
      error: error.data?.message || error.data || error.message,
    };
  }
}

/**
 * 批量批准用户
 * POST /api/v1/admin/users/batch-approve
 */
export async function batchApproveUsersAction(
  userIds: number[]
): Promise<SuccessResponse<BatchOperationResult> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestData: BatchUserIDsRequest = { user_ids: userIds };
    const response = await apiService.post<
      SuccessResponse<BatchOperationResult>
    >(`${USER_API_BASE}/batch-approve`, requestData);
    return response.data;
  } catch (error: any) {
    console.error(
      "[Action Error] batchApproveUsersAction:",
      error.message,
      error
    );
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to batch approve users",
      error: error.data?.message || error.data || error.message,
    };
  }
}

/**
 * 批量封禁用户
 * POST /api/v1/admin/users/batch-ban
 */
export async function batchBanUsersAction(
  userIds: number[]
): Promise<SuccessResponse<BatchOperationResult> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestData: BatchUserIDsRequest = { user_ids: userIds };
    const response = await apiService.post<
      SuccessResponse<BatchOperationResult>
    >(`${USER_API_BASE}/batch-ban`, requestData);
    return response.data;
  } catch (error: any) {
    console.error("[Action Error] batchBanUsersAction:", error.message, error);
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to batch ban users",
      error: error.data?.message || error.data || error.message,
    };
  }
}

/**
 * 批量拒绝用户
 * POST /api/v1/admin/users/batch-reject
 */
export async function batchRejectUsersAction(
  userIds: number[],
  reason?: string
): Promise<SuccessResponse<BatchOperationResult> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestData: BatchUserRejectRequest = {
      user_ids: userIds,
      ...(reason && { reason }),
    };
    const response = await apiService.post<
      SuccessResponse<BatchOperationResult>
    >(`${USER_API_BASE}/batch-reject`, requestData);
    return response.data;
  } catch (error: any) {
    console.error(
      "[Action Error] batchRejectUsersAction:",
      error.message,
      error
    );
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to batch reject users",
      error: error.data?.message || error.data || error.message,
    };
  }
}

/**
 * 批量解封用户
 * POST /api/v1/admin/users/batch-unban
 */
export async function batchUnbanUsersAction(
  userIds: number[]
): Promise<SuccessResponse<BatchOperationResult> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestData: BatchUserIDsRequest = { user_ids: userIds };
    const response = await apiService.post<
      SuccessResponse<BatchOperationResult>
    >(`${USER_API_BASE}/batch-unban`, requestData);
    return response.data;
  } catch (error: any) {
    console.error(
      "[Action Error] batchUnbanUsersAction:",
      error.message,
      error
    );
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to batch unban users",
      error: error.data?.message || error.data || error.message,
    };
  }
}

/**
 * 获取待审核用户列表
 * GET /api/v1/admin/users/pending
 */
export async function getPendingUsersAction(
  page: number = 1,
  pageSize: number = 10
): Promise<UserListResponse | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const params = { page, pageSize };
    const response = await apiService.get<UserListResponse>(
      `${USER_API_BASE}/pending`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "[Action Error] getPendingUsersAction:",
      error.message,
      error
    );
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to fetch pending users",
      error: error.data?.message || error.data || error.message,
    };
  }
}

/**
 * 获取所有符合条件的用户数据以供导出（处理分页）
 */
export async function getAllUsersForExportAction(
  params: UserListParams
): Promise<User[] | ErrorResponse> {
  let allUsers: User[] = [];
  let currentPage = 1;
  const pageSize = 100;

  try {
    const apiService = await getAuthenticatedApiService();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const currentParams: UserListParams = {
        ...params,
        page: currentPage,
        pageSize,
      };
      const response = await apiService.get<UserListResponse>(USER_API_BASE, {
        // Store the full response
        params: currentParams,
      });
      const pageData = response.data; // Explicitly access .data

      if (
        pageData &&
        pageData.data &&
        Array.isArray(pageData.data) &&
        pageData.meta
      ) {
        allUsers = allUsers.concat(pageData.data);
        if (
          pageData.data.length < pageSize ||
          pageData.meta.page * pageData.meta.page_size >= pageData.meta.total
        ) {
          break;
        }
        currentPage++;
      } else {
        console.warn(
          "getAllUsersForExportAction: Unexpected response structure or no more data.",
          pageData
        );
        break;
      }
    }
    return allUsers;
  } catch (error: any) {
    console.error(
      "[Action Error] getAllUsersForExportAction:",
      error.message,
      error
    );
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to fetch all users for export",
      error:
        error.data?.message ||
        error.data ||
        error.message ||
        "Unknown error details",
    };
  }
}
