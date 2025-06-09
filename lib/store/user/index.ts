/**
 * @file User Store Barrel.
 *
 * @description
 * This file serves as the central hub for the user-related state management in the application.
 * It re-exports all individual user store modules and provides a collection of convenient
 * selector hooks. These hooks are designed to simplify state access within UI components,
 * promoting a clean and maintainable architecture.
 *
 * By consolidating store exports and providing dedicated selectors, this module offers a
 * unified and intuitive API for interacting with user state, abstracting away the
 * underlying store implementation details.
 */

import { useStore } from "zustand";
import { User } from "@/lib/types/user";
import {
  userDataStore,
  UserDataState,
  UserDataActions,
} from "./user-data.store";
import {
  useUserFilterStore,
  UserFilterState,
  UserFilterActions,
} from "./user-filter.store";
import { useUserSelectionStore } from "./user-selection.store";
import { useUserActionStore, UserActionState } from "./user-action.store";
import { useUserBatchStore, UserBatchState } from "./user-batch.store";
import { useUserDataHydration } from "./user-hydration.store";

// ============================================================================
// STORE RE-EXPORTS
// ============================================================================
export * from "./user-action.store";
export * from "./user-batch.store";
export * from "./user-cache.store";
export * from "./user-data.store";
export * from "./user-filter.store";
export * from "./user-hydration.store";
export * from "./user-selection.store";

// ============================================================================
// CONVENIENCE SELECTOR HOOKS
// ============================================================================

// --- User Data Selectors ---
/**
 * Hook to get the current list of users.
 * @returns An array of user objects.
 */
export const useUsers = () =>
  useStore(userDataStore, (state: UserDataState) => state.users);

/**
 * Hook to get the total number of users.
 * @returns The total user count.
 */
export const useTotalUsers = () =>
  useStore(userDataStore, (state: UserDataState) => state.total);

/**
 * Hook to get the current pagination state.
 * @returns The pagination object { page, limit }.
 */
export const useUserPagination = () =>
  useUserFilterStore((state: UserFilterState) => state.pagination);

/**
 * Hook to check if the user list is currently being loaded.
 * @returns `true` if users are loading, `false` otherwise.
 */
export const useIsUsersLoading = () =>
  useStore(userDataStore, (state: UserDataState) => state.loading);

/**
 * Hook to get the user data fetching error, if any.
 * @returns The error object or null.
 */
export const useUsersError = () =>
  useStore(userDataStore, (state: UserDataState) => state.error);

// --- User Filter Selectors ---
/**
 * Hook to get the current filter values.
 * @returns The filter object.
 */
export const useUserFilters = () =>
  useUserFilterStore((state: UserFilterState) => state.filters);

/**
 * Hook to get the current search query.
 * @returns The search string.
 */
export const useUserSearchQuery = () =>
  useUserFilterStore((state: UserFilterState) => state.filters.search);

/**
 * Hook to get the filter actions.
 * @returns An object containing filter action functions.
 */
export const useUserFilterActions = (): UserFilterActions => {
  return useUserFilterStore((state: UserFilterActions) => ({
    setFilters: state.setFilters,
    setPagination: state.setPagination,
    resetFilters: state.resetFilters,
    goToPage: state.goToPage,
  }));
};

// --- User Selection Selectors ---
/**
 * Hook to get the set of selected user IDs.
 * @returns A Set of selected user IDs.
 */
export const useSelectedUserIds = () =>
  useUserSelectionStore((state: any) => state.selectedUserIds);

/**
 * Hook to get the count of selected users.
 * @returns The number of selected users.
 */
export const useSelectedUserCount = () =>
  useUserSelectionStore((state: any) => state.selectedUserIds.size);

/**
 * Hook to check if all currently displayed users are selected.
 * This requires access to both selection and data stores.
 * @returns `true` if all users are selected, `false` otherwise.
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
 * Hook to get the selection action functions.
 * @returns An object containing selection actions.
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

// --- User Action Selectors ---
/**
 * Hook to check if a specific user action is in progress.
 * @returns `true` if an action is running, `false` otherwise.
 */
export const useIsUserActionLoading = () =>
  useUserActionStore((state: UserActionState) =>
    Object.values(state.loading).some((record) =>
      Object.values(record).some(Boolean)
    )
  );

/**
 * Hook to get the user action functions.
 * @returns An object containing user actions.
 */
export const useUserActions = () => {
  return useUserActionStore((state: UserActionState) => ({
    changeUserStatus: state.changeUserStatus,
    deleteUser: state.deleteUser,
    resetPassword: state.resetPassword,
    clearError: state.clearError,
  }));
};

// --- User Batch Selectors ---
/**
 * Hook to check if a batch operation is in progress.
 * @returns `true` if a batch action is running, `false` otherwise.
 */
export const useIsBatchActionLoading = () =>
  useUserBatchStore((state: UserBatchState) => state.isBatching);

/**
 * Hook to get the batch action functions.
 * @returns An object containing batch actions.
 */
export const useUserBatchActions = () => {
  return useUserBatchStore((state: UserBatchState) => ({
    executeBatchAction: state.executeBatchAction,
  }));
};

// --- Hydration Hook ---
/**
 * Custom hook to manage the hydration of user-related stores.
 * It ensures that client-side stores are correctly initialized
 * after server-side rendering.
 */
export { useUserDataHydration };
