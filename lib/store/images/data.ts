// lib/store/images/data.ts
// 图片数据管理状态

import { StateCreator } from "zustand";
import { shallow } from "zustand/shallow";
import { ImageItem, ImageListResponse } from "@/lib/types/image";
import { isSuccessApiResponse } from "@/lib/types/common";
import { useImageFilterStore } from "./filter";
import { handleStoreError } from "@/lib/utils/error-handler";

/**
 * 图片核心数据状态
 */
export interface ImageDataState {
  /**
   * 当前页的图片列表
   */
  images: ImageItem[];
  
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
  
  /**
   * 是否正在加载更多数据（无限滚动）
   */
  loadingMore: boolean;
  
  /**
   * 是否还有更多数据可加载
   */
  hasMore: boolean;
  
  /**
   * 上次刷新时间
   */
  lastRefreshTime: number;
}

/**
 * 图片核心数据操作
 */
export interface ImageDataActions {
  /**
   * 根据当前筛选条件获取图片列表
   */
  fetchImages: () => Promise<void>;
  
  /**
   * 加载更多图片（无限滚动）
   */
  loadMoreImages: () => Promise<void>;
  
  /**
   * 强制刷新当前图片列表
   */
  refreshImages: () => Promise<void>;
  
  /**
   * 添加新图片到列表开头（上传后）
   */
  addImage: (image: ImageItem) => void;
  
  /**
   * 更新指定图片信息
   */
  updateImage: (imageId: number, updates: Partial<ImageItem>) => void;
  
  /**
   * 从列表中移除指定图片
   */
  removeImage: (imageId: number) => void;
  
  /**
   * 批量移除图片
   */
  removeImages: (imageIds: number[]) => void;
  
  /**
   * 根据ID查找图片
   */
  getImageById: (imageId: number) => ImageItem | undefined;
  
  /**
   * 初始化订阅
   */
  initialize: () => void;
  
  /**
   * 清理数据（组件卸载时调用）
   */
  cleanup: () => void;
}

/**
 * Zustand Store Slice: ImageData
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
  loadingMore: false,
  hasMore: true,
  lastRefreshTime: 0,

  // --- 核心数据操作 ---

  fetchImages: async () => {
    // 动态导入API函数以避免循环依赖
    const { getImageListAction } = await import("@/lib/actions/images/list");
    
    const apiParams = useImageFilterStore.getState().getApiParams();
    
    set({ loading: true, error: null });
    try {
      const response = await getImageListAction(apiParams);

      if (isSuccessApiResponse(response)) {
        const imageListResponse = response as ImageListResponse;
        if (imageListResponse.data && imageListResponse.meta) {
          const { data: images, meta } = imageListResponse;
          
          set({
            images,
            total: meta.total,
            loading: false,
            hasMore: images.length < meta.total,
            lastRefreshTime: Date.now(),
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

  loadMoreImages: async () => {
    const { loadingMore, hasMore } = get();
    if (loadingMore || !hasMore) {
      return;
    }

    const { getImageListAction } = await import("@/lib/actions/images/list");
    const filterState = useImageFilterStore.getState();
    
    // 获取下一页的参数
    const apiParams = {
      ...filterState.getApiParams(),
      page: filterState.pagination.page + 1,
    };

    set({ loadingMore: true, error: null });
    try {
      const response = await getImageListAction(apiParams);

      if (isSuccessApiResponse(response)) {
        const imageListResponse = response as ImageListResponse;
        if (imageListResponse.data && imageListResponse.meta) {
          const { data: newImages, meta } = imageListResponse;
          
          set((state) => ({
            images: [...state.images, ...newImages],
            total: meta.total,
            loadingMore: false,
            hasMore: state.images.length + newImages.length < meta.total,
          }));

          // 更新筛选器中的页码
          useImageFilterStore.getState().setPagination({ 
            page: apiParams.page 
          });
        } else {
          console.error("❌ 加载更多图片数据格式错误");
          set({ loadingMore: false });
        }
      } else {
        console.error("❌ 加载更多图片失败:", response.msg);
        set({ loadingMore: false });
      }
    } catch (error) {
      console.error("❌ 加载更多图片时发生未知错误:", error);
      set({ loadingMore: false });
    }
  },

  refreshImages: async () => {
    // 重置分页到第一页
    useImageFilterStore.getState().goToPage(1);
    await get().fetchImages();
  },

  addImage: (image) => {
    set((state) => ({
      images: [image, ...state.images],
      total: state.total + 1,
    }));
  },

  updateImage: (imageId, updates) => {
    set((state) => ({
      images: state.images.map((image) =>
        image.id === imageId ? { ...image, ...updates } : image
      ),
    }));
  },

  removeImage: (imageId) => {
    set((state) => ({
      images: state.images.filter((image) => image.id !== imageId),
      total: Math.max(0, state.total - 1),
    }));
  },

  removeImages: (imageIds) => {
    const idsSet = new Set(imageIds);
    set((state) => ({
      images: state.images.filter((image) => !idsSet.has(image.id)),
      total: Math.max(0, state.total - imageIds.length),
    }));
  },

  getImageById: (imageId) => {
    return get().images.find((image) => image.id === imageId);
  },

  initialize: () => {
    if (get().isInitialized) {
      return;
    }

    // 订阅筛选器状态变化
    const unsubscribe = useImageFilterStore.subscribe(
      (state, prevState) => {
        const watchedState = {
          filters: state.filters,
          pagination: { page: state.pagination.page }, // 只监听页码变化
          view: state.view,
        };
        const prevWatchedState = {
          filters: prevState.filters,
          pagination: { page: prevState.pagination.page },
          view: prevState.view,
        };

        // 使用 shallow compare 检查状态变化
        if (!shallow(watchedState, prevWatchedState)) {
          console.log(
            "[Debug] ImageData initialize: 检测到筛选器变化，重新获取数据。",
            { from: prevWatchedState, to: watchedState }
          );
          
          // 如果只是页码变化且不是第一页，说明是分页操作，不需要重新获取
          if (
            shallow(watchedState.filters, prevWatchedState.filters) &&
            shallow(watchedState.view, prevWatchedState.view) &&
            watchedState.pagination.page > 1
          ) {
            // 这种情况下不自动获取数据，由组件手动调用 loadMoreImages
            return;
          }
          
          get().fetchImages();
        }
      }
    );

    // 首次加载数据
    console.log("[Debug] ImageData initialize: 首次加载图片数据。");
    get().fetchImages();

    set({ isInitialized: true });
    console.log("[Debug] ImageData initialize: 图片数据存储已初始化并成功订阅筛选器变更。");
  },

  cleanup: () => {
    set({
      images: [],
      total: 0,
      loading: false,
      error: null,
      isInitialized: false,
      loadingMore: false,
      hasMore: true,
      lastRefreshTime: 0,
    });
  },
});

import { createStore } from "zustand";

// 创建独立的图片数据 store 实例
export const imageDataStore = createStore(createImageDataSlice);