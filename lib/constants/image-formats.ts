// lib/constants/image-formats.ts
// 图片格式相关常量定义

/**
 * 支持的图片格式定义（与后端保持一致）
 */
export const SUPPORTED_IMAGE_FORMATS = {
  "image/jpeg": "JPEG",
  "image/png": "PNG", 
  "image/gif": "GIF",
  "image/webp": "WebP",
  "image/x-canon-cr2": "Canon CR2",
  "image/tiff": "TIFF",
  "image/bmp": "BMP",
  "image/heif": "HEIF",
  "image/vnd.ms-photo": "Microsoft Photo",
  "image/vnd.adobe.photoshop": "Photoshop (PSD)",
  "image/vnd.microsoft.icon": "Icon (ICO)",
  "image/vnd.dwg": "AutoCAD Drawing",
  "image/avif": "AVIF",
} as const;

/**
 * 支持的图片MIME类型数组
 */
export const SUPPORTED_IMAGE_TYPES = Object.keys(SUPPORTED_IMAGE_FORMATS) as (keyof typeof SUPPORTED_IMAGE_FORMATS)[];

/**
 * 图片格式显示名称映射
 */
export const IMAGE_FORMAT_NAMES = SUPPORTED_IMAGE_FORMATS;

/**
 * 常见的图片格式（用于UI展示优先顺序）
 */
export const COMMON_IMAGE_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
] as const;

/**
 * RAW格式图片
 */
export const RAW_IMAGE_FORMATS = [
  'image/x-canon-cr2',
] as const;

/**
 * 专业格式图片
 */
export const PROFESSIONAL_IMAGE_FORMATS = [
  'image/tiff',
  'image/vnd.adobe.photoshop',
  'image/vnd.ms-photo',
] as const;

/**
 * 检查MIME类型是否为支持的图片格式
 * @param mimeType MIME类型
 * @returns 是否支持
 */
export function isSupportedImageFormat(mimeType: string): mimeType is keyof typeof SUPPORTED_IMAGE_FORMATS {
  return mimeType in SUPPORTED_IMAGE_FORMATS;
}

/**
 * 获取图片格式的显示名称
 * @param mimeType MIME类型
 * @returns 显示名称
 */
export function getImageFormatName(mimeType: string): string {
  if (isSupportedImageFormat(mimeType)) {
    return SUPPORTED_IMAGE_FORMATS[mimeType];
  }
  return mimeType;
}

/**
 * 检查是否为RAW格式
 * @param mimeType MIME类型
 * @returns 是否为RAW格式
 */
export function isRawImageFormat(mimeType: string): boolean {
  return RAW_IMAGE_FORMATS.includes(mimeType as any);
}

/**
 * 检查是否为常见格式
 * @param mimeType MIME类型
 * @returns 是否为常见格式
 */
export function isCommonImageFormat(mimeType: string): boolean {
  return COMMON_IMAGE_FORMATS.includes(mimeType as any);
}

/**
 * 文件扩展名到MIME类型的映射
 */
export const FILE_EXTENSION_TO_MIME: Record<string, string> = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'cr2': 'image/x-canon-cr2',
  'tiff': 'image/tiff',
  'tif': 'image/tiff',
  'bmp': 'image/bmp',
  'heif': 'image/heif',
  'heic': 'image/heif',
  'psd': 'image/vnd.adobe.photoshop',
  'ico': 'image/vnd.microsoft.icon',
  'dwg': 'image/vnd.dwg',
  'avif': 'image/avif',
};

/**
 * 从文件名获取MIME类型
 * @param filename 文件名
 * @returns MIME类型或null
 */
export function getMimeTypeFromFilename(filename: string): string | null {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (!extension) return null;
  
  return FILE_EXTENSION_TO_MIME[extension] || null;
}