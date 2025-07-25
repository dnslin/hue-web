// lib/store/images/index.ts
// 图片状态管理统一导出和hooks

import { useCallback, useEffect, useMemo } from "react";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// 导出所有状态和类型
export * from "./data";
export * from "./filter";
export * from "./cache";
export * from "./selection";

// 导出组合状态管理
import { 
  createImageDataSlice, 
  type ImageDataState, 
  type ImageDataActions 
} from "./data";
import { 
  useImageFilterStore,
  useHasActiveFilters,
  useActiveFiltersCount 
} from "./filter";
import { 
  useImageCacheStore,
  setupCacheCleanup 
} from "./cache";
import { ImageItem, ImageViewMode, ImageSortBy } from "@/lib/types/image";

/**
 * 主要的图片管理 Store
 * 结合了数据管理、筛选和缓存功能
 */
export const useImageStore = create<ImageDataState & ImageDataActions>()(
  subscribeWithSelector(createImageDataSlice)
);

// --- 便捷的 hooks ---

/**
 * 获取图片列表数据和加载状态
 */
export const useImageListData = () => {
  const images = useImageStore((state) => state.images);
  const total = useImageStore((state) => state.total);
  const loading = useImageStore((state) => state.loading);
  const error = useImageStore((state) => state.error);
  const loadingMore = useImageStore((state) => state.loadingMore);
  const hasMore = useImageStore((state) => state.hasMore);
  
  return { images, total, loading, error, loadingMore, hasMore };
};

/**
 * 获取图片列表操作方法
 */
export const useImageListActions = () => {
  const fetchImages = useImageStore((state) => state.fetchImages);
  const loadMoreImages = useImageStore((state) => state.loadMoreImages);
  const refreshImages = useImageStore((state) => state.refreshImages);
  const addImage = useImageStore((state) => state.addImage);
  const updateImage = useImageStore((state) => state.updateImage);
  const removeImage = useImageStore((state) => state.removeImage);
  const removeImages = useImageStore((state) => state.removeImages);
  const getImageById = useImageStore((state) => state.getImageById);
  
  return { 
    fetchImages, 
    loadMoreImages, 
    refreshImages, 
    addImage, 
    updateImage, 
    removeImage, 
    removeImages, 
    getImageById 
  };
};

/**
 * 获取筛选器状态和操作
 */
export const useImageFilters = () => {
  const store = useImageFilterStore();
  return {
    // 状态
    filters: store.filters,
    pagination: store.pagination,
    view: store.view,
    
    // 操作
    setFilters: store.setFilters,
    setPagination: store.setPagination,
    setView: store.setView,
    resetFilters: store.resetFilters,
    goToPage: store.goToPage,
    toggleSortOrder: store.toggleSortOrder,
    setSorting: store.setSorting,
    setViewMode: store.setViewMode,
    getApiParams: store.getApiParams,
  };
};

/**
 * 获取缓存管理功能
 */
export const useImageCache = () => {
  const store = useImageCacheStore();
  return {
    // 获取缓存数据
    getImageDimensions: store.getImageDimensions,
    getImagePreview: store.getImagePreview,
    getImageMetadata: store.getImageMetadata,
    
    // 缓存数据
    cacheImageDimensions: store.cacheImageDimensions,
    cacheImagePreview: store.cacheImagePreview,
    cacheImageMetadata: store.cacheImageMetadata,
    cacheFromImageItem: store.cacheFromImageItem,
    batchCacheFromImageItems: store.batchCacheFromImageItems,
    
    // 缓存管理
    clearImageCache: store.clearImageCache,
    clearAllCache: store.clearAllCache,
    getCacheStats: store.getCacheStats,
  };
};

/**
 * 检查是否有激活的筛选条件
 */
export { useHasActiveFilters };

/**
 * 获取激活的筛选条件数量
 */
export { useActiveFiltersCount };

/**
 * 图片选择管理 hook
 */
export const useImageSelection = () => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  const selectImage = useCallback((imageId: number) => {
    setSelectedIds(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  }, []);
  
  const selectAll = useCallback(() => {
    const { images } = useImageStore.getState();
    setSelectedIds(images.map(image => image.id));
  }, []);
  
  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);
  
  const isSelected = useCallback((imageId: number) => {
    return selectedIds.includes(imageId);
  }, [selectedIds]);
  
  const getSelectedImages = useCallback(() => {
    const { images } = useImageStore.getState();
    return images.filter(image => selectedIds.includes(image.id));
  }, [selectedIds]);
  
  return {
    selectedIds,
    selectedCount: selectedIds.length,
    selectImage,
    selectAll,
    deselectAll,
    isSelected,
    getSelectedImages,
  };
};

