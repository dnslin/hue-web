import { create } from "zustand";
import { User, UserStatus, UserUpdateRequest } from "@/lib/types/user";
import {
  SuccessResponse,
  ErrorResponse as ApiErrorResponse,
} from "@/lib/types/user";
import {
  approveUserAction,
  rejectUserAction,
  banUserAction,
  unbanUserAction,
  deleteAdminUserAction,
  updateAdminUserAction,
} from "@/lib/actions/users/user.actions";
import { userDataStore } from "./user-data.store";
import { useUserCacheStore } from "./user-cache.store";

// 定义加载状态的类型，针对每个具体操作
interface ActionLoadingState {
  isChangingStatus: Record<number, boolean>; // 按用户ID跟踪状态变更
  isDeleting: Record<number, boolean>; // 按用户ID跟踪删除
  isResettingPassword: Record<number, boolean>; // 按用户ID跟踪密码重置
}

// 定义错误状态的类型
interface ActionErrorState {
  statusChangeError: Record<number, string | null>;
  deleteError: Record<number, string | null>;
  resetPasswordError: Record<number, string | null>;
}

// Store 的完整状态接口
export interface UserActionState {
  loading: ActionLoadingState;
  error: ActionErrorState;
  changeUserStatus: (
    user: User,
    toStatus: UserStatus,
    reason?: string
  ) => Promise<boolean>;
  deleteUser: (userId: number) => Promise<boolean>;
  resetPassword: (userId: number) => Promise<string | null>; // 成功时返回新密码
  clearError: (action: keyof ActionErrorState, userId: number) => void;
}

/**
 * 用户操作 Store
 *
 * 负责处理单个用户的具体操作，如状态变更、删除、重置密码等。
 * 操作成功后会触发 user-data.store 的数据刷新。
 */
export const useUserActionStore = create<UserActionState>((set, get) => ({
  loading: {
    isChangingStatus: {},
    isDeleting: {},
    isResettingPassword: {},
  },
  error: {
    statusChangeError: {},
    deleteError: {},
    resetPasswordError: {},
  },

  // 清除特定操作的错误信息
  clearError: (action, userId) => {
    set((state) => ({
      error: {
        ...state.error,
        [action]: {
          ...state.error[action],
          [userId]: null,
        },
      },
    }));
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

    let actionResponse: SuccessResponse<User> | ApiErrorResponse | null = null;

    try {
      switch (toStatus) {
        case UserStatus.NORMAL:
          if (fromStatus === UserStatus.PENDING) {
            actionResponse = await approveUserAction(userId);
          } else if (fromStatus === UserStatus.DISABLED) {
            actionResponse = await unbanUserAction(userId);
          } else {
            throw new Error(
              `Unsupported status transition from ${fromStatus} to ${toStatus}`
            );
          }
          break;
        case UserStatus.DISABLED:
          actionResponse = await banUserAction(userId);
          break;
        case UserStatus.REJECTED:
          actionResponse = await rejectUserAction(userId, reason);
          break;
        default:
          throw new Error(`Unsupported target status: ${toStatus}`);
      }

      if (
        actionResponse &&
        "code" in actionResponse &&
        actionResponse.code !== 200
      ) {
        throw new Error(
          (actionResponse as ApiErrorResponse).message ||
            "Failed to change user status"
        );
      }

      // 操作成功，刷新数据
      await userDataStore.getState().refreshUsers();
      useUserCacheStore.getState().invalidateUserCache(userId);
      return true;
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred";
      console.error(
        `Failed to change status for user ${userId}:`,
        errorMessage
      );
      set((state) => ({
        error: {
          ...state.error,
          statusChangeError: {
            ...state.error.statusChangeError,
            [userId]: errorMessage,
          },
        },
      }));
      return false;
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
      if (
        actionResponse &&
        "code" in actionResponse &&
        actionResponse.code !== 200
      ) {
        throw new Error(
          (actionResponse as ApiErrorResponse).message ||
            "Failed to delete user"
        );
      }

      // 操作成功，刷新数据
      // 操作成功，刷新数据
      await userDataStore.getState().refreshUsers();
      useUserCacheStore.getState().invalidateUserCache(userId);
      return true;
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred";
      console.error(`Failed to delete user ${userId}:`, errorMessage);
      set((state) => ({
        error: {
          ...state.error,
          deleteError: { ...state.error.deleteError, [userId]: errorMessage },
        },
      }));
      return false;
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
      const tempPassword = Math.random().toString(36).slice(-8);
      const actionResponse = await updateAdminUserAction(userId, {
        password: tempPassword,
      });

      if (
        actionResponse &&
        "code" in actionResponse &&
        actionResponse.code !== 200
      ) {
        throw new Error(
          (actionResponse as ApiErrorResponse).message ||
            "Failed to reset password"
        );
      }

      // 密码重置通常不需要刷新整个列表
      // 使缓存失效
      // 密码重置通常不需要刷新整个列表
      // 使缓存失效
      useUserCacheStore.getState().invalidateUserCache(userId);
      return tempPassword;
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An unknown error occurred";
      console.error(
        `Failed to reset password for user ${userId}:`,
        errorMessage
      );
      set((state) => ({
        error: {
          ...state.error,
          resetPasswordError: {
            ...state.error.resetPasswordError,
            [userId]: errorMessage,
          },
        },
      }));
      return null;
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
}));

export const userActionStore = useUserActionStore;
