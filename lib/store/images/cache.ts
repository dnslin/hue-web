// lib/store/images/cache.ts
// 图片缓存状态管理

import { create } from 'zustand';
import type { ImageDetail } from '@/lib/types/image';

/**
 * 缓存项接口
 */
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * 图片缓存状态接口
 */
export interface ImageCacheState {
  // 缓存数据
  imageDetailsCache: Map<number, CacheItem<ImageDetail>>;
  thumbnailCache: Map<number, CacheItem<string>>;
  previewCache: Map<number, CacheItem<string>>;
  
  // 缓存配置
  detailCacheTTL: number; // 详情缓存时间（毫秒）
  thumbnailCacheTTL: number; // 缩略图缓存时间（毫秒）
  previewCacheTTL: number; // 预览图缓存时间（毫秒）
  maxCacheSize: number; // 最大缓存数量

  // 缓存操作方法
  cacheImageDetail: (id: number, detail: ImageDetail) => void;
  getCachedImageDetail: (id: number) => ImageDetail | null;
  
  cacheThumbnail: (id: number, dataUrl: string) => void;
  getCachedThumbnail: (id: number) => string | null;
  
  cachePreview: (id: number, dataUrl: string) => void;
  getCachedPreview: (id: number) => string | null;
  
  // 缓存管理
  clearExpiredCache: () => void;
  clearImageCache: (id: number) => void;
  clearAllCache: () => void;
  getCacheStats: () => {
    detailCount: number;
    thumbnailCount: number;
    previewCount: number;
    totalSize: number;
  };
  
  // 缓存验证
  isCacheExpired: (timestamp: number, ttl: number) => boolean;
  shouldEvictCache: () => boolean;
  evictOldestCache: () => void;
}

/**
 * 默认缓存配置
 */
const DEFAULT_CACHE_CONFIG = {
  detailCacheTTL: 10 * 60 * 1000, // 10分钟
  thumbnailCacheTTL: 30 * 60 * 1000, // 30分钟
  previewCacheTTL: 20 * 60 * 1000, // 20分钟
  maxCacheSize: 500, // 最多缓存500个项目
};

/**
 * 图片缓存 Store
 */
