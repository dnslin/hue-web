// @/lib/store/album/album-data.store.ts

import { StateCreator } from "zustand";
import { shallow } from "zustand/shallow";
import { AlbumResponse } from "@/lib/types/album";
import type { ApiResponse } from "@/lib/types/common";
import { isSuccessApiResponse } from "@/lib/types/common";
import { useAlbumFilterStore } from "./filter";
import { getAlbumsAction } from "@/lib/actions/albums/album";
import { handleStoreError } from "@/lib/utils/error-handler";

/**
 * 相册核心数据状态
 * @description 这个接口定义了相册数据切片（slice）的状态结构。
 */
export interface AlbumDataState {
  /**
   * 相册列表
   */
  albums: AlbumResponse[];
  /**
   * 相册总数
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
 * 相册核心数据操作
 * @description 这个接口定义了所有与相册数据直接相关的操作。
 */
export interface AlbumDataActions {
  /**
   * 根据查询参数获取相册列表
   */
  fetchAlbums: () => Promise<void>;
  /**
   * 强制刷新当前相册列表
   */
  refreshAlbums: () => Promise<void>;
  /**
   * 初始化订阅
   * @description 设置对 filter store 的订阅，以便在筛选条件变化时自动获取数据。
   */
  initialize: () => void;
  /**
   * 添加新相册到列表
   * @param album 新相册
   */
  addAlbum: (album: AlbumResponse) => void;
  /**
   * 更新相册信息
   * @param id 相册ID
   * @param updates 更新的相册信息
   */
  updateAlbum: (id: number, updates: Partial<AlbumResponse>) => void;
  /**
   * 从列表中移除相册
   * @param id 相册ID
   */
  removeAlbum: (id: number) => void;
}

/**
 * Zustand Store Slice: AlbumData
 * @description 这个 Slice 包含了相册数据的状态和所有核心操作的实现。
 *              它被设计为可组合的，可以与其他 Slice 一起构成完整的应用状态。
 */
export const createAlbumDataSlice: StateCreator<
  AlbumDataState & AlbumDataActions,
  [],
  [],
  AlbumDataState & AlbumDataActions
> = (set, get) => ({
  // 初始状态
  albums: [],
  total: 0,
  loading: false,
  error: null,
  isInitialized: false,

  // --- 核心数据操作 ---

  refreshAlbums: async () => {
    // 直接调用 fetchAlbums 实现刷新
    await get().fetchAlbums();
  },

  fetchAlbums: async () => {
    const { filters } = useAlbumFilterStore.getState();

    set({ loading: true, error: null });
    try {
      // 注意：相册列表API目前不支持查询参数，直接获取所有相册
      const response = await getAlbumsAction();

      // 使用类型守卫检查API响应
      if (isSuccessApiResponse(response)) {
        const albumsResponse = response as ApiResponse<AlbumResponse[]>;
        if (albumsResponse.data && Array.isArray(albumsResponse.data)) {
          let albums = albumsResponse.data;
          
          // 在前端进行筛选（因为API暂不支持）
          if (filters.search) {
            albums = albums.filter(album => 
              album.name.toLowerCase().includes(filters.search!.toLowerCase())
            );
          }
          if (filters.isPublic !== undefined) {
            albums = albums.filter(album => album.isPublic === filters.isPublic);
          }
          
          // 前端排序
          if (filters.sortBy) {
            albums.sort((a, b) => {
              let aValue: any;
              let bValue: any;
              
              switch (filters.sortBy) {
                case 'name':
                  aValue = a.name.toLowerCase();
                  bValue = b.name.toLowerCase();
                  break;
                case 'created_at':
                  aValue = new Date(a.createdAt);
                  bValue = new Date(b.createdAt);
                  break;
                case 'updated_at':
                  aValue = new Date(a.updatedAt);
                  bValue = new Date(b.updatedAt);
                  break;
                default:
                  aValue = a.createdAt;
                  bValue = b.createdAt;
              }
              
              if (aValue < bValue) return filters.order === 'desc' ? 1 : -1;
              if (aValue > bValue) return filters.order === 'desc' ? -1 : 1;
              return 0;
            });
          }

          set({
            albums,
            total: albums.length,
            loading: false,
          });
        } else {
          console.error("❌ 相册列表数据格式错误");
          const errorResult = await handleStoreError(
            new Error("数据格式错误"),
            "获取相册列表"
          );
          set({ loading: false, error: errorResult.error });
        }
      } else {
        // 处理API错误响应
        console.error("❌ 获取相册列表失败:", response.msg);
        const errorResult = await handleStoreError(response, "获取相册列表");
        set({ loading: false, error: errorResult.error });
      }
    } catch (error) {
      console.error("❌ 获取相册列表时发生未知错误:", error);
      const errorResult = await handleStoreError(error, "获取相册列表");
      set({ loading: false, error: errorResult.error });
    }
  },

  initialize: () => {
    if (get().isInitialized) {
      return;
    }

    // 订阅 album-filter.store 的变化
    const unsubscribe = useAlbumFilterStore.subscribe(
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
          get().fetchAlbums();
        }
      }
    );

    // 首次加载数据
    console.log("[Debug] initialize: 首次加载相册数据。");
    get().fetchAlbums();

    set({ isInitialized: true });
    console.log(
      "[Debug] initialize: 相册数据存储已初始化并成功订阅筛选器变更。"
    );
  },

  addAlbum: (album: AlbumResponse) => {
    set((state) => ({
      albums: [album, ...state.albums],
      total: state.total + 1,
    }));
  },

  updateAlbum: (id: number, updates: Partial<AlbumResponse>) => {
    set((state) => ({
      albums: state.albums.map((album) =>
        album.id === id ? { ...album, ...updates } : album
      ),
    }));
  },

  removeAlbum: (id: number) => {
    set((state) => ({
      albums: state.albums.filter((album) => album.id !== id),
      total: Math.max(0, state.total - 1),
    }));
  },
});

import { createStore } from "zustand";

// 从 createAlbumDataSlice 创建一个独立的 store 实例
export const albumDataStore = createStore(createAlbumDataSlice);