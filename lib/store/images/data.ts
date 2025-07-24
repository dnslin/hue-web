// lib/store/images/data.ts
// 图片数据状态管理

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ImageResponse, ImageDetail } from '@/lib/types/image';
import type { PaginationMeta } from '@/lib/types/common';

/**
 * 图片数据状态接口
 */
export interface ImageDataState {
  // 数据状态
  images: ImageResponse[];
  currentImage: ImageDetail | null;
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  lastFetchTime: number;

  // 数据操作方法
  setImages: (images: ImageResponse[]) => void;
  addImages: (images: ImageResponse[]) => void;
  removeImage: (id: number) => void;
  updateImage: (id: number, updates: Partial<ImageResponse>) => void;
  setCurrentImage: (image: ImageDetail | null) => void;
  setPagination: (pagination: PaginationMeta) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetData: () => void;
  updateLastFetchTime: () => void;
}

/**
 * 初始状态
 */
const initialState = {
  images: [],
  currentImage: null,
  pagination: null,
  loading: false,
  error: null,
  lastFetchTime: 0,
};

/**
 * 图片数据 Store
 */
export const useImageDataStore = create<ImageDataState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 设置图片列表
      setImages: (images: ImageResponse[]) => {
        set({ 
          images, 
          error: null,
          lastFetchTime: Date.now()
        });
      },

      // 添加图片到列表
      addImages: (newImages: ImageResponse[]) => {
        const { images } = get();
        const existingIds = new Set(images.map(img => img.id));
        const uniqueNewImages = newImages.filter(img => !existingIds.has(img.id));
        
        set({ 
          images: [...images, ...uniqueNewImages],
          lastFetchTime: Date.now()
        });
      },

      // 移除图片
      removeImage: (id: number) => {
        const { images, currentImage } = get();
        set({
          images: images.filter(img => img.id !== id),
          currentImage: currentImage?.id === id ? null : currentImage,
        });
      },

      // 更新图片信息
      updateImage: (id: number, updates: Partial<ImageResponse>) => {
        const { images, currentImage } = get();
        
        set({
          images: images.map(img => 
            img.id === id ? { ...img, ...updates } : img
          ),
          currentImage: currentImage?.id === id 
            ? { ...currentImage, ...updates } 
            : currentImage,
        });
      },

      // 设置当前图片
      setCurrentImage: (image: ImageDetail | null) => {
        set({ currentImage: image });
      },

      // 设置分页信息
      setPagination: (pagination: PaginationMeta) => {
        set({ pagination });
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ loading });
      },

      // 设置错误
      setError: (error: string | null) => {
        set({ error, loading: false });
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 重置数据
      resetData: () => {
        set(initialState);
      },

      // 更新最后获取时间
      updateLastFetchTime: () => {
        set({ lastFetchTime: Date.now() });
      },
    }),
    {
      name: 'hue-image-data',
      partialize: (state) => ({
        // 只持久化部分状态，避免存储过多数据
        lastFetchTime: state.lastFetchTime,
      }),
    }
  )
);

/**
 * 图片数据存储实例（用于外部访问）
 */
export const imageDataStore = useImageDataStore;