export const useImageCacheStore = create<ImageCacheState>((set, get) => ({
  // 初始状态
  imageDetailsCache: new Map(),
  thumbnailCache: new Map(),
  previewCache: new Map(),
  
  // 缓存配置
  ...DEFAULT_CACHE_CONFIG,

  // 缓存图片详情
  cacheImageDetail: (id: number, detail: ImageDetail) => {
    const { imageDetailsCache, detailCacheTTL, shouldEvictCache, evictOldestCache } = get();
    
    // 检查是否需要淘汰缓存
    if (shouldEvictCache()) {
      evictOldestCache();
    }
    
    const now = Date.now();
    const cacheItem: CacheItem<ImageDetail> = {
      data: detail,
      timestamp: now,
      expiresAt: now + detailCacheTTL,
    };
    
    const newCache = new Map(imageDetailsCache);
    newCache.set(id, cacheItem);
    
    set({ imageDetailsCache: newCache });
  },

  // 获取缓存的图片详情
  getCachedImageDetail: (id: number) => {
    const { imageDetailsCache, isCacheExpired, detailCacheTTL } = get();
    const cached = imageDetailsCache.get(id);
    
    if (!cached) return null;
    
    if (isCacheExpired(cached.timestamp, detailCacheTTL)) {
      // 缓存已过期，删除并返回null
      const newCache = new Map(imageDetailsCache);
      newCache.delete(id);
      set({ imageDetailsCache: newCache });
      return null;
    }
    
    return cached.data;
  },

  // 缓存缩略图
  cacheThumbnail: (id: number, dataUrl: string) => {
    const { thumbnailCache, thumbnailCacheTTL, shouldEvictCache, evictOldestCache } = get();
    
    if (shouldEvictCache()) {
      evictOldestCache();
    }
    
    const now = Date.now();
    const cacheItem: CacheItem<string> = {
      data: dataUrl,
      timestamp: now,
      expiresAt: now + thumbnailCacheTTL,
    };
    
    const newCache = new Map(thumbnailCache);
    newCache.set(id, cacheItem);
    
    set({ thumbnailCache: newCache });
  },

  // 获取缓存的缩略图
  getCachedThumbnail: (id: number) => {
    const { thumbnailCache, isCacheExpired, thumbnailCacheTTL } = get();
    const cached = thumbnailCache.get(id);
    
    if (!cached) return null;
    
    if (isCacheExpired(cached.timestamp, thumbnailCacheTTL)) {
      const newCache = new Map(thumbnailCache);
      newCache.delete(id);
      set({ thumbnailCache: newCache });
      return null;
    }
    
    return cached.data;
  },

  // 缓存预览图
  cachePreview: (id: number, dataUrl: string) => {
    const { previewCache, previewCacheTTL, shouldEvictCache, evictOldestCache } = get();
    
    if (shouldEvictCache()) {
      evictOldestCache();
    }
    
    const now = Date.now();
    const cacheItem: CacheItem<string> = {
      data: dataUrl,
      timestamp: now,
      expiresAt: now + previewCacheTTL,
    };
    
    const newCache = new Map(previewCache);
    newCache.set(id, cacheItem);
    
    set({ previewCache: newCache });
  },

  // 获取缓存的预览图
  getCachedPreview: (id: number) => {
    const { previewCache, isCacheExpired, previewCacheTTL } = get();
    const cached = previewCache.get(id);
    
    if (!cached) return null;
    
    if (isCacheExpired(cached.timestamp, previewCacheTTL)) {
      const newCache = new Map(previewCache);
      newCache.delete(id);
      set({ previewCache: newCache });
      return null;
    }
    
    return cached.data;
  },

  // 清理过期缓存
  clearExpiredCache: () => {
    const { 
      imageDetailsCache, 
      thumbnailCache, 
      previewCache,
      isCacheExpired,
      detailCacheTTL,
      thumbnailCacheTTL,
      previewCacheTTL
    } = get();
    
    // 清理详情缓存
    const newDetailsCache = new Map(imageDetailsCache);
    for (const [id, item] of newDetailsCache.entries()) {
      if (isCacheExpired(item.timestamp, detailCacheTTL)) {
        newDetailsCache.delete(id);
      }
    }
    
    // 清理缩略图缓存
    const newThumbnailCache = new Map(thumbnailCache);
    for (const [id, item] of newThumbnailCache.entries()) {
      if (isCacheExpired(item.timestamp, thumbnailCacheTTL)) {
        newThumbnailCache.delete(id);
      }
    }
    
    // 清理预览图缓存
    const newPreviewCache = new Map(previewCache);
    for (const [id, item] of newPreviewCache.entries()) {
      if (isCacheExpired(item.timestamp, previewCacheTTL)) {
        newPreviewCache.delete(id);
      }
    }
    
    set({
      imageDetailsCache: newDetailsCache,
      thumbnailCache: newThumbnailCache,
      previewCache: newPreviewCache,
    });
  },

  // 清理特定图片的所有缓存
  clearImageCache: (id: number) => {
    const { imageDetailsCache, thumbnailCache, previewCache } = get();
    
    const newDetailsCache = new Map(imageDetailsCache);
    const newThumbnailCache = new Map(thumbnailCache);
    const newPreviewCache = new Map(previewCache);
    
    newDetailsCache.delete(id);
    newThumbnailCache.delete(id);
    newPreviewCache.delete(id);
    
    set({
      imageDetailsCache: newDetailsCache,
      thumbnailCache: newThumbnailCache,
      previewCache: newPreviewCache,
    });
  },

  // 清理所有缓存
  clearAllCache: () => {
    set({
      imageDetailsCache: new Map(),
      thumbnailCache: new Map(),
      previewCache: new Map(),
    });
  },

  // 获取缓存统计
  getCacheStats: () => {
    const { imageDetailsCache, thumbnailCache, previewCache } = get();
    
    return {
      detailCount: imageDetailsCache.size,
      thumbnailCount: thumbnailCache.size,
      previewCount: previewCache.size,
      totalSize: imageDetailsCache.size + thumbnailCache.size + previewCache.size,
    };
  },

  // 检查缓存是否过期
  isCacheExpired: (timestamp: number, ttl: number) => {
    return Date.now() - timestamp > ttl;
  },

  // 检查是否需要淘汰缓存
  shouldEvictCache: () => {
    const { getCacheStats, maxCacheSize } = get();
    return getCacheStats().totalSize >= maxCacheSize;
  },

  // 淘汰最旧的缓存项
  evictOldestCache: () => {
    const { imageDetailsCache, thumbnailCache, previewCache } = get();
    
    // 找到最旧的项目
    let oldestTimestamp = Date.now();
    let oldestType: 'detail' | 'thumbnail' | 'preview' | null = null;
    let oldestId: number | null = null;
    
    // 检查详情缓存
    for (const [id, item] of imageDetailsCache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestType = 'detail';
        oldestId = id;
      }
    }
    
    // 检查缩略图缓存
    for (const [id, item] of thumbnailCache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestType = 'thumbnail';
        oldestId = id;
      }
    }
    
    // 检查预览图缓存
    for (const [id, item] of previewCache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestType = 'preview';
        oldestId = id;
      }
    }
    
    // 删除最旧的项目
    if (oldestType && oldestId !== null) {
      if (oldestType === 'detail') {
        const newCache = new Map(imageDetailsCache);
        newCache.delete(oldestId);
        set({ imageDetailsCache: newCache });
      } else if (oldestType === 'thumbnail') {
        const newCache = new Map(thumbnailCache);
        newCache.delete(oldestId);
        set({ thumbnailCache: newCache });
      } else if (oldestType === 'preview') {
        const newCache = new Map(previewCache);
        newCache.delete(oldestId);
        set({ previewCache: newCache });
      }
    }
  },
}));

/**
 * 图片缓存存储实例（用于外部访问）
 */
export const imageCacheStore = useImageCacheStore;