// lib/types/roles.ts
// 角色和权限相关类型定义

// 前端使用的权限类型（小写字段）
export interface Permission {
  id: number;
  name: string;
  description: string;
  groupName: string; // 权限分组名称
  createdAt: string;
  updatedAt: string;
}

// 前端使用的角色类型
export interface Role {
  id: number;
  name: string;
  alias?: string;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

// 角色创建请求类型
export interface CreateRoleRequest {
  name: string;
  alias?: string;
}

// 角色更新请求类型
export interface UpdateRoleRequest {
  name: string;
  alias?: string;
}

// 权限分组类型（前端聚合使用）
export interface PermissionGroup {
  name: string;
  description: string;
  permissions: Permission[];
}
