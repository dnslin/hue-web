// lib/types/roles.ts
// 角色和权限相关类型定义

// 前端使用的权限类型（小写字段）
export interface Permission {
  id: number;
  name: string;
  description: string;
  groupName: string; // 权限分组名称
  created_at: string;
  updated_at: string;
}

// 前端使用的角色类型（小写字段）
export interface Role {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
}

// 后端返回的权限响应结构（大写字段）
export interface BackendPermissionResponse {
  ID: number;
  Name: string;
  Description: string;
  GroupName: string;
  CreatedAt: string;
  UpdatedAt: string;
}

// 后端返回的角色响应结构（大写字段）
export interface BackendRoleResponse {
  ID: number;
  Name: string;
  CreatedAt: string;
  UpdatedAt: string;
  Permissions: BackendPermissionResponse[];
}

// 角色创建请求类型
export interface CreateRoleRequest {
  name: string;
}

// 角色更新请求类型
export interface UpdateRoleRequest {
  name: string;
}

// 权限分组类型（前端聚合使用）
export interface PermissionGroup {
  name: string;
  description: string;
  permissions: Permission[];
}

// 转换函数：将后端权限响应转换为前端权限类型
export function convertBackendPermissionToPermission(
  backendPermission: BackendPermissionResponse
): Permission {
  return {
    id: backendPermission.ID,
    name: backendPermission.Name,
    description: backendPermission.Description,
    groupName: backendPermission.GroupName,
    created_at: backendPermission.CreatedAt,
    updated_at: backendPermission.UpdatedAt,
  };
}

// 转换函数：将后端角色响应转换为前端角色类型
export function convertBackendRoleToRole(
  backendRole: BackendRoleResponse
): Role {
  return {
    id: backendRole.ID,
    name: backendRole.Name,
    created_at: backendRole.CreatedAt,
    updated_at: backendRole.UpdatedAt,
    permissions:
      backendRole.Permissions?.map(convertBackendPermissionToPermission) || [],
  };
}

// 转换函数：将后端角色数组转换为前端角色数组
export function convertBackendRolesToRoles(
  backendRoles: BackendRoleResponse[]
): Role[] {
  return backendRoles.map(convertBackendRoleToRole);
}
