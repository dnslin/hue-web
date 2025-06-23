// lib/types/roles.ts
// 角色和权限相关类型定义

import type {
  SuccessApiResponse,
  ErrorApiResponse,
  PaginatedApiResponse,
} from "./common";

// 重新导出用户模块中的类型，避免重复定义
export type { Permission, Role, PermissionGroup } from "./user";

/**
 * 权限创建请求 - 对应后端 dtos.PermissionCreateDTO
 */
export interface PermissionCreateRequest {
  name: string;
  description?: string;
  groupName: string;
}

/**
 * 权限更新请求 - 对应后端 dtos.PermissionUpdateDTO
 */
export interface PermissionUpdateRequest {
  description?: string;
  groupName?: string;
}

/**
 * 权限响应 - 对应后端 dtos.PermissionResponseDTO
 */
export interface PermissionResponse {
  id: number;
  name: string;
  description: string;
  groupName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 角色响应 - 对应后端 dtos.RoleResponseDTO
 */
export interface RoleResponse {
  id: number;
  name: string;
  alias?: string;
  permissions: PermissionResponse[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 分配权限请求 - 对应后端 dtos.AssignPermissionDTO
 */
export interface AssignPermissionRequest {
  permissionId: number;
}

/**
 * 分配角色请求 - 对应后端 dtos.AssignRoleDTO
 */
export interface AssignRoleRequest {
  roleId: number;
}

/**
 * 同步权限请求 - 对应后端 dtos.SyncPermissionsDTO
 */
export interface SyncPermissionsRequest {
  permissionIds: number[];
}

/**
 * 角色相关API响应类型
 */
export type RoleActionResponse =
  | SuccessApiResponse<RoleResponse>
  | ErrorApiResponse;
export type RoleListResponse = PaginatedApiResponse<RoleResponse>;
export type PermissionActionResponse =
  | SuccessApiResponse<PermissionResponse>
  | ErrorApiResponse;
export type PermissionListResponse = SuccessApiResponse<PermissionResponse[]>;
