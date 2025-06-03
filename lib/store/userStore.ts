import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  User,
  UserListParams,
  UserStatus,
  PaginationMeta,
  BatchOperationResult,
  AdminUserCreateRequest,
  UserUpdateRequest,
} from "@/lib/types/user";
import {
  getAdminUserList,
  changeUserStatus,
  batchChangeUserStatus,
  deleteAdminUser,
  createAdminUser,
  updateAdminUser,
} from "@/lib/api/adminUsers";

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

          // 检查缓存是否有效
          if (
            !forceRefresh &&
            state.cache.lastFetch > 0 &&
            now - state.cache.lastFetch < CACHE_EXPIRY &&
            !state.cache.isStale
          ) {
            return;
          }

          set((state) => ({
            loading: { ...state.loading, list: true },
            error: null,
          }));

          try {
            const mergedParams = { ...state.filters, ...params };
            const response = await getAdminUserList(mergedParams);

            set((state) => ({
              users: response.data,
              pagination: response.meta,
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
            console.error("获取用户列表失败:", error);
            set((state) => ({
              loading: { ...state.loading, list: false },
              error:
                error instanceof Error ? error.message : "获取用户列表失败",
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
            const response = await createAdminUser(userData);

            // 刷新列表
            await get().refreshUsers();

            set((state) => ({
              loading: { ...state.loading, create: false },
            }));

            return response.data || null;
          } catch (error) {
            console.error("创建用户失败:", error);
            set((state) => ({
              loading: { ...state.loading, create: false },
              error: error instanceof Error ? error.message : "创建用户失败",
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
            const response = await updateAdminUser(id, userData);

            // 更新本地状态
            set((state) => ({
              users: state.users.map((user) =>
                user.id === id ? { ...user, ...response.data } : user
              ),
              loading: { ...state.loading, update: false },
            }));

            return response.data || null;
          } catch (error) {
            console.error("更新用户失败:", error);
            set((state) => ({
              loading: { ...state.loading, update: false },
              error: error instanceof Error ? error.message : "更新用户失败",
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
            await deleteAdminUser(id);

            // 从本地状态移除
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

            return true;
          } catch (error) {
            console.error("删除用户失败:", error);
            set((state) => ({
              loading: { ...state.loading, delete: false },
              error: error instanceof Error ? error.message : "删除用户失败",
            }));
            return false;
          }
        },

        // 更改用户状态
        changeUserStatus: async (userId, fromStatus, toStatus, reason) => {
          set((state) => ({
            loading: { ...state.loading, statusChange: true },
            error: null,
          }));

          try {
            const response = await changeUserStatus(
              userId,
              fromStatus,
              toStatus,
              reason
            );

            // 更新本地状态
            set((state) => ({
              users: state.users.map((user) =>
                user.id === userId ? { ...user, ...response.data } : user
              ),
              loading: { ...state.loading, statusChange: false },
            }));

            return response.data || null;
          } catch (error) {
            console.error("更改用户状态失败:", error);
            set((state) => ({
              loading: { ...state.loading, statusChange: false },
              error:
                error instanceof Error ? error.message : "更改用户状态失败",
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
            const response = await batchChangeUserStatus(userIds, "approve");

            // 刷新列表
            await get().refreshUsers();

            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              selection: {
                selectedIds: new Set(),
                isAllSelected: false,
                isIndeterminate: false,
              },
            }));

            return response.data || null;
          } catch (error) {
            console.error("批量批准失败:", error);
            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              error: error instanceof Error ? error.message : "批量批准失败",
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
            const response = await batchChangeUserStatus(
              userIds,
              "reject",
              reason
            );

            // 刷新列表
            await get().refreshUsers();

            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              selection: {
                selectedIds: new Set(),
                isAllSelected: false,
                isIndeterminate: false,
              },
            }));

            return response.data || null;
          } catch (error) {
            console.error("批量拒绝失败:", error);
            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              error: error instanceof Error ? error.message : "批量拒绝失败",
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
            const response = await batchChangeUserStatus(userIds, "ban");

            // 刷新列表
            await get().refreshUsers();

            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              selection: {
                selectedIds: new Set(),
                isAllSelected: false,
                isIndeterminate: false,
              },
            }));

            return response.data || null;
          } catch (error) {
            console.error("批量封禁失败:", error);
            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              error: error instanceof Error ? error.message : "批量封禁失败",
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
            const response = await batchChangeUserStatus(userIds, "unban");

            // 刷新列表
            await get().refreshUsers();

            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              selection: {
                selectedIds: new Set(),
                isAllSelected: false,
                isIndeterminate: false,
              },
            }));

            return response.data || null;
          } catch (error) {
            console.error("批量解封失败:", error);
            set((state) => ({
              loading: { ...state.loading, batchOperation: false },
              error: error instanceof Error ? error.message : "批量解封失败",
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
          set((state) => ({
            cache: { ...state.cache, isStale: true },
          }));
        },

        // 更新缓存版本
        updateCacheVersion: () => {
          set((state) => ({
            cache: { ...state.cache, version: state.cache.version + 1 },
          }));
        },

        // 设置错误
        setError: (error) => {
          set(() => ({ error }));
        },

        // 清除错误
        clearError: () => {
          set(() => ({ error: null }));
        },

        // 重置状态
        reset: () => {
          set(() => ({ ...initialState }));
        },
      }),
      {
        name: "user-store",
        // 只持久化筛选条件和分页设置
        partialize: (state) => ({
          filters: {
            pageSize: state.filters.pageSize,
            sort_by: state.filters.sort_by,
            order: state.filters.order,
          },
        }),
      }
    ),
    {
      name: "user-store",
    }
  )
);

// 选择器函数
export const useUserList = () => useUserStore((state) => state.users);
export const useUserPagination = () =>
  useUserStore((state) => state.pagination);
export const useUserFilters = () => useUserStore((state) => state.filters);
export const useUserSelection = () => useUserStore((state) => state.selection);
export const useUserLoading = () => useUserStore((state) => state.loading);
export const useUserError = () => useUserStore((state) => state.error);

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
