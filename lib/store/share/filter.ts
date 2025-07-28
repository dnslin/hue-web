// @/lib/store/share/share-filter.store.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { ShareListParams } from "@/lib/types/share";

/**
 * @interface ShareFilters
 * @description 定义了可用于筛选分享列表的条件。
 */
export interface ShareFilters
  extends Omit<
    ShareListParams,
    "page" | "pageSize"
  > {
  /** 搜索字段，用于搜索分享令牌 */
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
 * @interface ShareFilterState
 * @description 聚合了筛选条件和分页状态。
 */
export interface ShareFilterState {
  filters: ShareFilters;
  pagination: PaginationState;
}

/**
 * @interface ShareFilterActions
 * @description 定义了用于更新筛选和分页状态的操作。
 */
export interface ShareFilterActions {
  /**
   * @function setFilters
   * @description 设置或更新筛选条件。
   * @param {Partial<ShareFilters>} newFilters - 新的筛选条件对象。
   */
  setFilters: (newFilters: Partial<ShareFilters>) => void;
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
const initialState: ShareFilterState = {
  filters: {
    search: undefined,
    type: undefined,
    isActive: undefined,
    sortBy: undefined,
    order: undefined,
  },
  pagination: {
    page: 1,
    pageSize: 20,
  },
};

/**
 * @constant useShareFilterStore
 * @description
 * 创建一个 Zustand store 来管理分享列表的筛选和分页状态。
 */
export const useShareFilterStore = create<ShareFilterState & ShareFilterActions>()(
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
      name: "share-filter-storage", // localStorage 中的 key
      storage: createJSONStorage(() => localStorage),
      // 只持久化 pageSize
      partialize: (state) => ({
        pagination: { pageSize: state.pagination.pageSize },
      }),
      // 自定义合并逻辑，以防 `persistedState` 为空或不完整
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as Partial<ShareFilterState>;
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