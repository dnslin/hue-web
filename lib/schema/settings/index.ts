// 基础设置
export { basicSettingSchema, type BasicSettingFormData } from "./basic";

// 邮件设置
export { emailSettingsSchema, type EmailSettingsFormData } from "./email";

// 图片设置
export {
  imageSettingsSchema,
  WATERMARK_POSITIONS,
  watermarkPositionOptions,
  imageFormatOptions,
  type ImageSettingsFormData,
} from "./image";

// 安全设置
export {
  securitySettingsSchema,
  type SecuritySettingsFormData,
} from "./security";
