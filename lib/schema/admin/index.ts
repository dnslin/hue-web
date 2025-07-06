// 角色管理
export { 
  createRoleFormSchema, 
  updateRoleFormSchema,
  type CreateRoleFormData,
  type UpdateRoleFormData
} from "./role";

// 用户管理
export {
  adminCreateUserSchema,
  userUpdateSchema,
  type AdminCreateUserFormData,
  type UserUpdateFormData,
} from "./user";

// 存储策略管理
export {
  createStorageStrategyFormSchema,
  updateStorageStrategyFormSchema,
  testS3ConnectionFormSchema,
  storageStrategyQuerySchema,
  batchStorageStrategyOperationSchema,
  s3ConfigSchema,
  localConfigSchema,
  storageTypeSchema,
  type CreateStorageStrategyFormData,
  type UpdateStorageStrategyFormData,
  type TestS3ConnectionFormData,
  type StorageStrategyQueryData,
  type BatchStorageStrategyOperationData,
  type S3ConfigFormData,
  type LocalConfigFormData,
  type StorageType,
} from "./storage-strategy";
