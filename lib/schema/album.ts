import { z } from "zod";

/**
 * 相册列表查询参数验证
 */
export const albumListParamsSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['created_at', 'updated_at', 'name', 'image_count']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  keyword: z.string().max(100).optional(),
  isPublic: z.boolean().optional(),
});

/**
 * 创建相册输入验证
 */
export const createAlbumInputSchema = z.object({
  name: z.string()
    .min(1, "相册名称不能为空")
    .max(255, "相册名称不能超过 255 个字符")
    .refine(
      (name) => name.trim().length > 0,
      "相册名称不能只包含空格"
    ),
  description: z.string()
    .max(1024, "相册描述不能超过 1024 个字符")
    .optional(),
  isPublic: z.boolean().optional().default(false),
  coverImageId: z.number().int().positive().optional(),
});

/**
 * 更新相册输入验证
 */
export const updateAlbumInputSchema = z.object({
  name: z.string()
    .min(1, "相册名称不能为空")
    .max(255, "相册名称不能超过 255 个字符")
    .refine(
      (name) => name.trim().length > 0,
      "相册名称不能只包含空格"
    )
    .optional(),
  description: z.string()
    .max(1024, "相册描述不能超过 1024 个字符")
    .nullable()
    .optional(),
  isPublic: z.boolean().optional(),
  coverImageId: z.number().int().positive().nullable().optional(),
});

/**
 * 相册图片操作参数验证
 */
export const albumImageParamsSchema = z.object({
  albumId: z.number().int().positive("相册ID必须是正整数"),
  imageIds: z.array(z.number().int().positive())
    .min(1, "至少需要选择一张图片")
    .max(50, "一次最多操作 50 张图片"),
  action: z.enum(['add', 'remove']),
});

/**
 * 相册删除参数验证
 */
export const albumDeleteParamsSchema = z.object({
  id: z.number().int().positive("相册ID必须是正整数"),
  moveImagesToAlbum: z.number().int().positive().optional(),
  deleteImages: z.boolean().optional().default(false),
}).refine(
  (data) => {
    // 如果不删除图片，必须提供目标相册ID
    if (!data.deleteImages && !data.moveImagesToAlbum) {
      return false;
    }
    return true;
  },
  {
    message: "删除相册时必须选择删除图片或指定目标相册",
    path: ["moveImagesToAlbum"],
  }
);

/**
 * 批量相册操作参数验证
 */
export const batchAlbumParamsSchema = z.object({
  albumIds: z.array(z.number().int().positive())
    .min(1, "至少需要选择一个相册")
    .max(20, "一次最多操作 20 个相册"),
  action: z.enum(['delete', 'set_public', 'set_private']),
  moveImagesToAlbum: z.number().int().positive().optional(),
  deleteImages: z.boolean().optional().default(false),
}).refine(
  (data) => {
    // 删除操作时的验证
    if (data.action === 'delete') {
      if (!data.deleteImages && !data.moveImagesToAlbum) {
        return false;
      }
    }
    return true;
  },
  {
    message: "批量删除相册时必须选择删除图片或指定目标相册",
    path: ["moveImagesToAlbum"],
  }
);

/**
 * 相册过滤条件验证
 */
export const albumFiltersSchema = z.object({
  isPublic: z.boolean().optional(),
  hasImages: z.boolean().optional(),
  minImageCount: z.number().int().min(0).optional(),
  maxImageCount: z.number().int().min(0).optional(),
  dateRange: z.object({
    start: z.string().datetime("开始时间格式不正确"),
    end: z.string().datetime("结束时间格式不正确"),
  }).optional(),
}).refine(
  (data) => {
    // 检查图片数量范围的逻辑关系
    if (data.minImageCount && data.maxImageCount && data.minImageCount > data.maxImageCount) {
      return false;
    }
    return true;
  },
  {
    message: "最小图片数量不能大于最大图片数量",
    path: ["maxImageCount"],
  }
).refine(
  (data) => {
    // 检查日期范围的逻辑关系
    if (data.dateRange) {
      const start = new Date(data.dateRange.start);
      const end = new Date(data.dateRange.end);
      if (start > end) {
        return false;
      }
    }
    return true;
  },
  {
    message: "开始时间不能晚于结束时间",
    path: ["dateRange"],
  }
);

// 类型导出
export type AlbumListParamsFormValues = z.infer<typeof albumListParamsSchema>;
export type CreateAlbumInputFormValues = z.infer<typeof createAlbumInputSchema>;
export type UpdateAlbumInputFormValues = z.infer<typeof updateAlbumInputSchema>;
export type AlbumImageParamsFormValues = z.infer<typeof albumImageParamsSchema>;
export type AlbumDeleteParamsFormValues = z.infer<typeof albumDeleteParamsSchema>;
export type BatchAlbumParamsFormValues = z.infer<typeof batchAlbumParamsSchema>;
export type AlbumFiltersFormValues = z.infer<typeof albumFiltersSchema>;