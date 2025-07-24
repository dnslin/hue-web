// lib/store/images/filter.ts
// 图片过滤状态管理

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ImageFilters, ImageSortBy } from '@/lib/types/image';
import type { SortOrder } from '@/lib/types/common';

/**
 * 分页状态接口
 */
export interface ImagePagination {
  page: number;
  pageSize: number;
}

/**
 * 图片过滤状态接口
 */
export interface ImageFilterState {
  // 过滤条件
  filters: ImageFilters;
  // 排序
  sortBy: ImageSortBy;
  order: SortOrder;
  // 分页
  pagination: ImagePagination;
  
  // 操作方法
  setFilters: (filters: Partial<ImageFilters>) => void;
  setSorting: (sortBy: ImageSortBy, order: SortOrder) => void;
  setPagination: (pagination: Partial<ImagePagination>) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
  resetPagination: () => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

/**
 * 图片过滤操作接口
 */
export interface ImageFilterActions {
  setFilters: (filters: Partial<ImageFilters>) => void;
  setSorting: (sortBy: ImageSortBy, order: SortOrder) => void;
  setPagination: (pagination: Partial<ImagePagination>) => void;
  resetFilters: () => void;
  goToPage: (page: number) => void;
}

/**
 * 初始过滤状态
 */
const initialFilters: ImageFilters = {
  albumId: undefined,
  searchQuery: '',
  mimeTypes: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  publicOnly: undefined,
};

/**
 * 初始分页状态
 */
const initialPagination: ImagePagination = {
  page: 1,
  pageSize: 20,
};

/**
 * 图片过滤 Store
 */
export const useImageFilterStore = create<ImageFilterState>()(
  persist(
    (set, get) => ({
      // 初始状态
      filters: initialFilters,
      sortBy: 'created_at',
      order: 'desc',
      pagination: initialPagination,

      // 设置过滤条件
      setFilters: (newFilters: Partial<ImageFilters>) => {
        const { filters } = get();
        set({
          filters: { ...filters, ...newFilters },
          pagination: { ...get().pagination, page: 1 }, // 重置到第一页
        });
      },

      // 设置排序
      setSorting: (sortBy: ImageSortBy, order: SortOrder) => {
        set({
          sortBy,
          order,
          pagination: { ...get().pagination, page: 1 }, // 重置到第一页
        });
      },

      // 设置分页
      setPagination: (newPagination: Partial<ImagePagination>) => {
        const { pagination } = get();
        set({
          pagination: { ...pagination, ...newPagination },
        });
      },

      // 设置页码
      setPage: (page: number) => {
        const { pagination } = get();
        set({
          pagination: { ...pagination, page },
        });
      },

      // 设置每页大小
      setPageSize: (pageSize: number) => {
        set({
          pagination: { page: 1, pageSize },
        });
      },

      // 重置过滤条件
      resetFilters: () => {
        set({
          filters: initialFilters,
          sortBy: 'created_at',
          order: 'desc',
          pagination: initialPagination,
        });
      },

      // 重置分页
      resetPagination: () => {
        set({
          pagination: initialPagination,
        });
      },

      // 跳转到指定页
      goToPage: (page: number) => {
        const { pagination } = get();
        if (page >= 1) {
          set({
            pagination: { ...pagination, page },
          });
        }
      },

      // 下一页
      nextPage: () => {
        const { pagination } = get();
        set({
          pagination: { ...pagination, page: pagination.page + 1 },
        });
      },

      // 上一页
      previousPage: () => {
        const { pagination } = get();
        if (pagination.page > 1) {
          set({
            pagination: { ...pagination, page: pagination.page - 1 },
          });
        }
      },
    }),
    {
      name: 'hue-image-filter',
      partialize: (state) => ({
        // 持久化过滤条件和排序，但不持久化分页
        filters: state.filters,
        sortBy: state.sortBy,
        order: state.order,
      }),
    }
  )
);

/**
 * 图片过滤存储实例（用于外部访问）
 */
export const imageFilterStore = useImageFilterStore;