// @/lib/store/recycle-bin/recycle-bin-filter.store.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { RecycleBinListParams } from "@/lib/types/recycle-bin";

/**
 * @interface RecycleBinFilters
 * @description 定义了可用于筛选回收站列表的条件。
 */
export interface RecycleBinFilters
  extends Omit<
    RecycleBinListParams,
    "page" | "pageSize"
  > {
  /** 搜索字段，用于搜索已删除图片的文件名 */
  search?: string;
}

/**
 * @interface PaginationState
 * @description 定义了分页的状态，包括当前页码和每页的项目数。
 */
export interface PaginationState {
  page: number;
  pageSize: number;
}

/**
 * @interface RecycleBinFilterState
 * @description 聚合了筛选条件和分页状态。
 */
export interface RecycleBinFilterState {
  filters: RecycleBinFilters;
  pagination: PaginationState;
}

/**
 * @interface RecycleBinFilterActions
 * @description 定义了用于更新筛选和分页状态的操作。
 */
export interface RecycleBinFilterActions {
  /**
   * @function setFilters
   * @description 设置或更新筛选条件。
   * @param {Partial<RecycleBinFilters>} newFilters - 新的筛选条件对象。
   */
  setFilters: (newFilters: Partial<RecycleBinFilters>) => void;
  /**
   * @function setPagination
   * @description 设置或更新分页状态。
   * @param {Partial<PaginationState>} newPagination - 新的分页状态对象。
   */
  setPagination: (newPagination: Partial<PaginationState>) => void;
  /**
   * @function resetFilters
   * @description 重置所有筛选条件为初始状态，但不重置分页。
   */
  resetFilters: () => void;
  /**
   * @function goToPage
   * @description 跳转到指定页码。
   * @param {number} page - 目标页码。
   */
  goToPage: (page: number) => void;
}

// 默认初始状态
const initialState: RecycleBinFilterState = {
  filters: {
    search: undefined,
    sortBy: undefined,
    order: undefined,
    daysBeforeExpiry: undefined,
  },
  pagination: {
    page: 1,
    pageSize: 20,
  },
};

/**
 * @constant useRecycleBinFilterStore
 * @description
 * 创建一个 Zustand store 来管理回收站列表的筛选和分页状态。
 */
export const useRecycleBinFilterStore = create<RecycleBinFilterState & RecycleBinFilterActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
          // 每次筛选时，都重置到第一页
          pagination: { ...state.pagination, page: 1 },
        }));
      },

      setPagination: (newPagination) => {
        set((state) => ({
          pagination: { ...state.pagination, ...newPagination },
        }));
      },

      goToPage: (page) => {
        get().setPagination({ page });
      },

      resetFilters: () => {
        set({
          filters: initialState.filters,
          pagination: { ...get().pagination, page: 1 },
        });
      },
    }),
    {
      name: "recycle-bin-filter-storage", // localStorage 中的 key
      storage: createJSONStorage(() => localStorage),
      // 只持久化 pageSize
      partialize: (state) => ({
        pagination: { pageSize: state.pagination.pageSize },
      }),
      // 自定义合并逻辑，以防 `persistedState` 为空或不完整
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as Partial<RecycleBinFilterState>;
        return {
          ...currentState,
          pagination: {
            ...currentState.pagination,
            // 如果持久化状态中存在 pageSize，则使用它
            pageSize:
              (typedPersistedState.pagination?.pageSize as number) ||
              currentState.pagination.pageSize,
          },
        };
      },
    }
  )
);