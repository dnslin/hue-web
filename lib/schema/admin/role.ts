import { z } from "zod";

/**
 * 角色创建表单验证模式
 */
export const createRoleFormSchema = z.object({
  name: z
    .string()
    .min(1, "角色名称不能为空")
    .max(50, "角色名称不能超过50个字符")
    .regex(/^[a-zA-Z0-9_]+$/, "角色名称只能包含英文字母、数字和下划线"),
  alias: z
    .string()
    .max(100, "角色别名不能超过100个字符")
    .optional()
    .or(z.literal("")),
  storageStrategyIds: z
    .array(z.number().int().positive())
    .optional()
    .default([]),
});

/**
 * 角色创建表单数据类型
 */
export type CreateRoleFormData = z.infer<typeof createRoleFormSchema>;

/**
 * 角色更新表单验证模式
 */
export const updateRoleFormSchema = z.object({
  name: z
    .string()
    .min(1, "角色名称不能为空")
    .max(50, "角色名称不能超过50个字符")
    .regex(/^[a-zA-Z0-9_]+$/, "角色名称只能包含英文字母、数字和下划线")
    .optional(),
  alias: z
    .string()
    .max(100, "角色别名不能超过100个字符")
    .optional()
    .or(z.literal("")),
  storageStrategyIds: z
    .array(z.number().int().positive())
    .optional(),
});

/**
 * 角色更新表单数据类型
 */
export type UpdateRoleFormData = z.infer<typeof updateRoleFormSchema>;
