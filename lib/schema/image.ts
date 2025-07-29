import { z } from "zod";
import { ImageProcessingSetting } from "@/lib/types/settings";
import { useSettingsStore } from "@/lib/store/settings";

/**
 * 创建动态的图片验证 Schema
 * 从设置中获取支持的图片类型和最大文件大小
 */
export const createImageValidationSchemas = (imageSettings?: ImageProcessingSetting) => {
  // 默认配置（当设置未加载时使用）
  const defaultSupportedTypes = [
    "image/jpeg",
    "image/jpg", 
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/tiff"
  ];
  const defaultMaxSizeMB = 10;
  const defaultBatchLimit = 20;

  // 解析设置中的支持格式
  const supportedTypes = imageSettings?.allowedImageFormats
    ? imageSettings.allowedImageFormats.split(',').map(format => 
        format.trim().toLowerCase().startsWith('image/') 
          ? format.trim() 
          : `image/${format.trim().toLowerCase()}`
      )
    : defaultSupportedTypes;

  const maxSizeMB = imageSettings?.uploadMaxSizeMB || defaultMaxSizeMB;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const batchLimit = imageSettings?.batchUploadLimit || defaultBatchLimit;

  /**
   * 图片列表查询参数验证
   */
  const imageListParamsSchema = z.object({
    page: z.number().int().min(1).optional().default(1),
    pageSize: z.number().int().min(1).max(100).optional().default(20),
    albumId: z.number().int().positive().optional(),
    sortBy: z.enum(['created_at', 'updated_at', 'size']).optional().default('created_at'),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
    filename: z.string().max(100).optional(),
    isPublic: z.boolean().optional(),
  });

  /**
   * 图片上传参数验证
   */
  const imageUploadParamsSchema = z.object({
    files: z.array(
      z.instanceof(File)
        .refine((file) => file.size <= maxSizeBytes, `文件大小不能超过 ${maxSizeMB}MB`)
        .refine(
          (file) => supportedTypes.includes(file.type.toLowerCase()),
          `不支持的文件类型。支持的格式：${supportedTypes.join(', ')}`
        )
    ).min(1, "至少需要选择一个文件").max(batchLimit, `一次最多上传 ${batchLimit} 个文件`),
    albumId: z.number().int().positive().optional(),
    isPublic: z.boolean().optional().default(false),
  });

  /**
   * 图片更新参数验证
   */
  const imageUpdateParamsSchema = z.object({
    filename: z.string().min(1, "文件名不能为空").max(255, "文件名不能超过 255 个字符").optional(),
    isPublic: z.boolean().optional(),
    albumId: z.number().int().positive().nullable().optional(),
  });

  /**
   * 图片删除参数验证
   */
  const imageDeleteParamsSchema = z.object({
    id: z.number().int().positive("图片ID必须是正整数"),
    permanent: z.boolean().optional().default(false),
  });

  /**
   * 批量图片操作参数验证
   */
  const batchImageParamsSchema = z.object({
    imageIds: z.array(z.number().int().positive()).min(1, "至少需要选择一张图片").max(100, "一次最多操作 100 张图片"),
    action: z.enum(['delete', 'move_to_album', 'set_public', 'set_private']),
    albumId: z.number().int().positive().optional(),
    permanent: z.boolean().optional().default(false),
  }).refine(
    (data) => {
      // 移动到相册时必须提供 albumId
      if (data.action === 'move_to_album' && !data.albumId) {
        return false;
      }
      return true;
    },
    {
      message: "移动到相册时必须指定目标相册",
      path: ["albumId"],
    }
  );

  /**
   * 图片过滤条件验证
   */
  const imageFiltersSchema = z.object({
    albumId: z.number().int().positive().optional(),
    isPublic: z.boolean().optional(),
    moderationStatus: z.enum(['0', '1', '2', '3']).transform(Number).optional(),
    minSize: z.number().int().min(0).optional(),
    maxSize: z.number().int().min(0).optional(),
    mimeTypes: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.string().datetime("开始时间格式不正确"),
      end: z.string().datetime("结束时间格式不正确"),
    }).optional(),
  }).refine(
    (data) => {
      // 检查最小和最大大小的逻辑关系
      if (data.minSize && data.maxSize && data.minSize > data.maxSize) {
        return false;
      }
      return true;
    },
    {
      message: "最小大小不能大于最大大小",
      path: ["maxSize"],
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

  return {
    imageListParamsSchema,
    imageUploadParamsSchema,
    imageUpdateParamsSchema,
    imageDeleteParamsSchema,
    batchImageParamsSchema,
    imageFiltersSchema,
    // 导出配置信息供组件使用
    config: {
      supportedTypes,
      maxSizeMB,
      maxSizeBytes,
      batchLimit,
    }
  };
};

// 静态 Schema（使用默认配置）
const defaultSchemas = createImageValidationSchemas();

export const {
  imageListParamsSchema,
  imageUploadParamsSchema,
  imageUpdateParamsSchema,
  imageDeleteParamsSchema,
  batchImageParamsSchema,
  imageFiltersSchema,
} = defaultSchemas;

// 类型导出
export type ImageListParamsFormValues = z.infer<typeof imageListParamsSchema>;
export type ImageUploadParamsFormValues = z.infer<typeof imageUploadParamsSchema>;
export type ImageUpdateParamsFormValues = z.infer<typeof imageUpdateParamsSchema>;
export type ImageDeleteParamsFormValues = z.infer<typeof imageDeleteParamsSchema>;
export type BatchImageParamsFormValues = z.infer<typeof batchImageParamsSchema>;
export type ImageFiltersFormValues = z.infer<typeof imageFiltersSchema>;

/**
 * 从 settings store 获取当前图片设置并创建动态验证 schemas
 * 这个函数应该在组件中使用，可以获取到最新的设置
 */
export const createDynamicImageSchemas = () => {
  const settingsState = useSettingsStore.getState();
  const imageSettings = settingsState.settings.image;
  
  return createImageValidationSchemas(imageSettings || undefined);
};

/**
 * 获取当前的上传配置信息
 * 用于在 UI 组件中显示限制信息
 */
export const getCurrentUploadConfig = () => {
  const settingsState = useSettingsStore.getState();
  const imageSettings = settingsState.settings.image;
  
  if (!imageSettings) {
    return {
      maxSizeMB: 10,
      allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      batchLimit: 20,
    };
  }
  
  return {
    maxSizeMB: imageSettings.uploadMaxSizeMB,
    allowedFormats: imageSettings.allowedImageFormats
      .split(',')
      .map(format => {
        const trimmed = format.trim().toLowerCase();
        return trimmed.startsWith('image/') ? trimmed : `image/${trimmed}`;
      }),
    batchLimit: imageSettings.batchUploadLimit,
  };
};