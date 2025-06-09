// @/lib/store/user/user-hydration.store.ts
import { useEffect, useState } from "react";
import { useStore } from "zustand";
import { userDataStore } from "./user-data.store";

/**
 * @hook useUserDataHydration
 * @description
 * 这个 Hook 负责在客户端初始化用户数据逻辑。它确保：
 * 1.  只在客户端执行，避免在 SSR 环境中运行。
 * 2.  `userDataStore` 的 `initialize` 方法只被调用一次。
 * 3.  返回一个 `isHydrated` 状态，让 UI 组件可以据此判断是否可以安全地渲染依赖于 store 的内容。
 *
 * @returns {boolean} `isHydrated` - 如果数据逻辑已初始化，则为 true。
 */
export function useUserDataHydration(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);
  const isInitialized = useStore(userDataStore, (s) => s.isInitialized);

  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window !== "undefined") {
      // 如果 store 尚未初始化，则调用其初始化方法
      if (!isInitialized) {
        userDataStore.getState().initialize();
      }
      // 设置水合状态为 true，允许 UI 渲染
      setIsHydrated(true);
    }
  }, [isInitialized]); // 依赖 isInitialized 确保不会重复执行

  return isHydrated;
}
