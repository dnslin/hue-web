import type {
  ApiResponse,
  SuccessApiResponse,
  ErrorApiResponse,
  PaginatedApiResponse,
  BatchOperationResult,
  BaseQueryParams,
  SortOrder,
} from "./common";

/**
 * 用户状态枚举 - 对应后端 models.User.status
 * 0-正常, 1-禁用, 2-待审核, 3-已删除, 4-审核拒绝, 5-待邮件激活
 */
export enum UserStatus {
  NORMAL = 0,
  BANNED = 1,
  PENDING = 2,
  DELETED = 3,
  REJECTED = 4,
  EMAIL_PENDING = 5,
}

/**
 * 状态标签映射
 */
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.NORMAL]: "正常",
  [UserStatus.BANNED]: "封禁",
  [UserStatus.PENDING]: "待审核",
  [UserStatus.DELETED]: "已删除",
  [UserStatus.REJECTED]: "审核拒绝",
  [UserStatus.EMAIL_PENDING]: "待邮件激活",
};

/**
 * 权限接口 - 对应后端 models.Permission
 */
export interface Permission {
  id: number;
  name: string;
  description: string;
  groupName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 角色接口 - 对应后端 models.Role
 */
export interface Role {
  id: number;
  name: string;
  alias?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 基础用户信息接口 - 对应后端 models.User
 */
export interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  status: UserStatus;
  role: Role;
  roleId: number;
  originalRoleId?: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  minTokenIssueTime?: string;
  suspiciousLoginNotifiedAt?: string;
}

/**
 * 管理员用户响应 - 对应后端 dtos.AdminUserResponseDTO
 */
export interface AdminUserResponse {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  status: UserStatus;
  role: Role;
  originalRoleId?: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
}

/**
 * 用户响应 - 对应后端 dtos.UserResponseDTO
 */
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  status: UserStatus;
  role: Role;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
}

/**
 * 管理员创建用户请求 - 对应后端 dtos.AdminUserCreateRequest
 */
export interface AdminUserCreateRequest {
  username: string;
  email: string;
  password: string;
  roleId: number;
}

/**
 * 用户更新请求 - 对应后端 models.UserUpdateRequest
 */
export interface UserUpdateRequest {
  username?: string;
  email?: string;
  password?: string;
  roleId?: number;
  status?: number;
}

/**
 * 批量用户ID请求 - 对应后端 dtos.BatchUserIDsRequest
 */
export interface BatchUserIDsRequest {
  userIds: number[];
}

/**
 * 批量用户拒绝请求 - 对应后端 dtos.BatchUserRejectRequest
 */
export interface BatchUserRejectRequest {
  userIds: number[];
  reason?: string;
}

/**
 * 用户审批请求 - 对应后端 dtos.UserApprovalRequest
 */
export interface UserApprovalRequest {
  reason?: string;
}

/**
 * 用户列表查询参数 - 对应后端 /admin/users 接口参数
 */
export interface UserListParams extends BaseQueryParams {
  username?: string;
  email?: string;
  roleId?: number;
  status?: number;
  createdAtStart?: string;
  createdAtEnd?: string;
  sortBy?:
    | "id"
    | "username"
    | "email"
    | "role_id"
    | "status"
    | "created_at"
    | "updated_at"
    | "last_login_at";
  sortOrder?: SortOrder;
}

/**
 * 用户列表响应类型
 */
export type UserListResponse = PaginatedApiResponse<AdminUserResponse>;

/**
 * 用户详情响应类型
 */
export type UserDetailResponse = SuccessApiResponse<User>;

/**
 * 用户操作响应类型
 */
export type UserActionResponse = SuccessApiResponse<User> | ErrorApiResponse;

/**
 * 批量用户操作响应类型
 */
export type BatchUserActionResponse =
  | SuccessApiResponse<BatchOperationResult>
  | ErrorApiResponse;

/**
 * 角色创建请求接口 - 对应后端 dtos.RoleCreateDTO
 */
export interface CreateRoleRequest {
  name: string;
  alias?: string;
}

/**
 * 角色更新请求接口 - 对应后端 dtos.RoleUpdateDTO
 */
export interface UpdateRoleRequest {
  name?: string;
  alias?: string;
}

/**
 * 权限分组接口（前端聚合使用）
 */
export interface PermissionGroup {
  name: string;
  description: string;
  permissions: Permission[];
}

/**
 * 用户统计信息接口
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  bannedUsers: number;
  pendingUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
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
    to: UserStatus.BANNED,
    action: "ban",
    endpoint: "ban",
  },
  {
    from: UserStatus.BANNED,
    to: UserStatus.NORMAL,
    action: "unban",
    endpoint: "unban",
  },
];

// Deprecated role helper functions removed.

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

// 工具函数：获取用户显示名称
export function getUserDisplayName(user: User): string {
  return user.nickname || user.username;
}
