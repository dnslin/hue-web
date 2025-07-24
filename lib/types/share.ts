// lib/types/share.ts
// 分享相关类型定义，基于 swagger.yaml 规范

import type { BaseQueryParams } from './common';
import type { ImageResponse } from './image';
import type { AlbumResponse } from './album';

/**
 * 分享类型
 */
export type ShareType = 'image' | 'album';

/**
 * 分享响应数据 - 对应后端 dtos.ShareResponseDTO
 * 后端字段会通过 api-service.ts 自动转换为 camelCase
 */
export interface ShareResponse {
  /** 分享记录ID */
  id: number;
  /** 分享令牌（唯一标识） */
  token: string;
  /** 分享类型 */
  type: ShareType;
  /** 被分享资源ID */
  resourceId: number;
  /** 创建者用户ID */
  createdById: number;
  /** 过期时间（可选，null表示永不过期） */
  expireAt?: string;
  /** 查看次数 */
  viewCount: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 创建分享链接请求 - 对应后端 dtos.CreateShareLinkRequest
 */
export interface CreateShareLinkRequest {
  /** 分享类型 */
  type: ShareType;
  /** 被分享资源ID */
  resourceId: number;
  /** 过期天数（可选，不设置表示永不过期） */
  expireDays?: number;
  /** 分享密码（可选） */
  password?: string;
  /** 是否允许下载 */
  allowDownload?: boolean;
}

/**
 * 分享内容数据 - 通过分享链接获取的内容
 */
export interface ShareContentData {
  /** 分享信息 */
  share: ShareResponse;
  /** 分享的内容（图片或相册） */
  content: ImageResponse | AlbumResponse;
  /** 如果是相册分享，包含相册中的图片列表 */
  images?: ImageResponse[];
  /** 创建者信息 */
  creator: {
    id: number;
    username: string;
    avatar?: string;
  };
}

/**
 * 分享查询参数 - 继承基础查询参数
 */
export interface ShareQueryParams extends BaseQueryParams {
  /** 分享类型过滤（可选） */
  type?: ShareType;
  /** 搜索关键词（可选） */
  search?: string;
  /** 是否只显示有效（未过期）的分享 */
  validOnly?: boolean;
}

/**
 * 分享链接验证结果
 */
export interface ShareValidationResult {
  /** 是否有效 */
  isValid: boolean;
  /** 是否需要密码 */
  requiresPassword: boolean;
  /** 是否已过期 */
  isExpired: boolean;
  /** 错误消息（如果无效） */
  error?: string;
  /** 分享基本信息（如果有效） */
  share?: Pick<ShareResponse, 'id' | 'type' | 'createdAt' | 'expireAt'>;
}

/**
 * 分享链接访问请求
 */
export interface ShareAccessRequest {
  /** 分享令牌 */
  token: string;
  /** 密码（如果需要） */
  password?: string;
  /** 是否计入访问次数 */
  countView?: boolean;
}

/**
 * 分享统计信息
 */
export interface ShareStats {
  /** 总分享数 */
  totalShares: number;
  /** 图片分享数 */
  imageShares: number;
  /** 相册分享数 */
  albumShares: number;
  /** 有效分享数（未过期） */
  validShares: number;
  /** 已过期分享数 */
  expiredShares: number;
  /** 总查看次数 */
  totalViews: number;
}

/**
 * 分享设置选项
 */
export interface ShareSettings {
  /** 默认过期天数 */
  defaultExpireDays: number;
  /** 是否允许设置密码 */
  allowPassword: boolean;
  /** 是否允许下载 */
  allowDownload: boolean;
  /** 最大过期天数限制 */
  maxExpireDays: number;
  /** 是否需要登录才能查看 */
  requireLogin: boolean;
}

/**
 * 分享批量操作类型
 */
export type BatchShareOperation = 
  | 'delete'
  | 'extend_expiry'
  | 'disable'
  | 'enable'
  | 'reset_views';

/**
 * 批量操作参数
 */
export interface BatchShareOperationParams {
  /** 操作类型 */
  operation: BatchShareOperation;
  /** 分享ID列表或token列表 */
  shares: (number | string)[];
  /** 操作相关参数 */
  params?: {
    /** 新的过期天数（用于延长过期时间） */
    expireDays?: number;
    /** 新的过期时间（绝对时间） */
    expireAt?: string;
  };
}

/**
 * 分享筛选条件
 */
export interface ShareFilters {
  /** 分享类型 */
  type?: ShareType;
  /** 搜索查询 */
  searchQuery?: string;
  /** 是否只显示有效分享 */
  validOnly?: boolean;
  /** 是否只显示有密码保护的分享 */
  passwordProtectedOnly?: boolean;
  /** 日期范围开始 */
  dateFrom?: string;
  /** 日期范围结束 */
  dateTo?: string;
}

/**
 * 分享排序选项
 */
export type ShareSortBy = 'created_at' | 'updated_at' | 'expire_at' | 'view_count' | 'type';

/**
 * 分享表单数据
 */
export interface ShareFormData {
  /** 分享类型 */
  type: ShareType;
  /** 资源ID */
  resourceId: number;
  /** 过期天数 */
  expireDays: number;
  /** 分享密码 */
  password: string;
  /** 是否允许下载 */
  allowDownload: boolean;
}

/**
 * 分享链接展示信息
 */
export interface ShareLinkInfo {
  /** 完整的分享URL */
  shareUrl: string;
  /** 分享令牌 */
  token: string;
  /** 二维码数据URL */
  qrCodeUrl: string;
  /** 过期时间 */
  expireAt?: string;
  /** 是否有密码保护 */
  hasPassword: boolean;
}