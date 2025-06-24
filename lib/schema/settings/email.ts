import { z } from "zod";

/**
 * 邮件设置表单验证Schema
 */
export const emailSettingsSchema = z.object({
  fromEmailAddress: z.string().email("请输入有效的邮箱地址"),
  fromEmailName: z
    .string()
    .min(1, "发件人名称不能为空")
    .max(100, "发件人名称不能超过100个字符"),
  smtpServer: z.string().min(1, "SMTP服务器不能为空"),
  smtpPort: z
    .number()
    .min(1, "端口号必须大于0")
    .max(65535, "端口号不能超过65535")
    .default(587),
  smtpUsername: z.string().min(1, "SMTP用户名不能为空"),
  smtpPassword: z.string().min(1, "SMTP密码不能为空"),
  emailNotifyEnabled: z.boolean().default(true),
});

/**
 * 邮件设置表单数据类型
 */
export type EmailSettingsFormData = z.infer<typeof emailSettingsSchema>;
