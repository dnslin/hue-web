/**
 * @file Stats Store
 * @description 统计数据状态管理
 *
 * 遵循项目标准的 Store 架构模式：
 * - 使用 Zustand 进行状态管理
 * - 包含数据状态、加载状态、错误处理
 * - 使用 Server Actions 进行数据获取
 * - 支持数据缓存和刷新
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  StatsData,
  SystemStatsData,
  GlobalStatsData,
  AccessStatsData,
  UploadStatsData,
  GeoDistributionData,
  ReferrerDistributionData,
  TopImagesData,
  TopUsersData,
  StatsApiParams,
} from "@/lib/types/dashboard";
import type { ApiResponse, ErrorApiResponse } from "@/lib/types/common";
import {
  getAllStatsAction,
  getSystemStatsAction,
  getGlobalStatsAction,
  getAccessStatsAction,
  getUploadStatsAction,
  getGeoDistributionAction,
  getReferrerDistributionAction,
  getTopImagesAction,
  getTopUsersAction,
} from "@/lib/actions/dashboard/dashboard";

/**
 * Stats Store 状态定义
 */
interface StatsState {
  // 数据状态
  data: StatsData | null;

  // 加载状态
  loading: boolean;

  // 错误状态
  error: string | null;

  // 最后更新时间
  lastUpdated: number | null;

  // 参数状态
  params: StatsApiParams;
}

/**
 * Stats Store 操作定义
 */
interface StatsActions {
  // 获取所有统计数据
  fetchAllStats: (params?: StatsApiParams) => Promise<void>;

  // 获取系统统计数据
  fetchSystemStats: () => Promise<SystemStatsData | null>;

  // 获取全局统计数据
  fetchGlobalStats: () => Promise<GlobalStatsData | null>;

  // 获取访问统计数据
  fetchAccessStats: (
    params?: StatsApiParams
  ) => Promise<AccessStatsData | null>;

  // 获取上传统计数据
  fetchUploadStats: (
    params?: StatsApiParams
  ) => Promise<UploadStatsData | null>;

  // 获取地理分布数据
  fetchGeoDistribution: (
    params?: StatsApiParams
  ) => Promise<GeoDistributionData | null>;

  // 获取来源分布数据
  fetchReferrerDistribution: (
    params?: StatsApiParams
  ) => Promise<ReferrerDistributionData | null>;

  // 获取热门图片数据
  fetchTopImages: (params?: StatsApiParams) => Promise<TopImagesData | null>;

  // 获取热门用户数据
  fetchTopUsers: (params?: StatsApiParams) => Promise<TopUsersData | null>;

  // 刷新数据
  refreshStats: () => Promise<void>;

  // 更新参数
  updateParams: (params: StatsApiParams) => void;

  // 清除错误
  clearError: () => void;

  // 重置状态
  reset: () => void;
}

type StatsStore = StatsState & StatsActions;

/**
 * 初始状态
 */
const initialState: StatsState = {
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,
  params: {
    range: 7, // 使用新的range参数，默认7天
    limit: 10,
  },
};

/**
 * 错误处理工具函数
 */
const handleError = (error: ErrorApiResponse | any): string => {
  if (error && typeof error === "object") {
    if (error.msg) return error.msg;
    if (error.message) return error.message;
    if (error.error && error.error.msg) return error.error.msg;
  }
  return "获取统计数据时发生未知错误";
};

/**
 * Stats Store 实例
 */
