# Sub-task Context: S007 - 实现 `userHydration.store.ts`

**Parent Task ID:** ROO#TASK_20250605153100_A1B2C3
**Main Plan Overview:** [Main Plan Overview](../../../plans/ROO#TASK_20250605153100_A1B2C3_plan_overview.md)
**Relevant Plan Section:** [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:228) (Section 8.7: 实现 `userHydration.store.ts`)

**Goal for Expert (rooroo-developer):**
实现 [`lib/store/user/userHydration.store.ts`](../../../../lib/store/user/userHydration.store.ts)。参考 [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:228) 第 8.7 节。定义 `UserHydrationState` 和 `UserHydrationActions`。实现 `setHydrated` 方法。准备在其他持久化 store (如 `userFilter.store`) 的 `onRehydrateStorage` 回调中调用此 store 的 `setHydrated(true)`。

**Key Files for This Sub-task:**
*   [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md)
*   [`lib/store/user/userHydration.store.ts`](../../../../lib/store/user/userHydration.store.ts) (待实现)
*   [`lib/store/user/userFilter.store.ts`](../../../../lib/store/user/userFilter.store.ts) (参考其持久化配置)