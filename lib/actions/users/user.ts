// lib/actions/users/user.actions.ts
"use server";

import {
  getAuthenticatedApiService,
  AuthenticationError,
} from "@/lib/api/api-service";
import {
  User,
  UserListParams,
  UserListResponse,
  AdminUserCreateRequest,
  UserUpdateRequest,
  BatchUserIDsRequest,
  BatchUserRejectRequest,
  UserApprovalRequest,
  BatchUserActionResponse,
  AdminUserResponse,
} from "@/lib/types/user";
import type {
  ApiResponse,
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
    return response.data;
  } catch (error: any) {
    console.error("getUsersAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 管理员创建用户
 */
export async function createAdminUserAction(
  userData: AdminUserCreateRequest
): Promise<ApiResponse<User>> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<User>>(
      USER_API_BASE,
      userData
    );
    return response.data;
  } catch (error: any) {
    console.error("createAdminUserAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 管理员更新任意用户信息
 */
export async function updateAdminUserAction(
  id: number,
  userData: UserUpdateRequest
): Promise<ApiResponse<User>> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<ApiResponse<User>>(
      `${USER_API_BASE}/${id}`,
      userData
    );
    return response.data;
  } catch (error: any) {
    console.error("updateAdminUserAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 管理员逻辑删除用户
 */
export async function deleteAdminUserAction(
  id: number
): Promise<ApiResponse<any>> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.delete<ApiResponse<any>>(
      `${USER_API_BASE}/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("deleteAdminUserAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 批准用户
 */
export async function approveUserAction(
  id: number
): Promise<ApiResponse<User>> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<User>>(
      `${USER_API_BASE}/${id}/approve`
    );
    return response.data;
  } catch (error: any) {
    console.error("approveUserAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 封禁用户
 */
export async function banUserAction(id: number): Promise<ApiResponse<User>> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<User>>(
      `${USER_API_BASE}/${id}/ban`
    );
    return response.data;
  } catch (error: any) {
    console.error("banUserAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 拒绝用户
 */
export async function rejectUserAction(
  id: number,
  reason?: string
): Promise<ApiResponse<User>> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestData: UserApprovalRequest = reason ? { reason } : {};
    const response = await apiService.post<ApiResponse<User>>(
      `${USER_API_BASE}/${id}/reject`,
      requestData
    );
    return response.data;
  } catch (error: any) {
    console.error("rejectUserAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 解封用户
 */
export async function unbanUserAction(id: number): Promise<ApiResponse<User>> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<User>>(
      `${USER_API_BASE}/${id}/unban`
    );
    return response.data;
  } catch (error: any) {
    console.error("unbanUserAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 批量批准用户
 */
export async function batchApproveUsersAction(
  userIds: number[]
): Promise<ApiResponse<BatchOperationResult>> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestData: BatchUserIDsRequest = { userIds };
    const response = await apiService.post<ApiResponse<BatchOperationResult>>(
      `${USER_API_BASE}/batch-approve`,
      requestData
    );
    return response.data;
  } catch (error: any) {
    console.error("batchApproveUsersAction 错误:", error.msg);
    return error as ErrorApiResponse;
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
        msg: apiResponse.msg || "批量封禁用户成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "批量封禁用户失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("batchBanUsersAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "批量封禁用户时发生未知错误",
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
        msg: apiResponse.msg || "批量拒绝用户成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "批量拒绝用户失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("batchRejectUsersAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "批量拒绝用户时发生未知错误",
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
        msg: apiResponse.msg || "批量解封用户成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "批量解封用户失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("batchUnbanUsersAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "批量解封用户时发生未知错误",
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
      msg: apiResponse.msg || "获取待审核用户列表失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getPendingUsersAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取待审核用户列表时发生未知错误",
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
    console.error("getAllUsersForExportAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取导出用户数据时发生未知错误",
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
        error: apiResponse.msg || "重置密码失败",
      };
    }
  } catch (error: any) {
    console.error("resetPasswordUserAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        success: false,
        error: "认证失败，请重新登录",
      };
    }

    return {
      success: false,
      error: error.msg || "重置密码时发生未知错误",
    };
  }
}

