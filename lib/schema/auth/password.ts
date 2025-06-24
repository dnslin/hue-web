import { z } from "zod";

/**
 * 忘记密码表单验证模式
 */
export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "请输入邮箱").email("请输入有效的邮箱地址"),
});

/**
 * 重置密码表单验证模式
 */
export const resetPasswordSchema = z.object({
  email: z.string().min(1, "请输入邮箱").email("请输入有效的邮箱地址"),
  token: z.string().min(8, "验证码必须是8位").max(8, "验证码必须是8位"),
  newPassword: z
    .string()
    .min(8, "密码长度至少6位")
    .regex(/(?=.*[a-z])/, "密码必须包含小写字母")
    .regex(/(?=.*[A-Z])/, "密码必须包含大写字母")
    .regex(/(?=.*\d)/, "密码必须包含数字")
    .regex(/(?=.*[@$!%*?&])/, "密码必须包含特殊字符"),
});

/**
 * 忘记密码表单数据类型
 */
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/**
 * 重置密码表单数据类型
 */
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
