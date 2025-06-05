# Sub-task Context: S006 - 实现 `userBatch.store.ts`

**Parent Task ID:** ROO#TASK_20250605153100_A1B2C3
**Main Plan Overview:** [Main Plan Overview](../../../plans/ROO#TASK_20250605153100_A1B2C3_plan_overview.md)
**Relevant Plan Section:** [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:222) (Section 8.6: 实现 `userBatch.store.ts`)

**Goal for Expert (rooroo-developer):**
实现 [`lib/store/user/userBatch.store.ts`](../../../../lib/store/user/userBatch.store.ts)。参考 [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:222) 第 8.6 节。定义 `UserBatchState` 和 `UserBatchActions`。迁移批量操作的 `loading` 和 `error` 状态及相关方法。在成功回调中调用 `userData.store.refreshUsers()` 和 `userSelection.store.unselectAll()`。实现 `_handleBatchApiCall`。

**Key Files for This Sub-task:**
*   [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md)
*   [`lib/store/user-store.ts`](../../../../lib/store/user-store.ts) (原始文件参考)
*   [`lib/store/user/userBatch.store.ts`](../../../../lib/store/user/userBatch.store.ts) (待实现)
*   [`lib/store/user/userData.store.ts`](../../../../lib/store/user/userData.store.ts)
*   [`lib/store/user/userSelection.store.ts`](../../../../lib/store/user/userSelection.store.ts)