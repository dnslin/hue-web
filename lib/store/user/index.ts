/**
 * @file 用户 Store 集合点
 *
 * @description
 * 该文件是应用程序中用户相关状态管理的中心枢纽。
 * 它重新导出了所有独立的用户 store 模块，并提供了一系列方便的选择器钩子 (selector hooks)。
 * 这些钩子旨在简化 UI 组件内部的状态访问，从而推广一种清晰且可维护的架构。
 *
 * 通过整合 store 导出并提供专用的选择器，该模块为与用户状态交互提供了一个统一且直观的 API，
 * 同时抽象了底层 store 的实现细节。
 */

import { useStore } from "zustand";
import { User } from "@/lib/types/user";
import { userDataStore, UserDataState } from "./data";
import {
  useUserFilterStore,
  UserFilterState,
  UserFilterActions,
} from "./filter";
import { useUserSelectionStore } from "./selection";
import { useUserActionStore, UserActionState } from "./action";
import { useUserBatchStore, UserBatchState } from "./batch";
import { useUserDataHydration } from "./hydration";

// ============================================================================
// STORE RE-EXPORTS
// ============================================================================
export * from "./action";
export * from "./batch";
export * from "./cache";
export * from "./data";
export * from "./filter";
export * from "./hydration";
export * from "./selection";

// ============================================================================
// CONVENIENCE SELECTOR HOOKS
// ============================================================================

// --- 用户数据选择器 ---
/**
 * @hook useUsers
 * @description 获取当前用户列表。
 * @returns {User[]} 用户对象数组。
 */
export const useUsers = () =>
  useStore(userDataStore, (state: UserDataState) => state.users);

/**
 * @hook useTotalUsers
 * @description 获取用户总数。
 * @returns {number} 用户总数。
 */
export const useTotalUsers = () =>
  useStore(userDataStore, (state: UserDataState) => state.total);

/**
 * @hook useUserPagination
 * @description 获取当前的分页状态。
 * @returns {object} 分页对象 { page, pageSize }。
 */
export const useUserPagination = () =>
  useUserFilterStore((state: UserFilterState) => state.pagination);

/**
 * @hook useIsUsersLoading
 * @description 检查用户列表当前是否正在加载。
 * @returns {boolean} 如果正在加载则为 `true`，否则为 `false`。
 */
export const useIsUsersLoading = () =>
  useStore(userDataStore, (state: UserDataState) => state.loading);

/**
 * @hook useUsersError
 * @description 获取用户数据加载时发生的错误。
 * @returns {string | null} 错误信息或 null。
 */
export const useUsersError = () =>
  useStore(userDataStore, (state: UserDataState) => state.error);

// --- 用户筛选选择器 ---
/**
 * @hook useUserFilters
 * @description 获取当前的筛选条件值。
 * @returns {object} 筛选条件对象。
 */
export const useUserFilters = () =>
  useUserFilterStore((state: UserFilterState) => state.filters);

/**
 * @hook useUserSearchQuery
 * @description 获取当前的搜索查询。
 * @returns {string} 搜索字符串。
 */
export const useUserSearchQuery = () =>
  useUserFilterStore((state: UserFilterState) => state.filters.search);

/**
 * @hook useUserFilterActions
 * @description 获取筛选相关的操作函数。
 * @returns {object} 包含筛选操作函数的对象。
 */
export const useUserFilterActions = (): UserFilterActions => {
  return useUserFilterStore((state: UserFilterActions) => ({
    setFilters: state.setFilters,
    setPagination: state.setPagination,
    resetFilters: state.resetFilters,
    goToPage: state.goToPage,
  }));
};

// --- 用户选择选择器 ---
/**
 * @hook useSelectedUserIds
 * @description 获取已选择用户 ID 的集合。
 * @returns {Set<number>} 已选择用户 ID 的 Set 集合。
 */
export const useSelectedUserIds = () =>
  useUserSelectionStore((state: any) => state.selectedUserIds);

/**
 * @hook useSelectedUserCount
 * @description 获取已选择用户的数量。
 * @returns {number} 已选择用户的数量。
 */
export const useSelectedUserCount = () =>
  useUserSelectionStore((state: any) => state.selectedUserIds.size);

/**
 * @hook useIsAllUsersSelected
 * @description 检查当前显示的所有用户是否都已被选择。
 * @description 需要同时访问选择 store 和数据 store。
 * @returns {boolean} 如果所有用户都已选择则为 `true`，否则为 `false`。
 */
export const useIsAllUsersSelected = () => {
  const selectedUserIds = useUserSelectionStore(
    (state: any) => state.selectedUserIds
  );
  const users = useStore(userDataStore, (state: any) => state.users);
  return (
    users.length > 0 &&
    users.every((user: User) => selectedUserIds.has(user.id as number))
  );
};

/**
 * @hook useUserSelectionActions
 * @description 获取选择相关的操作函数。
 * @returns {object} 包含选择操作函数的对象。
 */
export const useUserSelectionActions = () => {
  return useUserSelectionStore((state: any) => ({
    toggleUserSelection: state.toggleUserSelection,
    toggleAllUsersSelection: state.toggleAllUsersSelection,
    clearSelection: state.clearSelection,
    isUserSelected: state.isUserSelected,
    isAllSelected: state.isAllSelected,
  }));
};

// --- 用户操作选择器 ---
/**
 * @hook useIsUserActionLoading
 * @description 检查是否有任何用户相关的操作正在进行中。
 * @returns {boolean} 如果有操作正在运行则为 `true`，否则为 `false`。
 */
export const useIsUserActionLoading = () =>
  useUserActionStore((state: UserActionState) =>
    Object.values(state.loading).some((record) =>
      Object.values(record).some(Boolean)
    )
  );

/**
 * @hook useUserActions
 * @description 获取用户相关的操作函数。
 * @returns {object} 包含用户操作函数的对象。
 */
export const useUserActions = () => {
  return useUserActionStore((state: UserActionState) => ({
    changeUserStatus: state.changeUserStatus,
    deleteUser: state.deleteUser,
    resetPassword: state.resetPassword,
    clearError: state.clearError,
  }));
};

// --- 用户批量操作选择器 ---
/**
 * @hook useIsBatchActionLoading
 * @description 检查是否有批量操作正在进行中。
 * @returns {boolean} 如果有批量操作正在运行则为 `true`，否则为 `false`。
 */
export const useIsBatchActionLoading = () =>
  useUserBatchStore((state: UserBatchState) => state.isBatching);

/**
 * @hook useUserBatchActions
 * @description 获取批量操作相关的函数。
 * @returns {object} 包含批量操作函数的对象。
 */
export const useUserBatchActions = () => {
  return useUserBatchStore((state: UserBatchState) => ({
    executeBatchAction: state.executeBatchAction,
  }));
};

// --- 水合钩子 ---
/**
 * @hook useUserDataHydration
 * @description 管理用户相关 store 的水合 (hydration) 过程。
 * @description 确保在服务端渲染 (SSR) 之后，客户端的 store 能够被正确初始化。
 */
export { useUserDataHydration };

