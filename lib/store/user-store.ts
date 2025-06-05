import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  User,
  UserListParams,
  UserListResponse,
  UserStatus,
  PaginationMeta,
  BatchOperationResult,
  AdminUserCreateRequest,
  UserUpdateRequest,
} from "@/lib/types/user";
import {
  getUsersAction,
  approveUserAction,
  rejectUserAction,
  banUserAction,
  unbanUserAction,
  batchApproveUsersAction,
  batchRejectUsersAction,
  batchBanUsersAction,
  batchUnbanUsersAction,
  deleteAdminUserAction,
  createAdminUserAction,
  updateAdminUserAction,
} from "@/lib/actions/users/user.actions";
import { cacheManager, cacheUtils } from "@/lib/utils/cacheManager";
import {
  ErrorResponse as ApiErrorResponse,
  SuccessResponse,
} from "@/lib/types/user";

// 加载状态类型
interface LoadingState {
  list: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  statusChange: boolean;
  batchOperation: boolean;
}

// 选择状态类型
interface SelectionState {
  selectedIds: Set<number>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

// 筛选状态类型
interface FilterState extends UserListParams {
  // 扩展筛选状态，添加UI相关的状态
  isFilterOpen: boolean;
  hasActiveFilters: boolean;
}

// 缓存状态类型
interface CacheState {
  lastFetch: number;
  version: number;
  isStale: boolean;
}

// 用户管理状态接口
interface UserStoreState {
  // 数据状态
  users: User[];
  pagination: PaginationMeta;
  filters: FilterState;
  selection: SelectionState;
  loading: LoadingState;
  cache: CacheState;
  error: string | null;
  // 新增：水合状态管理
  isHydrated: boolean;

  // 操作方法
  // 数据获取
  fetchUsers: (
    params?: UserListParams,
    forceRefresh?: boolean
  ) => Promise<void>;
  refreshUsers: () => Promise<void>;

  // 用户操作
  createUser: (userData: AdminUserCreateRequest) => Promise<User | null>;
  updateUser: (id: number, userData: UserUpdateRequest) => Promise<User | null>;
  deleteUser: (id: number) => Promise<boolean>;
  changeUserStatus: (
    userId: number,
    fromStatus: UserStatus,
    toStatus: UserStatus,
    reason?: string
  ) => Promise<User | null>;

  // 批量操作
  batchApprove: (userIds: number[]) => Promise<BatchOperationResult | null>;
  batchReject: (
    userIds: number[],
    reason?: string
  ) => Promise<BatchOperationResult | null>;
  batchBan: (userIds: number[]) => Promise<BatchOperationResult | null>;
  batchUnban: (userIds: number[]) => Promise<BatchOperationResult | null>;

  // 筛选管理
  setFilters: (filters: Partial<UserListParams>) => void;
  clearFilters: () => void;
  toggleFilterPanel: () => void;

  // 选择管理
  selectUser: (id: number) => void;
  selectUsers: (ids: number[]) => void;
  unselectUser: (id: number) => void;
  unselectUsers: (ids: number[]) => void;
  selectAll: () => void;
  unselectAll: () => void;
  toggleUserSelection: (id: number) => void;
  toggleAllSelection: () => void;

  // 分页管理
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // 缓存管理
  invalidateCache: () => void;
  updateCacheVersion: () => void;

  // 错误处理
  setError: (error: string | null) => void;
  clearError: () => void;

  // 水合状态管理
  setHydrated: () => void;

  // 重置状态
  reset: () => void;
}

// 初始状态
const initialState = {
  users: [],
  pagination: {
    page: 1,
    page_size: 20,
    total: 0,
  },
  filters: {
    page: 1,
    pageSize: 20,
    isFilterOpen: false,
    hasActiveFilters: false,
  },
  selection: {
    selectedIds: new Set<number>(),
    isAllSelected: false,
    isIndeterminate: false,
  },
  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
    statusChange: false,
    batchOperation: false,
  },
  cache: {
    lastFetch: 0,
    version: 1,
    isStale: false,
  },
  error: null,
  isHydrated: false, // 新增：水合状态初始化
};

