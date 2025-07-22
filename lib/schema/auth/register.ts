import { z } from "zod";

/**
 * 注册表单验证模式
 */
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "用户名至少需要3个字符")
      .max(50, "用户名不能超过50个字符")
      .regex(/^[a-zA-Z0-9_-]+$/, "用户名只能包含字母、数字、下划线和连字符"),
    email: z.string().min(1, "请输入邮箱").email("请输入有效的邮箱地址"),
    password: z
      .string()
      .min(6, "密码至少需要6个字符")
      .max(100, "密码不能超过100个字符"),
    confirm_password: z.string().min(1, "请确认密码"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "两次输入的密码不一致",
    path: ["confirm_password"],
  });

/**
 * 注册表单数据类型
 */
export type RegisterFormValues = z.infer<typeof registerSchema>;

