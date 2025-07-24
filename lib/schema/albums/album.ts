// lib/schema/albums/album.ts
// 相册相关的 Zod 验证 Schema

import { z } from 'zod';

/**
 * 相册名称验证规则
 */
const albumNameSchema = z
  .string()
  .min(1, '相册名称不能为空')
  .max(255, '相册名称长度不能超过255个字符')
  .regex(/^[^<>:"/\\|?*]+$/, '相册名称包含非法字符');

/**
 * 相册描述验证规则
 */
const albumDescriptionSchema = z
  .string()
  .max(1024, '相册描述长度不能超过1024个字符')
  .optional();

/**
 * 创建相册Schema
 */
export const createAlbumSchema = z.object({
  /** 相册名称 */
  name: albumNameSchema,
  /** 相册描述 */
  description: albumDescriptionSchema,
  /** 是否公开 */
  isPublic: z.boolean().default(false),
  /** 封面图片ID */
  coverImageId: z.number().positive('封面图片ID必须为正数').optional(),
});

/**
 * 更新相册Schema - 所有字段都是可选的
 */
export const updateAlbumSchema = z.object({
  /** 相册名称 */
  name: albumNameSchema.optional(),
  /** 相册描述 */
  description: albumDescriptionSchema,
  /** 是否公开 */
  isPublic: z.boolean().optional(),
  /** 封面图片ID */
  coverImageId: z.number().positive('封面图片ID必须为正数').nullable().optional(),
});

/**
 * 相册查询参数Schema
 */
export const albumQuerySchema = z.object({
  /** 页码 */
  page: z.number().min(1, '页码必须大于0').default(1),
  /** 每页数量 */
  pageSize: z
    .number()
    .min(1, '每页数量必须大于0')
    .max(100, '每页数量不能超过100')
    .default(20),
  /** 搜索关键词 */
  search: z.string().max(100, '搜索关键词长度不能超过100').optional(),
  /** 排序字段 */
  sortBy: z
    .enum(['created_at', 'updated_at', 'name', 'image_count', 'last_image_at'])
    .default('created_at'),
  /** 排序方向 */
  order: z.enum(['asc', 'desc']).default('desc'),
  /** 是否只获取公开相册 */
  publicOnly: z.boolean().optional(),
  /** 是否包含统计信息 */
  includeStats: z.boolean().default(false),
});

/**
 * 相册中图片查询参数Schema
 */
export const albumImageQuerySchema = z.object({
  /** 页码 */
  page: z.number().min(1, '页码必须大于0').default(1),
  /** 每页数量 */
  pageSize: z
    .number()
    .min(1, '每页数量必须大于0')
    .max(100, '每页数量不能超过100')
    .default(20),
  /** 搜索关键词 */
  search: z.string().max(100, '搜索关键词长度不能超过100').optional(),
  /** 排序字段 */
  sortBy: z
    .enum(['created_at', 'updated_at', 'filename', 'size'])
    .default('created_at'),
  /** 排序方向 */
  order: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * 相册ID参数Schema
 */
export const albumIdSchema = z.object({
  id: z.coerce.number().positive('相册ID必须为正数'),
});

/**
 * 批量相册操作Schema
 */
export const batchAlbumOperationSchema = z.object({
  /** 操作类型 */
  operation: z.enum([
    'delete',
    'set_public',
    'set_private',
    'merge',
    'export',
  ]),
  /** 相册ID列表 */
  albumIds: z
    .array(z.number().positive('相册ID必须为正数'))
    .min(1, '至少需要选择一个相册')
    .max(50, '一次最多操作50个相册'),
  /** 操作参数 */
  params: z
    .object({
      /** 目标相册ID（用于合并操作） */
      targetAlbumId: z.number().positive('目标相册ID必须为正数').optional(),
      /** 是否公开 */
      isPublic: z.boolean().optional(),
      /** 导出格式 */
      exportFormat: z.enum(['zip', 'tar']).optional(),
    })
    .optional(),
});

/**
 * 相册筛选条件Schema
 */
export const albumFiltersSchema = z.object({
  /** 搜索查询 */
  searchQuery: z.string().max(100, '搜索关键词长度不能超过100').optional(),
  /** 是否仅显示公开相册 */
  publicOnly: z.boolean().optional(),
  /** 是否仅显示非空相册 */
  nonEmptyOnly: z.boolean().optional(),
  /** 日期范围开始 */
  dateFrom: z.string().datetime('日期格式不正确').optional(),
  /** 日期范围结束 */
  dateTo: z.string().datetime('日期格式不正确').optional(),
});

/**
 * 相册图片管理操作Schema
 */
export const albumImageOperationSchema = z.object({
  /** 相册ID */
  albumId: z.number().positive('相册ID必须为正数'),
  /** 图片ID列表 */
  imageIds: z
    .array(z.number().positive('图片ID必须为正数'))
    .min(1, '至少需要选择一张图片')
    .max(100, '一次最多操作100张图片'),
  /** 操作类型 */
  operation: z.enum(['add', 'remove', 'move']),
  /** 目标相册ID（用于移动操作） */
  targetAlbumId: z.number().positive('目标相册ID必须为正数').optional(),
});

/**
 * 相册表单数据Schema
 */
export const albumFormSchema = z
  .object({
    /** 相册名称 */
    name: albumNameSchema,
    /** 相册描述 */
    description: z.string().max(1024, '相册描述长度不能超过1024个字符').default(''),
    /** 是否公开 */
    isPublic: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // 如果设置为公开，确保有适当的名称和描述
      if (data.isPublic && (!data.name.trim() || data.name.length < 2)) {
        return false;
      }
      return true;
    },
    {
      message: '公开相册需要设置合适的名称（至少2个字符）',
      path: ['name'],
    }
  );

/**
 * 相册导入选项Schema
 */
export const albumImportSchema = z.object({
  /** 导入源类型 */
  source: z.enum(['folder', 'zip', 'url']),
  /** 源路径或URL */
  sourcePath: z.string().min(1, '源路径不能为空').max(500, '路径长度不能超过500'),
  /** 是否保持文件夹结构 */
  preserveStructure: z.boolean().default(true),
  /** 是否覆盖同名文件 */
  overwriteExisting: z.boolean().default(false),
  /** 目标相册名称（可选，不提供则使用文件夹名） */
  albumName: albumNameSchema.optional(),
});

/**
 * 相册导出选项Schema
 */
export const albumExportSchema = z.object({
  /** 相册ID */
  albumId: z.number().positive('相册ID必须为正数'),
  /** 导出格式 */
  format: z.enum(['zip', 'tar', 'folder']).default('zip'),
  /** 是否包含原始文件 */
  includeOriginals: z.boolean().default(true),
  /** 是否包含缩略图 */
  includeThumbnails: z.boolean().default(false),
  /** 是否包含元数据 */
  includeMetadata: z.boolean().default(true),
  /** 图片质量（1-100，用于JPEG压缩） */
  quality: z.number().min(1).max(100).default(85).optional(),
});

/**
 * 相册设置更新Schema
 */
export const albumSettingsSchema = z.object({
  /** 默认相册可见性 */
  defaultPublic: z.boolean().default(false),
  /** 允许的最大相册数 */
  maxAlbumsPerUser: z.number().positive().default(100),
  /** 相册名称最大长度 */
  maxNameLength: z.number().min(10).max(500).default(255),
  /** 相册描述最大长度 */
  maxDescriptionLength: z.number().min(100).max(5000).default(1024),
});

/**
 * 类型导出
 */
export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;
export type UpdateAlbumInput = z.infer<typeof updateAlbumSchema>;
export type AlbumQueryInput = z.infer<typeof albumQuerySchema>;
export type AlbumImageQueryInput = z.infer<typeof albumImageQuerySchema>;
export type AlbumIdInput = z.infer<typeof albumIdSchema>;
export type BatchAlbumOperationInput = z.infer<typeof batchAlbumOperationSchema>;
export type AlbumFiltersInput = z.infer<typeof albumFiltersSchema>;
export type AlbumImageOperationInput = z.infer<typeof albumImageOperationSchema>;
export type AlbumFormInput = z.infer<typeof albumFormSchema>;
export type AlbumImportInput = z.infer<typeof albumImportSchema>;
export type AlbumExportInput = z.infer<typeof albumExportSchema>;
export type AlbumSettingsInput = z.infer<typeof albumSettingsSchema>;