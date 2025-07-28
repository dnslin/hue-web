// @/lib/store/album/album-filter.store.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { AlbumListParams } from "@/lib/types/album";

/**
 * @interface AlbumFilters
 * @description 定义了可用于筛选相册列表的条件。
 *              包含前端专用的 search 字段用于统一搜索功能。
 */
export interface AlbumFilters
  extends Omit<
    AlbumListParams,
    "page" | "pageSize" | "keyword"
  > {
  /** 统一搜索字段，用于搜索相册名称，对应后端的 keyword 参数 */
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
 * @interface AlbumFilterState
 * @description 聚合了筛选条件和分页状态。
 */
export interface AlbumFilterState {
  filters: AlbumFilters;
  pagination: PaginationState;
}

/**
 * @interface AlbumFilterActions
 * @description 定义了用于更新筛选和分页状态的操作。
 */
export interface AlbumFilterActions {
  /**
   * @function setFilters
   * @description 设置或更新筛选条件。
   * @param {Partial<AlbumFilters>} newFilters - 新的筛选条件对象。
   */
  setFilters: (newFilters: Partial<AlbumFilters>) => void;
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
const initialState: AlbumFilterState = {
  filters: {
    search: undefined,
    isPublic: undefined,
    sortBy: undefined,
    order: undefined,
  },
  pagination: {
    page: 1,
    pageSize: 20,
  },
};

/**
 * @constant useAlbumFilterStore
 * @description
 * 创建一个 Zustand store 来管理相册列表的筛选和分页状态。
 *
 * 这个 store 使用 `persist` 中间件来将部分状态（特别是 `pageSize`）持久化到 `localStorage` 中。
 * 这样可以确保即使用户刷新页面，每页显示数量的偏好也能被保留。
 */
export const useAlbumFilterStore = create<AlbumFilterState & AlbumFilterActions>()(
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
      name: "album-filter-storage", // localStorage 中的 key
      storage: createJSONStorage(() => localStorage),
      // 只持久化 pageSize
      partialize: (state) => ({
        pagination: { pageSize: state.pagination.pageSize },
      }),
      // 自定义合并逻辑，以防 `persistedState` 为空或不完整
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as Partial<AlbumFilterState>;
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