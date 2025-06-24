import { z } from "zod";

/**
 * 安全设置表单验证Schema
 */
export const securitySettingsSchema = z.object({
  passwordMinLength: z
    .number()
    .min(6, "密码最小长度不能少于6位")
    .max(64, "密码最小长度不能超过64位")
    .default(8),
  passwordRequiresUppercase: z.boolean().default(true),
  passwordRequiresLowercase: z.boolean().default(true),
  passwordRequiresNumber: z.boolean().default(true),
  passwordRequiresSpecialChar: z.boolean().default(false),
  loginMaxAttempts: z
    .number()
    .min(3, "最大登录尝试次数不能少于3次")
    .max(20, "最大登录尝试次数不能超过20次")
    .default(5),
  accountLockoutDurationMinutes: z
    .number()
    .min(5, "账户锁定时间不能少于5分钟")
    .max(1440, "账户锁定时间不能超过24小时")
    .default(30),
  ipWhitelist: z.string().default(""),
  ipBlacklist: z.string().default(""),
});

/**
 * 安全设置表单数据类型
 */
export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;
