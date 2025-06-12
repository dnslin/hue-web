// @/lib/store/user/user-data.store.ts

import { StateCreator } from "zustand";
import { shallow } from "zustand/shallow";
import { User, getRoleId, UserListParams } from "@/lib/types/user";
import { useUserFilterStore } from "./user-filter.store";
import { getUsersAction } from "@/lib/actions/users/user.actions";
import { handleError } from "@/lib/utils/error-handler";

/**
 * 用户核心数据状态
 * @description 这个接口定义了用户数据切片（slice）的状态结构。
 */
export interface UserDataState {
  /**
   * 当前页的用户列表
   */
  users: User[];
  /**
   * 用户总数
   */
  total: number;
  /**
   * 是否正在加载数据
   */
  loading: boolean;
  /**
   * 错误信息
   */
  error: string | null;
  /**
   * 是否已初始化订阅
   */
  isInitialized: boolean;
}

/**
 * 用户核心数据操作
 * @description 这个接口定义了所有与用户数据直接相关的操作。
 */
export interface UserDataActions {
  /**
   * 根据查询参数获取用户列表
   * @param params 查询参数
   */
  fetchUsers: () => Promise<void>;
  /**
   * 强制刷新当前用户列表
   */
  refreshUsers: () => Promise<void>;
  /**
   * 初始化订阅
   * @description 设置对 filter store 的订阅，以便在筛选条件变化时自动获取数据。
   */
  initialize: () => void;
}

/**
 * Zustand Store Slice: UserData
 * @description 这个 Slice 包含了用户数据的状态和所有核心操作的实现。
 *              它被设计为可组合的，可以与其他 Slice 一起构成完整的应用状态。
 */
export const createUserDataSlice: StateCreator<
  UserDataState & UserDataActions,
  [],
  [],
  UserDataState & UserDataActions
> = (set, get) => ({
  // 初始状态
  users: [],
  total: 0,
  loading: false,
  error: null,
  isInitialized: false,

  // --- 核心数据操作 (骨架实现) ---

  refreshUsers: async () => {
    // 直接调用 fetchUsers 实现刷新
    await get().fetchUsers();
  },

  fetchUsers: async () => {
    const { filters, pagination } = useUserFilterStore.getState();

    // 准备发送到后端的参数
    const apiParams: Omit<UserListParams, "role"> = {
      ...filters,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };

    // 如果前端筛选条件中存在 role，则将其转换为 roleId
    if (filters.role) {
      apiParams.roleId = getRoleId(filters.role);
    }
    // 从发送到后端的参数中移除前端专用的 role 字段
    delete (apiParams as Partial<UserListParams>).role;

    set({ loading: true, error: null });
    try {
      const response = await getUsersAction(apiParams);

      // 首先检查成功的响应结构
      if ("data" in response && "meta" in response) {
        set({
          users: response.data,
          total: response.meta.total,
          loading: false,
        });
      } else if ("error" in response) {
        // 处理已知的 API 错误响应
        const errorToHandle = new Error(response.message || "获取用户列表失败");
        await handleError(errorToHandle, "获取用户列表失败");
        set({ loading: false, error: response.message || "获取用户列表失败" });
      } else {
        // 处理任何其他意外的响应格式
        const errorToHandle = new Error("API响应格式不正确或未知");
        await handleError(errorToHandle, "获取用户列表失败");
        set({ loading: false, error: "API响应格式不正确或未知" });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "获取用户列表时发生未知错误";
      await handleError(error, "获取用户列表失败");
      set({ loading: false, error: errorMessage });
    }
  },

  initialize: () => {
    if (get().isInitialized) {
      return;
    }

    // 订阅 user-filter.store 的变化
    const unsubscribe = useUserFilterStore.subscribe(
      // 直接在回调中处理状态
      (state, prevState) => {
        const watchedState = {
          filters: state.filters,
          pagination: state.pagination,
        };
        const prevWatchedState = {
          filters: prevState.filters,
          pagination: prevState.pagination,
        };

        // 使用 shallow aompare 检查关心的状态是否发生变化
        if (!shallow(watchedState, prevWatchedState)) {
          console.log(
            "[Debug] initialize: 检测到筛选器或分页变化，重新获取数据。",
            { from: prevWatchedState, to: watchedState }
          );
          get().fetchUsers();
        }
      }
    );

    // 首次加载数据
    console.log("[Debug] initialize: 首次加载用户数据。");
    get().fetchUsers();

    set({ isInitialized: true });
    console.log(
      "[Debug] initialize: 用户数据存储已初始化并成功订阅筛选器变更。"
    );
  },
});

import { createStore } from "zustand";

// 从 createUserDataSlice 创建一个独立的 store 实例
export const userDataStore = createStore(createUserDataSlice);
