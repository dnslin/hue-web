// lib/actions/roles/role.actions.ts
"use server";

import {
  getAuthenticatedApiService,
  AuthenticationError,
} from "@/lib/api/apiService";
import {
  Role,
  Permission,
  // PermissionGroup, // swagger中没有直接的PermissionGroup返回类型，permissions接口返回Permission[]
  CreateRoleRequest, // swagger中是 dtos.RoleCreateDTO { name: string }
  UpdateRoleRequest, // swagger中是 dtos.RoleUpdateDTO { name: string }
  ErrorResponse,
  SuccessResponse,
  PaginatedResponse, // 用于列表
} from "@/lib/types/user"; // 假设角色和权限类型在此定义或从swagger推断

// swagger中定义的角色相关基础路径
const ROLES_API_BASE = "/roles";
const PERMISSIONS_API_BASE = "/permissions";

/**
 * 获取角色列表
 * GET /api/v1/roles
 * swagger中此接口支持分页 page, page_size
 */
export async function getRolesAction(params?: {
  page?: number;
  page_size?: number;
}): Promise<PaginatedResponse<Role> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    // 假设后端 /roles GET 请求直接返回 PaginatedResponse<Role> 结构作为 AxiosResponse 的 data 部分
    const response = await apiService.get<PaginatedResponse<Role>>(
      ROLES_API_BASE,
      { params }
    );
    return response.data; // 显式返回 response.data
  } catch (error: any) {
    console.error("[Action Error] getRolesAction:", error.message, error);
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to fetch roles",
      error: error.data || error.message,
    };
  }
}

/**
 * 获取单个角色详情
 * GET /api/v1/roles/{id}
 */
export async function getRoleByIdAction(
  id: number
): Promise<SuccessResponse<Role> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    // swagger 定义 GET /roles/{id} 返回 SuccessResponse，其 data 是 Role
    const response = await apiService.get<SuccessResponse<Role>>( // response is AxiosResponse<SuccessResponse<Role>>
      `${ROLES_API_BASE}/${id}`
    );
    return response.data; // 显式返回 response.data
  } catch (error: any) {
    console.error("[Action Error] getRoleByIdAction:", error.message, error);
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to fetch role details",
      error: error.data || error.message,
    };
  }
}

/**
 * 创建新角色
 * POST /api/v1/roles
 * swagger 定义请求体是 dtos.RoleCreateDTO { name: string }
 * swagger 定义成功响应是 SuccessResponse，其 data 是 Role
 */
export async function createRoleAction(roleData: {
  name: string;
}): Promise<SuccessResponse<Role> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<SuccessResponse<Role>>( // response is AxiosResponse<SuccessResponse<Role>>
      ROLES_API_BASE,
      roleData
    );
    return response.data; // 显式返回 response.data
  } catch (error: any) {
    console.error("[Action Error] createRoleAction:", error.message, error);
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to create role",
      error: error.data || error.message,
    };
  }
}

/**
 * 更新角色信息
 * PUT /api/v1/roles/{id}
 * swagger 定义请求体是 dtos.RoleUpdateDTO { name: string }
 * swagger 定义成功响应是 SuccessResponse，其 data 是 Role
 */
export async function updateRoleAction(
  id: number,
  roleData: { name: string }
): Promise<SuccessResponse<Role> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<SuccessResponse<Role>>( // response is AxiosResponse<SuccessResponse<Role>>
      `${ROLES_API_BASE}/${id}`,
      roleData
    );
    return response.data; // 显式返回 response.data
  } catch (error: any) {
    console.error("[Action Error] updateRoleAction:", error.message, error);
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to update role",
      error: error.data || error.message,
    };
  }
}

/**
 * 删除角色
 * DELETE /api/v1/roles/{id}
 * swagger 定义成功响应是 SuccessResponse (无特定data)
 */
export async function deleteRoleAction(
  id: number
): Promise<SuccessResponse | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.delete<SuccessResponse>( // response is AxiosResponse<SuccessResponse>
      `${ROLES_API_BASE}/${id}`
    );
    return response.data; // 显式返回 response.data
  } catch (error: any) {
    console.error("[Action Error] deleteRoleAction:", error.message, error);
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to delete role",
      error: error.data || error.message,
    };
  }
}

/**
 * 获取权限列表
 * GET /api/v1/permissions
 * swagger 定义此接口支持分页 page, page_size, group_name
 * swagger 定义成功响应是 SuccessResponse，其 data 包含 Permission[] 和 meta
 */
