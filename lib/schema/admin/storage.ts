import { z } from "zod";

/**
 * 存储策略类型枚举
 */
export const storageTypeSchema = z.enum(["s3", "local"], {
  required_error: "请选择存储类型",
});

/**
 * S3配置验证模式
 */
export const s3ConfigSchema = z.object({
  accessKeyId: z
    .string()
    .min(1, "Access Key ID 不能为空")
    .max(128, "Access Key ID 不能超过128个字符"),
  secretAccessKey: z
    .string()
    .min(1, "Secret Access Key 不能为空")
    .max(255, "Secret Access Key 不能超过255个字符"),
  bucket: z
    .string()
    .min(1, "存储桶名称不能为空")
    .max(63, "存储桶名称不能超过63个字符")
    .regex(
      /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/,
      "存储桶名称格式不正确，只能包含小写字母、数字、点和连字符，且必须以字母或数字开头和结尾"
    ),
  region: z.string().min(1, "区域不能为空").max(50, "区域名称不能超过50个字符"),
  endpoint: z.string().min(1, "终端节点不能为空").url("请输入有效的URL地址"),
  baseUrl: z.string().url("请输入有效的URL地址").optional().or(z.literal("")),
  forcePathStyle: z.boolean().default(false),
});

/**
 * 本地存储配置验证模式
 */
export const localConfigSchema = z.object({
  basePath: z
    .string()
    .min(1, "存储路径不能为空")
    .max(255, "存储路径不能超过255个字符")
    .refine(
      (path) => path.startsWith("/") || /^[A-Z]:\\/.test(path),
      "请输入有效的绝对路径"
    ),
});

/**
 * 存储策略创建表单验证模式
 */
export const createStorageStrategyFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "策略名称不能为空")
      .max(100, "策略名称不能超过100个字符")
      .regex(
        /^[\u4e00-\u9fa5a-zA-Z0-9\s_-]+$/,
        "策略名称只能包含中文、英文字母、数字、空格、下划线和连字符"
      ),
    type: storageTypeSchema,
    isEnabled: z.boolean().default(true),
    // S3配置
    s3Config: s3ConfigSchema.optional(),
    // 本地配置
    localConfig: localConfigSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.type === "s3") {
        return data.s3Config !== undefined;
      }
      if (data.type === "local") {
        return data.localConfig !== undefined;
      }
      return true;
    },
    {
      message: "请配置对应存储类型的参数",
      path: ["config"],
    }
  );

/**
 * 存储策略更新表单验证模式
 */
export const updateStorageStrategyFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "策略名称不能为空")
      .max(100, "策略名称不能超过100个字符")
      .regex(
        /^[\u4e00-\u9fa5a-zA-Z0-9\s_-]+$/,
        "策略名称只能包含中文、英文字母、数字、空格、下划线和连字符"
      ),
    type: storageTypeSchema,
    isEnabled: z.boolean().default(true),
    // S3配置
    s3Config: s3ConfigSchema.optional(),
    // 本地配置
    localConfig: localConfigSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.type === "s3" && data.s3Config === undefined) {
        return false;
      }
      if (data.type === "local" && data.localConfig === undefined) {
        return false;
      }
      return true;
    },
    {
      message: "请配置对应存储类型的参数",
      path: ["config"],
    }
  );

/**
 * S3连接测试验证模式
 */
export const testS3ConnectionFormSchema = s3ConfigSchema;

/**
 * 存储策略查询参数验证模式
 */
export const storageStrategyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  type: storageTypeSchema.optional(),
  isEnabled: z.coerce.boolean().optional(),
  name: z.string().max(100).optional(),
});

/**
 * 批量操作验证模式
 */
export const batchStorageStrategyOperationSchema = z.object({
  ids: z
    .array(z.number().positive())
    .min(1, "请至少选择一个存储策略")
    .max(100, "一次最多只能操作100个存储策略"),
  action: z.enum(["enable", "disable", "delete"], {
    required_error: "请选择操作类型",
  }),
});

/**
 * 表单数据类型定义
 */
export type CreateStorageStrategyFormData = z.infer<
  typeof createStorageStrategyFormSchema
>;
export type UpdateStorageStrategyFormData = z.infer<
  typeof updateStorageStrategyFormSchema
>;
export type TestS3ConnectionFormData = z.infer<
  typeof testS3ConnectionFormSchema
>;
export type StorageStrategyQueryData = z.infer<
  typeof storageStrategyQuerySchema
>;
export type BatchStorageStrategyOperationData = z.infer<
  typeof batchStorageStrategyOperationSchema
>;

/**
 * S3配置数据类型
 */
export type S3ConfigFormData = z.infer<typeof s3ConfigSchema>;

/**
 * 本地配置数据类型
 */
export type LocalConfigFormData = z.infer<typeof localConfigSchema>;

/**
 * 存储类型数据类型
 */
export type StorageType = z.infer<typeof storageTypeSchema>;

