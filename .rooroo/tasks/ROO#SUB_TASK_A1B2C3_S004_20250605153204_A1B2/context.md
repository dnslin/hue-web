# Sub-task Context: S004 - 实现 `userFilter.store.ts`

**Parent Task ID:** ROO#TASK_20250605153100_A1B2C3
**Main Plan Overview:** [Main Plan Overview](../../../plans/ROO#TASK_20250605153100_A1B2C3_plan_overview.md)
**Relevant Plan Section:** [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:209) (Section 8.4: 实现 `userFilter.store.ts`)

**Goal for Expert (rooroo-developer):**
实现 [`lib/store/user/userFilter.store.ts`](../../../../lib/store/user/userFilter.store.ts)。参考 [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:209) 第 8.4 节。定义 `UserFilterState` 和 `UserFilterActions`。迁移 `filters`, `pagination`, `isFilterOpen`, `hasActiveFilters` 状态。迁移相关方法，并在必要时调用 `userData.store` 的 `fetchUsers`。配置 `persist` 中间件持久化筛选条件。实现 `_recalculateActiveFilters`。

**Key Files for This Sub-task:**
*   [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md)
*   [`lib/store/user-store.ts`](../../../../lib/store/user-store.ts) (原始文件参考)
*   [`lib/store/user/userFilter.store.ts`](../../../../lib/store/user/userFilter.store.ts) (待实现)
*   [`lib/store/user/userData.store.ts`](../../../../lib/store/user/userData.store.ts) (已创建或正在创建)