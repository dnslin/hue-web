import { create } from "zustand";
import { userDataStore } from "./data";
import { useUserFilterStore } from "./filter";
import { useUserSelectionStore } from "./selection";
import { useUserCacheStore } from "./cache";
import { User, UserStatus } from "@/lib/types/user";
import {
  batchApproveUsersAction,
  batchBanUsersAction,
  batchRejectUsersAction,
  batchUnbanUsersAction,
} from "@/lib/actions/users/user";
import { showToast } from "@/lib/utils/toast";

/**
 * 批量操作类型
 */
export type BatchAction = "approve" | "ban" | "reject" | "unban";

/**
 * 批量操作结果
 */
export interface BatchActionResult {
  success: boolean;
  message: string;
  successCount?: number;
  failedCount?: number;
  details?: any;
  /**
   * 实际操作的用户数量
   */
  actualCount?: number;
  /**
   * 被过滤掉的用户数量
   */
  filteredCount?: number;
  /**
   * 过滤原因说明
   */
  filterReason?: string;
}

/**
 * 用户批量操作 Store 状态
 */
export interface UserBatchState {
  /**
   * 批量操作是否正在进行中
   */
  isBatching: boolean;
  /**
   * 上次批量操作成功的时间戳
   */
  lastBatchSuccessAt: number | null;
  /**
   * 执行批量操作
   * @param action - 批量操作类型
   * @param reason - 拒绝理由 (仅在 reject 操作时需要)
   */
  executeBatchAction: (
    action: BatchAction,
    reason?: string
  ) => Promise<BatchActionResult>;
  /**
   * 批量批准用户
   * @param userIds - 用户 ID 列表
   */
  batchApproveUsers: (userIds: number[]) => Promise<BatchActionResult>;
  /**
   * 批量封禁用户
   * @param userIds - 用户 ID 列表
   */
  batchBanUsers: (userIds: number[]) => Promise<BatchActionResult>;
  /**
   * 批量拒绝用户
   * @param userIds - 用户 ID 列表
   * @param reason - 拒绝理由
   */
  batchRejectUsers: (
    userIds: number[],
    reason?: string
  ) => Promise<BatchActionResult>;
  /**
   * 批量解封用户
   * @param userIds - 用户 ID 列表
   */
  batchUnbanUsers: (userIds: number[]) => Promise<BatchActionResult>;
}

/**
 * 根据批量操作类型获取允许的用户状态
 */
const getAllowedStatusesForAction = (action: BatchAction): UserStatus[] => {
  switch (action) {
    case "approve":
      return [UserStatus.PENDING]; // 只能批准待审核用户
    case "ban":
      return [UserStatus.NORMAL]; // 只能封禁正常用户
    case "reject":
      return [UserStatus.PENDING]; // 只能拒绝待审核用户
    case "unban":
      return [UserStatus.BANNED]; // 只能解封被封禁用户
    default:
      return [];
  }
};

/**
 * 过滤符合条件的用户ID
 */
const filterUserIdsByStatus = (
  selectedIds: number[],
  action: BatchAction,
  allUsers: User[]
): { validIds: number[]; filteredIds: number[]; filterReason: string } => {
  const allowedStatuses = getAllowedStatusesForAction(action);

  if (allowedStatuses.length === 0) {
    return {
      validIds: [],
      filteredIds: selectedIds,
      filterReason: "不支持的操作类型",
    };
  }

  const validIds: number[] = [];
  const filteredIds: number[] = [];

  selectedIds.forEach((id) => {
    const user = allUsers.find((u) => u.id === id);
    if (user && allowedStatuses.includes(user.status)) {
      validIds.push(id);
    } else {
      filteredIds.push(id);
    }
  });

  const actionNames = {
    approve: "批准",
    ban: "封禁",
    reject: "拒绝",
    unban: "解封",
  };

  const statusNames = {
    [UserStatus.PENDING]: "待审核",
    [UserStatus.NORMAL]: "正常",
    [UserStatus.BANNED]: "封禁",
    [UserStatus.REJECTED]: "已拒绝",
    [UserStatus.DELETED]: "已删除",
    [UserStatus.EMAIL_PENDING]: "待邮件激活",
  };

  const allowedStatusNames = allowedStatuses
    .map((s) => statusNames[s])
    .join("、");
  const filterReason = `${actionNames[action]}操作只能对${allowedStatusNames}状态的用户执行`;

  return { validIds, filteredIds, filterReason };
};

/**
 * 用户批量操作 Store
 *
 * 负责处理用户的批量操作，如批量批准、封禁、拒绝、解封等。
 * 它会订阅其他 store 的变化来触发相应的行为。
 */