// 缓存过期时间（5分钟）
const CACHE_EXPIRY = 5 * 60 * 1000;

// 创建用户管理store
export const useUserStore = create<UserStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // 获取用户列表
        fetchUsers: async (params = {}, forceRefresh = false) => {
          const state = get();
          const now = Date.now();
          const mergedParams = { ...state.filters, ...params };
          const cacheKey = cacheUtils.getUsersListKey(mergedParams);

          // 检查缓存是否有效
          if (!forceRefresh) {
            // 先检查内存缓存
            const cachedData = cacheManager.get<UserListResponse>(cacheKey);
            if (cachedData) {
              set((state) => ({
                users: cachedData.data,
                pagination: cachedData.meta,
                filters: {
                  ...state.filters,
                  ...mergedParams,
                  hasActiveFilters: Object.keys(mergedParams).some(
                    (key) =>
                      mergedParams[key as keyof UserListParams] !== undefined &&
                      mergedParams[key as keyof UserListParams] !== "" &&
                      key !== "page" &&
                      key !== "pageSize"
                  ),
                },
                cache: {
                  ...state.cache,
                  lastFetch: now,
                  isStale: false,
                },
              }));
              return;
            }

            // 检查store内部缓存
            if (
              state.cache.lastFetch > 0 &&
              now - state.cache.lastFetch < CACHE_EXPIRY &&
              !state.cache.isStale
            ) {
              return;
            }
          }

          set((state) => ({
            loading: { ...state.loading, list: true },
            error: null,
          }));

          try {
            const actionResponse = await getUsersAction(mergedParams);

            if (
              "code" in actionResponse &&
              actionResponse.code !== 200 &&
              actionResponse.code !== undefined
            ) {
              // 处理 ErrorResponse
              const errorResponse = actionResponse as ApiErrorResponse;
              console.error(
                "获取用户列表失败 (Action Error):",
                errorResponse.message,
                errorResponse.error
              );
              set((state) => ({
                loading: { ...state.loading, list: false },
                error: errorResponse.message || "获取用户列表失败",
              }));
              return;
            }

            // 处理 UserListResponse (成功情况)
            const successResponse = actionResponse as UserListResponse;

            // 缓存响应数据
            cacheManager.set(cacheKey, successResponse, {
              ttl: CACHE_EXPIRY,
              storage: "memory",
              version: state.cache.version.toString(),
            });

            set((state) => ({
              users: successResponse.data,
              pagination: successResponse.meta,
              filters: {
                ...state.filters,
                ...mergedParams,
                hasActiveFilters: Object.keys(mergedParams).some(
                  (key) =>
                    mergedParams[key as keyof UserListParams] !== undefined &&
                    mergedParams[key as keyof UserListParams] !== "" &&
                    key !== "page" &&
                    key !== "pageSize"
                ),
              },
              loading: { ...state.loading, list: false },
              cache: {
                ...state.cache,
                lastFetch: now,
                isStale: false,
              },
              // 清空选择状态
              selection: {
                selectedIds: new Set(),
                isAllSelected: false,
                isIndeterminate: false,
              },
            }));
          } catch (error) {
            // 主要捕获 getUsersAction 内部未处理的意外错误
            console.error("获取用户列表时发生意外错误:", error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "获取用户列表时发生未知网络或客户端错误";
            set((state) => ({
              loading: { ...state.loading, list: false },
              error: errorMessage,
            }));
          }
        },

        // 刷新用户列表
        refreshUsers: async () => {
          const state = get();
          await get().fetchUsers(state.filters, true);
        },

        // 创建用户
        createUser: async (userData) => {
          set((state) => ({
            loading: { ...state.loading, create: true },
            error: null,
          }));

          try {
            const actionResponse = await createAdminUserAction(userData);

            if (
              "code" in actionResponse &&
              actionResponse.code !== 200 &&
              actionResponse.code !== 201 && // 201 for created
              actionResponse.code !== undefined
            ) {
              const errorResponse = actionResponse as ApiErrorResponse;
              console.error(
                "创建用户失败 (Action Error):",
                errorResponse.message,
                errorResponse.error
              );
              set((state) => ({
                loading: { ...state.loading, create: false },
                error: errorResponse.message || "创建用户失败",
              }));
              return null;
            }
            const successResponse = actionResponse as SuccessResponse<User>;
            cacheUtils.clearUserCache();
            await get().refreshUsers();
            set((state) => ({
              loading: { ...state.loading, create: false },
            }));
            return successResponse.data || null;
          } catch (error) {
            console.error("创建用户时发生意外错误:", error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "创建用户时发生未知网络或客户端错误";
            set((state) => ({
              loading: { ...state.loading, create: false },
              error: errorMessage,
            }));
            return null;
          }
        },

        // 更新用户
        updateUser: async (id, userData) => {
          set((state) => ({
            loading: { ...state.loading, update: true },
            error: null,
          }));
          try {
            const actionResponse = await updateAdminUserAction(id, userData);

            if (
              "code" in actionResponse &&
              actionResponse.code !== 200 &&
              actionResponse.code !== undefined
            ) {
              const errorResponse = actionResponse as ApiErrorResponse;
              console.error(
                "更新用户失败 (Action Error):",
                errorResponse.message,
                errorResponse.error
              );
              set((state) => ({
                loading: { ...state.loading, update: false },
                error: errorResponse.message || "更新用户失败",
              }));
              return null;
            }
            const successResponse = actionResponse as SuccessResponse<User>;
            cacheUtils.clearUserCache();
            // 刷新列表或仅更新本地用户
            // 考虑到其他地方可能依赖最新列表，刷新更稳妥
            // await get().refreshUsers();
            // 或者，如果后端返回了完整的更新后的用户对象，可以直接更新本地状态
            if (successResponse.data) {
              set((state) => ({
                users: state.users.map((user) =>
                  user.id === id ? { ...user, ...successResponse.data } : user
                ),
                loading: { ...state.loading, update: false },
              }));
            } else {
              // 如果没有返回data，则刷新列表
              await get().refreshUsers();
              set((state) => ({
                loading: { ...state.loading, update: false },
              }));
            }
            return successResponse.data || null;
          } catch (error) {
            console.error("更新用户时发生意外错误:", error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "更新用户时发生未知网络或客户端错误";
            set((state) => ({
              loading: { ...state.loading, update: false },
              error: errorMessage,
            }));
            return null;
          }
        },

        // 删除用户
        deleteUser: async (id) => {
          set((state) => ({
            loading: { ...state.loading, delete: true },
            error: null,
          }));
          try {
            const actionResponse = await deleteAdminUserAction(id);

            if (
              "code" in actionResponse &&
              actionResponse.code !== 200 &&
              actionResponse.code !== undefined
            ) {
              // 通常删除成功是 200 或 204 (No Content)
              const errorResponse = actionResponse as ApiErrorResponse;
              console.error(
                "删除用户失败 (Action Error):",
                errorResponse.message,
                errorResponse.error
              );
              set((state) => ({
                loading: { ...state.loading, delete: false },
                error: errorResponse.message || "删除用户失败",
              }));
              return false;
            }

            // SuccessResponse (可能无 data)
            cacheUtils.clearUserCache();
            set((state) => ({
              users: state.users.filter((user) => user.id !== id),
              loading: { ...state.loading, delete: false },
              selection: {
                ...state.selection,
                selectedIds: new Set(
                  [...state.selection.selectedIds].filter(
                    (selectedId) => selectedId !== id
                  )
                ),
              },
            }));
            // 刷新列表确保数据一致性，因为分页等信息可能改变
            await get().refreshUsers();
            return true;
          } catch (error) {
            console.error("删除用户时发生意外错误:", error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "删除用户时发生未知网络或客户端错误";
            set((state) => ({
              loading: { ...state.loading, delete: false },
              error: errorMessage,
            }));
            return false;
          }
        },

        // 更改用户状态
        // 注意：原始 changeUserStatus API 比较复杂，涉及 fromStatus, toStatus。
        // Server Actions (approveUserAction, banUserAction, etc.) 更直接。
        // 这里需要根据 toStatus 调用不同的 Action。
        changeUserStatus: async (userId, fromStatus, toStatus, reason) => {
          set((state) => ({
            loading: { ...state.loading, statusChange: true },
            error: null,
          }));

          let actionResponse: SuccessResponse<User> | ApiErrorResponse | null =
            null;

          try {
            switch (toStatus) {
              case UserStatus.NORMAL:
                if (fromStatus === UserStatus.PENDING) {
                  actionResponse = await approveUserAction(userId);
                } else if (fromStatus === UserStatus.DISABLED) {
                  actionResponse = await unbanUserAction(userId);
                } else {
                  console.warn(
                    `Unsupported status transition from ${fromStatus} to ${toStatus}`
                  );
                  set((state) => ({
                    loading: { ...state.loading, statusChange: false },
                    error: "不支持的状态变更",
                  }));
                  return null;
                }
                break;
              case UserStatus.DISABLED:
                actionResponse = await banUserAction(userId);
                break;
              case UserStatus.REJECTED:
                actionResponse = await rejectUserAction(userId, reason);
                break;
              default:
                console.warn(`Unsupported target status: ${toStatus}`);
                set((state) => ({
                  loading: { ...state.loading, statusChange: false },
                  error: "不支持的目标状态",
                }));
                return null;
            }

            if (!actionResponse) {
              set((state) => ({
                loading: { ...state.loading, statusChange: false },
                error: "状态变更操作未执行",
              }));
              return null;
            }

            if (
              "code" in actionResponse &&
              actionResponse.code !== 200 &&
              actionResponse.code !== undefined
            ) {
              const errorResponse = actionResponse as ApiErrorResponse;
              console.error(
                `更改用户状态至 ${toStatus} 失败 (Action Error):`,
                errorResponse.message,
                errorResponse.error
              );
              set((state) => ({
                loading: { ...state.loading, statusChange: false },
                error:
                  errorResponse.message || `更改用户状态至 ${toStatus} 失败`,
              }));
              return null;
            }

            const successResponse = actionResponse as SuccessResponse<User>;
            cacheUtils.clearUserCache();

            if (successResponse.data) {
              set((state) => ({
                users: state.users.map((user) =>
                  user.id === userId
                    ? { ...user, ...successResponse.data }
                    : user
                ),
                loading: { ...state.loading, statusChange: false },
              }));
            } else {
              await get().refreshUsers();
              set((state) => ({
                loading: { ...state.loading, statusChange: false },
              }));
            }
            return successResponse.data || null;
          } catch (error) {
            console.error(`更改用户状态至 ${toStatus} 时发生意外错误:`, error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : `更改用户状态至 ${toStatus} 时发生未知网络或客户端错误`;
            set((state) => ({
              loading: { ...state.loading, statusChange: false },
              error: errorMessage,
            }));
            return null;
          }
        },

        // 批量批准
        batchApprove: async (userIds) => {
          set((state) => ({
            loading: { ...state.loading, batchOperation: true },
            error: null,
          }));
          try {
            const actionResponse = await batchApproveUsersAction(userIds);
            if (
              "code" in actionResponse &&
              actionResponse.code !== 200 &&
              actionResponse.code !== undefined
            ) {
              const errorResponse = actionResponse as ApiErrorResponse;
              console.error(
                "批量批准失败 (Action Error):",
                errorResponse.message,
                errorResponse.error
              );
              set((state) => ({
                loading: { ...state.loading, batchOperation: false },
                error: errorResponse.message || "批量批准失败",
              }));
              return null;
            }
            const successResponse =
              actionResponse as SuccessResponse<BatchOperationResult>;
            cacheUtils.clearUserCache();
            await get().refreshUsers();
            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              selection: {
                selectedIds: new Set(),
                isAllSelected: false,
                isIndeterminate: false,
              },
            }));
            return successResponse.data || null;
          } catch (error) {
            console.error("批量批准时发生意外错误:", error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "批量批准时发生未知网络或客户端错误";
            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              error: errorMessage,
            }));
            return null;
          }
        },

        // 批量拒绝
        batchReject: async (userIds, reason) => {
          set((state) => ({
            loading: { ...state.loading, batchOperation: true },
            error: null,
          }));
          try {
            const actionResponse = await batchRejectUsersAction(
              userIds,
              reason
            );
            if (
              "code" in actionResponse &&
              actionResponse.code !== 200 &&
              actionResponse.code !== undefined
            ) {
              const errorResponse = actionResponse as ApiErrorResponse;
              console.error(
                "批量拒绝失败 (Action Error):",
                errorResponse.message,
                errorResponse.error
              );
              set((state) => ({
                loading: { ...state.loading, batchOperation: false },
                error: errorResponse.message || "批量拒绝失败",
              }));
              return null;
            }
            const successResponse =
              actionResponse as SuccessResponse<BatchOperationResult>;
            cacheUtils.clearUserCache();
            await get().refreshUsers();
            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              selection: {
                selectedIds: new Set(),
                isAllSelected: false,
                isIndeterminate: false,
              },
            }));
            return successResponse.data || null;
          } catch (error) {
            console.error("批量拒绝时发生意外错误:", error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "批量拒绝时发生未知网络或客户端错误";
            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              error: errorMessage,
            }));
            return null;
          }
        },

        // 批量封禁
        batchBan: async (userIds) => {
          set((state) => ({
            loading: { ...state.loading, batchOperation: true },
            error: null,
          }));
          try {
            const actionResponse = await batchBanUsersAction(userIds);
            if (
              "code" in actionResponse &&
              actionResponse.code !== 200 &&
              actionResponse.code !== undefined
            ) {
              const errorResponse = actionResponse as ApiErrorResponse;
              console.error(
                "批量封禁失败 (Action Error):",
                errorResponse.message,
                errorResponse.error
              );
              set((state) => ({
                loading: { ...state.loading, batchOperation: false },
                error: errorResponse.message || "批量封禁失败",
              }));
              return null;
            }
            const successResponse =
              actionResponse as SuccessResponse<BatchOperationResult>;
            cacheUtils.clearUserCache();
            await get().refreshUsers();
            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              selection: {
                selectedIds: new Set(),
                isAllSelected: false,
                isIndeterminate: false,
              },
            }));
            return successResponse.data || null;
          } catch (error) {
            console.error("批量封禁时发生意外错误:", error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "批量封禁时发生未知网络或客户端错误";
            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              error: errorMessage,
            }));
            return null;
          }
        },

        // 批量解封
        batchUnban: async (userIds) => {
          set((state) => ({
            loading: { ...state.loading, batchOperation: true },
            error: null,
          }));
          try {
            const actionResponse = await batchUnbanUsersAction(userIds);
            if (
              "code" in actionResponse &&
              actionResponse.code !== 200 &&
              actionResponse.code !== undefined
            ) {
              const errorResponse = actionResponse as ApiErrorResponse;
              console.error(
                "批量解封失败 (Action Error):",
                errorResponse.message,
                errorResponse.error
              );
              set((state) => ({
                loading: { ...state.loading, batchOperation: false },
                error: errorResponse.message || "批量解封失败",
              }));
              return null;
            }
            const successResponse =
              actionResponse as SuccessResponse<BatchOperationResult>;
            cacheUtils.clearUserCache();
            await get().refreshUsers();
            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              selection: {
                selectedIds: new Set(),
                isAllSelected: false,
                isIndeterminate: false,
              },
            }));
            return successResponse.data || null;
          } catch (error) {
            console.error("批量解封时发生意外错误:", error);
            const errorMessage =
              error instanceof Error
                ? error.message
                : "批量解封时发生未知网络或客户端错误";
            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              error: errorMessage,
            }));
            return null;
          }
        },

        // 设置筛选条件
        setFilters: (newFilters) => {
          set((state) => {
            const updatedFilters = { ...state.filters, ...newFilters, page: 1 };
            return {
              filters: {
                ...updatedFilters,
                hasActiveFilters: Object.keys(updatedFilters).some(
                  (key) =>
                    updatedFilters[key as keyof UserListParams] !== undefined &&
                    updatedFilters[key as keyof UserListParams] !== "" &&
                    key !== "page" &&
                    key !== "pageSize" &&
                    key !== "isFilterOpen" &&
                    key !== "hasActiveFilters"
                ),
              },
              cache: { ...state.cache, isStale: true },
            };
          });

          // 自动获取数据
          get().fetchUsers();
        },

        // 清空筛选条件
        clearFilters: () => {
          set((state) => ({
            filters: {
              page: 1,
              pageSize: state.filters.pageSize,
              isFilterOpen: state.filters.isFilterOpen,
              hasActiveFilters: false,
            },
            cache: { ...state.cache, isStale: true },
          }));

          // 自动获取数据
          get().fetchUsers();
        },

        // 切换筛选面板
        toggleFilterPanel: () => {
          set((state) => ({
            filters: {
              ...state.filters,
              isFilterOpen: !state.filters.isFilterOpen,
            },
          }));
        },

        // 选择用户
        selectUser: (id) => {
          set((state) => {
            const newSelectedIds = new Set(state.selection.selectedIds);
            newSelectedIds.add(id);

            return {
              selection: {
                selectedIds: newSelectedIds,
                isAllSelected: newSelectedIds.size === state.users.length,
                isIndeterminate:
                  newSelectedIds.size > 0 &&
                  newSelectedIds.size < state.users.length,
              },
            };
          });
        },

        // 批量选择用户
        selectUsers: (ids) => {
          set((state) => {
            const newSelectedIds = new Set([
              ...state.selection.selectedIds,
              ...ids,
            ]);

            return {
              selection: {
                selectedIds: newSelectedIds,
                isAllSelected: newSelectedIds.size === state.users.length,
                isIndeterminate:
                  newSelectedIds.size > 0 &&
                  newSelectedIds.size < state.users.length,
              },
            };
          });
        },

        // 取消选择用户
        unselectUser: (id) => {
          set((state) => {
            const newSelectedIds = new Set(state.selection.selectedIds);
            newSelectedIds.delete(id);

            return {
              selection: {
                selectedIds: newSelectedIds,
                isAllSelected: false,
                isIndeterminate: newSelectedIds.size > 0,
              },
            };
          });
        },

        // 批量取消选择用户
        unselectUsers: (ids) => {
          set((state) => {
            const newSelectedIds = new Set(state.selection.selectedIds);
            ids.forEach((id) => newSelectedIds.delete(id));

            return {
              selection: {
                selectedIds: newSelectedIds,
                isAllSelected: false,
                isIndeterminate: newSelectedIds.size > 0,
              },
            };
          });
        },

        // 全选
        selectAll: () => {
          set((state) => ({
            selection: {
              selectedIds: new Set(state.users.map((user) => user.id)),
              isAllSelected: true,
              isIndeterminate: false,
            },
          }));
        },

        // 取消全选
        unselectAll: () => {
          set(() => ({
            selection: {
              selectedIds: new Set(),
              isAllSelected: false,
              isIndeterminate: false,
            },
          }));
        },

        // 切换用户选择状态
        toggleUserSelection: (id) => {
          const state = get();
          if (state.selection.selectedIds.has(id)) {
            get().unselectUser(id);
          } else {
            get().selectUser(id);
          }
        },

        // 切换全选状态
        toggleAllSelection: () => {
          const state = get();
          if (state.selection.isAllSelected) {
            get().unselectAll();
          } else {
            get().selectAll();
          }
        },

        // 设置页码
        setPage: (page) => {
          set((state) => ({
            filters: { ...state.filters, page },
            cache: { ...state.cache, isStale: true },
          }));

          get().fetchUsers();
        },

        // 设置每页大小
        setPageSize: (pageSize) => {
          set((state) => ({
            filters: { ...state.filters, pageSize, page: 1 },
            cache: { ...state.cache, isStale: true },
          }));

          get().fetchUsers();
        },

        // 使缓存失效
        invalidateCache: () => {
          cacheUtils.clearUserCache();
          set((state) => ({
            cache: { ...state.cache, isStale: true },
          }));
        },

        // 更新缓存版本
        updateCacheVersion: () => {
          set((state) => ({
            cache: { ...state.cache, version: state.cache.version + 1 },
          }));
          cacheUtils.clearUserCache();
        },

        // 设置错误
        setError: (error) => {
          set(() => ({ error }));
        },

        // 清除错误
        clearError: () => {
          set(() => ({ error: null }));
        },

        // 水合状态管理
        setHydrated: () => {
          set(() => ({ isHydrated: true }));
        },

        // 重置状态
        reset: () => {
          set(() => ({ ...initialState }));
        },
      }),
      {
        name: "user-store",
        // 只持久化筛选条件和分页设置，确保不覆盖关键状态
        partialize: (state) => ({
          filters: {
            pageSize: state.filters.pageSize,
            sort_by: state.filters.sort_by,
            order: state.filters.order,
          },
        }),
        // 状态合并逻辑，确保持久化数据不覆盖初始状态
        merge: (persistedState, currentState) => {
          // 安全的状态合并，确保 persistedState 存在
          const safePersistedState = persistedState || {};
          return {
            ...currentState,
            ...safePersistedState,
            // 确保关键状态不被持久化数据覆盖
            users: currentState.users,
            pagination: currentState.pagination,
            loading: currentState.loading,
            cache: currentState.cache,
            selection: currentState.selection,
            error: currentState.error,
            isHydrated: false, // 水合过程中设为 false
          };
        },
        // 水合完成回调
        onRehydrateStorage: () => {
          console.log("🔄 用户状态开始水合");
          return (state, error) => {
            if (error) {
              console.error("❌ 用户状态水合失败:", error);
              // 水合失败时设置为已水合，避免无限等待
              setTimeout(() => {
                useUserStore.getState().setHydrated();
              }, 0);
            } else {
              console.log("✅ 用户状态水合完成");
              // 设置水合完成状态
              setTimeout(() => {
                useUserStore.getState().setHydrated();
              }, 0);
            }
          };
        },
      }
    ),
    {
      name: "user-store",
    }
  )
);

