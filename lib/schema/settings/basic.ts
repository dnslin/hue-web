import { z } from "zod";

/**
 * 基础设置表单验证Schema - 根据swagger.yaml约束更新
 */
export const basicSettingSchema = z.object({
  appName: z
    .string()
    .min(1, "应用名称不能为空")
    .max(100, "应用名称不能超过100个字符"),
  siteDescription: z.string().max(500, "站点描述不能超过500个字符").default(""),
  seoKeywords: z.string().max(200, "SEO关键词不能超过200个字符").default(""),
  logoURL: z
    .string()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "请输入有效的Logo URL",
    })
    .default(""),
  faviconURL: z
    .string()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "请输入有效的Favicon URL",
    })
    .default(""),
  siteAnnouncement: z
    .string()
    .max(1000, "站点公告不能超过1000个字符")
    .default(""),
  userRegistrationEnabled: z.boolean().default(true),
  adminApprovalRequired: z.boolean().default(false),
  emailVerificationRequired: z.boolean().default(true),
  guestUploadEnabled: z.boolean().default(false),
  userInitialStorageCapacityMB: z
    .number()
    .min(10, "初始存储容量不能少于10MB")
    .max(102400, "初始存储容量不能超过100GB")
    .default(1024),
  notifyAdminOnPendingApproval: z.boolean().default(false),
});

/**
 * 基础设置表单数据类型
 */
export type BasicSettingFormData = z.infer<typeof basicSettingSchema>;
