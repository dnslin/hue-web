// lib/store/gallery/filter.ts
// 瀑布流画廊筛选状态管理

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GalleryQueryParams } from '@/lib/types/gallery';
import type { ImageFilters } from '@/lib/types/image';

/**
 * 画廊筛选状态接口
 */
export interface GalleryFilterState {
  // 筛选条件
  filters: ImageFilters;
  
  // 排序
  sortBy: 'created_at' | 'updated_at' | 'filename' | 'size' | 'width' | 'height';
  order: 'asc' | 'desc';
  
  // 分页
  page: number;
  pageSize: number;
  
  // 高级筛选开关
  isAdvancedFilterOpen: boolean;
  
  // 操作方法
  setFilters: (filters: Partial<ImageFilters>) => void;
  setSorting: (sortBy: GalleryFilterState['sortBy'], order: GalleryFilterState['order']) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  toggleAdvancedFilter: () => void;
  setAdvancedFilter: (open: boolean) => void;
  
  // 便捷方法
  resetFilters: () => void;
  resetPagination: () => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  
  // 获取完整查询参数
  getQueryParams: () => GalleryQueryParams;
  
  // 应用筛选（重置分页）
  applyFilters: (filters: Partial<ImageFilters>) => void;
}

/**
 * 初始筛选条件
 */
const initialFilters: ImageFilters = {
  searchQuery: undefined,
  albumId: undefined,
  mimeTypes: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  publicOnly: undefined,
};

/**
 * 初始状态
 */
const initialState = {
  filters: initialFilters,
  sortBy: 'created_at' as const,
  order: 'desc' as const,
  page: 1,
  pageSize: 20,
  isAdvancedFilterOpen: false,
};

/**
 * 瀑布流画廊筛选 Store
 */
export const useGalleryFilterStore = create<GalleryFilterState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 设置筛选条件
      setFilters: (newFilters: Partial<ImageFilters>) => {
        const { filters } = get();
        set({
          filters: { ...filters, ...newFilters },
        });
      },

      // 设置排序
      setSorting: (sortBy: GalleryFilterState['sortBy'], order: GalleryFilterState['order']) => {
        set({
          sortBy,
          order,
          page: 1, // 重置到第一页
        });
      },

      // 设置页码
      setPage: (page: number) => {
        set({ page: Math.max(1, page) });
      },

      // 设置每页大小
      setPageSize: (pageSize: number) => {
        set({
          pageSize: Math.max(1, pageSize),
          page: 1, // 重置到第一页
        });
      },

      // 切换高级筛选面板
      toggleAdvancedFilter: () => {
        set({ isAdvancedFilterOpen: !get().isAdvancedFilterOpen });
      },

      // 设置高级筛选面板状态
      setAdvancedFilter: (open: boolean) => {
        set({ isAdvancedFilterOpen: open });
      },

      // 重置筛选条件
      resetFilters: () => {
        set({
          filters: initialFilters,
          sortBy: 'created_at',
          order: 'desc',
          page: 1,
        });
      },

      // 重置分页
      resetPagination: () => {
        set({ page: 1 });
      },

      // 跳转到指定页
      goToPage: (page: number) => {
        if (page >= 1) {
          set({ page });
        }
      },

      // 下一页
      nextPage: () => {
        const { page } = get();
        set({ page: page + 1 });
      },

      // 上一页
      previousPage: () => {
        const { page } = get();
        if (page > 1) {
          set({ page: page - 1 });
        }
      },

      // 获取完整查询参数
      getQueryParams: (): GalleryQueryParams => {
        const state = get();
        return {
          page: state.page,
          pageSize: state.pageSize,
          sortBy: state.sortBy,
          order: state.order,
          filters: state.filters,
        };
      },

      // 应用筛选（重置分页到第一页）
      applyFilters: (newFilters: Partial<ImageFilters>) => {
        const { filters } = get();
        set({
          filters: { ...filters, ...newFilters },
          page: 1,
        });
      },
    }),
    {
      name: 'hue-gallery-filter',
      partialize: (state) => ({
        // 持久化筛选条件、排序和页面大小，但不持久化当前页码
        filters: state.filters,
        sortBy: state.sortBy,
        order: state.order,
        pageSize: state.pageSize,
        isAdvancedFilterOpen: state.isAdvancedFilterOpen,
      }),
    }
  )
);

/**
 * 画廊筛选存储实例（用于外部访问）
 */
export const galleryFilterStore = useGalleryFilterStore;

/**
 * 筛选相关的派生选择器
 */
export const galleryFilterSelectors = {
  // 判断是否有活跃的筛选条件
  hasActiveFilters: () => {
    const { filters } = useGalleryFilterStore.getState();
    return Object.values(filters).some(value => 
      value !== undefined && value !== null && value !== ''
    );
  },
  
  // 获取活跃筛选条件的数量
  getActiveFiltersCount: () => {
    const { filters } = useGalleryFilterStore.getState();
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
  },
  
  // 判断是否为默认排序
  isDefaultSorting: () => {
    const { sortBy, order } = useGalleryFilterStore.getState();
    return sortBy === 'created_at' && order === 'desc';
  },
  
  // 获取当前筛选的描述文本
  getFilterDescription: () => {
    const { filters, sortBy, order } = useGalleryFilterStore.getState();
    const descriptions: string[] = [];
    
    if (filters.searchQuery) {
      descriptions.push(`搜索: "${filters.searchQuery}"`);
    }
    
    if (filters.mimeTypes && filters.mimeTypes.length > 0) {
      descriptions.push(`文件类型: ${filters.mimeTypes.join(', ')}`);
    }
    
    if (filters.dateFrom || filters.dateTo) {
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString() : '';
      const toDate = filters.dateTo ? new Date(filters.dateTo).toLocaleDateString() : '';
      if (fromDate && toDate) {
        descriptions.push(`日期: ${fromDate} - ${toDate}`);
      } else if (fromDate) {
        descriptions.push(`日期: 从 ${fromDate}`);
      } else if (toDate) {
        descriptions.push(`日期: 到 ${toDate}`);
      }
    }
    
    // 排序描述
    const sortLabels = {
      'created_at': '创建时间',
      'updated_at': '修改时间',
      'filename': '文件名',
      'size': '文件大小',
      'width': '图片宽度',
      'height': '图片高度',
    };
    
    const orderLabel = order === 'asc' ? '升序' : '降序';
    descriptions.push(`排序: ${sortLabels[sortBy]} (${orderLabel})`);
    
    return descriptions.join(' | ');
  },
};