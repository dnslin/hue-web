// lib/store/images/filter.ts
// 图片筛选和分页状态管理

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { 
  ImageQueryParams, 
  ImageFilterParams, 
  ImageSortBy, 
  ImageViewMode,
  IMAGE_CONSTANTS 
} from "@/lib/types/image";
import type { SortOrder } from "@/lib/types/common";

/**
 * 图片筛选器状态（前端使用）
 */
export interface ImageFilters extends ImageFilterParams {
  /** 统一搜索字段，用于搜索文件名和描述 */
  search?: string;
}

/**
 * 图片分页状态
 */
export interface ImagePaginationState {
  page: number;
  pageSize: number;
}

/**
 * 图片视图配置状态
 */
export interface ImageViewState {
  viewMode: ImageViewMode;
  sortBy: ImageSortBy;
  order: SortOrder;
}

/**
 * 图片筛选器完整状态
 */
export interface ImageFilterState {
  filters: ImageFilters;
  pagination: ImagePaginationState;
  view: ImageViewState;
}

/**
 * 图片筛选器操作
 */
export interface ImageFilterActions {
  /**
   * 设置或更新筛选条件
   */
  setFilters: (newFilters: Partial<ImageFilters>) => void;
  
  /**
   * 设置或更新分页状态
   */
  setPagination: (newPagination: Partial<ImagePaginationState>) => void;
  
  /**
   * 设置或更新视图配置
   */
  setView: (newView: Partial<ImageViewState>) => void;
  
  /**
   * 重置所有筛选条件为初始状态，但不重置分页大小和视图模式
   */
  resetFilters: () => void;
  
  /**
   * 跳转到指定页码
   */
  goToPage: (page: number) => void;
  
  /**
   * 切换排序方向
   */
  toggleSortOrder: () => void;
  
  /**
   * 设置排序字段和方向
   */
  setSorting: (sortBy: ImageSortBy, order?: SortOrder) => void;
  
  /**
   * 切换视图模式
   */
  setViewMode: (mode: ImageViewMode) => void;
  
  /**
   * 获取用于API调用的查询参数
   */
  getApiParams: () => ImageQueryParams;
}

// 默认初始状态
const initialState: ImageFilterState = {
  filters: {
    search: undefined,
    mimeTypes: undefined,
    minSize: undefined,
    maxSize: undefined,
    minWidth: undefined,
    maxWidth: undefined,
    minHeight: undefined,
    maxHeight: undefined,
    uploadedAfter: undefined,
    uploadedBefore: undefined,
    uploaderIds: undefined,
    processingStatuses: undefined,
    moderationStatuses: undefined,
    isPublic: undefined,
    tags: undefined,
    albums: undefined,
  },
  pagination: {
    page: 1,
    pageSize: IMAGE_CONSTANTS.DEFAULT_PAGE_SIZE,
  },
  view: {
    viewMode: ImageViewMode.GRID,
    sortBy: ImageSortBy.UPLOADED_AT,
    order: "desc",
  },
};

/**
 * 图片筛选器状态管理 Store
 * 
 * 持久化配置：
 * - 持久化 pageSize 和 viewMode，保持用户偏好
 * - 不持久化筛选条件和当前页码，确保每次访问时从干净状态开始
 */
export const useImageFilterStore = create<ImageFilterState & ImageFilterActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          // 筛选条件变化时重置到第一页
          pagination: { ...state.pagination, page: 1 },
        }));
      },

      setPagination: (newPagination) => {
        set((state) => ({
          pagination: { ...state.pagination, ...newPagination },
        }));
      },

      setView: (newView) => {
        set((state) => ({
          view: { ...state.view, ...newView },
          // 视图配置变化时重置到第一页
          pagination: { ...state.pagination, page: 1 },
        }));
      },

      goToPage: (page) => {
        get().setPagination({ page });
      },

      toggleSortOrder: () => {
        const currentOrder = get().view.order;
        get().setView({ order: currentOrder === "asc" ? "desc" : "asc" });
      },

      setSorting: (sortBy, order = "desc") => {
        get().setView({ sortBy, order });
      },

      setViewMode: (viewMode) => {
        get().setView({ viewMode });
      },

      resetFilters: () => {
        set((state) => ({
          filters: initialState.filters,
          pagination: { ...state.pagination, page: 1 },
        }));
      },

      getApiParams: () => {
        const { filters, pagination, view } = get();
        const { search, ...otherFilters } = filters;
        
        // 转换为API查询参数
        const apiParams: ImageQueryParams = {
          // 基础查询参数
          page: pagination.page,
          pageSize: pagination.pageSize,
          sortBy: view.sortBy,
          order: view.order,
          
          // 筛选参数
          filters: {
            ...otherFilters,
            // 如果有搜索关键词，添加到筛选参数中
            ...(search && { search }),
          },
          
          // 视图配置
          viewMode: view.viewMode,
          includeThumbnail: true, // 默认包含缩略图
          includeUploader: true,  // 默认包含上传者信息
          includeStats: false,    // 默认不包含统计信息
        };

        return apiParams;
      },
    }),
    {
      name: "image-filter-storage", // localStorage 中的 key
      storage: createJSONStorage(() => localStorage),
      
      // 只持久化用户偏好设置
      partialize: (state) => ({
        pagination: { 
          pageSize: state.pagination.pageSize 
        },
        view: {
          viewMode: state.view.viewMode,
          // 可选：是否持久化排序偏好
          // sortBy: state.view.sortBy,
          // order: state.view.order,
        },
      }),
      
      // 自定义合并逻辑
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as Partial<ImageFilterState>;
        return {
          ...currentState,
          pagination: {
            ...currentState.pagination,
            pageSize: 
              typedPersistedState.pagination?.pageSize || 
              currentState.pagination.pageSize,
          },
          view: {
            ...currentState.view,
            viewMode: 
              typedPersistedState.view?.viewMode || 
              currentState.view.viewMode,
          },
        };
      },
    }
  )
);

/**
 * 实用工具函数：检查是否有激活的筛选条件
 */
export const useHasActiveFilters = () => {
  return useImageFilterStore((state) => {
    const { filters } = state;
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'search') return Boolean(value?.trim());
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null;
    });
  });
};

/**
 * 实用工具函数：获取激活的筛选条件数量
 */
export const useActiveFiltersCount = () => {
  return useImageFilterStore((state) => {
    const { filters } = state;
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return Boolean(value?.trim());
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null;
    }).length;
  });
};