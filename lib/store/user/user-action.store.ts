import { create } from "zustand";
import {
  User,
  UserStatus,
  UserUpdateRequest,
  AdminUserCreateRequest,
} from "@/lib/types/user";
import type { SuccessApiResponse, ErrorApiResponse } from "@/lib/types/common";
import { isSuccessApiResponse } from "@/lib/types/common";
import {
  approveUserAction,
  rejectUserAction,
  banUserAction,
  unbanUserAction,
  deleteAdminUserAction,
  updateAdminUserAction,
  resetPasswordUserAction,
  createAdminUserAction,
} from "@/lib/actions/users/user.actions";
import { userDataStore } from "./user-data.store";
import { useUserCacheStore } from "./user-cache.store";
import { handleStoreError } from "@/lib/utils/error-handler";

// 定义加载状态的类型，针对每个具体操作
interface ActionLoadingState {
  isChangingStatus: Record<number, boolean>; // 按用户ID跟踪状态变更
  isDeleting: Record<number, boolean>; // 按用户ID跟踪删除
  isResettingPassword: Record<number, boolean>; // 按用户ID跟踪密码重置
  isUpdating: Record<number, boolean>; // 按用户ID跟踪信息更新
  isCreating: boolean; // 创建用户的加载状态
}

// 定义错误状态的类型
interface ActionErrorState {
  statusChangeError: Record<number, string | null>;
  deleteError: Record<number, string | null>;
  resetPasswordError: Record<number, string | null>;
  updateError: Record<number, string | null>;
  createError: string | null; // 创建用户的错误状态
}

