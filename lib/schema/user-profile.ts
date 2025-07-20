import { z } from "zod";

/**
 * 基本信息更新表单验证
 */
export const basicInfoSchema = z.object({
  nickname: z
    .string()
    .max(50, "昵称不能超过50个字符")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("请输入有效的邮箱地址")
    .optional()
    .or(z.literal("")),
});

/**
 * 密码修改表单验证
 */
export const passwordUpdateSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "请输入当前密码"),
    newPassword: z
      .string()
      .min(8, "新密码至少需要8个字符")
      .max(100, "密码不能超过100个字符"),
    confirmPassword: z
      .string()
      .min(1, "请确认新密码"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

/**
 * 表单数据类型
 */
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type PasswordUpdateFormData = z.infer<typeof passwordUpdateSchema>;