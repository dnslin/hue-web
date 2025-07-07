// lib/actions/roles/role.actions.ts
"use server";

import {
  getAuthenticatedApiService,
  AuthenticationError,
} from "@/lib/api/api-service";
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
import { cacheManager, CACHE_KEYS } from "@/lib/utils/cache-manager";

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
      msg: apiResponse.msg || "获取角色列表失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getRolesAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取角色列表失败",
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
        msg: apiResponse.msg || "获取角色详情成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "获取角色详情失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getRoleByIdAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取角色详情失败",
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
        msg: apiResponse.msg || "角色创建成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "角色创建失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("createRoleAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "角色创建失败",
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
        msg: apiResponse.msg || "角色更新成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "角色更新失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("updateRoleAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "角色更新失败",
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
        msg: apiResponse.msg || "角色删除成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "角色删除失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("deleteRoleAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "角色删除失败",
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
      msg: apiResponse.msg || "获取权限列表失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getPermissionsAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取权限列表失败",
      error,
    };
  }
}

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
        msg: apiResponse.msg || "角色权限同步成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "角色权限同步失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("syncRolePermissionsAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "角色权限同步失败",
      error,
    };
  }
}

/**
 * 为角色分配权限
 */
export async function assignPermissionToRoleAction(
  roleId: number,
  permissionId: number
): Promise<SuccessApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<any>>(
      `/roles/${roleId}/permissions`,
      { permission_id: permissionId }
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      // 清除相关缓存
      cacheManager.delete(CACHE_KEYS.ROLE_DETAIL(roleId));
      cacheManager.delete(CACHE_KEYS.ROLES_LIST);

      return {
        code: 0,
        msg: apiResponse.msg || "权限分配成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "权限分配失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("assignPermissionToRoleAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "分配权限失败",
      error,
    };
  }
}

/**
 * 从角色移除权限
 */
export async function removePermissionFromRoleAction(
  roleId: number,
  permissionId: number
): Promise<SuccessApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.delete<ApiResponse<any>>(
      `/roles/${roleId}/permissions/${permissionId}`
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      // 清除相关缓存
      cacheManager.delete(CACHE_KEYS.ROLE_DETAIL(roleId));
      cacheManager.delete(CACHE_KEYS.ROLES_LIST);

      return {
        code: 0,
        msg: apiResponse.msg || "权限移除成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "权限移除失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("removePermissionFromRoleAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "移除权限失败",
      error,
    };
  }
}

