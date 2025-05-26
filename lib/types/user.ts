// 用户状态枚举
export enum UserStatus {
  ACTIVE = 1,
  INACTIVE = 0,
  BANNED = -1,
}

// 用户角色枚举
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator",
}

// 基础用户信息接口
export interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  status: UserStatus;
  role: UserRole;
  created_at: string;
  updated_at: string;
  last_login?: string;
  storage_used?: number;
  storage_limit?: number;
  upload_count?: number;
}

// 用户创建请求接口
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  role?: UserRole;
  status?: UserStatus;
}

// 用户更新请求接口
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  nickname?: string;
  role?: UserRole;
  status?: UserStatus;
  storage_limit?: number;
}

// 用户列表查询参数
export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: UserStatus;
  role?: UserRole;
  sort_by?: "created_at" | "updated_at" | "last_login" | "upload_count";
  sort_order?: "asc" | "desc";
}

// 用户列表响应接口
export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// 角色权限接口
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

// 角色接口
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  user_count: number;
  created_at: string;
  updated_at: string;
}

// 角色创建请求接口
export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

// 角色更新请求接口
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

// 权限分组接口
export interface PermissionGroup {
  name: string;
  description: string;
  permissions: Permission[];
}

// 用户统计信息接口
export interface UserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  banned_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
}
