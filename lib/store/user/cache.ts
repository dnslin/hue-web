import { create } from "zustand";
import { User } from "@/lib/types/user";

/**
 * 用户缓存 Store 状态
 */
interface UserCacheState {
  /**
   * 用户缓存 Map，键为用户 ID，值为用户对象
   */
  userCache: Map<number, User>;
  /**
   * 从缓存中获取用户
   * @param userId - 用户 ID
   * @returns 用户对象或 undefined
   */
  getUserById: (userId: number) => User | undefined;
  /**
   * 向缓存中添加或更新用户
   * @param user - 用户对象
   */
  addUserToCache: (user: User) => void;
  /**
   * 向缓存中批量添加或更新用户
   * @param users - 用户对象数组
   */
  addUsersToCache: (users: User[]) => void;
  /**
   * 从缓存中移除用户
   * @param userId - 用户 ID
   */
  removeUserFromCache: (userId: number) => void;
  /**
   * 使单个用户缓存失效
   * @param userId - 用户 ID
   */
  invalidateUserCache: (userId: number) => void;
}

/**
 * 用户缓存 Store
 *
 * 负责缓存用户数据，减少重复的 API 请求。
 */
export const useUserCacheStore = create<UserCacheState>((set, get) => ({
  userCache: new Map(),

  getUserById: (userId: number) => get().userCache.get(userId),

  addUserToCache: (user: User) =>
    set((state) => {
      const newCache = new Map(state.userCache);
      newCache.set(user.id, user);
      return { userCache: newCache };
    }),

  addUsersToCache: (users: User[]) =>
    set((state) => {
      const newCache = new Map(state.userCache);
      users.forEach((user) => newCache.set(user.id, user));
      return { userCache: newCache };
    }),

  removeUserFromCache: (userId: number) =>
    set((state) => {
      const newCache = new Map(state.userCache);
      newCache.delete(userId);
      return { userCache: newCache };
    }),

  invalidateUserCache: (userId: number) => {
    get().removeUserFromCache(userId);
    console.log(`[UserCacheStore] 用户缓存无效 ${userId}`);
  },
}));
