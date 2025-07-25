// lib/store/images/cache.ts
// 图片缓存管理状态

import { create } from "zustand";
import { ImageItem, ImageCacheConfig, IMAGE_CONSTANTS } from "@/lib/types/image";

/**
 * 图片尺寸信息缓存项
 */
interface ImageDimensionsCache {
  width: number;
  height: number;
  aspectRatio: number;
  size: number; // 文件大小
  lastAccessed: number; // 最后访问时间
}

/**
 * 图片预览缓存项
 */
interface ImagePreviewCache {
  thumbnailUrl: string;
  base64Data?: string; // Base64编码的预览数据
  lastAccessed: number;
}

/**
 * 图片元数据缓存项
 */
interface ImageMetadataCache {
  mimeType: string;
  uploadedAt: string;
  uploaderUsername?: string;
  viewCount: number;
  downloadCount: number;
  lastAccessed: number;
}

/**
 * 图片缓存状态
 */
interface ImageCacheState {
  /**
   * 图片尺寸信息缓存
   */
  dimensionsCache: Map<number, ImageDimensionsCache>;
  
  /**
   * 图片预览缓存
   */
  previewCache: Map<number, ImagePreviewCache>;
  
  /**
   * 图片元数据缓存
   */
  metadataCache: Map<number, ImageMetadataCache>;
  
  /**
   * 缓存配置
   */
  config: ImageCacheConfig;
  
  /**
   * 缓存统计信息
   */
  stats: {
    dimensionsHitCount: number;
    previewHitCount: number;
    metadataHitCount: number;
    totalRequests: number;
  };
}

/**
 * 图片缓存操作
 */
interface ImageCacheActions {
  // --- 尺寸缓存相关 ---
  
  /**
   * 获取图片尺寸信息
   */
  getImageDimensions: (imageId: number) => ImageDimensionsCache | undefined;
  
  /**
   * 缓存图片尺寸信息
   */
  cacheImageDimensions: (imageId: number, dimensions: Omit<ImageDimensionsCache, 'lastAccessed'>) => void;
  
  /**
   * 批量缓存图片尺寸信息
   */
  batchCacheImageDimensions: (items: Array<{ imageId: number; dimensions: Omit<ImageDimensionsCache, 'lastAccessed'> }>) => void;
  
  // --- 预览缓存相关 ---
  
  /**
   * 获取图片预览数据
   */
  getImagePreview: (imageId: number) => ImagePreviewCache | undefined;
  
  /**
   * 缓存图片预览数据
   */
  cacheImagePreview: (imageId: number, preview: Omit<ImagePreviewCache, 'lastAccessed'>) => void;
  
  /**
   * 批量缓存图片预览数据
   */
  batchCacheImagePreviews: (items: Array<{ imageId: number; preview: Omit<ImagePreviewCache, 'lastAccessed'> }>) => void;
  
  // --- 元数据缓存相关 ---
  
  /**
   * 获取图片元数据
   */
  getImageMetadata: (imageId: number) => ImageMetadataCache | undefined;
  
  /**
   * 缓存图片元数据
   */
  cacheImageMetadata: (imageId: number, metadata: Omit<ImageMetadataCache, 'lastAccessed'>) => void;
  
  /**
   * 从图片项批量缓存所有信息
   */
  cacheFromImageItem: (image: ImageItem) => void;
  
  /**
   * 从图片项数组批量缓存所有信息
   */
  batchCacheFromImageItems: (images: ImageItem[]) => void;
  
  // --- 缓存管理相关 ---
  
  /**
   * 清理过期缓存
   */
  cleanupExpiredCache: () => void;
  
  /**
   * 清理指定图片的所有缓存
   */
  clearImageCache: (imageId: number) => void;
  
  /**
   * 清理所有缓存
   */
  clearAllCache: () => void;
  
  /**
   * 获取缓存统计信息
   */
  getCacheStats: () => {
    dimensionsCount: number;
    previewCount: number;
    metadataCount: number;
    totalMemoryUsage: number; // 预估内存使用量(MB)
    hitRate: number; // 缓存命中率
  };
  
  /**
   * 更新缓存配置
   */
  updateConfig: (newConfig: Partial<ImageCacheConfig>) => void;
  
  /**
   * 检查缓存是否需要清理
   */
  shouldCleanup: () => boolean;
}

/**
 * 图片缓存管理 Store
 */
