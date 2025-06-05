# Sub-task Context: S009 - 更新/创建自定义 Hooks (选择器)

**Parent Task ID:** ROO#TASK_20250605153100_A1B2C3
**Main Plan Overview:** [Main Plan Overview](../../../plans/ROO#TASK_20250605153100_A1B2C3_plan_overview.md)
**Relevant Plan Section:** [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:235) (Section 8.9 & Section 5: 更新/创建自定义 Hooks)

**Goal for Expert (rooroo-developer):**
根据 [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:235) 第 8.9 节和第 5 节的示例，更新或创建新的自定义 hooks (选择器)。确保它们从正确的拆分后 store 中选取状态。如果创建了 [`lib/store/user/index.ts`](../../../../lib/store/user/index.ts)，从中统一导出所有新的 hooks 和 stores。

**Key Files for This Sub-task:**
*   [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md)
*   新创建的 user stores (e.g., [`lib/store/user/userData.store.ts`](../../../../lib/store/user/userData.store.ts), etc.)
*   [`lib/store/user/index.ts`](../../../../lib/store/user/index.ts) (如果已创建)
*   旧的 [`lib/store/user-store.ts`](../../../../lib/store/user-store.ts) (用于查找旧 hooks)