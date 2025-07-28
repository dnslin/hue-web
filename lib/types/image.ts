// lib/types/image.ts
// 图片管理相关类型定义 - 基于 swagger.yaml 规范

/**
 * EXIF 信息 - 对应后端 dtos.ExifInfoDTO
 */
export interface ExifInfo {
  altitude?: number;
  cameraModel?: string;
  dateTimeOriginal?: string;
  exposureTime?: string;
  fNumber?: number;
  filmMode?: string;
  flash?: number;
  focalLength?: number;
  isoSpeedRatings?: number;
  latitude?: number;
  lens?: string;
  longitude?: number;
  make?: string;
}

/**
 * 图片响应信息 - 对应后端 dtos.ImageResponseDTO
 */
export interface ImageResponse {
  id: number;
  filename: string;
  url: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
  isPublic: boolean;
  albumId?: number;
  userId: number;
  storageStrategyId: number;
  moderationStatus: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 图片详细信息 - 对应后端 dtos.ImageDetailDTO (包含 EXIF)
 */
export interface ImageDetail extends ImageResponse {
  exif?: ExifInfo;
}

/**
 * 上传成功响应 - 对应后端 dtos.UploadResponseDTO
 */
export interface UploadResponse {
  id: number;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  thumbnailUrl?: string;
}

/**
 * 上传失败信息 - 对应后端 dtos.UploadFailureDTO
 */
export interface UploadFailure {
  filename: string;
  error: string;
}

/**
 * 批量上传响应 - 对应后端 dtos.BatchUploadResponseDTO
 */
export interface BatchUploadResponse {
  totalFiles: number;
  successCount: number;
  failureCount: number;
  successFiles: UploadResponse[];
  failureFiles: UploadFailure[];
}

/**
 * 图片列表查询参数
 */
export interface ImageListParams {
  page?: number;
  pageSize?: number;
  albumId?: number;
  sortBy?: 'created_at' | 'updated_at' | 'filename' | 'size';
  order?: 'asc' | 'desc';
  keyword?: string;
  isPublic?: boolean;
}

/**
 * 图片上传参数
 */
export interface ImageUploadParams {
  files: File[];
  albumId?: number;
  isPublic?: boolean;
}

/**
 * 图片更新参数
 */
export interface ImageUpdateParams {
  filename?: string;
  isPublic?: boolean;
  albumId?: number;
}

/**
 * 图片删除参数
 */
export interface ImageDeleteParams {
  id: number;
  permanent?: boolean; // 是否永久删除
}

/**
 * 批量图片操作参数
 */
export interface BatchImageParams {
  imageIds: number[];
  action: 'delete' | 'move_to_album' | 'set_public' | 'set_private';
  albumId?: number; // 移动到相册时需要
  permanent?: boolean; // 删除时是否永久删除
}

/**
 * 回收站图片信息
 */
export interface RecycleBinImage extends ImageResponse {
  deletedAt: string;
  daysRemaining: number; // 距离永久删除还有多少天
}

/**
 * 图片审核状态枚举
 */
export enum ModerationStatus {
  PENDING = 0,    // 待审核
  APPROVED = 1,   // 已通过
  REJECTED = 2,   // 已拒绝
  REVIEWING = 3   // 审核中
}

/**
 * 图片排序字段类型
 */
export type ImageSortField = 'created_at' | 'updated_at' | 'filename' | 'size' | 'width' | 'height';

/**
 * 图片过滤条件
 */
export interface ImageFilters {
  albumId?: number;
  isPublic?: boolean;
  moderationStatus?: ModerationStatus;
  minSize?: number;
  maxSize?: number;
  mimeTypes?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * 图片统计信息
 */
export interface ImageStats {
  totalCount: number;
  totalSize: number;
  publicCount: number;
  privateCount: number;
  albumCount: number;
  unalbumCount: number;
  averageSize: number;
  recentUploads: number; // 最近7天上传数量
}