/**
 * 图片统计信息 hook
 */
export const useImageStats = () => {
  const { images, total } = useImageListData();
  
  return useMemo(() => {
    const totalSize = images.reduce((sum, image) => sum + image.size, 0);
    const averageSize = images.length > 0 ? totalSize / images.length : 0;
    const totalViews = images.reduce((sum, image) => sum + image.viewCount, 0);
    const totalDownloads = images.reduce((sum, image) => sum + image.downloadCount, 0);
    
    // 按文件类型统计
    const typeStats = images.reduce((stats, image) => {
      const type = image.mimeType;
      stats[type] = (stats[type] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);
    
    return {
      currentPageCount: images.length,
      totalCount: total,
      totalSize,
      averageSize,
      totalViews,
      totalDownloads,
      typeStats,
    };
  }, [images, total]);
};

/**
 * 图片懒加载 hook
 */
export const useImageLazyLoading = () => {
  const { loadMoreImages } = useImageListActions();
  const { hasMore, loadingMore } = useImageListData();
  
  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore) {
      loadMoreImages();
    }
  }, [hasMore, loadingMore, loadMoreImages]);
  
  return { loadMore, hasMore, loadingMore };
};

/**
 * 图片搜索 hook
 */
export const useImageSearch = () => {
  const { filters, setFilters } = useImageFilters();
  
  const searchImages = useCallback((query: string) => {
    setFilters({ search: query.trim() || undefined });
  }, [setFilters]);
  
  const clearSearch = useCallback(() => {
    setFilters({ search: undefined });
  }, [setFilters]);
  
  return {
    searchQuery: filters.search || "",
    searchImages,
    clearSearch,
    hasSearch: Boolean(filters.search?.trim()),
  };
};

/**
 * 图片排序 hook
 */
export const useImageSorting = () => {
  const { view, setSorting, toggleSortOrder } = useImageFilters();
  
  const sortBy = (field: ImageSortBy, order?: "asc" | "desc") => {
    setSorting(field, order);
  };
  
  const toggleOrder = () => {
    toggleSortOrder();
  };
  
  return {
    currentSort: view.sortBy,
    currentOrder: view.order,
    sortBy,
    toggleOrder,
  };
};

/**
 * 图片视图模式 hook
 */
export const useImageViewMode = () => {
  const { view, setViewMode } = useImageFilters();
  
  const changeViewMode = useCallback((mode: ImageViewMode) => {
    setViewMode(mode);
  }, [setViewMode]);
  
  return {
    currentViewMode: view.viewMode,
    changeViewMode,
    isGridView: view.viewMode === ImageViewMode.GRID,
    isListView: view.viewMode === ImageViewMode.LIST,
    isWaterfallView: view.viewMode === ImageViewMode.WATERFALL,
  };
};

/**
 * 图片管理初始化 hook
 * 在页面组件中使用，负责初始化各种状态管理
 */
export const useImageManagerInit = () => {
  useEffect(() => {
    // 初始化图片数据管理
    const { initialize } = useImageStore.getState();
    initialize();
    
    // 设置缓存清理
    const cleanupCache = setupCacheCleanup();
    
    return () => {
      cleanupCache();
    };
  }, []);
};

/**
 * 图片详情 hook
 */
export const useImageDetail = (imageId: number) => {
  const getImageById = useImageStore(state => state.getImageById);
  const updateImage = useImageStore(state => state.updateImage);
  const { getImageMetadata, cacheImageMetadata } = useImageCache();
  
  const image = getImageById(imageId);
  const cachedMetadata = getImageMetadata(imageId);
  
  const updateImageDetails = useCallback((updates: Partial<ImageItem>) => {
    updateImage(imageId, updates);
    
    // 更新缓存
    if (updates.viewCount !== undefined || updates.downloadCount !== undefined) {
      cacheImageMetadata(imageId, {
        mimeType: image?.mimeType || "",
        uploadedAt: image?.uploadedAt || "",
        uploaderUsername: image?.uploaderUsername,
        viewCount: updates.viewCount ?? image?.viewCount ?? 0,
        downloadCount: updates.downloadCount ?? image?.downloadCount ?? 0,
      });
    }
  }, [imageId, image, updateImage, cacheImageMetadata]);
  
  return {
    image,
    cachedMetadata,
    updateImageDetails,
    exists: Boolean(image),
  };
};

// 导入必要的依赖
import { useState } from "react";