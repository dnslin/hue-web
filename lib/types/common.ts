// lib/types/common.ts
// 统一的API响应接口和公共类型定义

/**
 * 分页元数据 - 对应后端 utils.PaginationMeta
 * 后端字段: page, page_size, total
 * 前端字段: page, pageSize, total
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * 统一的API响应接口 - 对应后端 utils.Response
 * 后端字段: code, msg, data, request_id, meta
 * 前端字段: code, message, data, requestId, meta
 */
export interface ApiResponse<TData = any, TMeta = PaginationMeta> {
  /** 业务状态码，0表示成功，其他为各类错误 */
  code: number;
  /** 简短、清晰的提示信息 */
  msg: string;
  /** 成功时返回的业务数据，失败时可为 null */
  data?: TData;
  /** 用于追踪和日志记录的唯一请求ID */
  requestId?: string;
  /** 分页元数据，仅在分页查询时出现 */
  meta?: TMeta;
}

/**
 * 分页API响应类型
 */
export type PaginatedApiResponse<TItem> = ApiResponse<TItem[], PaginationMeta>;

/**
 * 成功API响应类型 (code === 0)
 */
export type SuccessApiResponse<TData = any> = ApiResponse<TData> & {
  code: 0;
  data: TData;
};

/**
 * 错误API响应类型 (code !== 0)
 */
export interface ErrorApiResponse
  extends Omit<ApiResponse<null>, "data" | "meta"> {
  code: number; // 非0的业务错误码
  msg: string;
  error?: any; // 更详细的原始错误信息
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult {
  successCount: number;
  failedCount: number;
  failedItems?: Array<{
    id: number;
    error: string;
  }>;
}

/**
 * 审计日志操作类型 - 对应后端 models.AuditLogActionType
 */
export enum AuditLogActionType {
  USER_REGISTER = "USER_REGISTER",
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
  USER_UPDATE_PROFILE = "USER_UPDATE_PROFILE",
  USER_CHANGE_PASSWORD = "USER_CHANGE_PASSWORD",
  USER_REQUEST_RESET_PWD = "USER_REQUEST_RESET_PWD",
  USER_RESET_PASSWORD = "USER_RESET_PASSWORD",
  USER_VERIFY_EMAIL = "USER_VERIFY_EMAIL",
  USER_REQUEST_ACTIVATION_EMAIL = "USER_REQUEST_ACTIVATION_EMAIL",
  USER_REQUEST_RESET_PWD_EMAIL = "USER_REQUEST_RESET_PWD_EMAIL",
  ADMIN_USER_CREATE = "ADMIN_USER_CREATE",
  ADMIN_USER_UPDATE = "ADMIN_USER_UPDATE",
  ADMIN_USER_DELETE = "ADMIN_USER_DELETE",
  ADMIN_USER_STATUS_CHANGE = "ADMIN_USER_STATUS_CHANGE",
  ADMIN_USER_ROLE_CHANGE = "ADMIN_USER_ROLE_CHANGE",
  ADMIN_USER_PASSWORD_RESET = "ADMIN_USER_PASSWORD_RESET",
  ADMIN_BATCH_USER_APPROVE = "ADMIN_BATCH_USER_APPROVE",
  ADMIN_BATCH_USER_REJECT = "ADMIN_BATCH_USER_REJECT",
  ADMIN_BATCH_USER_BAN = "ADMIN_BATCH_USER_BAN",
  ADMIN_BATCH_USER_UNBAN = "ADMIN_BATCH_USER_UNBAN",
  SYSTEM_EMAIL_SEND_SKIPPED = "SYSTEM_EMAIL_SEND_SKIPPED",
}

/**
 * 审计日志响应项 - 对应后端 dtos.AuditLogResponseItem
 */
export interface AuditLogResponseItem {
  id: number;
  actionType: AuditLogActionType;
  description: string;
  details?: any; // 使用 any 以便灵活处理 JSON 数据
  failureReason?: string;
  operatorId: number;
  operatorIp: string;
  operatorName: string;
  status: string;
  targetUserId?: number;
  targetUsername?: string;
  timestamp: string;
  userAgent: string;
}

/**
 * 审计日志查询响应 - 对应后端 dtos.AuditLogQueryResponse
 */
export interface AuditLogQueryResponse {
  logs: AuditLogResponseItem[];
  meta: PaginationMeta;
}

/**
 * 排序方向
 */
export type SortOrder = "asc" | "desc";

/**
 * 基础查询参数
 */
export interface BaseQueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: SortOrder;
}

/**
 * 日期范围查询参数
 */
export interface DateRangeParams {
  startTime?: string;
  endTime?: string;
}

/**
 * 通用ID参数
 */
export interface IdParam {
  id: number;
}

/**
 * 通用状态
 */
export type Status = "success" | "error" | "warning" | "info";

/**
 * 加载状态
 */
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

/**
 * 操作状态
 */
export interface OperationState extends LoadingState {
  isSubmitting?: boolean;
}

/**
 * 表单验证错误
 */
export interface ValidationError {
  field: string;
  msg: string;
}

/**
 * 表单状态
 */
export interface FormState<T = any> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

/**
 * 选项类型（用于下拉框等）
 */
export interface Option<T = string | number> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * 树形节点类型
 */
export interface TreeNode<T = any> {
  id: string | number;
  label: string;
  children?: TreeNode<T>[];
  data?: T;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
}

/**
 * 文件上传响应 - 对应后端 dtos.UploadResponseDTO
 */
export interface UploadResponse {
  id: number;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

/**
 * 分享响应 - 对应后端 dtos.ShareResponseDTO
 */
export interface ShareResponse {
  id: number;
  token: string;
  type: string;
  resourceId: number;
  createdById: number;
  expireAt?: string;
  viewCount: number;
  createdAt: string;
}

/**
 * 存储策略 - 对应后端 models.StorageStrategy
 */
export interface StorageStrategy {
  id: number;
  name: string;
  type: string;
  config: string; // JSON字符串
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 工具类型：提取数组元素类型
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * 工具类型：使所有属性可选
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 工具类型：使指定属性必需
 */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 工具类型：深度可选
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 工具类型：深度必需
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * 类型守卫：检查是否为成功响应
 */
export function isSuccessApiResponse<T>(
  response: SuccessApiResponse<T> | ErrorApiResponse
): response is SuccessApiResponse<T> {
  return response.code === 0;
}

/**
 * 类型守卫：检查是否为错误响应
 */
export function isErrorApiResponse(
  response: SuccessApiResponse<any> | ErrorApiResponse
): response is ErrorApiResponse {
  return response.code !== 0;
}