export const useUserBatchStore = create<UserBatchState>((set, get) => ({
  isBatching: false,
  lastBatchSuccessAt: null,

  executeBatchAction: async (
    action: BatchAction,
    reason?: string
  ): Promise<BatchActionResult> => {
    const selectedIds = Array.from(
      useUserSelectionStore.getState().selectedUserIds
    );
    if (selectedIds.length === 0) {
      const result = {
        success: false,
        message: "未选择任何用户进行批量操作",
      };
      showToast.warning(result.message);
      return result;
    }

    // 获取当前页面的所有用户数据，用于状态过滤
    const allUsers = userDataStore.getState().users;

    // 根据操作类型过滤用户
    const { validIds, filteredIds, filterReason } = filterUserIdsByStatus(
      selectedIds,
      action,
      allUsers
    );

    // 如果没有符合条件的用户
    if (validIds.length === 0) {
      const result = {
        success: false,
        message: `无符合条件的用户可执行此操作`,
        actualCount: 0,
        filteredCount: filteredIds.length,
        filterReason,
      };
      showToast.warning(`${result.message}：${filterReason}`);
      return result;
    }

    // 如果有用户被过滤，显示提示
    if (filteredIds.length > 0) {
      showToast.info(
        `已过滤 ${filteredIds.length} 个不符合条件的用户，将对 ${validIds.length} 个用户执行操作`
      );
    }

    set({ isBatching: true });

    try {
      let result: BatchActionResult;

      switch (action) {
        case "approve":
          result = await get().batchApproveUsers(validIds);
          break;
        case "ban":
          result = await get().batchBanUsers(validIds);
          break;
        case "reject":
          result = await get().batchRejectUsers(validIds, reason);
          break;
        case "unban":
          result = await get().batchUnbanUsers(validIds);
          break;
        default:
          result = {
            success: false,
            message: "不支持的批量操作类型",
          };
      }

      // 添加过滤信息到结果中
      result.actualCount = validIds.length;
      result.filteredCount = filteredIds.length;
      result.filterReason = filteredIds.length > 0 ? filterReason : undefined;

      if (result.success) {
        set({ lastBatchSuccessAt: Date.now() });
        // 刷新数据
        userDataStore.getState().refreshUsers();
      }

      return result;
    } catch (error) {
      console.error(`[用户批量操作] 批量操作 '${action}' 失败:`, error);
      const result = {
        success: false,
        message: "批量操作执行失败",
        actualCount: validIds.length,
        filteredCount: filteredIds.length,
        filterReason: filteredIds.length > 0 ? filterReason : undefined,
      };
      showToast.error(result.message);
      return result;
    } finally {
      set({ isBatching: false });
    }
  },

  batchApproveUsers: async (userIds: number[]): Promise<BatchActionResult> => {
    try {
      const response = await batchApproveUsersAction(userIds);

      if (response.code === 0) {
        const result = {
          success: true,
          message: "批量批准用户成功",
          successCount: (response as any).data?.successCount,
          failedCount: (response as any).data?.failedCount,
          details: (response as any).data,
        };
        showToast.success(result.message);
        return result;
      } else {
        const result = {
          success: false,
          message: response.msg || "批量批准用户失败",
        };
        showToast.error(result.message);
        return result;
      }
    } catch (error: any) {
      const result = {
        success: false,
        message: error.msg || "批量批准用户时发生错误",
      };
      showToast.error(result.message);
      return result;
    }
  },

  batchBanUsers: async (userIds: number[]): Promise<BatchActionResult> => {
    try {
      const response = await batchBanUsersAction(userIds);

      if (response.code === 0) {
        const result = {
          success: true,
          message: "批量封禁用户成功",
          successCount: (response as any).data?.successCount,
          failedCount: (response as any).data?.failedCount,
          details: (response as any).data,
        };
        showToast.success(result.message);
        return result;
      } else {
        const result = {
          success: false,
          message: response.msg || "批量封禁用户失败",
        };
        showToast.error(result.message);
        return result;
      }
    } catch (error: any) {
      const result = {
        success: false,
        message: error.msg || "批量封禁用户时发生错误",
      };
      showToast.error(result.message);
      return result;
    }
  },

  batchRejectUsers: async (
    userIds: number[],
    reason?: string
  ): Promise<BatchActionResult> => {
    try {
      const response = await batchRejectUsersAction(userIds, reason);

      if (response.code === 0) {
        const result = {
          success: true,
          message: "批量拒绝用户成功",
          successCount: (response as any).data?.successCount,
          failedCount: (response as any).data?.failedCount,
          details: (response as any).data,
        };
        showToast.success(result.message);
        return result;
      } else {
        const result = {
          success: false,
          message: response.msg || "批量拒绝用户失败",
        };
        showToast.error(result.message);
        return result;
      }
    } catch (error: any) {
      const result = {
        success: false,
        message: error.msg || "批量拒绝用户时发生错误",
      };
      showToast.error(result.message);
      return result;
    }
  },

  batchUnbanUsers: async (userIds: number[]): Promise<BatchActionResult> => {
    try {
      const response = await batchUnbanUsersAction(userIds);

      if (response.code === 0) {
        const result = {
          success: true,
          message: "批量解封用户成功",
          successCount: (response as any).data?.successCount,
          failedCount: (response as any).data?.failedCount,
          details: (response as any).data,
        };
        showToast.success(result.message);
        return result;
      } else {
        const result = {
          success: false,
          message: response.msg || "批量解封用户失败",
        };
        showToast.error(result.message);
        return result;
      }
    } catch (error: any) {
      const result = {
        success: false,
        message: error.msg || "批量解封用户时发生错误",
      };
      showToast.error(result.message);
      return result;
    }
  },
}));

export const userBatchStore = useUserBatchStore;

// 订阅 user-data.store 的 users 变化，并更新缓存
// 注意：createStore 返回的 store 的 subscribe 方法只有一个 state 参数
let previousUsers: User[] = [];
userDataStore.subscribe((state) => {
  if (state.users !== previousUsers && state.users.length > 0) {
    useUserCacheStore.getState().addUsersToCache(state.users);
    console.log("[用户批量操作] 已将 user-data.store 的用户同步到缓存。");
  }
  previousUsers = state.users;
});

// 订阅 user-filter.store 的 filters 变化，并持久化到 localStorage
useUserFilterStore.subscribe((state, prevState) => {
  if (
    typeof window !== "undefined" &&
    JSON.stringify(state.filters) !== JSON.stringify(prevState.filters)
  ) {
    localStorage.setItem("user-filters", JSON.stringify(state.filters));
    console.log(
      "[用户批量操作] 已将筛选条件保存到 localStorage。",
      state.filters
    );
  }
});

