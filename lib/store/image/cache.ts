// @/lib/store/image/image-cache.store.ts

import { StateCreator } from "zustand";
import { ImageResponse, ImageDetail } from "@/lib/types/image";
import { getImageDetailAction } from "@/lib/actions/images/image";
import { isSuccessApiResponse } from "@/lib/types/common";
import { handleStoreError } from "@/lib/utils/error-handler";

/**
 * 图片缓存状态
 * @description 管理图片详情的缓存，避免重复请求相同的图片数据。
 */
export interface ImageCacheState {
  /**
   * 图片详情缓存 - 使用图片ID作为键
   */
  imageDetailsCache: Record<number, ImageDetail>;
  /**
   * 正在加载的图片详情ID列表
   */
  loadingImageIds: Set<number>;
  /**
   * 缓存的错误信息
   */
  cacheErrors: Record<number, string | undefined>;
}

/**
 * 图片缓存操作
 * @description 定义了所有与图片缓存相关的操作。
 */
export interface ImageCacheActions {
  /**
   * 获取图片详情（带缓存）
   * @param id 图片ID
   * @returns 图片详情或错误信息
   */
  getImageDetail: (id: number) => Promise<ImageDetail | null>;
  /**
   * 清除指定图片的缓存
   * @param id 图片ID
   */
  clearImageCache: (id: number) => void;
  /**
   * 清除所有缓存
   */
  clearAllCache: () => void;
  /**
   * 预加载图片详情
   * @param id 图片ID
   */
  preloadImageDetail: (id: number) => Promise<void>;
  /**
   * 批量预加载图片详情
   * @param ids 图片ID列表
   */
  batchPreloadImageDetails: (ids: number[]) => Promise<void>;
  /**
   * 更新缓存中的图片信息
   * @param id 图片ID
   * @param updates 更新的图片信息
   */
  updateCachedImage: (id: number, updates: Partial<ImageResponse>) => void;
}

/**
 * Zustand Store Slice: ImageCache
 * @description 这个 Slice 包含了图片缓存的状态和所有相关操作的实现。
 */
export const createImageCacheSlice: StateCreator<
  ImageCacheState & ImageCacheActions,
  [],
  [],
  ImageCacheState & ImageCacheActions
> = (set, get) => ({
  // 初始状态
  imageDetailsCache: {},
  loadingImageIds: new Set(),
  cacheErrors: {},

  getImageDetail: async (id: number) => {
    const state = get();
    
    // 如果缓存中已存在，直接返回
    if (state.imageDetailsCache[id]) {
      return state.imageDetailsCache[id];
    }

    // 如果正在加载，返回 null
    if (state.loadingImageIds.has(id)) {
      return null;
    }

    // 开始加载
    set((state) => ({
      loadingImageIds: new Set([...state.loadingImageIds, id]),
    }));

    try {
      const response = await getImageDetailAction(id);

      if (isSuccessApiResponse(response)) {
        const imageDetail = response.data as ImageDetail;
        
        // 更新缓存
        set((state) => ({
          imageDetailsCache: {
            ...state.imageDetailsCache,
            [id]: imageDetail,
          },
          loadingImageIds: new Set(
            [...state.loadingImageIds].filter((loadingId) => loadingId !== id)
          ),
          cacheErrors: {
            ...state.cacheErrors,
            [id]: undefined,
          },
        }));

        return imageDetail;
      } else {
        // 处理错误
        console.error(`❌ 获取图片详情失败 (ID: ${id}):`, response.msg);
        const errorResult = await handleStoreError(response, `获取图片详情 (ID: ${id})`);
        
        set((state) => ({
          loadingImageIds: new Set(
            [...state.loadingImageIds].filter((loadingId) => loadingId !== id)
          ),
          cacheErrors: {
            ...state.cacheErrors,
            [id]: errorResult.error,
          },
        }));

        return null;
      }
    } catch (error) {
      console.error(`❌ 获取图片详情时发生未知错误 (ID: ${id}):`, error);
      const errorResult = await handleStoreError(error, `获取图片详情 (ID: ${id})`);
      
      set((state) => ({
        loadingImageIds: new Set(
          [...state.loadingImageIds].filter((loadingId) => loadingId !== id)
        ),
        cacheErrors: {
          ...state.cacheErrors,
          [id]: errorResult.error,
        },
      }));

      return null;
    }
  },

  clearImageCache: (id: number) => {
    set((state) => {
      const newCache = { ...state.imageDetailsCache };
      const newErrors = { ...state.cacheErrors };
      delete newCache[id];
      delete newErrors[id];
      
      return {
        imageDetailsCache: newCache,
        cacheErrors: newErrors,
      };
    });
  },

  clearAllCache: () => {
    set({
      imageDetailsCache: {},
      loadingImageIds: new Set(),
      cacheErrors: {},
    });
  },

  preloadImageDetail: async (id: number) => {
    await get().getImageDetail(id);
  },

  batchPreloadImageDetails: async (ids: number[]) => {
    const promises = ids.map((id) => get().preloadImageDetail(id));
    await Promise.allSettled(promises);
  },

  updateCachedImage: (id: number, updates: Partial<ImageResponse>) => {
    set((state) => {
      const cachedImage = state.imageDetailsCache[id];
      if (!cachedImage) {
        return state;
      }

      return {
        imageDetailsCache: {
          ...state.imageDetailsCache,
          [id]: {
            ...cachedImage,
            ...updates,
          },
        },
      };
    });
  },
});

import { createStore } from "zustand";

// 从 createImageCacheSlice 创建一个独立的 store 实例
export const imageCacheStore = createStore(createImageCacheSlice);