export async function getPermissionsAction(params?: {
  page?: number;
  page_size?: number;
  group_name?: string;
}): Promise<PaginatedResponse<Permission> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    // 假设后端 /permissions GET 的 data 字段直接是 Permission[]，并且 meta 在 SuccessResponse 的顶层
    // 或者更规范的是返回 PaginatedResponse<Permission>
    const response = await apiService.get<PaginatedResponse<Permission>>( // response is AxiosResponse<PaginatedResponse<Permission>>
      PERMISSIONS_API_BASE,
      { params }
    );
    return response.data; // 显式返回 response.data
  } catch (error: any) {
    console.error("[Action Error] getPermissionsAction:", error.message, error);
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "Failed to fetch permissions",
      error: error.data || error.message,
    };
  }
}

/**
 * 同步角色的权限列表 (覆盖)
 * PUT /api/v1/roles/{id}/permissions
 * swagger 定义请求体是 dtos.SyncPermissionsDTO { permission_ids: number[] }
 * swagger 定义成功响应是 SuccessResponse，其 data 是 Role (更新后的角色)
 */
export async function syncRolePermissionsAction(
  id: number,
  permissionIds: number[]
): Promise<SuccessResponse<Role> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestBody = { permission_ids: permissionIds };
    const response = await apiService.put<SuccessResponse<Role>>( // response is AxiosResponse<SuccessResponse<Role>>
      `${ROLES_API_BASE}/${id}/permissions`,
      requestBody
    );
    return response.data; // 显式返回 response.data
  } catch (error: any) {
    console.error(
      "[Action Error] syncRolePermissionsAction:",
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
      message: error.message || "Failed to sync role permissions",
      error: error.data || error.message,
    };
  }
}

/**
 * 为角色添加单个权限 (注意：swagger中没有直接的"添加单个"，而是用PUT进行同步)
 * POST /api/v1/roles/{role_id}/permissions (swagger 定义)
 * 请求体：dtos.AssignPermissionDTO { permission_id: number }
 * 响应：SuccessResponse (data: Role)
 * 此函数模拟添加单个权限，但实际后端可能是同步。如果需要严格的"添加而不影响其他"，后端API可能需要调整。
 * 这里我们遵循 swagger 的 AssignPermissionDTO，它只接受一个 permission_id。
 */
export async function assignPermissionToRoleAction(
  roleId: number,
  permissionId: number
): Promise<SuccessResponse<Role> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    // swagger 定义的路径是 /roles/{role_id}/permissions，方法是 POST，请求体是 dtos.AssignPermissionDTO
    // 注意：这与 PUT /roles/{id}/permissions (syncRolePermissionsAction) 不同
    const requestBody = { permission_id: permissionId };
    const response = await apiService.post<SuccessResponse<Role>>( // response is AxiosResponse<SuccessResponse<Role>>
      `${ROLES_API_BASE}/${roleId}/permissions`,
      requestBody
    );
    return response.data; // 显式返回 response.data
  } catch (error: any) {
    console.error(
      "[Action Error] assignPermissionToRoleAction:",
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
      message: error.message || "Failed to assign permission to role",
      error: error.data || error.message,
    };
  }
}

/**
 * 从角色移除单个权限
 * DELETE /api/v1/roles/{id}/permissions/{permission_id} (swagger 定义)
 * 响应：SuccessResponse (无特定data)
 */
export async function removePermissionFromRoleAction(
  roleId: number,
  permissionId: number
): Promise<SuccessResponse | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.delete<SuccessResponse>( // response is AxiosResponse<SuccessResponse>
      `${ROLES_API_BASE}/${roleId}/permissions/${permissionId}`
    );
    return response.data; // 显式返回 response.data
  } catch (error: any) {
    console.error(
      "[Action Error] removePermissionFromRoleAction:",
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
      message: error.message || "Failed to remove permission from role",
      error: error.data || error.message,
    };
  }
}

// 注意：lib/api/roles.ts 中的 getPermissionGroups, checkRolePermission, duplicateRole
// 在 swagger.yaml 中没有直接对应的端点，或其逻辑已通过其他方式覆盖。
// - getPermissionGroups: 可以通过 getPermissionsAction 带 group_name 参数实现类似功能，或者前端自行分组。
// - checkRolePermission: 客户端可以通过获取角色权限列表后自行检查。
// - duplicateRole: swagger 中没有此功能。

// 角色基本信息接口
export interface RoleBasic {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}
