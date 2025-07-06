// 存储策略类型定义
// 基于 swagger.yaml 中的 models.StorageStrategy 和相关 DTO

export type StorageType = 's3' | 'local'

// 本地存储配置
export interface LocalConfig {
  basePath: string
}

// S3存储配置
export interface S3Config {
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  region: string
  endpoint: string
  baseUrl?: string
  forcePathStyle?: boolean
}

// 存储策略基础接口
export interface StorageStrategy {
  id: number
  name: string
  type: StorageType
  isEnabled: boolean
  // S3配置（仅当 type === 's3' 时存在）
  s3AccessKeyId?: string
  s3SecretAccessKey?: string
  s3Bucket?: string
  s3Region?: string
  s3Endpoint?: string
  s3BaseUrl?: string
  s3ForcePathStyle?: boolean
  // 本地存储配置（仅当 type === 'local' 时存在）
  localBasePath?: string
  createdAt: string
  updatedAt: string
}

// 存储策略创建请求 DTO（基于 dtos.StorageStrategyDTO）
export interface StorageStrategyCreateRequest {
  name: string
  type: StorageType
  isEnabled: boolean
  s3Config?: S3Config
  localConfig?: LocalConfig
}

// 存储策略更新请求 DTO
export interface StorageStrategyUpdateRequest {
  name?: string
  type?: StorageType
  isEnabled?: boolean
  s3Config?: S3Config
  localConfig?: LocalConfig
}

// 存储策略测试连接请求（基于 dtos.S3ConfigDTO）
export interface StorageStrategyTestRequest {
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  region: string
  endpoint: string
  baseUrl?: string
  forcePathStyle?: boolean
}

// 存储策略响应接口（用于列表展示）
export interface StorageStrategyResponse {
  id: number
  name: string
  type: StorageType
  isEnabled: boolean
  createdAt: string
  updatedAt: string
  // 脱敏后的配置信息用于展示
  configSummary?: string
}

// 存储策略详情响应（包含完整配置，敏感信息已脱敏）
export interface StorageStrategyDetailResponse extends StorageStrategy {
  // 脱敏后的敏感信息
  maskedSecretAccessKey?: string
}

// 分页查询参数
export interface StorageStrategyQueryParams {
  page?: number
  pageSize?: number
  type?: StorageType
  isEnabled?: boolean
  name?: string
}

// 存储策略列表响应
export interface StorageStrategyListResponse {
  data: StorageStrategyResponse[]
  meta: {
    page: number
    pageSize: number
    total: number
  }
}

// 角色-存储策略关联接口
export interface RoleStorageStrategyAssociation {
  roleId: number
  storageStrategyId: number
  createdAt: string
}

// 用户可用存储策略接口（基于 dtos.StorageStrategyDTO）
export interface UserAvailableStorageStrategy {
  id: number
  name: string
  type: StorageType
  isEnabled: boolean
}

// 存储策略统计信息
export interface StorageStrategyStats {
  totalStrategies: number
  enabledStrategies: number
  s3Strategies: number
  localStrategies: number
}

// 表单状态接口
export interface StorageStrategyFormData {
  name: string
  type: StorageType
  isEnabled: boolean
  // S3 配置
  s3AccessKeyId: string
  s3SecretAccessKey: string
  s3Bucket: string
  s3Region: string
  s3Endpoint: string
  s3BaseUrl: string
  s3ForcePathStyle: boolean
  // 本地配置
  localBasePath: string
}

// 存储策略操作类型
export type StorageStrategyAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'enable'
  | 'disable'
  | 'test'
  | 'view'

// 存储策略错误类型
export interface StorageStrategyError {
  code: string
  message: string
  field?: string
}

// 存储策略测试结果
export interface StorageStrategyTestResult {
  success: boolean
  message: string
  details?: string
}