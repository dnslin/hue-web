// @/lib/store/share/share-data.store.ts

import { StateCreator } from "zustand";
import { shallow } from "zustand/shallow";
import { ShareResponse, ShareListParams } from "@/lib/types/share";
import type { ApiResponse } from "@/lib/types/common";
import { isSuccessApiResponse } from "@/lib/types/common";
import { useShareFilterStore } from "./filter";
import { getUserSharesAction } from "@/lib/actions/shares/share";
import { handleStoreError } from "@/lib/utils/error-handler";

/**
 * 分享核心数据状态
 * @description 这个接口定义了分享数据切片（slice）的状态结构。
 */
export interface ShareDataState {
  /**
   * 分享列表
   */
  shares: ShareResponse[];
  /**
   * 分享总数
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
 * 分享核心数据操作
 * @description 这个接口定义了所有与分享数据直接相关的操作。
 */
export interface ShareDataActions {
  /**
   * 根据查询参数获取分享列表
   */
  fetchShares: () => Promise<void>;
  /**
   * 强制刷新当前分享列表
   */
  refreshShares: () => Promise<void>;
  /**
   * 初始化订阅
   * @description 设置对 filter store 的订阅，以便在筛选条件变化时自动获取数据。
   */
  initialize: () => void;
  /**
   * 添加新分享到列表
   * @param share 新分享
   */
  addShare: (share: ShareResponse) => void;
  /**
   * 从列表中移除分享
   * @param token 分享token
   */
  removeShare: (token: string) => void;
  /**
   * 更新分享信息
   * @param token 分享token
   * @param updates 更新的分享信息
   */
  updateShare: (token: string, updates: Partial<ShareResponse>) => void;
}

/**
 * Zustand Store Slice: ShareData
 * @description 这个 Slice 包含了分享数据的状态和所有核心操作的实现。
 */
export const createShareDataSlice: StateCreator<
  ShareDataState & ShareDataActions,
  [],
  [],
  ShareDataState & ShareDataActions
> = (set, get) => ({
  // 初始状态
  shares: [],
  total: 0,
  loading: false,
  error: null,
  isInitialized: false,

  // --- 核心数据操作 ---

  refreshShares: async () => {
    // 直接调用 fetchShares 实现刷新
    await get().fetchShares();
  },

  fetchShares: async () => {
    const { filters, pagination } = useShareFilterStore.getState();

    // 准备发送到后端的参数
    const apiParams: ShareListParams = {
      ...filters,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };

    set({ loading: true, error: null });
    try {
      const response = await getUserSharesAction(apiParams);

      // 使用类型守卫检查API响应
      if (isSuccessApiResponse(response)) {
        const sharesResponse = response as ApiResponse<ShareResponse[]>;
        if (sharesResponse.data && Array.isArray(sharesResponse.data)) {
          let shares = sharesResponse.data;

          // 前端筛选（如果有搜索条件）
          if (filters.search) {
            shares = shares.filter(share =>
              share.token.toLowerCase().includes(filters.search!.toLowerCase())
            );
          }

          // 前端排序
          if (filters.sortBy) {
            shares.sort((a, b) => {
              let aValue: any;
              let bValue: any;

              switch (filters.sortBy) {
                case 'created_at':
                  aValue = new Date(a.createdAt);
                  bValue = new Date(b.createdAt);
                  break;
                case 'expire_at':
                  aValue = a.expireAt ? new Date(a.expireAt) : new Date(0);
                  bValue = b.expireAt ? new Date(b.expireAt) : new Date(0);
                  break;
                case 'view_count':
                  aValue = a.viewCount;
                  bValue = b.viewCount;
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
            shares,
            total: shares.length,
            loading: false,
          });
        } else {
          console.error("❌ 分享列表数据格式错误");
          const errorResult = await handleStoreError(
            new Error("数据格式错误"),
            "获取分享列表"
          );
          set({ loading: false, error: errorResult.error });
        }
      } else {
        // 处理API错误响应
        console.error("❌ 获取分享列表失败:", response.msg);
        const errorResult = await handleStoreError(response, "获取分享列表");
        set({ loading: false, error: errorResult.error });
      }
    } catch (error) {
      console.error("❌ 获取分享列表时发生未知错误:", error);
      const errorResult = await handleStoreError(error, "获取分享列表");
      set({ loading: false, error: errorResult.error });
    }
  },

  initialize: () => {
    if (get().isInitialized) {
      return;
    }

    // 订阅 share-filter.store 的变化
    useShareFilterStore.subscribe(
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
          get().fetchShares();
        }
      }
    );

    // 首次加载数据
    console.log("[Debug] initialize: 首次加载分享数据。");
    get().fetchShares();

    set({ isInitialized: true });
    console.log(
      "[Debug] initialize: 分享数据存储已初始化并成功订阅筛选器变更。"
    );
  },

  addShare: (share: ShareResponse) => {
    set((state) => ({
      shares: [share, ...state.shares],
      total: state.total + 1,
    }));
  },

  removeShare: (token: string) => {
    set((state) => ({
      shares: state.shares.filter((share) => share.token !== token),
      total: Math.max(0, state.total - 1),
    }));
  },

  updateShare: (token: string, updates: Partial<ShareResponse>) => {
    set((state) => ({
      shares: state.shares.map((share) =>
        share.token === token ? { ...share, ...updates } : share
      ),
    }));
  },
});

import { createStore } from "zustand";

// 从 createShareDataSlice 创建一个独立的 store 实例
export const shareDataStore = createStore(createShareDataSlice);