import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  StorageStrategy,
  StorageStrategyCreateRequest,
  StorageStrategyUpdateRequest,
  StorageStrategyQueryParams,
  StorageStrategyTestRequest,
  StorageStrategyTestResult,
  StorageStrategyStats,
  BatchUpdateStorageStatusRequest,
  OrphanedFileResult,
} from "@/lib/types/storage";
import type { PaginatedApiResponse } from "@/lib/types/common";
import { isSuccessApiResponse } from "@/lib/types/common";
import { handleStoreError } from "@/lib/utils/error-handler";
import { showToast } from "@/lib/utils/toast";
import {
  cacheManager,
  CACHE_KEYS,
  cacheUtils,
} from "@/lib/utils/cache-manager";
import {
  getStorageStrategiesAction,
  getStorageStrategyByIdAction,
  createStorageStrategyAction,
  updateStorageStrategyAction,
  deleteStorageStrategyAction,
  testS3ConnectionAction,
  batchUpdateStorageStatusAction,
  previewOrphanedFilesAction,
  cleanOrphanedFilesAction,
  recalculateStorageStatsAction,
} from "@/lib/actions/storage/storage";

interface StorageStrategyStoreState {
  // 数据状态
  strategies: StorageStrategy[];
  selectedStrategy: StorageStrategy | null;
  stats: StorageStrategyStats | null;

  // 加载状态
  isLoadingStrategies: boolean;
  isLoadingStats: boolean;
  isSubmitting: boolean;
  isTesting: boolean;

  // 清理和校准状态
  isCleaningOrphaned: boolean;
  isRecalculating: boolean;
  orphanedResult: OrphanedFileResult | null;
  cleanupError: string | null;

  // 错误状态
  error: string | null;
  testError: string | null;

  // 分页状态
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };

  // 查询条件
  queryParams: StorageStrategyQueryParams;

  // 测试结果
  testResult: StorageStrategyTestResult | null;

  // 存储策略 CRUD 操作
  fetchStrategies: (params?: StorageStrategyQueryParams) => Promise<void>;
  fetchStrategyById: (id: number) => Promise<StorageStrategy | null>;
  createStrategy: (
    data: StorageStrategyCreateRequest
  ) => Promise<StorageStrategy | null>;
  updateStrategy: (
    id: number,
    data: StorageStrategyUpdateRequest
  ) => Promise<StorageStrategy | null>;
  deleteStrategy: (id: number) => Promise<boolean>;

  // 批量操作
  batchEnableStrategies: (ids: number[]) => Promise<boolean>;
  batchDisableStrategies: (ids: number[]) => Promise<boolean>;
  batchDeleteStrategies: (ids: number[]) => Promise<boolean>;

  // 状态切换
  toggleStrategyEnabled: (id: number) => Promise<StorageStrategy | null>;

  // 测试连接
  testS3Connection: (
    config: StorageStrategyTestRequest
  ) => Promise<StorageStrategyTestResult>;

  // 统计信息
  fetchStats: () => Promise<void>;

  // 清理和校准操作
  previewOrphanedFiles: (id: number) => Promise<OrphanedFileResult | null>;
  cleanOrphanedFiles: (id: number) => Promise<OrphanedFileResult | null>;
  recalculateStorageStats: (id: number) => Promise<StorageStrategy | null>;
  clearOrphanedResult: () => void;
  clearCleanupError: () => void;

  // UI 辅助方法
  setSelectedStrategy: (strategy: StorageStrategy | null) => void;
  setQueryParams: (params: Partial<StorageStrategyQueryParams>) => void;
  clearError: () => void;
  clearTestResult: () => void;
  resetFilters: () => void;
}

const initialState = {
  strategies: [],
  selectedStrategy: null,
  stats: null,
  isLoadingStrategies: false,
  isLoadingStats: false,
  isSubmitting: false,
  isTesting: false,
  isCleaningOrphaned: false,
  isRecalculating: false,
  orphanedResult: null,
  cleanupError: null,
  error: null,
  testError: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  queryParams: {
    page: 1,
    pageSize: 10,
  },
  testResult: null,
};

