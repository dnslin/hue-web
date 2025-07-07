import { create } from "zustand";
import { userBatchStore } from "./batch";
import type { UserBatchState } from "./batch";

/**
 * 用户选择 Store 状态
 */
interface UserSelectionState {
  /**
   * 已选择的用户 ID 集合
   */
  selectedUserIds: Set<number>;
  /**
   * 切换单个用户的选择状态
   * @param userId - 用户 ID
   */
  toggleUserSelection: (userId: number) => void;
  /**
   * 切换所有用户的选择状态
   * @param allUserIds - 当前页所有用户的 ID 列表
   * @param isSelected - 是否全选
   */
  toggleAllUsersSelection: (allUserIds: number[], isSelected: boolean) => void;
  /**
   * 清空所有选择
   */
  clearSelection: () => void;
  /**
   * 判断用户是否被选择
   * @param userId - 用户 ID
   * @returns 是否被选择
   */
  isUserSelected: (userId: number) => boolean;
  /**
   * 判断当前页是否已全选
   * @param allUserIds - 当前页所有用户的 ID 列表
   * @returns 是否全选
   */
  isAllSelected: (allUserIds: number[]) => boolean;
}

/**
 * 用户选择 Store
 *
 * 负责管理用户列表中的选择状态。
 */
export const useUserSelectionStore = create<UserSelectionState>((set, get) => ({
  selectedUserIds: new Set(),

  toggleUserSelection: (userId: number) =>
    set((state) => {
      const newSelectedUserIds = new Set(state.selectedUserIds);
      if (newSelectedUserIds.has(userId)) {
        newSelectedUserIds.delete(userId);
      } else {
        newSelectedUserIds.add(userId);
      }
      return { selectedUserIds: newSelectedUserIds };
    }),

  toggleAllUsersSelection: (allUserIds: number[], isSelected: boolean) =>
    set(() => {
      if (isSelected) {
        return { selectedUserIds: new Set(allUserIds) };
      }
      return { selectedUserIds: new Set() };
    }),

  clearSelection: () => set({ selectedUserIds: new Set() }),

  isUserSelected: (userId: number) => get().selectedUserIds.has(userId),

  isAllSelected: (allUserIds: number[]) => {
    const { selectedUserIds } = get();
    if (selectedUserIds.size === 0) return false;
    return allUserIds.every((id) => selectedUserIds.has(id));
  },
}));

// 订阅批量操作成功事件，成功后清空选择
userBatchStore.subscribe((state: UserBatchState, prevState: UserBatchState) => {
  if (
    state.lastBatchSuccessAt !== prevState.lastBatchSuccessAt &&
    state.lastBatchSuccessAt !== null
  ) {
    useUserSelectionStore.getState().clearSelection();
    console.log("[用户选择] 批量操作成功，已清空选择。");
  }
});

