import { md5 } from "js-md5";

// 缓存接口定义
interface GravatarCache {
  hash: string;
  timestamp: number;
}

// 内存缓存，存储邮箱对应的 MD5 哈希值
const hashCache = new Map<string, GravatarCache>();

// 缓存有效期：1小时（毫秒）
const CACHE_DURATION = 60 * 60 * 1000;

/**
 * 生成邮箱的 MD5 哈希值（用于 Gravatar）
 * @param email 用户邮箱地址
 * @returns MD5 哈希字符串
 */
export function generateGravatarHash(email: string): string {
  if (!email || typeof email !== "string") {
    return "";
  }

  // 规范化邮箱：转小写并去除首尾空格
  const normalizedEmail = email.toLowerCase().trim();

  // 检查缓存
  const cached = hashCache.get(normalizedEmail);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.hash;
  }

  // 计算 MD5 哈希
  const hash = md5(normalizedEmail);

  // 存储到缓存
  hashCache.set(normalizedEmail, {
    hash,
    timestamp: now,
  });

  return hash;
}

/**
 * 生成 Gravatar 头像 URL
 * @param email 用户邮箱地址
 * @param size 头像尺寸（像素），默认 80
 * @param defaultImage 默认图片类型，默认 'identicon'
 * @param rating 内容评级，默认 'g'
 * @returns Gravatar URL
 */
export function getGravatarUrl(
  email: string,
  size: number = 80,
  defaultImage: string = "identicon",
  rating: string = "g"
): string {
  const hash = generateGravatarHash(email);

  if (!hash) {
    return "";
  }

  const params = new URLSearchParams({
    s: size.toString(),
    d: defaultImage,
    r: rating,
  });

  return `https://www.gravatar.com/avatar/${hash}?${params.toString()}`;
}

/**
 * 获取用户名的首字母（用作头像回退显示）
 * @param username 用户名
 * @returns 首字母（1-2个字符）
 */
export function getUserInitials(username: string): string {
  if (!username || typeof username !== "string") {
    return "?";
  }

  const trimmed = username.trim();
  if (!trimmed) {
    return "?";
  }

  // 处理中文用户名：取最后两个字符
  if (/[\u4e00-\u9fa5]/.test(trimmed)) {
    return trimmed.slice(-2);
  }

  // 处理英文用户名：取首字母，如果有空格则取前两个单词的首字母
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  return trimmed[0].toUpperCase();
}

/**
 * 生成 DiceBear 头像 URL（作为回退方案）
 * @param seed 种子字符串（通常是用户名）
 * @param style 头像风格，默认 'avataaars'
 * @returns DiceBear URL
 */
export function getDiceBearUrl(
  seed: string,
  style: string = "avataaars"
): string {
  if (!seed || typeof seed !== "string") {
    return "";
  }

  const encodedSeed = encodeURIComponent(seed.trim());
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodedSeed}`;
}

/**
 * 清理过期的缓存条目
 */
export function cleanExpiredCache(): void {
  const now = Date.now();

  for (const [email, cache] of hashCache.entries()) {
    if (now - cache.timestamp >= CACHE_DURATION) {
      hashCache.delete(email);
    }
  }
}

/**
 * 清空所有缓存
 */
export function clearAllCache(): void {
  hashCache.clear();
}

/**
 * 获取当前缓存统计信息（用于调试）
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: hashCache.size,
    entries: Array.from(hashCache.keys()),
  };
}