export const useImageCacheStore = create<ImageCacheState & ImageCacheActions>((set, get) => ({
  // 初始状态
  dimensionsCache: new Map(),
  previewCache: new Map(),
  metadataCache: new Map(),
  config: IMAGE_CONSTANTS.DEFAULT_CACHE_CONFIG,
  stats: {
    dimensionsHitCount: 0,
    previewHitCount: 0,
    metadataHitCount: 0,
    totalRequests: 0,
  },

  // --- 尺寸缓存操作 ---

  getImageDimensions: (imageId) => {
    const cache = get().dimensionsCache.get(imageId);
    if (cache) {
      // 更新访问时间
      cache.lastAccessed = Date.now();
      set((state) => ({
        stats: {
          ...state.stats,
          dimensionsHitCount: state.stats.dimensionsHitCount + 1,
          totalRequests: state.stats.totalRequests + 1,
        },
      }));
    } else {
      set((state) => ({
        stats: {
          ...state.stats,
          totalRequests: state.stats.totalRequests + 1,
        },
      }));
    }
    return cache;
  },

  cacheImageDimensions: (imageId, dimensions) => {
    set((state) => {
      const newCache = new Map(state.dimensionsCache);
      newCache.set(imageId, {
        ...dimensions,
        lastAccessed: Date.now(),
      });
      return { dimensionsCache: newCache };
    });
  },

  batchCacheImageDimensions: (items) => {
    set((state) => {
      const newCache = new Map(state.dimensionsCache);
      const now = Date.now();
      
      items.forEach(({ imageId, dimensions }) => {
        newCache.set(imageId, {
          ...dimensions,
          lastAccessed: now,
        });
      });
      
      return { dimensionsCache: newCache };
    });
  },

  // --- 预览缓存操作 ---

  getImagePreview: (imageId) => {
    const cache = get().previewCache.get(imageId);
    if (cache) {
      cache.lastAccessed = Date.now();
      set((state) => ({
        stats: {
          ...state.stats,
          previewHitCount: state.stats.previewHitCount + 1,
          totalRequests: state.stats.totalRequests + 1,
        },
      }));
    } else {
      set((state) => ({
        stats: {
          ...state.stats,
          totalRequests: state.stats.totalRequests + 1,
        },
      }));
    }
    return cache;
  },

  cacheImagePreview: (imageId, preview) => {
    set((state) => {
      const newCache = new Map(state.previewCache);
      newCache.set(imageId, {
        ...preview,
        lastAccessed: Date.now(),
      });
      return { previewCache: newCache };
    });
  },

  batchCacheImagePreviews: (items) => {
    set((state) => {
      const newCache = new Map(state.previewCache);
      const now = Date.now();
      
      items.forEach(({ imageId, preview }) => {
        newCache.set(imageId, {
          ...preview,
          lastAccessed: now,
        });
      });
      
      return { previewCache: newCache };
    });
  },

  // --- 元数据缓存操作 ---

  getImageMetadata: (imageId) => {
    const cache = get().metadataCache.get(imageId);
    if (cache) {
      cache.lastAccessed = Date.now();
      set((state) => ({
        stats: {
          ...state.stats,
          metadataHitCount: state.stats.metadataHitCount + 1,
          totalRequests: state.stats.totalRequests + 1,
        },
      }));
    } else {
      set((state) => ({
        stats: {
          ...state.stats,
          totalRequests: state.stats.totalRequests + 1,
        },
      }));
    }
    return cache;
  },

  cacheImageMetadata: (imageId, metadata) => {
    set((state) => {
      const newCache = new Map(state.metadataCache);
      newCache.set(imageId, {
        ...metadata,
        lastAccessed: Date.now(),
      });
      return { metadataCache: newCache };
    });
  },

  // --- 综合缓存操作 ---

  cacheFromImageItem: (image) => {
    const now = Date.now();
    
    set((state) => {
      const newDimensionsCache = new Map(state.dimensionsCache);
      const newPreviewCache = new Map(state.previewCache);
      const newMetadataCache = new Map(state.metadataCache);

      // 缓存尺寸信息
      newDimensionsCache.set(image.id, {
        width: image.width,
        height: image.height,
        aspectRatio: image.width / image.height,
        size: image.size,
        lastAccessed: now,
      });

      // 缓存预览信息
      if (image.thumbnailUrl) {
        newPreviewCache.set(image.id, {
          thumbnailUrl: image.thumbnailUrl,
          lastAccessed: now,
        });
      }

      // 缓存元数据
      newMetadataCache.set(image.id, {
        mimeType: image.mimeType,
        uploadedAt: image.uploadedAt,
        uploaderUsername: image.uploaderUsername,
        viewCount: image.viewCount,
        downloadCount: image.downloadCount,
        lastAccessed: now,
      });

      return {
        dimensionsCache: newDimensionsCache,
        previewCache: newPreviewCache,
        metadataCache: newMetadataCache,
      };
    });
  },

  batchCacheFromImageItems: (images) => {
    const now = Date.now();
    
    set((state) => {
      const newDimensionsCache = new Map(state.dimensionsCache);
      const newPreviewCache = new Map(state.previewCache);
      const newMetadataCache = new Map(state.metadataCache);

      images.forEach((image) => {
        // 缓存尺寸信息
        newDimensionsCache.set(image.id, {
          width: image.width,
          height: image.height,
          aspectRatio: image.width / image.height,
          size: image.size,
          lastAccessed: now,
        });

        // 缓存预览信息
        if (image.thumbnailUrl) {
          newPreviewCache.set(image.id, {
            thumbnailUrl: image.thumbnailUrl,
            lastAccessed: now,
          });
        }

        // 缓存元数据
        newMetadataCache.set(image.id, {
          mimeType: image.mimeType,
          uploadedAt: image.uploadedAt,
          uploaderUsername: image.uploaderUsername,
          viewCount: image.viewCount,
          downloadCount: image.downloadCount,
          lastAccessed: now,
        });
      });

      return {
        dimensionsCache: newDimensionsCache,
        previewCache: newPreviewCache,
        metadataCache: newMetadataCache,
      };
    });
  },

  // --- 缓存管理操作 ---

  cleanupExpiredCache: () => {
    const { config } = get();
    const now = Date.now();

    set((state) => {
      const newDimensionsCache = new Map(state.dimensionsCache);
      const newPreviewCache = new Map(state.previewCache);
      const newMetadataCache = new Map(state.metadataCache);

      // 清理过期的尺寸缓存
      for (const [imageId, cache] of newDimensionsCache) {
        const ageHours = (now - cache.lastAccessed) / (1000 * 60 * 60);
        if (ageHours > config.dimensionsCacheDuration) {
          newDimensionsCache.delete(imageId);
        }
      }

      // 清理过期的预览缓存
      for (const [imageId, cache] of newPreviewCache) {
        const ageHours = (now - cache.lastAccessed) / (1000 * 60 * 60);
        if (ageHours > config.thumbnailCacheDuration) {
          newPreviewCache.delete(imageId);
        }
      }

      // 清理过期的元数据缓存
      for (const [imageId, cache] of newMetadataCache) {
        const ageHours = (now - cache.lastAccessed) / (1000 * 60 * 60);
        if (ageHours > config.metadataCacheDuration) {
          newMetadataCache.delete(imageId);
        }
      }

      return {
        dimensionsCache: newDimensionsCache,
        previewCache: newPreviewCache,
        metadataCache: newMetadataCache,
      };
    });
  },

  clearImageCache: (imageId) => {
    set((state) => {
      const newDimensionsCache = new Map(state.dimensionsCache);
      const newPreviewCache = new Map(state.previewCache);
      const newMetadataCache = new Map(state.metadataCache);

      newDimensionsCache.delete(imageId);
      newPreviewCache.delete(imageId);
      newMetadataCache.delete(imageId);

      return {
        dimensionsCache: newDimensionsCache,
        previewCache: newPreviewCache,
        metadataCache: newMetadataCache,
      };
    });
  },

  clearAllCache: () => {
    set({
      dimensionsCache: new Map(),
      previewCache: new Map(),
      metadataCache: new Map(),
      stats: {
        dimensionsHitCount: 0,
        previewHitCount: 0,
        metadataHitCount: 0,
        totalRequests: 0,
      },
    });
  },

  getCacheStats: () => {
    const { dimensionsCache, previewCache, metadataCache, stats } = get();
    
    // 预估内存使用量
    const avgImageDataSize = 0.001; // 1KB per cached item
    const totalMemoryUsage = 
      (dimensionsCache.size + previewCache.size + metadataCache.size) * avgImageDataSize;
    
    // 计算命中率
    const totalHits = stats.dimensionsHitCount + stats.previewHitCount + stats.metadataHitCount;
    const hitRate = stats.totalRequests > 0 ? (totalHits / stats.totalRequests) * 100 : 0;

    return {
      dimensionsCount: dimensionsCache.size,
      previewCount: previewCache.size,
      metadataCount: metadataCache.size,
      totalMemoryUsage,
      hitRate,
    };
  },

  updateConfig: (newConfig) => {
    set((state) => ({
      config: { ...state.config, ...newConfig },
    }));
  },

  shouldCleanup: () => {
    const { config } = get();
    const stats = get().getCacheStats();
    
    // 检查内存使用量是否超过限制
    const totalLimit = config.thumbnailCacheSize + config.dimensionsCacheSize + config.metadataCacheSize;
    return stats.totalMemoryUsage > totalLimit * 0.8; // 80% 阈值
  },
});

// 定期清理过期缓存的工具函数
export const setupCacheCleanup = () => {
  const cleanup = () => {
    const store = useImageCacheStore.getState();
    if (store.shouldCleanup()) {
      store.cleanupExpiredCache();
    }
  };

  // 每10分钟检查一次
  const intervalId = setInterval(cleanup, 10 * 60 * 1000);

  // 返回清理函数
  return () => clearInterval(intervalId);
};