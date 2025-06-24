import { z } from "zod";

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

/**
 * 图片设置表单验证Schema
 */
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

/**
 * 图片设置表单数据类型
 */
export type ImageSettingsFormData = z.infer<typeof imageSettingsSchema>;
