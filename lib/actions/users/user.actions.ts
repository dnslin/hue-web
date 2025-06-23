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
  UserActionResponse,
  BatchUserActionResponse,
  AdminUserResponse,
} from "@/lib/types/user";
import type {
  ApiResponse,
  SuccessApiResponse,
  ErrorApiResponse,
  BatchOperationResult,
} from "@/lib/types/common";

const USER_API_BASE = "/admin/users";

/**
 * 管理员获取用户列表
 */
export async function getUsersAction(
  params: UserListParams = {}
): Promise<UserListResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<UserListResponse>(USER_API_BASE, {
      params,
    });

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return apiResponse;
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "获取用户列表失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getUsersAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "获取用户列表时发生未知错误",
      error,
    };
  }
}

/**
 * 管理员创建用户
 */
export async function createAdminUserAction(
  userData: AdminUserCreateRequest
): Promise<UserActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<User>>(
      USER_API_BASE,
      userData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "用户创建成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "用户创建失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("createAdminUserAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "创建用户时发生未知错误",
      error,
    };
  }
}

/**
 * 管理员更新任意用户信息
 */
export async function updateAdminUserAction(
  id: number,
  userData: UserUpdateRequest
): Promise<UserActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<ApiResponse<User>>(
      `${USER_API_BASE}/${id}`,
      userData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "用户信息更新成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "用户信息更新失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("updateAdminUserAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "更新用户信息时发生未知错误",
      error,
    };
  }
}

/**
 * 管理员逻辑删除用户
 */
export async function deleteAdminUserAction(
  id: number
): Promise<SuccessApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.delete<ApiResponse<any>>(
      `${USER_API_BASE}/${id}`
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "用户删除成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "用户删除失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("deleteAdminUserAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "删除用户时发生未知错误",
      error,
    };
  }
}

/**
 * 批准用户
 */
export async function approveUserAction(
  id: number
): Promise<UserActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<User>>(
      `${USER_API_BASE}/${id}/approve`
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "用户批准成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "用户批准失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("approveUserAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "批准用户时发生未知错误",
      error,
    };
  }
}

/**
 * 封禁用户
 */
export async function banUserAction(id: number): Promise<UserActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<User>>(
      `${USER_API_BASE}/${id}/ban`
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "用户封禁成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "用户封禁失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("banUserAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "封禁用户时发生未知错误",
      error,
    };
  }
}

/**
 * 拒绝用户
 */
export async function rejectUserAction(
  id: number,
  reason?: string
): Promise<UserActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestData: UserApprovalRequest = reason ? { reason } : {};
    const response = await apiService.post<ApiResponse<User>>(
      `${USER_API_BASE}/${id}/reject`,
      requestData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "用户拒绝成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "用户拒绝失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("rejectUserAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "拒绝用户时发生未知错误",
      error,
    };
  }
}

/**
 * 解封用户
 */
export async function unbanUserAction(id: number): Promise<UserActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<User>>(
      `${USER_API_BASE}/${id}/unban`
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "用户解封成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "用户解封失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("unbanUserAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "解封用户时发生未知错误",
      error,
    };
  }
}

/**
 * 批量批准用户
 */
export async function batchApproveUsersAction(
  userIds: number[]
): Promise<BatchUserActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestData: BatchUserIDsRequest = { userIds };
    const response = await apiService.post<ApiResponse<BatchOperationResult>>(
      `${USER_API_BASE}/batch-approve`,
      requestData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "批量批准用户成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "批量批准用户失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("batchApproveUsersAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "批量批准用户时发生未知错误",
      error,
    };
  }
}

/**
 * 批量封禁用户
 */
export async function batchBanUsersAction(
  userIds: number[]
): Promise<BatchUserActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestData: BatchUserIDsRequest = { userIds };
    const response = await apiService.post<ApiResponse<BatchOperationResult>>(
      `${USER_API_BASE}/batch-ban`,
      requestData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "批量封禁用户成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "批量封禁用户失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("batchBanUsersAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "批量封禁用户时发生未知错误",
      error,
    };
  }
}

/**
 * 批量拒绝用户
 */
export async function batchRejectUsersAction(
  userIds: number[],
  reason?: string
): Promise<BatchUserActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestData: BatchUserRejectRequest = {
      userIds,
      ...(reason && { reason }),
    };
    const response = await apiService.post<ApiResponse<BatchOperationResult>>(
      `${USER_API_BASE}/batch-reject`,
      requestData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "批量拒绝用户成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "批量拒绝用户失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("batchRejectUsersAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "批量拒绝用户时发生未知错误",
      error,
    };
  }
}

/**
 * 批量解封用户
 */
export async function batchUnbanUsersAction(
  userIds: number[]
): Promise<BatchUserActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestData: BatchUserIDsRequest = { userIds };
    const response = await apiService.post<ApiResponse<BatchOperationResult>>(
      `${USER_API_BASE}/batch-unban`,
      requestData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "批量解封用户成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "批量解封用户失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("batchUnbanUsersAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "批量解封用户时发生未知错误",
      error,
    };
  }
}

/**
 * 获取待审核用户列表
 */
export async function getPendingUsersAction(
  page: number = 1,
  pageSize: number = 10
): Promise<UserListResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const params = { page, pageSize };
    const response = await apiService.get<UserListResponse>(
      `${USER_API_BASE}/pending`,
      { params }
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return apiResponse;
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "获取待审核用户列表失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getPendingUsersAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "获取待审核用户列表时发生未知错误",
      error,
    };
  }
}

/**
 * 获取所有符合条件的用户数据以供导出（处理分页）
 */
export async function getAllUsersForExportAction(
  params: UserListParams
): Promise<AdminUserResponse[] | ErrorApiResponse> {
  let allUsers: AdminUserResponse[] = [];
  let currentPage = 1;
  const pageSize = 100;

  try {
    const apiService = await getAuthenticatedApiService();

    while (true) {
      const currentParams: UserListParams = {
        ...params,
        page: currentPage,
        pageSize,
      };
      const response = await apiService.get<UserListResponse>(USER_API_BASE, {
        params: currentParams,
      });
      const pageData = response.data;

      if (
        pageData &&
        pageData.code === 0 &&
        pageData.data &&
        Array.isArray(pageData.data) &&
        pageData.meta
      ) {
        allUsers = allUsers.concat(pageData.data);
        if (
          pageData.data.length < pageSize ||
          pageData.meta.page * pageData.meta.pageSize >= pageData.meta.total
        ) {
          break;
        }
        currentPage++;
      } else {
        console.warn(
          "getAllUsersForExportAction: 响应结构异常或无更多数据",
          pageData
        );
        break;
      }
    }
    return allUsers;
  } catch (error: any) {
    console.error("getAllUsersForExportAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "获取导出用户数据时发生未知错误",
      error,
    };
  }
}

/**
 * 重置用户密码
 */
export async function resetPasswordUserAction(
  id: number
): Promise<{ success: boolean; newPassword?: string; error?: string }> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<
      ApiResponse<{ newPassword?: string }>
    >(`${USER_API_BASE}/${id}/reset-password`);

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        success: true,
        newPassword: apiResponse.data?.newPassword || "已通过邮件发送",
      };
    } else {
      return {
        success: false,
        error: apiResponse.message || "重置密码失败",
      };
    }
  } catch (error: any) {
    console.error("resetPasswordUserAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        success: false,
        error: "认证失败，请重新登录",
      };
    }

    return {
      success: false,
      error: error.message || "重置密码时发生未知错误",
    };
  }
}
