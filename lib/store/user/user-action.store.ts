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
  resetPasswordUserAction,
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
  ) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (userId: number) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    userId: number
  ) => Promise<{ success: boolean; newPassword?: string; error?: string }>; // 修改返回类型
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
          } else if (fromStatus === UserStatus.BANNED) {
            actionResponse = await unbanUserAction(userId);
          } else {
            throw new Error(`不支持从 ${fromStatus} 到 ${toStatus} 的状态转换`);
          }
          break;
        case UserStatus.BANNED:
          actionResponse = await banUserAction(userId);
          break;
        case UserStatus.REJECTED:
          actionResponse = await rejectUserAction(userId, reason);
          break;
        default:
          throw new Error(`不支持的目标状态: ${toStatus}`);
      }

      if (
        actionResponse &&
        "code" in actionResponse &&
        actionResponse.code !== 200
      ) {
        throw new Error(
          (actionResponse as ApiErrorResponse).message || "更改用户状态失败"
        );
      }

      // 操作成功，刷新数据
      await userDataStore.getState().refreshUsers();
      useUserCacheStore.getState().invalidateUserCache(userId);
      return { success: true };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "发生未知错误";
      console.error(`为用户 ${userId} 更改状态失败:`, errorMessage);
      set((state) => ({
        error: {
          ...state.error,
          statusChangeError: {
            ...state.error.statusChangeError,
            [userId]: errorMessage,
          },
        },
      }));
      return { success: false, error: errorMessage };
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
          (actionResponse as ApiErrorResponse).message || "删除用户失败"
        );
      }

      // 操作成功，刷新数据
      await userDataStore.getState().refreshUsers();
      useUserCacheStore.getState().invalidateUserCache(userId);
      return { success: true };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "发生未知错误";
      console.error(`删除用户 ${userId} 失败:`, errorMessage);
      set((state) => ({
        error: {
          ...state.error,
          deleteError: { ...state.error.deleteError, [userId]: errorMessage },
        },
      }));
      return { success: false, error: errorMessage };
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
        throw new Error(result.error || "重置密码失败");
      }

      // 使缓存失效
      useUserCacheStore.getState().invalidateUserCache(userId);
      return { success: true, newPassword: result.newPassword };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "发生未知错误";
      console.error(`为用户 ${userId} 重置密码失败:`, errorMessage);
      set((state) => ({
        error: {
          ...state.error,
          resetPasswordError: {
            ...state.error.resetPasswordError,
            [userId]: errorMessage,
          },
        },
      }));
      return { success: false, error: errorMessage };
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
