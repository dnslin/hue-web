import type { SuccessApiResponse, ErrorApiResponse } from "./common";
// ========== 基础站点设置 ==========

/**
 * 基础站点设置 - 对应后端 models.BasicSiteSetting
 */
export interface BasicSiteSetting {
  id: number;
  appName: string;
  siteDescription: string;
  seoKeywords: string;
  logoURL: string;
  faviconURL: string;
  siteAnnouncement: string;
  userRegistrationEnabled: boolean;
  adminApprovalRequired: boolean;
  emailVerificationRequired: boolean;
  guestUploadEnabled: boolean;
  userInitialStorageCapacityMB: number;
  notifyAdminOnPendingApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 管理员基础站点设置DTO - 对应后端 dtos.AdminBasicSiteSettingsDTO
 */
export interface AdminBasicSiteSettingsDTO {
  id: number;
  appName: string;
  siteDescription: string;
  seoKeywords: string;
  logoUrl: string;
  faviconUrl: string;
  siteAnnouncement: string;
  userRegistrationEnabled: boolean;
  adminApprovalRequired: boolean;
  emailVerificationRequired: boolean;
  guestUploadEnabled: boolean;
  userInitialStorageCapacityMb: number;
  notifyAdminOnPendingApproval: boolean;
  emailNotifyEnabled: boolean;
  fromEmailAddress: string;
  fromEmailName: string;
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  isSmtpPasswordSet: boolean; // 指示SMTP密码是否已设置
  createdAt: string;
  updatedAt: string;
}

/**
 * 公共站点设置DTO - 对应后端 dtos.PublicSiteDetailsDTO
 */
export interface PublicSiteDetailsDTO {
  appName: string;
  logoUrl: string;
  faviconUrl: string;
  siteDescription: string;
  siteAnnouncement: string;
}

// ========== 邮件设置 ==========

/**
 * 邮件设置更新DTO - 对应后端 dtos.UpdateEmailSettingsDTO
 */
export interface UpdateEmailSettingsDTO {
  emailNotifyEnabled?: boolean;
  fromEmailAddress?: string;
  fromEmailName?: string;
  smtpServer?: string;
  smtpPort?: number;
  smtpUsername?: string;
  smtpPassword?: string; // 注意：密码应由后端加密处理
}

/**
 * 基础站点公共设置DTO - 对应后端 dtos.BasicSitePublicSettingsDTO
 */
export interface BasicSitePublicSettingsDTO {
  emailNotifyEnabledPublic: boolean;
  fromEmailAddressPublic: string;
  fromEmailNamePublic: string;
  smtpServerPublic: string;
  smtpPortPublic: number;
  smtpUsernamePublic: string;
}

/**
 * 邮件设置接口（前端使用）
 */
export interface EmailSettings {
  id: number;
  fromEmailAddress: string;
  fromEmailName: string;
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  emailNotifyEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// ========== 图片处理设置 ==========
export interface ImageProcessingSetting {
  id: number;
  uploadMaxSizeMB: number;
  allowedImageFormats: string;
  batchUploadLimit: number;
  autoCompressEnabled: boolean;
  compressionQuality: number;
  thumbnailEnabled: boolean;
  thumbnailWidth: number;
  thumbnailHeight: number;
  watermarkEnabled: boolean;
  watermarkPosition: string;
  watermarkSourceFile: string;
  watermarkOpacity: number;
  watermarkScaleRatio: number;
  watermarkMarginX: number;
  watermarkMarginY: number;
  createdAt: string;
  updatedAt: string;
}

// 水印位置选项（九宫格）
export const WATERMARK_POSITIONS = {
  TOP_LEFT: "top-left",
  TOP_CENTER: "top-center",
  TOP_RIGHT: "top-right",
  MIDDLE_LEFT: "middle-left",
  MIDDLE_CENTER: "middle-center",
  MIDDLE_RIGHT: "middle-right",
  BOTTOM_LEFT: "bottom-left",
  BOTTOM_CENTER: "bottom-center",
  BOTTOM_RIGHT: "bottom-right",
} as const;

export const watermarkPositionOptions = [
  { value: WATERMARK_POSITIONS.TOP_LEFT, label: "左上角" },
  { value: WATERMARK_POSITIONS.TOP_CENTER, label: "上方居中" },
  { value: WATERMARK_POSITIONS.TOP_RIGHT, label: "右上角" },
  { value: WATERMARK_POSITIONS.MIDDLE_LEFT, label: "左侧居中" },
  { value: WATERMARK_POSITIONS.MIDDLE_CENTER, label: "中心" },
  { value: WATERMARK_POSITIONS.MIDDLE_RIGHT, label: "右侧居中" },
  { value: WATERMARK_POSITIONS.BOTTOM_LEFT, label: "左下角" },
  { value: WATERMARK_POSITIONS.BOTTOM_CENTER, label: "下方居中" },
  { value: WATERMARK_POSITIONS.BOTTOM_RIGHT, label: "右下角" },
];

// ========== 安全设置 ==========
export interface SecuritySetting {
  id: number;
  passwordMinLength: number;
  passwordRequiresUppercase: boolean;
  passwordRequiresLowercase: boolean;
  passwordRequiresNumber: boolean;
  passwordRequiresSpecialChar: boolean;
  loginMaxAttempts: number;
  accountLockoutDurationMinutes: number;
  ipWhitelist: string;
  ipBlacklist: string;
  createdAt: string;
  updatedAt: string;
}

// ========== 统一设置类型 ==========
export interface AllSettingsData {
  basic: BasicSiteSetting | null;
  email: EmailSettings | null;
  image: ImageProcessingSetting | null;
  security: SecuritySetting | null;
}

// 设置类型枚举
export enum SettingType {
  BASIC = "basic",
  EMAIL = "email",
  IMAGE = "image",
  SECURITY = "security",
}

// Tab配置
export interface SettingTab {
  key: SettingType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ========== API响应类型 ==========

/**
 * 设置相关API响应类型
 */
export type SettingsActionResponse = SuccessApiResponse<any> | ErrorApiResponse;
export type BasicSettingsResponse =
  SuccessApiResponse<AdminBasicSiteSettingsDTO>;
export type PublicSettingsResponse = SuccessApiResponse<PublicSiteDetailsDTO>;
export type EmailSettingsResponse = SuccessApiResponse<UpdateEmailSettingsDTO>;
