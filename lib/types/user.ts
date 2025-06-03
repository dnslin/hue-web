// 用户状态枚举 - 对齐后端定义
export enum UserStatus {
  NORMAL = 0, // 正常
  DISABLED = 1, // 禁用
  PENDING = 2, // 待审核
  DELETED = 3, // 已删除
  REJECTED = 4, // 审核拒绝
}

// 用户角色枚举 - 保持字符串类型但添加ID映射
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator",
}

// 角色ID映射 - 用于与后端role_id字段对应
export const ROLE_ID_MAP: Record<UserRole, number> = {
  [UserRole.ADMIN]: 1,
  [UserRole.USER]: 2,
  [UserRole.MODERATOR]: 3,
};

// 反向映射 - 从role_id获取角色名称
export const ID_ROLE_MAP: Record<number, UserRole> = {
  1: UserRole.ADMIN,
  2: UserRole.USER,
  3: UserRole.MODERATOR,
};

// 状态标签映射
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.NORMAL]: "正常",
  [UserStatus.DISABLED]: "禁用",
  [UserStatus.PENDING]: "待审核",
  [UserStatus.DELETED]: "已删除",
  [UserStatus.REJECTED]: "审核拒绝",
};

// 基础用户信息接口 - 对齐后端models.User
export interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  status: UserStatus;
  role: UserRole;
  roleID: number;
  originalRoleID?: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
  storage_used?: number;
  storage_limit?: number;
  upload_count?: number;
  passwordHash?: string; // 仅在特定场景下返回
}

// 管理员创建用户请求 - 对齐dtos.AdminUserCreateRequest
export interface AdminUserCreateRequest {
  username: string;
  email: string;
  password: string;
  role_id: number;
}

// 用户更新请求 - 对齐models.UserUpdateRequest
export interface UserUpdateRequest {
  username?: string;
  email?: string;
  password?: string;
  role_id?: number;
  status?: number;
}

// 批量用户ID请求 - 对齐dtos.BatchUserIDsRequest
export interface BatchUserIDsRequest {
  user_ids: number[];
}

// 批量用户拒绝请求 - 对齐dtos.BatchUserRejectRequest
export interface BatchUserRejectRequest {
  user_ids: number[];
  reason?: string;
}

// 用户审批请求 - 对齐dtos.UserApprovalRequest
export interface UserApprovalRequest {
  reason?: string;
}

// 用户列表查询参数 - 对齐后端接口参数
export interface UserListParams {
  page?: number;
  pageSize?: number;
  username?: string;
  email?: string;
  role_id?: number;
  status?: number;
  created_at_start?: string;
  created_at_end?: string;
  sort_by?:
    | "id"
    | "username"
    | "email"
    | "role_id"
    | "status"
    | "created_at"
    | "updated_at"
    | "last_login"
    | "upload_count";
  order?: "asc" | "desc";
  // 前端扩展字段
  search?: string; // 搜索关键词
  role?: UserRole; // 角色筛选
  sort_order?: "asc" | "desc"; // 排序方向别名
}

// 分页元数据 - 对齐dtos.PaginationMeta
export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
}

// 分页响应 - 对齐utils.PaginatedResponse
export interface PaginatedResponse<T> {
  code: number;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

// 用户列表响应
export type UserListResponse = PaginatedResponse<User>;

// 成功响应 - 对齐utils.SuccessResponse
export interface SuccessResponse<T = unknown> {
  code: number;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

// 错误响应 - 对齐utils.ErrorResponse
export interface ErrorResponse {
  code: number;
  message: string;
  error?: string;
}

// 批量操作结果
export interface BatchOperationResult {
  success_count: number;
  failed_count: number;
  failed_items?: Array<{
    id: number;
    error: string;
  }>;
}

// 角色权限接口
export interface Permission {
  id: number;
  name: string;
  description: string;
  group_name: string;
  created_at: string;
  updated_at: string;
}

// 角色接口 - 对齐models.Role
export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
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
  pending_users: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
}

// 工具函数类型
export type UserStatusTransition = {
  from: UserStatus;
  to: UserStatus;
  action: string;
  endpoint: string;
};

// 状态转换映射
export const USER_STATUS_TRANSITIONS: UserStatusTransition[] = [
  {
    from: UserStatus.PENDING,
    to: UserStatus.NORMAL,
    action: "approve",
    endpoint: "approve",
  },
  {
    from: UserStatus.PENDING,
    to: UserStatus.REJECTED,
    action: "reject",
    endpoint: "reject",
  },
  {
    from: UserStatus.NORMAL,
    to: UserStatus.DISABLED,
    action: "ban",
    endpoint: "ban",
  },
  {
    from: UserStatus.DISABLED,
    to: UserStatus.NORMAL,
    action: "unban",
    endpoint: "unban",
  },
];

// 工具函数：获取角色ID
export function getRoleId(role: UserRole): number {
  return ROLE_ID_MAP[role];
}

// 工具函数：从ID获取角色
export function getRoleFromId(roleId: number): UserRole {
  return ID_ROLE_MAP[roleId] || UserRole.USER;
}

// 工具函数：获取状态标签
export function getUserStatusLabel(status: UserStatus): string {
  return USER_STATUS_LABELS[status] || "未知";
}

// 工具函数：检查状态转换是否有效
export function isValidStatusTransition(
  from: UserStatus,
  to: UserStatus
): boolean {
  return USER_STATUS_TRANSITIONS.some((t) => t.from === from && t.to === to);
}

// 工具函数：获取状态转换操作
export function getStatusTransitionAction(
  from: UserStatus,
  to: UserStatus
): string | null {
  const transition = USER_STATUS_TRANSITIONS.find(
    (t) => t.from === from && t.to === to
  );
  return transition?.action || null;
}

// 工具函数：获取状态转换端点
export function getStatusTransitionEndpoint(
  from: UserStatus,
  to: UserStatus
): string | null {
  const transition = USER_STATUS_TRANSITIONS.find(
    (t) => t.from === from && t.to === to
  );
  return transition?.endpoint || null;
}
