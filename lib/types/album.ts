// lib/types/album.ts
// 相册管理相关类型定义 - 基于 swagger.yaml 规范

/**
 * 相册响应信息 - 对应后端 dtos.AlbumResponseDTO
 */
export interface AlbumResponse {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  coverImageId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建相册输入 - 对应后端 services.CreateAlbumInput
 */
export interface CreateAlbumInput {
  name: string;
  description?: string;
  isPublic?: boolean;
  coverImageId?: number;
}

/**
 * 更新相册输入 - 对应后端 services.UpdateAlbumInput
 */
export interface UpdateAlbumInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverImageId?: number; // 允许设为 null
}

/**
 * 相册列表查询参数
 */
export interface AlbumListParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'updated_at' | 'name' | 'image_count';
  order?: 'asc' | 'desc';
  keyword?: string;
  isPublic?: boolean;
}

/**
 * 相册详细信息（包含图片统计）
 */
export interface AlbumDetail extends AlbumResponse {
  imageCount: number;
  totalSize: number;
  coverImage?: {
    id: number;
    url: string;
    thumbnailUrl?: string;
  };
}

/**
 * 相册图片操作参数
 */
export interface AlbumImageParams {
  albumId: number;
  imageIds: number[];
  action: 'add' | 'remove';
}

/**
 * 相册删除参数
 */
export interface AlbumDeleteParams {
  id: number;
  moveImagesToAlbum?: number; // 删除相册时将图片移动到指定相册
  deleteImages?: boolean; // 是否同时删除相册内的图片
}

/**
 * 批量相册操作参数
 */
export interface BatchAlbumParams {
  albumIds: number[];
  action: 'delete' | 'set_public' | 'set_private';
  moveImagesToAlbum?: number; // 删除时将图片移动到指定相册
  deleteImages?: boolean; // 删除时是否同时删除图片
}

/**
 * 相册排序字段类型
 */
export type AlbumSortField = 'created_at' | 'updated_at' | 'name' | 'image_count';

/**
 * 相册过滤条件
 */
export interface AlbumFilters {
  isPublic?: boolean;
  hasImages?: boolean; // 是否包含图片
  minImageCount?: number;
  maxImageCount?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * 相册统计信息
 */
export interface AlbumStats {
  totalCount: number;
  publicCount: number;
  privateCount: number;
  totalImages: number;
  averageImagesPerAlbum: number;
  emptyAlbumCount: number;
  recentAlbums: number; // 最近7天创建的相册数量
}

/**
 * 相册简要信息（用于下拉选择等）
 */
export interface AlbumSummary {
  id: number;
  name: string;
  imageCount: number;
  coverImageUrl?: string;
}