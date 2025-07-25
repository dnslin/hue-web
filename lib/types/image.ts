// lib/types/image.ts
// 图片管理相关类型定义

import { BaseQueryParams, PaginatedApiResponse, ApiResponse } from "./common";

/**
 * 图片实体类型 - 对应后端 ImageResponse DTO
 */
export interface ImageItem {
  id: number;
  filename: string;
  originalFilename: string;
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  size: number; // 文件大小(字节)
  width: number;
  height: number;
  uploadedAt: string; // ISO 时间戳
  uploadedById: number;
  uploaderUsername?: string;
  uploaderEmail?: string;
  viewCount: number;
  downloadCount: number;
  isPublic: boolean;
  description?: string;
  tags?: string[];
  album?: string;
  // 处理状态
  processingStatus: ImageProcessingStatus;
  // 存储相关
  storageStrategy?: string;
  storageMetadata?: Record<string, any>;
  // 审核相关
  moderationStatus: ModerationStatus;
  moderationNote?: string;
}

/**
 * 图片处理状态枚举
 */
export enum ImageProcessingStatus {
  PENDING = "pending",        // 待处理
  PROCESSING = "processing",  // 处理中
  COMPLETED = "completed",    // 处理完成
  FAILED = "failed",         // 处理失败
  OPTIMIZING = "optimizing"   // 优化中
}

/**
 * 图片审核状态枚举
 */
export enum ModerationStatus {
  PENDING = "pending",     // 待审核
  APPROVED = "approved",   // 已通过
  REJECTED = "rejected",   // 已拒绝
  FLAGGED = "flagged"      // 已标记
}

/**
 * 图片排序字段枚举
 */
export enum ImageSortBy {
  UPLOADED_AT = "uploadedAt",      // 上传时间
  FILE_SIZE = "size",              // 文件大小
  VIEW_COUNT = "viewCount",        // 查看次数
  DOWNLOAD_COUNT = "downloadCount", // 下载次数
  FILENAME = "filename",           // 文件名
  DIMENSIONS = "dimensions"        // 图片尺寸(width * height)
}

/**
 * 图片视图模式枚举
 */
export enum ImageViewMode {
  GRID = "grid",           // 网格视图
  LIST = "list",           // 列表视图
  WATERFALL = "waterfall"  // 瀑布流视图
}

/**
 * 图片筛选器参数
 */
export interface ImageFilterParams {
  // 文件类型筛选
  mimeTypes?: string[];
  // 文件大小范围筛选 (字节)
  minSize?: number;
  maxSize?: number;
  // 尺寸范围筛选
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  // 上传时间范围筛选
  uploadedAfter?: string;  // ISO 时间戳
  uploadedBefore?: string; // ISO 时间戳
  // 上传者筛选
  uploaderIds?: number[];
  // 状态筛选
  processingStatuses?: ImageProcessingStatus[];
  moderationStatuses?: ModerationStatus[];
  // 可见性筛选
  isPublic?: boolean;
  // 标签筛选
  tags?: string[];
  // 专辑筛选
  albums?: string[];
  // 搜索关键词
  search?: string; // 在filename, description中搜索
}

/**
 * 图片查询参数 - 扩展基础查询参数
 */
export interface ImageQueryParams extends BaseQueryParams {
  // 排序字段
  sortBy?: ImageSortBy;
  // 筛选参数
  filters?: ImageFilterParams;
  // 视图模式
  viewMode?: ImageViewMode;
  // 是否包含缩略图URL
  includeThumbnail?: boolean;
  // 是否包含上传者信息
  includeUploader?: boolean;
  // 是否包含统计信息
  includeStats?: boolean;
}

/**
 * 图片列表API响应类型
 */
export type ImageListResponse = PaginatedApiResponse<ImageItem>;

/**
 * 图片详情API响应类型
 */
export type ImageDetailResponse = ApiResponse<ImageItem>;

/**
 * 图片上传响应类型
 */
export interface ImageUploadResult {
  id: number;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  width: number;
  height: number;
  mimeType: string;
}

export type ImageUploadResponse = ApiResponse<ImageUploadResult>;

/**
 * 批量图片上传响应类型
 */
export interface BatchImageUploadResult {
  successful: ImageUploadResult[];
  failed: Array<{
    filename: string;
    error: string;
  }>;
  totalCount: number;
  successCount: number;
  failedCount: number;
}

export type BatchImageUploadResponse = ApiResponse<BatchImageUploadResult>;

/**
 * 图片操作结果类型
 */
export interface ImageOperationResult {
  imageId: number;
  success: boolean;
  error?: string;
}

/**
 * 批量操作响应类型
 */
export interface BatchImageOperationResult {
  results: ImageOperationResult[];
  successCount: number;
  failedCount: number;
  totalCount: number;
}

export type BatchImageOperationResponse = ApiResponse<BatchImageOperationResult>;

/**
 * 图片统计信息类型
 */
export interface ImageStats {
  totalImages: number;
  totalSize: number; // 总存储大小(字节)
  averageSize: number; // 平均文件大小
  totalViews: number;
  totalDownloads: number;
  imagesByType: Record<string, number>; // 按文件类型统计
  imagesByStatus: Record<ImageProcessingStatus, number>; // 按处理状态统计
  imagesByModeration: Record<ModerationStatus, number>; // 按审核状态统计
  uploadsToday: number;
  uploadsThisWeek: number;
  uploadsThisMonth: number;
}

export type ImageStatsResponse = ApiResponse<ImageStats>;

/**
 * 图片分享配置类型
 */
export interface ImageShareConfig {
  imageId: number;
  isPublic: boolean;
  allowDownload: boolean;
  expiresAt?: string; // ISO 时间戳
  shareToken?: string;
  shareUrl?: string;
}

