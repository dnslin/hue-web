import { z } from "zod";

/**
 * 创建分享链接请求验证
 */
export const createShareLinkRequestSchema = z.object({
  type: z.enum(['image', 'album'], {
    errorMap: () => ({ message: "分享类型必须是 'image' 或 'album'" })
  }),
  resourceId: z.number().int().positive("资源ID必须是正整数"),
  expireDays: z.number()
    .int("有效天数必须是整数")
    .min(1, "有效天数至少为1天")
    .max(365, "有效天数最多为365天")
    .optional(),
});

/**
 * 分享列表查询参数验证
 */
export const shareListParamsSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['created_at', 'expire_at', 'view_count']).optional().default('created_at'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  type: z.enum(['image', 'album']).optional(),
  status: z.enum(['active', 'expired', 'all']).optional().default('all'),
});

/**
 * 分享更新参数验证
 */
export const shareUpdateParamsSchema = z.object({
  token: z.string().min(1, "分享令牌不能为空"),
  expireDays: z.number()
    .int("有效天数必须是整数")
    .min(1, "有效天数至少为1天")
    .max(365, "有效天数最多为365天")
    .optional(),
});

/**
 * 批量分享操作参数验证
 */
export const batchShareParamsSchema = z.object({
  tokens: z.array(z.string().min(1, "分享令牌不能为空"))
    .min(1, "至少需要选择一个分享")
    .max(50, "一次最多操作 50 个分享"),
  action: z.enum(['delete', 'extend_expiry']),
  expireDays: z.number()
    .int("有效天数必须是整数")
    .min(1, "有效天数至少为1天")
    .max(365, "有效天数最多为365天")
    .optional(),
}).refine(
  (data) => {
    // 延长过期时间时必须提供 expireDays
    if (data.action === 'extend_expiry' && !data.expireDays) {
      return false;
    }
    return true;
  },
  {
    message: "延长过期时间时必须指定有效天数",
    path: ["expireDays"],
  }
);

/**
 * 分享过滤条件验证
 */
export const shareFiltersSchema = z.object({
  type: z.enum(['image', 'album']).optional(),
  status: z.enum(['active', 'expired']).optional(),
  createdDateRange: z.object({
    start: z.string().datetime("开始时间格式不正确"),
    end: z.string().datetime("结束时间格式不正确"),
  }).optional(),
  expireDateRange: z.object({
    start: z.string().datetime("开始时间格式不正确"),
    end: z.string().datetime("结束时间格式不正确"),
  }).optional(),
  minViews: z.number().int().min(0).optional(),
  maxViews: z.number().int().min(0).optional(),
}).refine(
  (data) => {
    // 检查浏览次数范围的逻辑关系
    if (data.minViews && data.maxViews && data.minViews > data.maxViews) {
      return false;
    }
    return true;
  },
  {
    message: "最小浏览次数不能大于最大浏览次数",
    path: ["maxViews"],
  }
).refine(
  (data) => {
    // 检查创建日期范围的逻辑关系
    if (data.createdDateRange) {
      const start = new Date(data.createdDateRange.start);
      const end = new Date(data.createdDateRange.end);
      if (start > end) {
        return false;
      }
    }
    return true;
  },
  {
    message: "创建开始时间不能晚于结束时间",
    path: ["createdDateRange"],
  }
).refine(
  (data) => {
    // 检查过期日期范围的逻辑关系
    if (data.expireDateRange) {
      const start = new Date(data.expireDateRange.start);
      const end = new Date(data.expireDateRange.end);
      if (start > end) {
        return false;
      }
    }
    return true;
  },
  {
    message: "过期开始时间不能晚于结束时间",
    path: ["expireDateRange"],
  }
);

/**
 * 分享访问验证（用于访客访问时）
 */
export const shareAccessSchema = z.object({
  token: z.string()
    .min(1, "分享令牌不能为空")
    .regex(/^[a-zA-Z0-9_-]+$/, "分享令牌格式不正确"),
  password: z.string().optional(), // 如果分享设置了密码保护
});

// 类型导出
export type CreateShareLinkRequestFormValues = z.infer<typeof createShareLinkRequestSchema>;
export type ShareListParamsFormValues = z.infer<typeof shareListParamsSchema>;
export type ShareUpdateParamsFormValues = z.infer<typeof shareUpdateParamsSchema>;
export type BatchShareParamsFormValues = z.infer<typeof batchShareParamsSchema>;
export type ShareFiltersFormValues = z.infer<typeof shareFiltersSchema>;
export type ShareAccessFormValues = z.infer<typeof shareAccessSchema>;