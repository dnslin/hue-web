import { z } from "zod";

/**
 * 管理员创建用户表单验证模式
 * 注意：这是预留文件，可以在未来扩展更多用户管理相关的验证模式
 */
export const adminCreateUserSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少需要3个字符")
    .max(50, "用户名不能超过50个字符")
    .regex(/^[a-zA-Z0-9_-]+$/, "用户名只能包含字母、数字、下划线和连字符"),
  email: z.string().min(1, "请输入邮箱").email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(8, "密码至少需要8个字符")
    .max(100, "密码不能超过100个字符"),
  roleId: z.number().min(1, "请选择用户角色"),
});

/**
 * 用户更新表单验证模式
 */
export const userUpdateSchema = z.object({
  username: z
    .string()
    .min(3, "用户名至少需要3个字符")
    .max(50, "用户名不能超过50个字符")
    .regex(/^[a-zA-Z0-9_-]+$/, "用户名只能包含字母、数字、下划线和连字符")
    .optional(),
  email: z.string().email("请输入有效的邮箱地址").optional(),
  roleId: z.number().min(1, "请选择用户角色").optional(),
});

/**
 * 管理员创建用户表单数据类型
 */
export type AdminCreateUserFormData = z.infer<typeof adminCreateUserSchema>;

/**
 * 用户更新表单数据类型
 */
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
