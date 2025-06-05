# Sub-task Context: S008 - 更新 UI 组件引用

**Parent Task ID:** ROO#TASK_20250605153100_A1B2C3
**Main Plan Overview:** [Main Plan Overview](../../../plans/ROO#TASK_20250605153100_A1B2C3_plan_overview.md)
**Relevant Plan Section:** [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:232) (Section 8.8: 更新组件引用)

**Goal for Expert (rooroo-developer):**
根据 [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:232) 第 8.8 节，识别并更新项目中所有使用了旧 `useUserStore` 及其派生 hooks 的UI组件。修改这些组件，使其从新的、拆分后的对应 store (如 `useUserDataStore`, `useUserFilterStore` 等) 中获取状态和调用方法。提供一份更新的主要受影响组件及其对应新 store 引用的清单作为交付成果的一部分。

**Key Files for This Sub-task:**
*   [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md)
*   项目中的所有 UI 组件 (需要开发者自行搜索定位)
*   新创建的 user stores (e.g., [`lib/store/user/userData.store.ts`](../../../../lib/store/user/userData.store.ts), etc.)
*   旧的 [`lib/store/user-store.ts`](../../../../lib/store/user-store.ts) (用于查找旧用法)