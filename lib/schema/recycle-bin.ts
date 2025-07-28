import { z } from "zod";

/**
 * 回收站列表查询参数验证
 */
export const recycleBinListParamsSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['deleted_at', 'created_at', 'filename', 'size']).optional().default('deleted_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  keyword: z.string().max(100).optional(),
  dateRange: z.object({
    start: z.string().datetime("开始时间格式不正确"),
    end: z.string().datetime("结束时间格式不正确"),
  }).optional(),
}).refine(
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

/**
 * 回收站图片恢复参数验证
 */
export const recycleBinRestoreParamsSchema = z.object({
  id: z.number().int().positive("图片ID必须是正整数"),
  albumId: z.number().int().positive().optional(),
});

/**
 * 回收站图片永久删除参数验证
 */
export const recycleBinPurgeParamsSchema = z.object({
  id: z.number().int().positive("图片ID必须是正整数"),
});

/**
 * 批量回收站操作参数验证
 */
export const batchRecycleBinParamsSchema = z.object({
  imageIds: z.array(z.number().int().positive())
    .min(1, "至少需要选择一个项目")
    .max(50, "一次最多操作 50 个项目"),
  action: z.enum(['restore', 'purge']),
  albumId: z.number().int().positive().optional(),
});

/**
 * 回收站清空操作参数验证
 */
export const recycleBinClearParamsSchema = z.object({
  olderThanDays: z.number()
    .int("天数必须是整数")
    .min(1, "天数至少为1天")
    .max(365, "天数最多为365天")
    .optional(),
  confirmMessage: z.string()
    .min(1, "确认消息不能为空")
    .refine(
      (msg) => msg === "确认清空回收站",
      "确认消息必须是：确认清空回收站"
    ),
});

/**
 * 回收站过滤条件验证
 */
export const recycleBinFiltersSchema = z.object({
  keyword: z.string().max(100).optional(),
  minSize: z.number().int().min(0).optional(),
  maxSize: z.number().int().min(0).optional(),
  mimeTypes: z.array(z.string()).optional(),
  deletedDateRange: z.object({
    start: z.string().datetime("开始时间格式不正确"),
    end: z.string().datetime("结束时间格式不正确"),
  }).optional(),
  daysRemainingRange: z.object({
    min: z.number().int().min(0, "最小剩余天数不能小于0"),
    max: z.number().int().min(0, "最大剩余天数不能小于0"),
  }).optional(),
}).refine(
  (data) => {
    // 检查文件大小范围的逻辑关系
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
    // 检查删除日期范围的逻辑关系
    if (data.deletedDateRange) {
      const start = new Date(data.deletedDateRange.start);
      const end = new Date(data.deletedDateRange.end);
      if (start > end) {
        return false;
      }
    }
    return true;
  },
  {
    message: "删除开始时间不能晚于结束时间",
    path: ["deletedDateRange"],
  }
).refine(
  (data) => {
    // 检查剩余天数范围的逻辑关系
    if (data.daysRemainingRange) {
      if (data.daysRemainingRange.min > data.daysRemainingRange.max) {
        return false;
      }
    }
    return true;
  },
  {
    message: "最小剩余天数不能大于最大剩余天数",
    path: ["daysRemainingRange"],
  }
);

// 类型导出
export type RecycleBinListParamsFormValues = z.infer<typeof recycleBinListParamsSchema>;
export type RecycleBinRestoreParamsFormValues = z.infer<typeof recycleBinRestoreParamsSchema>;
export type RecycleBinPurgeParamsFormValues = z.infer<typeof recycleBinPurgeParamsSchema>;
export type BatchRecycleBinParamsFormValues = z.infer<typeof batchRecycleBinParamsSchema>;
export type RecycleBinClearParamsFormValues = z.infer<typeof recycleBinClearParamsSchema>;
export type RecycleBinFiltersFormValues = z.infer<typeof recycleBinFiltersSchema>;