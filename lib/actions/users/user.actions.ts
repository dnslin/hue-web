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
  BackendUserResponse,
  convertBackendUserToUser,
} from "@/lib/types/user";

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

    // 调用后端API获取原始数据
    const axiosResponse = await apiService.get(USER_API_BASE, {
      params,
    });

    // 移除详细的响应日志以提升性能

    const backendResponse = axiosResponse.data;

    // 移除详细的结构调试日志

    // 检查响应是否为错误
    if (axiosResponse.status >= 400) {
      throw new Error(
        `HTTP ${axiosResponse.status}: ${backendResponse.message || "请求失败"}`
      );
    }

    // 更灵活的响应结构检查
    let userData: BackendUserResponse[] = [];
    let metaData: any = {};

    if (backendResponse && typeof backendResponse === "object") {
      if (Array.isArray(backendResponse.data)) {
        // 标准 PaginatedResponse 格式：{ data: [...], meta: {...}, code: 200, message: "..." }
        userData = backendResponse.data;
        metaData = backendResponse.meta || {
          page: params.page || 1,
          page_size: params.pageSize || 10,
          total: backendResponse.data.length,
        };
      } else if (Array.isArray(backendResponse)) {
        // 直接数组格式：[...]（向后兼容）
        userData = backendResponse;
        metaData = {
          page: params.page || 1,
          page_size: params.pageSize || 10,
          total: backendResponse.length,
        };
      } else if (
        backendResponse.users &&
        Array.isArray(backendResponse.users)
      ) {
        // 替代格式：{ users: [...], pagination: {...} }
        userData = backendResponse.users;
        metaData = backendResponse.pagination || backendResponse.meta || {};
      } else {
        // 移除无法识别响应格式的调试日志
        throw new Error(
          `API响应格式不正确。期望包含用户数组，但收到未知格式的响应。`
        );
      }
    } else {
      throw new Error("API响应为空或格式无效");
    }

    // 验证用户数据
    if (!Array.isArray(userData)) {
      throw new Error("API返回的用户数据不是数组格式");
    }

    // 转换后端用户数据为前端用户数据
    const convertedUsers: User[] = userData.map(
      (backendUser: BackendUserResponse, index: number) => {
        try {
          return convertBackendUserToUser(backendUser);
        } catch (conversionError: any) {
          console.error(
            `转换用户数据失败 (索引 ${index}):`,
            conversionError.message
          );
          throw new Error(`转换用户数据失败: ${conversionError.message}`);
        }
      }
    );

    const responseData: UserListResponse = {
      code: backendResponse.code || axiosResponse.status || 200,
      message: backendResponse.message || "获取用户列表成功",
      data: convertedUsers,
      meta: metaData,
    };

    // 移除转换成功的调试日志

    return responseData;
  } catch (error: any) {
    console.error("getUsersAction - 错误详情:", {
      message: error.message,
      status: error.response?.status,
    });

    const errorResponse: ErrorResponse = {
      code: error.response?.status || error.code || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        "获取用户列表时发生未知错误",
      error: error.name || "UnknownError",
    };
    return errorResponse;
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

/**
 * 重置用户密码（使用更新用户API实现）
 * PUT /api/v1/admin/users/{id}
 */
export async function resetPasswordUserAction(
  id: number
): Promise<{ success: boolean; newPassword?: string; error?: string }> {
  try {
    // 生成临时密码
    const newPassword = generateTemporaryPassword();

    const updateResult = await updateAdminUserAction(id, {
      password: newPassword,
    });

    if ("code" in updateResult && updateResult.code === 200) {
      return {
        success: true,
        newPassword: newPassword,
      };
    } else {
      return {
        success: false,
        error: (updateResult as ErrorResponse).message || "重置密码失败",
      };
    }
  } catch (error: any) {
    console.error(
      "[Action Error] resetPasswordUserAction:",
      error.message,
      error
    );
    return {
      success: false,
      error: error.message || "重置密码时发生未知错误",
    };
  }
}

/**
 * 生成临时密码
 */
function generateTemporaryPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const length = 12;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
