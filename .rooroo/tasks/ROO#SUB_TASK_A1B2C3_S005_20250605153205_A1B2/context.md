# Sub-task Context: S005 - 实现 `userSelection.store.ts`

**Parent Task ID:** ROO#TASK_20250605153100_A1B2C3
**Main Plan Overview:** [Main Plan Overview](../../../plans/ROO#TASK_20250605153100_A1B2C3_plan_overview.md)
**Relevant Plan Section:** [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:216) (Section 8.5: 实现 `userSelection.store.ts`)

**Goal for Expert (rooroo-developer):**
实现 [`lib/store/user/userSelection.store.ts`](../../../../lib/store/user/userSelection.store.ts)。参考 [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:216) 第 8.5 节。定义 `UserSelectionState` 和 `UserSelectionActions`。迁移选择相关状态和方法。确保 `selectAll` 和 `toggleAllSelection` 能访问 `userData.store` 的用户数据。实现 `_updateSelectionState`。

**Key Files for This Sub-task:**
*   [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md)
*   [`lib/store/user-store.ts`](../../../../lib/store/user-store.ts) (原始文件参考)
*   [`lib/store/user/userSelection.store.ts`](../../../../lib/store/user/userSelection.store.ts) (待实现)
*   [`lib/store/user/userData.store.ts`](../../../../lib/store/user/userData.store.ts) (已创建或正在创建)