// Helper 函数：清理存储策略数据并处理API响应映射
const sanitizeStrategy = (strategy: StorageStrategy): StorageStrategy => {
  if (!strategy) return strategy;
  
  // 创建基础策略对象
  const sanitizedStrategy: StorageStrategy = {
    ...strategy,
    name: strategy.name || "未命名策略",
    type: strategy.type || "local",
    isEnabled: strategy.isEnabled ?? false,
    createdAt: strategy.createdAt || new Date().toISOString(),
    updatedAt: strategy.updatedAt || new Date().toISOString(),
    totalFiles: strategy.totalFiles || 0,
    usedSpaceBytes: strategy.usedSpaceBytes || 0,
  };

  // 处理S3配置映射 (支持嵌套和平铺两种格式)
  if (strategy.type === "s3") {
    // 优先使用嵌套配置对象
    if (strategy.s3Config) {
      sanitizedStrategy.s3Config = {
        ...strategy.s3Config,
        // 敏感信息脱敏
        secretAccessKey: strategy.s3Config.secretAccessKey ? "••••••••" : "",
      };
      // 同时维护平铺字段以保持兼容性
      sanitizedStrategy.s3AccessKeyId = strategy.s3Config.accessKeyId;
      sanitizedStrategy.s3SecretAccessKey = "••••••••";
      sanitizedStrategy.s3Bucket = strategy.s3Config.bucket;
      sanitizedStrategy.s3Region = strategy.s3Config.region;
      sanitizedStrategy.s3Endpoint = strategy.s3Config.endpoint;
      sanitizedStrategy.s3BaseUrl = strategy.s3Config.baseUrl;
      sanitizedStrategy.s3ForcePathStyle = strategy.s3Config.forcePathStyle;
      sanitizedStrategy.s3ForcePresignedUrl = strategy.s3Config.forcePresignedUrl;
    } else {
      // 使用平铺字段构建嵌套配置
      sanitizedStrategy.s3Config = {
        accessKeyId: strategy.s3AccessKeyId || "",
        secretAccessKey: "••••••••",
        bucket: strategy.s3Bucket || "",
        region: strategy.s3Region || "",
        endpoint: strategy.s3Endpoint || "",
        baseUrl: strategy.s3BaseUrl,
        forcePathStyle: strategy.s3ForcePathStyle,
        forcePresignedUrl: strategy.s3ForcePresignedUrl,
      };
      // 确保敏感信息安全处理
      sanitizedStrategy.s3SecretAccessKey = strategy.s3SecretAccessKey ? "••••••••" : "";
    }
  }

  // 处理本地存储配置映射
  if (strategy.type === "local") {
    // 优先使用嵌套配置对象
    if (strategy.localConfig) {
      sanitizedStrategy.localConfig = {
        ...strategy.localConfig,
      };
      // 同时维护平铺字段以保持兼容性
      sanitizedStrategy.localBasePath = strategy.localConfig.basePath;
    } else {
      // 使用平铺字段构建嵌套配置
      sanitizedStrategy.localConfig = {
        basePath: strategy.localBasePath || "/uploads",
      };
    }
  }

  return sanitizedStrategy;
};

// Helper 函数：生成缓存键
const getCacheKey = (params: StorageStrategyQueryParams): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });
  return `${CACHE_KEYS.STORAGE_STRATEGIES_LIST}:${searchParams.toString()}`;
};

