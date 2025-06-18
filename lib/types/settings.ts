import { z } from "zod";

// ========== 基础站点设置 ==========
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
  createdAt: string;
  updatedAt: string;
}

export const basicSettingSchema = z.object({
  appName: z
    .string()
    .min(1, "应用名称不能为空")
    .max(100, "应用名称不能超过100个字符"),
  siteDescription: z.string().max(500, "站点描述不能超过500个字符").default(""),
  seoKeywords: z.string().max(200, "SEO关键词不能超过200个字符").default(""),
  logoURL: z
    .string()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "请输入有效的Logo URL",
    })
    .default(""),
  faviconURL: z
    .string()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "请输入有效的Favicon URL",
    })
    .default(""),
  siteAnnouncement: z
    .string()
    .max(1000, "站点公告不能超过1000个字符")
    .default(""),
  userRegistrationEnabled: z.boolean().default(true),
  adminApprovalRequired: z.boolean().default(false),
  emailVerificationRequired: z.boolean().default(true),
  guestUploadEnabled: z.boolean().default(false),
  userInitialStorageCapacityMB: z
    .number()
    .min(10, "初始存储容量不能少于10MB")
    .max(102400, "初始存储容量不能超过100GB")
    .default(1024),
});

export type BasicSettingFormData = z.infer<typeof basicSettingSchema>;

// ========== 邮件设置 ==========
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

export const emailSettingsSchema = z.object({
  fromEmailAddress: z.string().email("请输入有效的邮箱地址"),
  fromEmailName: z
    .string()
    .min(1, "发件人名称不能为空")
    .max(100, "发件人名称不能超过100个字符"),
  smtpServer: z.string().min(1, "SMTP服务器不能为空"),
  smtpPort: z
    .number()
    .min(1, "端口号必须大于0")
    .max(65535, "端口号不能超过65535")
    .default(587),
  smtpUsername: z.string().min(1, "SMTP用户名不能为空"),
  smtpPassword: z.string().min(1, "SMTP密码不能为空"),
  emailNotifyEnabled: z.boolean().default(true),
});

export type EmailSettingsFormData = z.infer<typeof emailSettingsSchema>;

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

export const imageSettingsSchema = z.object({
  uploadMaxSizeMB: z
    .number()
    .min(1, "最大上传大小不能少于1MB")
    .max(100, "最大上传大小不能超过100MB")
    .default(10),
  allowedImageFormats: z
    .string()
    .min(1, "允许的图片格式不能为空")
    .default("jpg,jpeg,png,gif,webp"),
  batchUploadLimit: z
    .number()
    .min(1, "批量上传限制不能少于1")
    .max(100, "批量上传限制不能超过100")
    .default(10),
  autoCompressEnabled: z.boolean().default(true),
  compressionQuality: z
    .number()
    .min(1, "压缩质量必须在1-100之间")
    .max(100, "压缩质量必须在1-100之间")
    .default(85),
  thumbnailEnabled: z.boolean().default(true),
  thumbnailWidth: z
    .number()
    .min(0, "缩略图宽度不能为负数")
    .max(8000, "缩略图宽度不能超过8000像素")
    .default(300),
  thumbnailHeight: z
    .number()
    .min(0, "缩略图高度不能为负数")
    .max(8000, "缩略图高度不能超过8000像素")
    .default(300),
  watermarkEnabled: z.boolean().default(false),
  watermarkPosition: z
    .enum([
      WATERMARK_POSITIONS.TOP_LEFT,
      WATERMARK_POSITIONS.TOP_CENTER,
      WATERMARK_POSITIONS.TOP_RIGHT,
      WATERMARK_POSITIONS.MIDDLE_LEFT,
      WATERMARK_POSITIONS.MIDDLE_CENTER,
      WATERMARK_POSITIONS.MIDDLE_RIGHT,
      WATERMARK_POSITIONS.BOTTOM_LEFT,
      WATERMARK_POSITIONS.BOTTOM_CENTER,
      WATERMARK_POSITIONS.BOTTOM_RIGHT,
    ])
    .default(WATERMARK_POSITIONS.BOTTOM_RIGHT),
  watermarkSourceFile: z.string().default(""),
  watermarkOpacity: z
    .number()
    .min(0, "水印透明度必须在0-1之间")
    .max(1, "水印透明度必须在0-1之间")
    .default(0.8),
  watermarkScaleRatio: z
    .number()
    .min(0.01, "水印缩放比例必须在0.01-1.0之间")
    .max(1.0, "水印缩放比例必须在0.01-1.0之间")
    .default(0.1),
  watermarkMarginX: z.number().min(0, "水印水平边距不能为负数").default(20),
  watermarkMarginY: z.number().min(0, "水印垂直边距不能为负数").default(20),
});

export type ImageSettingsFormData = z.infer<typeof imageSettingsSchema>;

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

export const securitySettingsSchema = z.object({
  passwordMinLength: z
    .number()
    .min(6, "密码最小长度不能少于6位")
    .max(64, "密码最小长度不能超过64位")
    .default(8),
  passwordRequiresUppercase: z.boolean().default(true),
  passwordRequiresLowercase: z.boolean().default(true),
  passwordRequiresNumber: z.boolean().default(true),
  passwordRequiresSpecialChar: z.boolean().default(false),
  loginMaxAttempts: z
    .number()
    .min(3, "最大登录尝试次数不能少于3次")
    .max(20, "最大登录尝试次数不能超过20次")
    .default(5),
  accountLockoutDurationMinutes: z
    .number()
    .min(5, "账户锁定时间不能少于5分钟")
    .max(1440, "账户锁定时间不能超过24小时")
    .default(30),
  ipWhitelist: z.string().default(""),
  ipBlacklist: z.string().default(""),
});

export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;

// ========== 统一设置类型 ==========
export interface AllSettingsData {
  basic: BasicSiteSetting | null;
  email: EmailSettings | null;
  image: ImageProcessingSetting | null;
  security: SecuritySetting | null;
}

// 设置更新请求类型
export interface UpdateSettingsRequest {
  basic?: Partial<BasicSettingFormData>;
  email?: Partial<EmailSettingsFormData>;
  image?: Partial<ImageSettingsFormData>;
  security?: Partial<SecuritySettingsFormData>;
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
