// lib/schema/images/image.ts
// 图片相关的 Zod 验证 Schema

import { z } from 'zod';
import { SUPPORTED_IMAGE_TYPES } from '@/lib/constants/image-formats';

/**
 * 文件大小限制（默认10MB）
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 单个文件验证Schema
 */
export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: `文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`,
  })
  .refine((file) => SUPPORTED_IMAGE_TYPES.includes(file.type as any), {
    message: `不支持的文件类型，支持的类型：${SUPPORTED_IMAGE_TYPES.join(', ')}`,
  });

/**
 * 图片上传Schema
 */
export const uploadImageSchema = z.object({
  /** 要上传的文件列表 */
  files: z
    .array(imageFileSchema)
    .min(1, '至少需要选择一个文件')
    .max(20, '一次最多上传20个文件'),
  /** 目标相册ID（可选） */
  albumId: z.number().positive('相册ID必须为正数').optional(),
  /** 存储策略ID（可选） */
  storageStrategyId: z.number().positive('存储策略ID必须为正数').optional(),
  /** 是否设为公开 */
  isPublic: z.boolean().default(false),
});

/**
 * 图片查询参数Schema
 */
export const imageQuerySchema = z.object({
  /** 页码 */
  page: z.number().min(1, '页码必须大于0').default(1),
  /** 每页数量 */
  pageSize: z
    .number()
    .min(1, '每页数量必须大于0')
    .max(100, '每页数量不能超过100')
    .default(20),
  /** 相册ID过滤 */
  albumId: z.number().positive('相册ID必须为正数').optional(),
  /** 搜索关键词 */
  search: z.string().max(100, '搜索关键词长度不能超过100').optional(),
  /** 排序字段 */
  sortBy: z
    .enum(['created_at', 'updated_at', 'filename', 'size', 'width', 'height'])
    .default('created_at'),
  /** 排序方向 */
  order: z.enum(['asc', 'desc']).default('desc'),
  /** 是否只获取公开图片 */
  publicOnly: z.boolean().optional(),
});

/**
 * 图片更新Schema
 */
export const updateImageSchema = z.object({
  /** 文件名 */
  filename: z
    .string()
    .min(1, '文件名不能为空')
    .max(255, '文件名长度不能超过255')
    .optional(),
  /** 是否公开 */
  isPublic: z.boolean().optional(),
  /** 相册ID（null表示从相册中移除） */
  albumId: z.number().positive('相册ID必须为正数').nullable().optional(),
});

/**
 * 批量图片操作Schema
 */
export const batchImageOperationSchema = z.object({
  /** 操作类型 */
  operation: z.enum([
    'delete',
    'move_to_album',
    'remove_from_album',
    'set_public',
    'set_private',
  ]),
  /** 图片ID列表 */
  imageIds: z
    .array(z.number().positive('图片ID必须为正数'))
    .min(1, '至少需要选择一张图片')
    .max(100, '一次最多操作100张图片'),
  /** 操作参数 */
  params: z
    .object({
      /** 目标相册ID */
      albumId: z.number().positive('相册ID必须为正数').optional(),
      /** 是否公开 */
      isPublic: z.boolean().optional(),
    })
    .optional(),
});

/**
 * 图片筛选Schema
 */
export const imageFiltersSchema = z.object({
  /** 相册ID */
  albumId: z.number().positive('相册ID必须为正数').optional(),
  /** 搜索查询 */
  searchQuery: z.string().max(100, '搜索关键词长度不能超过100').optional(),
  /** 文件类型过滤 */
  mimeTypes: z.array(z.string().refine((type) => 
    SUPPORTED_IMAGE_TYPES.includes(type as any), 
    '不支持的图片格式'
  )).optional(),
  /** 日期范围开始 */
  dateFrom: z.string().datetime('日期格式不正确').optional(),
  /** 日期范围结束 */
  dateTo: z.string().datetime('日期格式不正确').optional(),
  /** 是否仅显示公开图片 */
  publicOnly: z.boolean().optional(),
});

/**
 * 上传任务Schema
 */
export const uploadTaskSchema = z.object({
  /** 任务ID */
  id: z.string().min(1, '任务ID不能为空'),
  /** 文件 */
  file: imageFileSchema,
  /** 相册ID */
  albumId: z.number().positive('相册ID必须为正数').optional(),
  /** 进度 */
  progress: z.number().min(0).max(100),
  /** 状态 */
  status: z.enum(['pending', 'uploading', 'completed', 'error', 'paused']),
  /** 错误信息 */
  error: z.string().optional(),
});

/**
 * 图片ID参数Schema
 */
export const imageIdSchema = z.object({
  id: z.coerce.number().positive('图片ID必须为正数'),
});

/**
 * 图片视图参数Schema
 */
export const imageViewSchema = z.object({
  /** 图片ID */
  id: z.coerce.number().positive('图片ID必须为正数'),
  /** 是否获取缩略图 */
  thumb: z.coerce.boolean().default(false),
});

/**
 * EXIF信息Schema
 */
export const exifInfoSchema = z.object({
  /** 相机制造商 */
  make: z.string().max(100).optional(),
  /** 相机型号 */
  cameraModel: z.string().max(100).optional(),
  /** 镜头信息 */
  lens: z.string().max(200).optional(),
  /** 拍摄时间 */
  dateTimeOriginal: z.string().datetime().optional(),
  /** 曝光时间 */
  exposureTime: z.string().max(50).optional(),
  /** 光圈值 */
  fNumber: z.number().positive().optional(),
  /** ISO感光度 */
  isoSpeedRatings: z.number().positive().optional(),
  /** 焦距 */
  focalLength: z.number().positive().optional(),
  /** 闪光灯设置 */
  flash: z.number().int().min(0).optional(),
  /** 拍摄模式 */
  filmMode: z.string().max(50).optional(),
  /** 纬度 */
  latitude: z.number().min(-90).max(90).optional(),
  /** 经度 */
  longitude: z.number().min(-180).max(180).optional(),
  /** 海拔高度 */
  altitude: z.number().optional(),
});

/**
 * 类型导出
 */
export type UploadImageInput = z.infer<typeof uploadImageSchema>;
export type ImageQueryInput = z.infer<typeof imageQuerySchema>;
export type UpdateImageInput = z.infer<typeof updateImageSchema>;
export type BatchImageOperationInput = z.infer<typeof batchImageOperationSchema>;
export type ImageFiltersInput = z.infer<typeof imageFiltersSchema>;
export type UploadTaskInput = z.infer<typeof uploadTaskSchema>;
export type ImageIdInput = z.infer<typeof imageIdSchema>;
export type ImageViewInput = z.infer<typeof imageViewSchema>;
export type ExifInfoInput = z.infer<typeof exifInfoSchema>;