export type ImageShareResponse = ApiResponse<ImageShareConfig>;

/**
 * 图片元数据类型
 */
export interface ImageMetadata {
  // EXIF 信息
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  focalLength?: string;
  exposureMode?: string;
  whiteBalance?: string;
  flash?: string;
  // 位置信息
  gps?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  // 拍摄时间
  takenAt?: string; // ISO 时间戳
  // 颜色信息
  colorSpace?: string;
  colorProfile?: string;
  // 其他技术信息
  compression?: string;
  resolution?: {
    x: number;
    y: number;
    unit: "inches" | "cm";
  };
}

/**
 * 图片编辑历史类型
 */
export interface ImageEditHistory {
  id: number;
  imageId: number;
  operation: string; // 操作类型：resize, crop, filter等
  parameters: Record<string, any>; // 操作参数
  editedAt: string; // ISO 时间戳
  editedById: number;
  editorUsername?: string;
  beforeUrl?: string;
  afterUrl?: string;
}

/**
 * 图片瀑布流配置类型
 */
export interface WaterfallConfig {
  columns: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap: number; // 间距(px)
  minItemHeight: number; // 最小项目高度(px)
  threshold: number; // 触发加载更多的阈值(px)
}

/**
 * 图片缓存配置类型
 */
export interface ImageCacheConfig {
  // 预览图缓存设置
  thumbnailCacheSize: number; // 缓存大小限制(MB)
  thumbnailCacheDuration: number; // 缓存持续时间(小时)
  // 尺寸信息缓存
  dimensionsCacheSize: number;
  dimensionsCacheDuration: number;
  // 元数据缓存
  metadataCacheSize: number;
  metadataCacheDuration: number;
}

/**
 * 图片组件Props基础类型
 */
export interface BaseImageComponentProps {
  className?: string;
  loading?: boolean;
  error?: string | null;
}

/**
 * 图片项组件Props类型
 */
export interface ImageItemProps extends BaseImageComponentProps {
  image: ImageItem;
  selected?: boolean;
  viewMode: ImageViewMode;
  showMetadata?: boolean;
  showActions?: boolean;
  onSelect?: (imageId: number) => void;
  onPreview?: (image: ImageItem) => void;
  onEdit?: (image: ImageItem) => void;
  onDelete?: (image: ImageItem) => void;
  onShare?: (image: ImageItem) => void;
}

/**
 * 图片列表组件Props类型
 */
export interface ImageListProps extends BaseImageComponentProps {
  images: ImageItem[];
  viewMode: ImageViewMode;
  selectedIds: number[];
  waterfallConfig?: WaterfallConfig;
  onLoadMore?: () => void;
  onSelectImage?: (imageId: number) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onBatchDelete?: (imageIds: number[]) => void;
  onBatchShare?: (imageIds: number[]) => void;
  onViewModeChange?: (mode: ImageViewMode) => void;
}

/**
 * 图片筛选器组件Props类型
 */
export interface ImageFiltersProps extends BaseImageComponentProps {
  filters: ImageFilterParams;
  stats?: ImageStats;
  onFiltersChange: (filters: ImageFilterParams) => void;
  onReset: () => void;
}

/**
 * 图片操作栏组件Props类型
 */
export interface ImageActionsProps extends BaseImageComponentProps {
  selectedCount: number;
  totalCount: number;
  viewMode: ImageViewMode;
  sortBy: ImageSortBy;
  sortOrder: "asc" | "desc";
  onUpload?: () => void;
  onBatchDelete?: () => void;
  onBatchShare?: () => void;
  onBatchDownload?: () => void;
  onViewModeChange?: (mode: ImageViewMode) => void;
  onSortChange?: (sortBy: ImageSortBy, order: "asc" | "desc") => void;
  onRefresh?: () => void;
}

/**
 * 类型守卫函数：检查是否为有效的图片项
 */
export function isValidImageItem(item: any): item is ImageItem {
  return (
    item &&
    typeof item.id === "number" &&
    typeof item.filename === "string" &&
    typeof item.url === "string" &&
    typeof item.size === "number" &&
    typeof item.width === "number" &&
    typeof item.height === "number"
  );
}

/**
 * 工具类型：图片项的部分更新类型
 */
export type ImageItemUpdate = Partial<Pick<ImageItem, 
  | "description" 
  | "tags" 
  | "album" 
  | "isPublic" 
  | "moderationStatus" 
  | "moderationNote"
>>;

/**
 * 常量定义
 */
export const IMAGE_CONSTANTS = {
  // 支持的图片格式
  SUPPORTED_MIME_TYPES: [
    "image/jpeg",
    "image/png", 
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",
    "image/tiff",
    "image/avif",
    "image/heif"
  ] as const,
  
  // 文件大小限制 (字节)
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MIN_FILE_SIZE: 1024, // 1KB
  
  // 尺寸限制
  MAX_DIMENSION: 8000,
  MIN_DIMENSION: 1,
  
  // 默认分页设置
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // 默认瀑布流配置
  DEFAULT_WATERFALL_CONFIG: {
    columns: {
      mobile: 2,
      tablet: 3,
      desktop: 4
    },
    gap: 16,
    minItemHeight: 200,
    threshold: 1000
  } as WaterfallConfig,
  
  // 默认缓存配置
  DEFAULT_CACHE_CONFIG: {
    thumbnailCacheSize: 50, // 50MB
    thumbnailCacheDuration: 24, // 24小时
    dimensionsCacheSize: 10, // 10MB
    dimensionsCacheDuration: 168, // 7天
    metadataCacheSize: 5, // 5MB
    metadataCacheDuration: 72 // 3天
  } as ImageCacheConfig
} as const;