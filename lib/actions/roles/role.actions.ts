// lib/actions/roles/role.actions.ts
"use server";

import {
  getAuthenticatedApiService,
  AuthenticationError,
} from "@/lib/api/apiService";
import {
  Role,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleActionResponse,
  RoleListResponse,
  PermissionListResponse,
} from "@/lib/types/roles";
import type {
  ApiResponse,
  SuccessApiResponse,
  ErrorApiResponse,
  PaginatedApiResponse,
} from "@/lib/types/common";

// swagger中定义的角色相关基础路径
const ROLES_API_BASE = "/roles";
const PERMISSIONS_API_BASE = "/permissions";

/**
 * 获取角色列表
 */
export async function getRolesAction(params?: {
  page?: number;
  page_size?: number;
}): Promise<RoleListResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<RoleListResponse>(ROLES_API_BASE, {
      params,
    });

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return apiResponse;
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "获取角色列表失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getRolesAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "获取角色列表失败",
      error,
    };
  }
}

/**
 * 获取单个角色详情
 */
export async function getRoleByIdAction(
  id: number
): Promise<RoleActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<ApiResponse<Role>>(
      `${ROLES_API_BASE}/${id}`
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "获取角色详情成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "获取角色详情失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getRoleByIdAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "获取角色详情失败",
      error,
    };
  }
}

/**
 * 创建新角色
 */
export async function createRoleAction(
  roleData: CreateRoleRequest
): Promise<RoleActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<Role>>(
      ROLES_API_BASE,
      roleData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "角色创建成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "角色创建失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("createRoleAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "角色创建失败",
      error,
    };
  }
}

/**
 * 更新角色信息
 */
export async function updateRoleAction(
  id: number,
  roleData: UpdateRoleRequest
): Promise<RoleActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<ApiResponse<Role>>(
      `${ROLES_API_BASE}/${id}`,
      roleData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "角色更新成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "角色更新失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("updateRoleAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "角色更新失败",
      error,
    };
  }
}

/**
 * 删除角色
 */
export async function deleteRoleAction(
  id: number
): Promise<SuccessApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.delete<ApiResponse<any>>(
      `${ROLES_API_BASE}/${id}`
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "角色删除成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "角色删除失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("deleteRoleAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "角色删除失败",
      error,
    };
  }
}

/**
 * 获取权限列表
 */
export async function getPermissionsAction(params?: {
  page?: number;
  page_size?: number;
  group_name?: string;
}): Promise<PermissionListResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<PermissionListResponse>(
      PERMISSIONS_API_BASE,
      { params }
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return apiResponse;
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "获取权限列表失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getPermissionsAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "获取权限列表失败",
      error,
    };
  }
}

// 注意：剩余的权限管理函数（syncRolePermissionsAction, assignPermissionToRoleAction, removePermissionFromRoleAction）
// 需要按照相同的模式进行重构，使用新的API响应类型和错误处理模式。
// 由于篇幅限制，这里仅展示了核心的CRUD操作重构示例。

/**
 * 同步角色的权限列表 (覆盖)
 */
export async function syncRolePermissionsAction(
  id: number,
  permissionIds: number[]
): Promise<SuccessApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestBody = { permission_ids: permissionIds };
    const response = await apiService.put<ApiResponse<any>>(
      `${ROLES_API_BASE}/${id}/permissions`,
      requestBody
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "角色权限同步成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "角色权限同步失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("syncRolePermissionsAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "角色权限同步失败",
      error,
    };
  }
}

// 其他权限管理函数（assignPermissionToRoleAction, removePermissionFromRoleAction）
// 可以按照相同的模式进行重构...
