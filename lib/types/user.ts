// 用户状态枚举 - 对齐后端定义
export enum UserStatus {
  NORMAL = 0, // 正常/激活 - 对应后端 StatusNormal = 0
  BANNED = 1, // 禁用/封禁 - 对应后端 StatusBanned = 1
  PENDING = 2, // 待审核 - 对应后端 StatusPendingApproval = 2
  DELETED = 3, // 已删除 (逻辑删除) - 对应后端 StatusDeleted = 3
  REJECTED = 4, // 审核拒绝 - 对应后端 StatusApprovalRejected = 4
  EMAIL_PENDING = 5, // 待邮件激活 - 对应后端 StatusEmailPending = 5
}

// UserRole enum and mappings are removed to rely on dynamic data from the backend.

// 状态标签映射
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.NORMAL]: "正常",
  [UserStatus.BANNED]: "封禁",
  [UserStatus.PENDING]: "待审核",
  [UserStatus.DELETED]: "已删除",
  [UserStatus.REJECTED]: "审核拒绝",
  [UserStatus.EMAIL_PENDING]: "待邮件激活",
};

// 基础用户信息接口
export interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string; // 前端使用Gravatar生成
  status: UserStatus;
  role: Role; // 完整的角色对象
  roleId: number;
  originalRoleId?: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  storageUsed?: number;
  storageLimit?: number;
  uploadCount?: number;
  passwordHash?: string;
}

// 管理员创建用户请求
export interface AdminUserCreateRequest {
  username: string;
  email: string;
  password: string;
  roleId: number;
}

// 用户更新请求
export interface UserUpdateRequest {
  username?: string;
  email?: string;
  password?: string;
  roleId?: number;
  status?: number;
}

// 批量用户ID请求
export interface BatchUserIDsRequest {
  userIds: number[];
}

// 批量用户拒绝请求
export interface BatchUserRejectRequest {
  userIds: number[];
  reason?: string;
}

// 用户审批请求
export interface UserApprovalRequest {
  reason?: string;
}

// 用户列表查询参数
export interface UserListParams {
  page?: number;
  pageSize?: number;
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
    | "roleId"
    | "status"
    | "createdAt"
    | "updatedAt"
    | "lastLoginAt"
    | "uploadCount";
  order?: "asc" | "desc";
  // 前端扩展字段
  search?: string; // 搜索关键词
  sortOrder?: "asc" | "desc"; // 排序方向别名
}

// 分页元数据
export interface PaginationMeta {
  page: number;
  pageSize: number;
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
  successCount: number;
  failedCount: number;
  failedItems?: Array<{
    id: number;
    error: string;
  }>;
}

// 角色权限接口
export interface Permission {
  id: number;
  name: string;
  description: string;
  groupName: string;
  createdAt: string;
  updatedAt: string;
}

// 角色接口
export interface Role {
  id: number;
  name: string;
  alias?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

// 角色创建请求接口
export interface CreateRoleRequest {
  name: string;
  alias?: string;
  description?: string;
  permissions: string[];
}

// 角色更新请求接口
export interface UpdateRoleRequest {
  name?: string;
  alias?: string;
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
