// @/lib/store/recycle-bin/recycle-bin-data.store.ts

import { StateCreator } from "zustand";
import { shallow } from "zustand/shallow";
import { RecycleBinImage, RecycleBinListParams } from "@/lib/types/recycle-bin";
import type { PaginatedApiResponse } from "@/lib/types/common";
import { isSuccessApiResponse } from "@/lib/types/common";
import { useRecycleBinFilterStore } from "./filter";
import { getRecycleBinAction } from "@/lib/actions/recycle-bin/recycle-bin";
import { handleStoreError } from "@/lib/utils/error-handler";

/**
 * 回收站核心数据状态
 * @description 这个接口定义了回收站数据切片（slice）的状态结构。
 */
export interface RecycleBinDataState {
  /**
   * 回收站图片列表
   */
  items: RecycleBinImage[];
  /**
   * 回收站图片总数
   */
  total: number;
  /**
   * 是否正在加载数据
   */
  loading: boolean;
  /**
   * 错误信息
   */
  error: string | null;
  /**
   * 是否已初始化订阅
   */
  isInitialized: boolean;
}

/**
 * 回收站核心数据操作
 * @description 这个接口定义了所有与回收站数据直接相关的操作。
 */
export interface RecycleBinDataActions {
  /**
   * 根据查询参数获取回收站列表
   */
  fetchRecycleBinItems: () => Promise<void>;
  /**
   * 强制刷新当前回收站列表
   */
  refreshRecycleBinItems: () => Promise<void>;
  /**
   * 初始化订阅
   * @description 设置对 filter store 的订阅，以便在筛选条件变化时自动获取数据。
   */
  initialize: () => void;
  /**
   * 从回收站列表中移除项目（恢复或永久删除后）
   * @param id 图片ID
   */
  removeItem: (id: number) => void;
  /**
   * 批量从回收站列表中移除项目
   * @param ids 图片ID列表
   */
  removeItems: (ids: number[]) => void;
  /**
   * 清空回收站列表
   */
  clearItems: () => void;
}

/**
 * Zustand Store Slice: RecycleBinData
 * @description 这个 Slice 包含了回收站数据的状态和所有核心操作的实现。
 */
export const createRecycleBinDataSlice: StateCreator<
  RecycleBinDataState & RecycleBinDataActions,
  [],
  [],
  RecycleBinDataState & RecycleBinDataActions
> = (set, get) => ({
  // 初始状态
  items: [],
  total: 0,
  loading: false,
  error: null,
  isInitialized: false,

  // --- 核心数据操作 ---

  refreshRecycleBinItems: async () => {
    // 直接调用 fetchRecycleBinItems 实现刷新
    await get().fetchRecycleBinItems();
  },

  fetchRecycleBinItems: async () => {
    const { filters, pagination } = useRecycleBinFilterStore.getState();

    // 准备发送到后端的参数
    const { search, ...otherFilters } = filters;
    const apiParams: RecycleBinListParams = {
      ...otherFilters,
      // 如果有搜索关键词，可以在前端过滤或传递给后端
      page: pagination.page,
      pageSize: pagination.pageSize,
    };

    set({ loading: true, error: null });
    try {
      const response = await getRecycleBinAction(apiParams);

      // 使用类型守卫检查API响应
      if (isSuccessApiResponse(response)) {
        const paginatedResponse =
          response as PaginatedApiResponse<RecycleBinImage>;
        if (paginatedResponse.data && paginatedResponse.meta) {
          let items = paginatedResponse.data;

          // 前端搜索过滤（如果有搜索条件）
          if (search) {
            items = items.filter(item =>
              item.filename.toLowerCase().includes(search.toLowerCase())
            );
          }

          set({
            items,
            total: paginatedResponse.meta.total,
            loading: false,
          });
        } else {
          console.error("❌ 回收站列表数据格式错误");
          const errorResult = await handleStoreError(
            new Error("数据格式错误"),
            "获取回收站列表"
          );
          set({ loading: false, error: errorResult.error });
        }
      } else {
        // 处理API错误响应
        console.error("❌ 获取回收站列表失败:", response.msg);
        const errorResult = await handleStoreError(response, "获取回收站列表");
        set({ loading: false, error: errorResult.error });
      }
    } catch (error) {
      console.error("❌ 获取回收站列表时发生未知错误:", error);
      const errorResult = await handleStoreError(error, "获取回收站列表");
      set({ loading: false, error: errorResult.error });
    }
  },

  initialize: () => {
    if (get().isInitialized) {
      return;
    }

    // 订阅 recycle-bin-filter.store 的变化
    useRecycleBinFilterStore.subscribe(
      // 直接在回调中处理状态
      (state, prevState) => {
        const watchedState = {
          filters: state.filters,
          pagination: state.pagination,
        };
        const prevWatchedState = {
          filters: prevState.filters,
          pagination: prevState.pagination,
        };

        // 使用 shallow compare 检查关心的状态是否发生变化
        if (!shallow(watchedState, prevWatchedState)) {
          console.log(
            "[Debug] initialize: 检测到筛选器或分页变化，重新获取数据。",
            { from: prevWatchedState, to: watchedState }
          );
          get().fetchRecycleBinItems();
        }
      }
    );

    // 首次加载数据
    console.log("[Debug] initialize: 首次加载回收站数据。");
    get().fetchRecycleBinItems();

    set({ isInitialized: true });
    console.log(
      "[Debug] initialize: 回收站数据存储已初始化并成功订阅筛选器变更。"
    );
  },

  removeItem: (id: number) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      total: Math.max(0, state.total - 1),
    }));
  },

  removeItems: (ids: number[]) => {
    set((state) => ({
      items: state.items.filter((item) => !ids.includes(item.id)),
      total: Math.max(0, state.total - ids.length),
    }));
  },

  clearItems: () => {
    set({
      items: [],
      total: 0,
    });
  },
});

import { createStore } from "zustand";

// 从 createRecycleBinDataSlice 创建一个独立的 store 实例
export const recycleBinDataStore = createStore(createRecycleBinDataSlice);