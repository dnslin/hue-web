// @/lib/store/image/image-data.store.ts

import { StateCreator } from "zustand";
import { shallow } from "zustand/shallow";
import { ImageResponse, ImageListParams } from "@/lib/types/image";
import type { PaginatedApiResponse } from "@/lib/types/common";
import { isSuccessApiResponse } from "@/lib/types/common";
import { useImageFilterStore } from "./filter";
import { getImagesAction } from "@/lib/actions/images/image";
import { handleStoreError } from "@/lib/utils/error-handler";

/**
 * 图片核心数据状态
 * @description 这个接口定义了图片数据切片（slice）的状态结构。
 */
export interface ImageDataState {
  /**
   * 当前页的图片列表
   */
  images: ImageResponse[];
  /**
   * 图片总数
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
 * 图片核心数据操作
 * @description 这个接口定义了所有与图片数据直接相关的操作。
 */
export interface ImageDataActions {
  /**
   * 根据查询参数获取图片列表
   * @param params 查询参数
   */
  fetchImages: () => Promise<void>;
  /**
   * 强制刷新当前图片列表
   */
  refreshImages: () => Promise<void>;
  /**
   * 初始化订阅
   * @description 设置对 filter store 的订阅，以便在筛选条件变化时自动获取数据。
   */
  initialize: () => void;
}

/**
 * Zustand Store Slice: ImageData
 * @description 这个 Slice 包含了图片数据的状态和所有核心操作的实现。
 *              它被设计为可组合的，可以与其他 Slice 一起构成完整的应用状态。
 */
export const createImageDataSlice: StateCreator<
  ImageDataState & ImageDataActions,
  [],
  [],
  ImageDataState & ImageDataActions
> = (set, get) => ({
  // 初始状态
  images: [],
  total: 0,
  loading: false,
  error: null,
  isInitialized: false,

  // --- 核心数据操作 (骨架实现) ---

  refreshImages: async () => {
    // 直接调用 fetchImages 实现刷新
    await get().fetchImages();
  },

  fetchImages: async () => {
    const { filters, pagination } = useImageFilterStore.getState();

    // 准备发送到后端的参数，转换 search 字段为 keyword
    const { search, ...otherFilters } = filters;
    const apiParams: ImageListParams = {
      ...otherFilters,
      // 如果有搜索关键词，转换为 keyword 参数
      ...(search && {
        keyword: search,
      }),
      page: pagination.page,
      pageSize: pagination.pageSize,
    };

    set({ loading: true, error: null });
    try {
      const response = await getImagesAction(apiParams);

      // 使用类型守卫检查API响应
      if (isSuccessApiResponse(response)) {
        const paginatedResponse =
          response as PaginatedApiResponse<ImageResponse>;
        if (paginatedResponse.data && paginatedResponse.meta) {
          set({
            images: paginatedResponse.data,
            total: paginatedResponse.meta.total,
            loading: false,
          });
        } else {
          console.error("❌ 图片列表数据格式错误");
          const errorResult = await handleStoreError(
            new Error("数据格式错误"),
            "获取图片列表"
          );
          set({ loading: false, error: errorResult.error });
        }
      } else {
        // 处理API错误响应
        console.error("❌ 获取图片列表失败:", response.msg);
        const errorResult = await handleStoreError(response, "获取图片列表");
        set({ loading: false, error: errorResult.error });
      }
    } catch (error) {
      console.error("❌ 获取图片列表时发生未知错误:", error);
      const errorResult = await handleStoreError(error, "获取图片列表");
      set({ loading: false, error: errorResult.error });
    }
  },

  initialize: () => {
    if (get().isInitialized) {
      return;
    }

    // 订阅 image-filter.store 的变化
    const unsubscribe = useImageFilterStore.subscribe(
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
          get().fetchImages();
        }
      }
    );

    // 首次加载数据
    console.log("[Debug] initialize: 首次加载图片数据。");
    get().fetchImages();

    set({ isInitialized: true });
    console.log(
      "[Debug] initialize: 图片数据存储已初始化并成功订阅筛选器变更。"
    );
  },
});

import { createStore } from "zustand";

// 从 createImageDataSlice 创建一个独立的 store 实例
export const imageDataStore = createStore(createImageDataSlice);