// Store 的完整状态接口
export interface UserActionState {
  loading: ActionLoadingState;
  error: ActionErrorState;
  changeUserStatus: (
    user: User,
    toStatus: UserStatus,
    reason?: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (userId: number) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    userId: number
  ) => Promise<{ success: boolean; newPassword?: string; error?: string }>;
  updateUser: (
    userId: number,
    updateData: UserUpdateRequest
  ) => Promise<{ success: boolean; error?: string }>;
  createUser: (
    userData: AdminUserCreateRequest
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  clearError: (action: keyof ActionErrorState, userId?: number) => void;
}

/**
 * 用户操作 Store
 *
 * 负责处理单个用户的具体操作，如状态变更、删除、重置密码等。
 * 操作成功后会触发 user-data.store 的数据刷新。
 */
export const useUserActionStore = create<UserActionState>((set) => ({
  loading: {
    isChangingStatus: {},
    isDeleting: {},
    isResettingPassword: {},
    isUpdating: {},
    isCreating: false,
  },
  error: {
    statusChangeError: {},
    deleteError: {},
    resetPasswordError: {},
    updateError: {},
    createError: null,
  },

  // 清除特定操作的错误信息
  clearError: (action, userId) => {
    if (action === "createError") {
      set((state) => ({
        error: {
          ...state.error,
          createError: null,
        },
      }));
    } else if (userId !== undefined) {
      set((state) => ({
        error: {
          ...state.error,
          [action]: {
            ...state.error[action],
            [userId]: null,
          },
        },
      }));
    }
  },

  // 更改用户状态
  changeUserStatus: async (user, toStatus, reason) => {
    const { id: userId, status: fromStatus } = user;

    set((state) => ({
      loading: {
        ...state.loading,
        isChangingStatus: { ...state.loading.isChangingStatus, [userId]: true },
      },
      error: {
        ...state.error,
        statusChangeError: { ...state.error.statusChangeError, [userId]: null },
      },
    }));

    let actionResponse: SuccessApiResponse<User> | ErrorApiResponse | null =
      null;

    try {
      switch (toStatus) {
        case UserStatus.NORMAL:
          if (fromStatus === UserStatus.PENDING) {
            actionResponse = await approveUserAction(userId);
          } else if (fromStatus === UserStatus.BANNED) {
            actionResponse = await unbanUserAction(userId);
          } else {
            const error = new Error(
              `不支持从 ${fromStatus} 到 ${toStatus} 的状态转换`
            );
            const result = await handleStoreError(error, "更改用户状态");
            return { success: false, error: result.error };
          }
          break;
        case UserStatus.BANNED:
          actionResponse = await banUserAction(userId);
          break;
        case UserStatus.REJECTED:
          actionResponse = await rejectUserAction(userId, reason);
          break;
        default:
          const error = new Error(`不支持的目标状态: ${toStatus}`);
          const result = await handleStoreError(error, "更改用户状态");
          return { success: false, error: result.error };
      }

      if (actionResponse && !isSuccessApiResponse(actionResponse)) {
        console.error("❌ 更改用户状态失败:", actionResponse.message);
        const result = await handleStoreError(actionResponse, "更改用户状态");
        set((state) => ({
          error: {
            ...state.error,
            statusChangeError: {
              ...state.error.statusChangeError,
              [userId]: result.error,
            },
          },
        }));
        return { success: false, error: result.error };
      }

      // 操作成功，刷新数据
      await userDataStore.getState().refreshUsers();
      useUserCacheStore.getState().invalidateUserCache(userId);
      return { success: true };
    } catch (e) {
      const result = await handleStoreError(e, "更改用户状态");
      set((state) => ({
        error: {
          ...state.error,
          statusChangeError: {
            ...state.error.statusChangeError,
            [userId]: result.error,
          },
        },
      }));
      return { success: false, error: result.error };
    } finally {
      set((state) => ({
        loading: {
          ...state.loading,
          isChangingStatus: {
            ...state.loading.isChangingStatus,
            [userId]: false,
          },
        },
      }));
    }
  },

  // 删除用户
  deleteUser: async (userId) => {
    set((state) => ({
      loading: {
        ...state.loading,
        isDeleting: { ...state.loading.isDeleting, [userId]: true },
      },
      error: {
        ...state.error,
        deleteError: { ...state.error.deleteError, [userId]: null },
      },
    }));

    try {
      const actionResponse = await deleteAdminUserAction(userId);
      if (actionResponse && !isSuccessApiResponse(actionResponse)) {
        console.error("❌ 删除用户失败:", actionResponse.message);
        const result = await handleStoreError(actionResponse, "删除用户");
        set((state) => ({
          error: {
            ...state.error,
            deleteError: { ...state.error.deleteError, [userId]: result.error },
          },
        }));
        return { success: false, error: result.error };
      }

      // 操作成功，刷新数据
      await userDataStore.getState().refreshUsers();
      useUserCacheStore.getState().invalidateUserCache(userId);
      return { success: true };
    } catch (e) {
      const result = await handleStoreError(e, "删除用户");
      set((state) => ({
        error: {
          ...state.error,
          deleteError: { ...state.error.deleteError, [userId]: result.error },
        },
      }));
      return { success: false, error: result.error };
    } finally {
      set((state) => ({
        loading: {
          ...state.loading,
          isDeleting: { ...state.loading.isDeleting, [userId]: false },
        },
      }));
    }
  },

  // 重置密码
  resetPassword: async (userId) => {
    set((state) => ({
      loading: {
        ...state.loading,
        isResettingPassword: {
          ...state.loading.isResettingPassword,
          [userId]: true,
        },
      },
      error: {
        ...state.error,
        resetPasswordError: {
          ...state.error.resetPasswordError,
          [userId]: null,
        },
      },
    }));

    try {
      const result = await resetPasswordUserAction(userId);

      if (!result.success) {
        const error = new Error(result.error || "重置密码失败");
        const storeResult = await handleStoreError(error, "重置密码");
        set((state) => ({
          error: {
            ...state.error,
            resetPasswordError: {
              ...state.error.resetPasswordError,
              [userId]: storeResult.error,
            },
          },
        }));
        return { success: false, error: storeResult.error };
      }

      // 使缓存失效
      useUserCacheStore.getState().invalidateUserCache(userId);
      return { success: true, newPassword: result.newPassword };
    } catch (e) {
      const storeResult = await handleStoreError(e, "重置密码");
      set((state) => ({
        error: {
          ...state.error,
          resetPasswordError: {
            ...state.error.resetPasswordError,
            [userId]: storeResult.error,
          },
        },
      }));
      return { success: false, error: storeResult.error };
    } finally {
      set((state) => ({
        loading: {
          ...state.loading,
          isResettingPassword: {
            ...state.loading.isResettingPassword,
            [userId]: false,
          },
        },
      }));
    }
  },

  // 更新用户信息
  updateUser: async (userId, updateData) => {
    set((state) => ({
      loading: {
        ...state.loading,
        isUpdating: { ...state.loading.isUpdating, [userId]: true },
      },
      error: {
        ...state.error,
        updateError: { ...state.error.updateError, [userId]: null },
      },
    }));

    try {
      const actionResponse = await updateAdminUserAction(userId, updateData);

      if (actionResponse && !isSuccessApiResponse(actionResponse)) {
        console.error("❌ 更新用户信息失败:", actionResponse.message);
        const result = await handleStoreError(actionResponse, "更新用户信息");
        set((state) => ({
          error: {
            ...state.error,
            updateError: { ...state.error.updateError, [userId]: result.error },
          },
        }));
        return { success: false, error: result.error };
      }

      // 操作成功，刷新数据
      await userDataStore.getState().refreshUsers();
      useUserCacheStore.getState().invalidateUserCache(userId);
      return { success: true };
    } catch (e) {
      const result = await handleStoreError(e, "更新用户信息");
      set((state) => ({
        error: {
          ...state.error,
          updateError: { ...state.error.updateError, [userId]: result.error },
        },
      }));
      return { success: false, error: result.error };
    } finally {
      set((state) => ({
        loading: {
          ...state.loading,
          isUpdating: { ...state.loading.isUpdating, [userId]: false },
        },
      }));
    }
  },

  // 创建用户
  createUser: async (userData) => {
    set((state) => ({
      loading: {
        ...state.loading,
        isCreating: true,
      },
      error: {
        ...state.error,
        createError: null,
      },
    }));

    try {
      const actionResponse = await createAdminUserAction(userData);

      if (actionResponse && !isSuccessApiResponse(actionResponse)) {
        console.error("❌ 创建用户失败:", actionResponse.message);
        const result = await handleStoreError(actionResponse, "创建用户");
        set((state) => ({
          error: {
            ...state.error,
            createError: result.error,
          },
        }));
        return { success: false, error: result.error };
      }

      // 操作成功，刷新数据
      await userDataStore.getState().refreshUsers();
      if (actionResponse && isSuccessApiResponse(actionResponse)) {
        const createdUser = actionResponse.data as User;
        if (createdUser) {
          useUserCacheStore.getState().invalidateUserCache(createdUser.id);
          return { success: true, user: createdUser };
        }
      }

      const error = new Error("创建用户成功但未返回用户数据");
      const result = await handleStoreError(error, "创建用户");
      set((state) => ({
        error: {
          ...state.error,
          createError: result.error,
        },
      }));
      return { success: false, error: result.error };
    } catch (e) {
      const result = await handleStoreError(e, "创建用户");
      set((state) => ({
        error: {
          ...state.error,
          createError: result.error,
        },
      }));
      return { success: false, error: result.error };
    } finally {
      set((state) => ({
        loading: {
          ...state.loading,
          isCreating: false,
        },
      }));
    }
  },
}));

export const userActionStore = useUserActionStore;
