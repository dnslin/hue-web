// lib/types/image.ts
// 图片相关类型定义，基于 swagger.yaml 规范

import type { BaseQueryParams } from './common';
import type { SUPPORTED_IMAGE_FORMATS } from '@/lib/constants/image-formats';

/**
 * 图片响应数据 - 对应后端 dtos.ImageResponseDTO
 * 后端字段会通过 api-service.ts 自动转换为 camelCase
 */
export interface ImageResponse {
  /** 图片唯一ID */
  id: number;
  /** 原始文件名 */
  filename: string;
  /** 图片访问URL */
  url: string;
  /** 图片宽度（像素） */
  width: number;
  /** 图片高度（像素） */
  height: number;
  /** 文件大小（字节） */
  size: number;
  /** MIME类型 */
  mimeType: string;
  /** 是否公开可访问 */
  isPublic: boolean;
  /** 所属相册ID（可选） */
  albumId?: number;
  /** 所属用户ID */
  userId: number;
  /** 存储策略ID */
  storageStrategyId: number;
  /** 审核状态 */
  moderationStatus: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * EXIF信息 - 对应后端 dtos.ExifInfoDTO
 * 包含相机拍摄参数和地理位置信息
 */
export interface ExifInfo {
  /** 相机制造商 */
  make?: string;
  /** 相机型号 */
  cameraModel?: string;
  /** 镜头信息 */
  lens?: string;
  /** 拍摄时间 */
  dateTimeOriginal?: string;
  /** 曝光时间 */
  exposureTime?: string;
  /** 光圈值 */
  fNumber?: number;
  /** ISO感光度 */
  isoSpeedRatings?: number;
  /** 焦距 */
  focalLength?: number;
  /** 闪光灯设置 */
  flash?: number;
  /** 拍摄模式 */
  filmMode?: string;
  /** 纬度 */
  latitude?: number;
  /** 经度 */
  longitude?: number;
  /** 海拔高度 */
  altitude?: number;
}

/**
 * 图片详细信息 - 对应后端 dtos.ImageDetailDTO
 * 继承基础图片信息，增加EXIF数据
 */
export interface ImageDetail extends ImageResponse {
  /** EXIF信息（可选） */
  exif?: ExifInfo;
}

/**
 * 上传响应数据 - 对应后端 dtos.UploadResponseDTO
 */
export interface UploadResponse {
  /** 图片ID */
  id: number;
  /** 文件名 */
  filename: string;
  /** 访问URL */
  url: string;
  /** MIME类型 */
  mimeType: string;
  /** 文件大小 */
  size: number;
  /** 缩略图URL（可选） */
  thumbnailUrl?: string;
}

/**
 * 上传失败信息 - 对应后端 dtos.UploadFailureDTO
 */
export interface UploadFailure {
  /** 失败的文件名 */
  filename: string;
  /** 错误信息 */
  error: string;
}

/**
 * 批量上传响应 - 对应后端 dtos.BatchUploadResponseDTO
 */
export interface BatchUploadResponse {
  /** 总文件数 */
  totalFiles: number;
  /** 成功上传数 */
  successCount: number;
  /** 失败上传数 */
  failureCount: number;
  /** 成功上传的文件列表 */
  successFiles: UploadResponse[];
  /** 失败上传的文件列表 */
  failureFiles: UploadFailure[];
}

/**
 * 图片查询参数 - 继承基础查询参数
 */
export interface ImageQueryParams extends BaseQueryParams {
  /** 相册ID过滤（可选） */
  albumId?: number;
  /** 搜索关键词（可选） */
  search?: string;
  /** 是否只获取公开图片 */
  publicOnly?: boolean;
}

/**
 * 图片上传参数
 */
export interface ImageUploadParams {
  /** 要上传的文件列表 */
  files: File[];
  /** 目标相册ID（可选） */
  albumId?: number;
  /** 存储策略ID（可选） */
  storageStrategyId?: number;
  /** 是否设为公开 */
  isPublic?: boolean;
}

/**
 * 图片更新参数
 */
export interface ImageUpdateParams {
  /** 文件名（可选） */
  filename?: string;
  /** 是否公开（可选） */
  isPublic?: boolean;
  /** 相册ID（可选，null表示从相册中移除） */
  albumId?: number | null;
}

/**
 * 上传任务状态
 */
export type UploadTaskStatus = 'pending' | 'uploading' | 'completed' | 'error' | 'paused';

/**
 * 上传任务接口
 */
export interface UploadTask {
  /** 任务唯一ID */
  id: string;
  /** 要上传的文件 */
  file: File;
  /** 目标相册ID */
  albumId?: number;
  /** 上传进度（0-100） */
  progress: number;
  /** 任务状态 */
  status: UploadTaskStatus;
  /** 错误信息（如果有） */
  error?: string;
  /** 上传结果（成功时） */
  result?: UploadResponse;
}

/**
 * 图片筛选条件
 */
export interface ImageFilters {
  /** 相册ID */
  albumId?: number;
  /** 搜索查询 */
  searchQuery?: string;
  /** 文件类型过滤 */
  mimeTypes?: (keyof typeof SUPPORTED_IMAGE_FORMATS)[];
  /** 日期范围开始 */
  dateFrom?: string;
  /** 日期范围结束 */
  dateTo?: string;
  /** 是否仅显示公开图片 */
  publicOnly?: boolean;
}

/**
 * 图片排序选项
 */
export type ImageSortBy = 'created_at' | 'updated_at' | 'filename' | 'size' | 'width' | 'height';

/**
 * 图片批量操作类型
 */
export type BatchImageOperation = 
  | 'delete'
  | 'move_to_album' 
  | 'remove_from_album'
  | 'set_public'
  | 'set_private';

/**
 * 批量操作参数
 */
export interface BatchImageOperationParams {
  /** 操作类型 */
  operation: BatchImageOperation;
  /** 图片ID列表 */
  imageIds: number[];
  /** 操作相关参数（如目标相册ID） */
  params?: {
    albumId?: number;
    isPublic?: boolean;
  };
}