// lib/types/share.ts
// 分享功能相关类型定义 - 基于 swagger.yaml 规范

/**
 * 分享响应信息 - 对应后端 dtos.ShareResponseDTO
 */
export interface ShareResponse {
  id: number;
  token: string;
  type: 'image' | 'album';
  resourceId: number;
  createdById: number;
  expireAt?: string;
  viewCount: number;
  createdAt: string;
}

/**
 * 创建分享链接请求 - 对应后端 dtos.CreateShareLinkRequest
 */
export interface CreateShareLinkRequest {
  type: 'image' | 'album';
  resourceId: number;
  expireDays?: number; // 可选，分享有效天数
}

/**
 * 分享类型枚举
 */
export enum ShareType {
  IMAGE = 'image',
  ALBUM = 'album'
}

/**
 * 分享链接详细信息（包含资源信息）
 */
export interface ShareDetail extends ShareResponse {
  resource?: {
    id: number;
    name: string;
    url?: string;
    thumbnailUrl?: string;
    description?: string;
  };
  isExpired: boolean;
  remainingDays?: number; // 距离过期还有多少天
}

/**
 * 分享列表查询参数
 */
export interface ShareListParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'expire_at' | 'view_count';
  order?: 'asc' | 'desc';
  type?: 'image' | 'album';
  status?: 'active' | 'expired' | 'all';
}

/**
 * 分享更新参数
 */
export interface ShareUpdateParams {
  token: string;
  expireDays?: number; // 更新过期时间
}

/**
 * 批量分享操作参数
 */
export interface BatchShareParams {
  tokens: string[];
  action: 'delete' | 'extend_expiry';
  expireDays?: number; // 延长过期时间时需要
}

/**
 * 分享访问记录
 */
export interface ShareAccessLog {
  id: number;
  shareToken: string;
  visitorIp: string;
  userAgent: string;
  accessAt: string;
  referer?: string;
}

/**
 * 分享统计信息
 */
export interface ShareStats {
  totalShares: number;
  activeShares: number;
  expiredShares: number;
  imageShares: number;
  albumShares: number;
  totalViews: number;
  todayViews: number;
  popularShares: Array<{
    token: string;
    resourceName: string;
    viewCount: number;
  }>;
}

/**
 * 公开分享内容（访客查看）
 */
export interface PublicShareContent {
  type: 'image' | 'album';
  resourceName: string;
  description?: string;
  createdAt: string;
  viewCount: number;
  content: PublicImageContent | PublicAlbumContent;
}

/**
 * 公开图片内容
 */
export interface PublicImageContent {
  id: number;
  filename: string;
  url: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
}

/**
 * 公开相册内容
 */
export interface PublicAlbumContent {
  id: number;
  name: string;
  description?: string;
  imageCount: number;
  images: PublicImageContent[];
}

/**
 * 分享过滤条件
 */
export interface ShareFilters {
  type?: 'image' | 'album';
  status?: 'active' | 'expired';
  createdDateRange?: {
    start: string;
    end: string;
  };
  expireDateRange?: {
    start: string;
    end: string;
  };
  minViews?: number;
  maxViews?: number;
}