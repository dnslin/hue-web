import { create } from "zustand";
import { userDataStore } from "./data";
import { useUserFilterStore } from "./filter";
import { useUserSelectionStore } from "./selection";
import { useUserCacheStore } from "./cache";
import { User } from "@/lib/types/user";

/**
 * 批量操作类型
 */
type BatchAction = "delete" | "disable" | "enable";

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
   */
  executeBatchAction: (action: BatchAction) => Promise<void>;
}

/**
 * 模拟 API 调用
 * @param action - 操作类型
 * @param userIds - 用户 ID 列表
 */
const fakeBatchApi = (
  action: BatchAction,
  userIds: number[]
): Promise<void> => {
  console.log(
    `[用户批量操作] 正在为以下用户执行批量操作 '${action}':`,
    userIds
  );
  return new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟网络延迟
};

/**
 * 用户批量操作 Store
 *
 * 负责处理用户的批量操作，如批量删除、禁用、启用等。
 * 它会订阅其他 store 的变化来触发相应的行为。
 */
export const useUserBatchStore = create<UserBatchState>((set, get) => ({
  isBatching: false,
  lastBatchSuccessAt: null,

  executeBatchAction: async (action: BatchAction) => {
    const selectedIds = Array.from(
      useUserSelectionStore.getState().selectedUserIds
    );
    if (selectedIds.length === 0) {
      console.warn("[用户批量操作] 未选择任何用户进行批量操作。");
      return;
    }

    set({ isBatching: true });

    try {
      await fakeBatchApi(action, selectedIds);
      set({ lastBatchSuccessAt: Date.now() });
      console.log(`[用户批量操作] 批量操作 '${action}' 成功。`);
    } catch (error) {
      console.error(`[用户批量操作] 批量操作 '${action}' 失败:`, error);
    } finally {
      set({ isBatching: false });
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

