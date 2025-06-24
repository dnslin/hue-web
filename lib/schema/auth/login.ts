import { z } from "zod";

/**
 * 登录表单验证模式
 */
export const loginSchema = z.object({
  username_or_email: z.string().min(1, "请输入用户名或邮箱"),
  password: z.string().min(1, "请输入密码"),
});

/**
 * 登录表单数据类型
 */
export type LoginFormValues = z.infer<typeof loginSchema>;