export const useStorageStrategyStore = create<StorageStrategyStoreState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchStrategies: async (params = {}) => {
        set({ isLoadingStrategies: true, error: null });
        const queryParams = { ...get().queryParams, ...params };
        const cacheKey = getCacheKey(queryParams);

        try {
          const response = await cacheManager.getOrSet(
            cacheKey,
            () => getStorageStrategiesAction(queryParams),
            { ttl: 5 * 60 * 1000, storage: "memory" }
          );

          if (isSuccessApiResponse(response)) {
            const paginatedResponse =
              response as PaginatedApiResponse<StorageStrategy>;
            if (paginatedResponse.data && paginatedResponse.meta) {
              set({
                strategies: paginatedResponse.data.map(sanitizeStrategy),
                pagination: {
                  page: paginatedResponse.meta.page,
                  pageSize: paginatedResponse.meta.pageSize,
                  total: paginatedResponse.meta.total,
                },
                queryParams,
                isLoadingStrategies: false,
              });
            } else {
              console.error("❌ 存储策略列表数据格式错误");
              const errorResult = await handleStoreError(
                new Error("数据格式错误"),
                "获取存储策略列表"
              );
              set({ error: errorResult.error, isLoadingStrategies: false });
            }
          } else {
            console.error("❌ 获取存储策略列表失败:", response.msg);
            const errorResult = await handleStoreError(
              response,
              "获取存储策略列表"
            );
            set({ error: errorResult.error, isLoadingStrategies: false });
          }
        } catch (err: unknown) {
          console.error("❌ 获取存储策略列表时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "获取存储策略列表");
          set({ error: errorResult.error, isLoadingStrategies: false });
        }
      },

      fetchStrategyById: async (id) => {
        set({ isLoadingStrategies: true, error: null });
        const cacheKey = CACHE_KEYS.STORAGE_STRATEGY_DETAIL(id);

        try {
          const response = await cacheManager.getOrSet(
            cacheKey,
            () => getStorageStrategyByIdAction(id),
            { ttl: 5 * 60 * 1000, storage: "memory" }
          );

          if (isSuccessApiResponse(response)) {
            const strategy = response.data as StorageStrategy;
            const sanitizedStrategy = sanitizeStrategy(strategy);
            set((state) => ({
              strategies: state.strategies.map((s) =>
                s.id === id ? sanitizedStrategy : s
              ),
              selectedStrategy:
                state.selectedStrategy?.id === id
                  ? sanitizedStrategy
                  : state.selectedStrategy,
              isLoadingStrategies: false,
            }));
            return sanitizedStrategy;
          } else {
            console.error("❌ 获取存储策略详情失败:", response.msg);
            const errorResult = await handleStoreError(
              response,
              "获取存储策略详情"
            );
            set({
              error: errorResult.error,
              isLoadingStrategies: false,
            });
            return null;
          }
        } catch (err: unknown) {
          console.error("❌ 获取存储策略详情时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "获取存储策略详情");
          set({ error: errorResult.error, isLoadingStrategies: false });
          return null;
        }
      },

      createStrategy: async (data) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await createStorageStrategyAction(data);
          if (isSuccessApiResponse(response)) {
            const newStrategy = response.data as StorageStrategy;
            showToast.success("存储策略创建成功");
            cacheUtils.clearStorageStrategyCache?.(); // 清理缓存
            await get().fetchStrategies(get().queryParams); // 刷新列表
            set({ isSubmitting: false });
            return sanitizeStrategy(newStrategy);
          } else {
            console.error("❌ 创建存储策略失败:", response.msg);
            const errorResult = await handleStoreError(
              response,
              "创建存储策略"
            );
            set({
              error: errorResult.error,
              isSubmitting: false,
            });
            return null;
          }
        } catch (err: unknown) {
          console.error("❌ 创建存储策略时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "创建存储策略");
          set({ error: errorResult.error, isSubmitting: false });
          return null;
        }
      },

      updateStrategy: async (id, data) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await updateStorageStrategyAction(id, data);
          if (isSuccessApiResponse(response)) {
            const updatedStrategy = response.data as StorageStrategy;
            const sanitizedStrategy = sanitizeStrategy(updatedStrategy);
            cacheUtils.clearStorageStrategyCache?.(); // 清理缓存
            set((state) => ({
              strategies: state.strategies.map((s) =>
                s.id === id ? sanitizedStrategy : s
              ),
              selectedStrategy:
                state.selectedStrategy?.id === id
                  ? sanitizedStrategy
                  : state.selectedStrategy,
              isSubmitting: false,
            }));
            return sanitizedStrategy;
          } else {
            console.error("❌ 更新存储策略失败:", response.msg);
            const errorResult = await handleStoreError(
              response,
              "更新存储策略"
            );
            set({
              error: errorResult.error,
              isSubmitting: false,
            });
            return null;
          }
        } catch (err: unknown) {
          console.error("❌ 更新存储策略时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "更新存储策略");
          set({ error: errorResult.error, isSubmitting: false });
          return null;
        }
      },

      deleteStrategy: async (id) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await deleteStorageStrategyAction(id);
          if (isSuccessApiResponse(response)) {
            showToast.success("存储策略删除成功");
            cacheUtils.clearStorageStrategyCache?.(); // 清理缓存
            await get().fetchStrategies(get().queryParams); // 刷新列表
            set((state) => ({
              selectedStrategy:
                state.selectedStrategy?.id === id
                  ? null
                  : state.selectedStrategy,
              isSubmitting: false,
            }));
            return true;
          } else {
            console.error("❌ 删除存储策略失败:", response.msg);
            const errorResult = await handleStoreError(
              response,
              "删除存储策略"
            );
            set({
              error: errorResult.error,
              isSubmitting: false,
            });
            return false;
          }
        } catch (err: unknown) {
          console.error("❌ 删除存储策略时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "删除存储策略");
          set({ error: errorResult.error, isSubmitting: false });
          return false;
        }
      },

      batchEnableStrategies: async (ids) => {
        set({ isSubmitting: true, error: null });
        try {
          const batchRequest: BatchUpdateStorageStatusRequest = {
            ids,
            isEnabled: true,
          };

          const response = await batchUpdateStorageStatusAction(batchRequest);

          if (isSuccessApiResponse(response)) {
            // 更新本地状态
            set((state) => ({
              strategies: state.strategies.map((strategy) =>
                ids.includes(strategy.id)
                  ? { ...strategy, isEnabled: true }
                  : strategy
              ),
              isSubmitting: false,
            }));

            // 刷新统计信息
            await get().fetchStats();
            showToast.success(`成功启用 ${ids.length} 个存储策略`);
            return true;
          } else {
            console.error("❌ 批量启用存储策略失败:", response.msg);
            const errorResult = await handleStoreError(
              response,
              "批量启用存储策略"
            );
            set({ error: errorResult.error, isSubmitting: false });
            return false;
          }
        } catch (err: unknown) {
          console.error("❌ 批量启用存储策略时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "批量启用存储策略");
          set({ error: errorResult.error, isSubmitting: false });
          return false;
        }
      },

      batchDisableStrategies: async (ids) => {
        set({ isSubmitting: true, error: null });
        try {
          const batchRequest: BatchUpdateStorageStatusRequest = {
            ids,
            isEnabled: false,
          };

          const response = await batchUpdateStorageStatusAction(batchRequest);

          if (isSuccessApiResponse(response)) {
            // 更新本地状态
            set((state) => ({
              strategies: state.strategies.map((strategy) =>
                ids.includes(strategy.id)
                  ? { ...strategy, isEnabled: false }
                  : strategy
              ),
              isSubmitting: false,
            }));

            // 刷新统计信息
            await get().fetchStats();
            showToast.success(`成功禁用 ${ids.length} 个存储策略`);
            return true;
          } else {
            console.error("❌ 批量禁用存储策略失败:", response.msg);
            const errorResult = await handleStoreError(
              response,
              "批量禁用存储策略"
            );
            set({ error: errorResult.error, isSubmitting: false });
            return false;
          }
        } catch (err: unknown) {
          console.error("❌ 批量禁用存储策略时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "批量禁用存储策略");
          set({ error: errorResult.error, isSubmitting: false });
          return false;
        }
      },

      batchDeleteStrategies: async (ids) => {
        set({ isSubmitting: true, error: null });
        try {
          const promises = ids.map((id) => get().deleteStrategy(id));
          const results = await Promise.all(promises);
          const successCount = results.filter(
            (result) => result === true
          ).length;
          if (successCount > 0) {
            showToast.success(`成功删除 ${successCount} 个存储策略`);
            set({ isSubmitting: false });
            return true;
          } else {
            set({ isSubmitting: false });
            return false;
          }
        } catch (err: unknown) {
          console.error("❌ 批量删除存储策略时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "批量删除存储策略");
          set({ error: errorResult.error, isSubmitting: false });
          return false;
        }
      },

      toggleStrategyEnabled: async (id) => {
        const strategy = get().strategies.find((s) => s.id === id);
        if (!strategy) return null;

        const newEnabledStatus = !strategy.isEnabled;

        try {
          const batchRequest: BatchUpdateStorageStatusRequest = {
            ids: [id],
            isEnabled: newEnabledStatus,
          };

          const response = await batchUpdateStorageStatusAction(batchRequest);

          if (isSuccessApiResponse(response)) {
            // 更新本地状态
            set((state) => ({
              strategies: state.strategies.map((s) =>
                s.id === id ? { ...s, isEnabled: newEnabledStatus } : s
              ),
            }));

            // 刷新统计信息
            await get().fetchStats();

            // 返回更新后的策略
            return get().strategies.find((s) => s.id === id) || null;
          } else {
            console.error("❌ 切换存储策略状态失败:", response.msg);
            const errorResult = await handleStoreError(
              response,
              "切换存储策略状态"
            );
            set({ error: errorResult.error });
            return null;
          }
        } catch (err: unknown) {
          console.error("❌ 切换存储策略状态时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "切换存储策略状态");
          set({ error: errorResult.error });
          return null;
        }
      },

      testS3Connection: async (config) => {
        set({ isTesting: true, testError: null, testResult: null });
        try {
          const response = await testS3ConnectionAction(config);
          if (isSuccessApiResponse(response)) {
            const result: StorageStrategyTestResult = {
              success: true,
              msg: "S3 连接测试成功",
              details: response.msg || "连接正常",
            };
            showToast.success("S3 连接测试成功");
            set({
              testResult: result,
              isTesting: false,
            });
            return result;
          } else {
            const result: StorageStrategyTestResult = {
              success: false,
              msg: "S3 连接测试失败",
              details: response.msg || "连接失败",
            };
            console.error("❌ S3 连接测试失败:", response.msg);
            const errorResult = await handleStoreError(response, "S3 连接测试");
            set({
              testError: errorResult.error,
              testResult: result,
              isTesting: false,
            });
            return result;
          }
        } catch (err: unknown) {
          console.error("❌ S3 连接测试时发生意外错误:", err);
          const result: StorageStrategyTestResult = {
            success: false,
            msg: "S3 连接测试异常",
            details: err instanceof Error ? err.message : "未知错误",
          };
          const errorResult = await handleStoreError(err, "S3 连接测试");
          set({
            testError: errorResult.error,
            testResult: result,
            isTesting: false,
          });
          return result;
        }
      },

      fetchStats: async () => {
        set({ isLoadingStats: true, error: null });
        try {
          // 确保策略列表已加载
          const { isLoadingStrategies } = get();

          // 如果策略正在加载，等待加载完成
          if (isLoadingStrategies) {
            console.log("📊 统计信息计算等待策略加载完成...");
            // 等待策略加载完成
            await new Promise((resolve) => {
              const checkInterval = setInterval(() => {
                const { isLoadingStrategies: currentLoading } = get();
                if (!currentLoading) {
                  clearInterval(checkInterval);
                  resolve(void 0);
                }
              }, 100);
            });
          }

          // 获取最新的策略列表
          const { strategies: currentStrategies } = get();

          // 如果策略列表为空，先尝试获取策略
          if (currentStrategies.length === 0) {
            console.log("📊 策略列表为空，先获取策略数据...");
            await get().fetchStrategies();
          }

          // 重新获取最新的策略列表进行计算
          const { strategies: finalStrategies } = get();

          const stats: StorageStrategyStats = {
            totalStrategies: finalStrategies.length,
            enabledStrategies: finalStrategies.filter((s) => s.isEnabled)
              .length,
            s3Strategies: finalStrategies.filter((s) => s.type === "s3").length,
            localStrategies: finalStrategies.filter((s) => s.type === "local")
              .length,
          };

          console.log("📊 统计信息计算完成:", stats);
          set({
            stats,
            isLoadingStats: false,
          });
        } catch (err: unknown) {
          console.error("❌ 获取统计信息时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "获取统计信息");
          set({ error: errorResult.error, isLoadingStats: false });
        }
      },

      // 清理和校准操作
      previewOrphanedFiles: async (id) => {
        set({ isCleaningOrphaned: true, cleanupError: null, orphanedResult: null });
        try {
          const response = await previewOrphanedFilesAction(id);
          if (isSuccessApiResponse(response)) {
            const result = response.data as OrphanedFileResult;
            set({
              orphanedResult: result,
              isCleaningOrphaned: false,
            });
            return result;
          } else {
            console.error("❌ 预览孤立文件失败:", response.msg);
            const errorResult = await handleStoreError(response, "预览孤立文件");
            set({
              cleanupError: errorResult.error,
              isCleaningOrphaned: false,
            });
            return null;
          }
        } catch (err: unknown) {
          console.error("❌ 预览孤立文件时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "预览孤立文件");
          set({
            cleanupError: errorResult.error,
            isCleaningOrphaned: false,
          });
          return null;
        }
      },

      cleanOrphanedFiles: async (id) => {
        set({ isCleaningOrphaned: true, cleanupError: null });
        try {
          const response = await cleanOrphanedFilesAction(id);
          if (isSuccessApiResponse(response)) {
            const result = response.data as OrphanedFileResult;
            showToast.success("孤立文件清理成功", 
              `清理了 ${result.cleanedCount} 个孤立文件`);
            set({
              orphanedResult: result,
              isCleaningOrphaned: false,
            });
            // 刷新策略数据和统计信息
            await get().fetchStrategies(get().queryParams);
            await get().fetchStats();
            return result;
          } else {
            console.error("❌ 清理孤立文件失败:", response.msg);
            const errorResult = await handleStoreError(response, "清理孤立文件");
            set({
              cleanupError: errorResult.error,
              isCleaningOrphaned: false,
            });
            return null;
          }
        } catch (err: unknown) {
          console.error("❌ 清理孤立文件时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "清理孤立文件");
          set({
            cleanupError: errorResult.error,
            isCleaningOrphaned: false,
          });
          return null;
        }
      },

      recalculateStorageStats: async (id) => {
        set({ isRecalculating: true, error: null });
        try {
          const response = await recalculateStorageStatsAction(id);
          if (isSuccessApiResponse(response)) {
            const updatedStrategy = response.data as StorageStrategy;
            const sanitizedStrategy = sanitizeStrategy(updatedStrategy);
            showToast.success("统计数据校准成功", 
              `存储策略 "${sanitizedStrategy.name}" 统计数据已更新`);
            
            // 更新本地状态
            set((state) => ({
              strategies: state.strategies.map((s) =>
                s.id === id ? sanitizedStrategy : s
              ),
              selectedStrategy:
                state.selectedStrategy?.id === id
                  ? sanitizedStrategy
                  : state.selectedStrategy,
              isRecalculating: false,
            }));
            
            // 刷新统计信息
            await get().fetchStats();
            return sanitizedStrategy;
          } else {
            console.error("❌ 校准统计数据失败:", response.msg);
            const errorResult = await handleStoreError(response, "校准统计数据");
            set({
              error: errorResult.error,
              isRecalculating: false,
            });
            return null;
          }
        } catch (err: unknown) {
          console.error("❌ 校准统计数据时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "校准统计数据");
          set({
            error: errorResult.error,
            isRecalculating: false,
          });
          return null;
        }
      },

      clearOrphanedResult: () => set({ orphanedResult: null }),
      
      clearCleanupError: () => set({ cleanupError: null }),

      // UI 辅助方法
      setSelectedStrategy: (strategy) => set({ selectedStrategy: strategy }),

      setQueryParams: (params) =>
        set((state) => ({
          queryParams: { ...state.queryParams, ...params },
        })),

      clearError: () => set({ error: null, testError: null, cleanupError: null }),

      clearTestResult: () => set({ testResult: null, testError: null }),

      resetFilters: () =>
        set({
          queryParams: { page: 1, pageSize: 10 },
        }),
    }),
    {
      name: "storage-store",
    }
  )
);

