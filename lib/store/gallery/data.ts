// lib/store/gallery/data.ts
// 瀑布流画廊数据状态管理

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GalleryImageItem, GalleryQueryParams } from '@/lib/types/gallery';
import type { PaginationMeta } from '@/lib/types/common';

/**
 * 画廊数据状态接口
 */
export interface GalleryDataState {
  // 数据状态
  images: GalleryImageItem[];
  totalCount: number;
  pagination: PaginationMeta | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  lastFetchTime: number;
  hasMore: boolean;

  // 查询状态
  currentQuery: GalleryQueryParams;
  
  // 数据操作方法
  setImages: (images: GalleryImageItem[], totalCount?: number) => void;
  addImages: (images: GalleryImageItem[], hasMore?: boolean) => void;
  updateImage: (id: number, updates: Partial<GalleryImageItem>) => void;
  removeImage: (id: number) => void;
  removeImages: (ids: number[]) => void;
  
  // 状态操作方法
  setPagination: (pagination: PaginationMeta) => void;
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loadingMore: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setCurrentQuery: (query: GalleryQueryParams) => void;
  
  // 清理方法
  clearError: () => void;
  clearImages: () => void;
  resetData: () => void;
  updateLastFetchTime: () => void;
}

/**
 * 初始状态
 */
const initialState = {
  images: [],
  totalCount: 0,
  pagination: null,
  loading: false,
  loadingMore: false,
  error: null,
  lastFetchTime: 0,
  hasMore: true,
  currentQuery: {
    page: 1,
    pageSize: 20,
    sortBy: 'created_at' as const,
    order: 'desc' as const,
    filters: {},
  },
};

/**
 * 瀑布流画廊数据 Store
 */
export const useGalleryDataStore = create<GalleryDataState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 设置图片列表（替换现有数据）
      setImages: (images: GalleryImageItem[], totalCount?: number) => {
        set({ 
          images,
          totalCount: totalCount ?? images.length,
          error: null,
          lastFetchTime: Date.now(),
          hasMore: totalCount ? images.length < totalCount : true,
        });
      },

      // 添加图片到列表（用于分页加载）
      addImages: (newImages: GalleryImageItem[], hasMore = true) => {
        const { images } = get();
        const existingIds = new Set(images.map(img => img.id));
        const uniqueNewImages = newImages.filter(img => !existingIds.has(img.id));
        
        set({ 
          images: [...images, ...uniqueNewImages],
          totalCount: Math.max(get().totalCount, images.length + uniqueNewImages.length),
          hasMore,
          lastFetchTime: Date.now(),
        });
      },

      // 更新单个图片信息
      updateImage: (id: number, updates: Partial<GalleryImageItem>) => {
        const { images } = get();
        
        set({
          images: images.map(img => 
            img.id === id ? { ...img, ...updates } : img
          ),
        });
      },

      // 移除单个图片
      removeImage: (id: number) => {
        const { images, totalCount } = get();
        const filteredImages = images.filter(img => img.id !== id);
        
        set({
          images: filteredImages,
          totalCount: Math.max(0, totalCount - 1),
        });
      },

      // 批量移除图片
      removeImages: (ids: number[]) => {
        const { images, totalCount } = get();
        const idsSet = new Set(ids);
        const filteredImages = images.filter(img => !idsSet.has(img.id));
        
        set({
          images: filteredImages,
          totalCount: Math.max(0, totalCount - ids.length),
        });
      },

      // 设置分页信息
      setPagination: (pagination: PaginationMeta) => {
        set({ pagination });
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ loading });
      },

      // 设置加载更多状态
      setLoadingMore: (loadingMore: boolean) => {
        set({ loadingMore });
      },

      // 设置错误
      setError: (error: string | null) => {
        set({ error, loading: false, loadingMore: false });
      },

      // 设置是否还有更多数据
      setHasMore: (hasMore: boolean) => {
        set({ hasMore });
      },

      // 设置当前查询参数
      setCurrentQuery: (query: GalleryQueryParams) => {
        set({ currentQuery: query });
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 清空图片列表
      clearImages: () => {
        set({ 
          images: [], 
          totalCount: 0,
          pagination: null,
          hasMore: true,
        });
      },

      // 重置所有数据
      resetData: () => {
        set(initialState);
      },

      // 更新最后获取时间
      updateLastFetchTime: () => {
        set({ lastFetchTime: Date.now() });
      },
    }),
    {
      name: 'hue-gallery-data',
      partialize: (state) => ({
        // 只持久化必要的状态
        lastFetchTime: state.lastFetchTime,
        currentQuery: state.currentQuery,
      }),
    }
  )
);

/**
 * 画廊数据存储实例（用于外部访问）
 */
export const galleryDataStore = useGalleryDataStore;

/**
 * 派生选择器
 */
export const galleryDataSelectors = {
  // 获取指定 ID 的图片
  getImageById: (id: number) => {
    return useGalleryDataStore.getState().images.find(img => img.id === id);
  },
  
  // 获取已加载的图片数量
  getLoadedCount: () => {
    return useGalleryDataStore.getState().images.length;
  },
  
  // 判断是否可以加载更多
  canLoadMore: () => {
    const state = useGalleryDataStore.getState();
    return state.hasMore && !state.loading && !state.loadingMore;
  },
  
  // 判断是否为空状态
  isEmpty: () => {
    const state = useGalleryDataStore.getState();
    return state.images.length === 0 && !state.loading;
  },
};