// 默认值常量，避免每次创建新对象
const defaultPagination = { page: 1, page_size: 20, total: 0 };
const defaultFilters = {
  page: 1,
  pageSize: 20,
  isFilterOpen: false,
  hasActiveFilters: false,
};
const defaultSelection = {
  selectedIds: new Set(),
  isAllSelected: false,
  isIndeterminate: false,
};
const defaultLoading = {
  list: false,
  create: false,
  update: false,
  delete: false,
  statusChange: false,
  batchOperation: false,
};

// 选择器函数 - 使用缓存的默认值
export const useUserList = () => useUserStore((state) => state.users);
export const useUserPagination = () =>
  useUserStore((state) => state.pagination);
export const useUserFilters = () => useUserStore((state) => state.filters);
export const useUserSelection = () => useUserStore((state) => state.selection);
export const useUserLoading = () => useUserStore((state) => state.loading);
export const useUserError = () => useUserStore((state) => state.error);
export const useUserHydrated = () => useUserStore((state) => state.isHydrated);

// 计算属性选择器
export const useSelectedUsers = () =>
  useUserStore((state) =>
    state.users.filter((user) => state.selection.selectedIds.has(user.id))
  );

export const useSelectedUserIds = () =>
  useUserStore((state) => Array.from(state.selection.selectedIds));

export const useHasSelection = () =>
  useUserStore((state) => state.selection.selectedIds.size > 0);

export const useSelectionCount = () =>
  useUserStore((state) => state.selection.selectedIds.size);