export const useStatsStore = create<StatsStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      ...initialState,

      // 获取所有统计数据
      fetchAllStats: async (params?: StatsApiParams) => {
        const currentParams = params || get().params;

        console.log("🔄 Stats Store: 开始获取统计数据", currentParams);
        set({ loading: true, error: null });

        try {
          const response = await getAllStatsAction(currentParams);
          console.log("📊 Stats Store: API 响应", response);

          if (response.code === 0) {
            const apiResponse = response as ApiResponse<StatsData>;
            console.log("✅ Stats Store: 数据获取成功", {
              accessStats: apiResponse.data?.accessStats,
              uploadStats: apiResponse.data?.uploadStats,
              accessDataLength: apiResponse.data?.accessStats?.data?.length,
              uploadDataLength: apiResponse.data?.uploadStats?.data?.length,
            });
            set({
              data: apiResponse.data!,
              loading: false,
              error: null,
              lastUpdated: Date.now(),
              params: currentParams,
            });
          } else {
            const errorResponse = response as ErrorApiResponse;
            const errorMsg = handleError(errorResponse);
            console.error("❌ Stats Store: 数据获取失败", errorResponse);
            set({
              loading: false,
              error: errorMsg,
            });
          }
        } catch (error) {
          const errorMsg = handleError(error);
          console.error("❌ Stats Store: 获取数据异常", error);
          set({
            loading: false,
            error: errorMsg,
          });
        }
      },

      // 获取系统统计数据
      fetchSystemStats: async () => {
        try {
          const response = await getSystemStatsAction();
          if (response.code === 0) {
            return (response as ApiResponse<SystemStatsData>).data!;
          }
          return null;
        } catch (error) {
          console.error("获取系统统计数据失败:", error);
          return null;
        }
      },

      // 获取全局统计数据
      fetchGlobalStats: async () => {
        try {
          const response = await getGlobalStatsAction();
          if (response.code === 0) {
            return (response as ApiResponse<GlobalStatsData>).data!;
          }
          return null;
        } catch (error) {
          console.error("获取全局统计数据失败:", error);
          return null;
        }
      },

      // 获取访问统计数据
      fetchAccessStats: async (params?: StatsApiParams) => {
        const currentParams = params || get().params;

        try {
          const response = await getAccessStatsAction(currentParams);
          if (response.code === 0) {
            return (response as ApiResponse<AccessStatsData>).data!;
          }
          return null;
        } catch (error) {
          console.error("获取访问统计数据失败:", error);
          return null;
        }
      },

      // 获取上传统计数据
      fetchUploadStats: async (params?: StatsApiParams) => {
        const currentParams = params || get().params;

        try {
          const response = await getUploadStatsAction(currentParams);
          if (response.code === 0) {
            return (response as ApiResponse<UploadStatsData>).data!;
          }
          return null;
        } catch (error) {
          console.error("获取上传统计数据失败:", error);
          return null;
        }
      },

      // 获取地理分布数据
      fetchGeoDistribution: async (params?: StatsApiParams) => {
        const currentParams = params || get().params;

        try {
          const response = await getGeoDistributionAction(currentParams);
          if (response.code === 0) {
            return (response as ApiResponse<GeoDistributionData>).data!;
          }
          return null;
        } catch (error) {
          console.error("获取地理分布数据失败:", error);
          return null;
        }
      },

      // 获取来源分布数据
      fetchReferrerDistribution: async (params?: StatsApiParams) => {
        const currentParams = params || get().params;

        try {
          const response = await getReferrerDistributionAction(currentParams);
          if (response.code === 0) {
            return (response as ApiResponse<ReferrerDistributionData>).data!;
          }
          return null;
        } catch (error) {
          console.error("获取来源分布数据失败:", error);
          return null;
        }
      },

      // 获取热门图片数据
      fetchTopImages: async (params?: StatsApiParams) => {
        const currentParams = params || get().params;

        try {
          const response = await getTopImagesAction(currentParams);
          if (response.code === 0) {
            return (response as ApiResponse<TopImagesData>).data!;
          }
          return null;
        } catch (error) {
          console.error("获取热门图片数据失败:", error);
          return null;
        }
      },

      // 获取热门用户数据
      fetchTopUsers: async (params?: StatsApiParams) => {
        const currentParams = params || get().params;

        try {
          const response = await getTopUsersAction(currentParams);
          if (response.code === 0) {
            return (response as ApiResponse<TopUsersData>).data!;
          }
          return null;
        } catch (error) {
          console.error("获取热门用户数据失败:", error);
          return null;
        }
      },

      // 刷新数据
      refreshStats: async () => {
        const { params, fetchAllStats } = get();
        await fetchAllStats(params);
      },

      // 更新参数
      updateParams: (params: StatsApiParams) => {
        set({ params: { ...get().params, ...params } });
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 重置状态
      reset: () => {
        set({ ...initialState });
      },
    }),
    {
      name: "stats-store",
      partialize: (state) => ({
        // 只持久化参数，不持久化数据（避免过期数据）
        params: state.params,
      }),
    }
  )
);

/**
 * 便捷的选择器钩子
 */

// 获取统计数据
export const useStatsData = () => useStatsStore((state) => state.data);

// 获取加载状态
export const useStatsLoading = () => useStatsStore((state) => state.loading);

// 获取错误状态
export const useStatsError = () => useStatsStore((state) => state.error);

// 获取最后更新时间
export const useStatsLastUpdated = () =>
  useStatsStore((state) => state.lastUpdated);

// 获取参数
export const useStatsParams = () => useStatsStore((state) => state.params);

// 获取操作函数
export const useStatsActions = () => {
  const fetchAllStats = useStatsStore((state) => state.fetchAllStats);
  const fetchSystemStats = useStatsStore((state) => state.fetchSystemStats);
  const fetchGlobalStats = useStatsStore((state) => state.fetchGlobalStats);
  const fetchAccessStats = useStatsStore((state) => state.fetchAccessStats);
  const fetchUploadStats = useStatsStore((state) => state.fetchUploadStats);
  const fetchGeoDistribution = useStatsStore(
    (state) => state.fetchGeoDistribution
  );
  const fetchReferrerDistribution = useStatsStore(
    (state) => state.fetchReferrerDistribution
  );
  const fetchTopImages = useStatsStore((state) => state.fetchTopImages);
  const fetchTopUsers = useStatsStore((state) => state.fetchTopUsers);
  const refreshStats = useStatsStore((state) => state.refreshStats);
  const updateParams = useStatsStore((state) => state.updateParams);
  const clearError = useStatsStore((state) => state.clearError);
  const reset = useStatsStore((state) => state.reset);

  return {
    fetchAllStats,
    fetchSystemStats,
    fetchGlobalStats,
    fetchAccessStats,
    fetchUploadStats,
    fetchGeoDistribution,
    fetchReferrerDistribution,
    fetchTopImages,
    fetchTopUsers,
    refreshStats,
    updateParams,
    clearError,
    reset,
  };
};

/**
 * 特定数据选择器
 */
export const useSystemStats = () =>
  useStatsStore((state) => state.data?.systemStats);
export const useGlobalStats = () =>
  useStatsStore((state) => state.data?.globalStats);
export const useAccessStats = () =>
  useStatsStore((state) => state.data?.accessStats);
export const useUploadStats = () =>
  useStatsStore((state) => state.data?.uploadStats);
export const useGeoDistribution = () =>
  useStatsStore((state) => state.data?.geoDistribution);
export const useReferrerDistribution = () =>
  useStatsStore((state) => state.data?.referrerDistribution);
export const useTopImages = () =>
  useStatsStore((state) => state.data?.topImages);
export const useTopUsers = () => useStatsStore((state) => state.data?.topUsers);
