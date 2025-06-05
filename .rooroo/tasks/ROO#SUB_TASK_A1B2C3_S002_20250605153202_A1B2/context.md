# Sub-task Context: S002 - 实现 `userData.store.ts`

**Parent Task ID:** ROO#TASK_20250605153100_A1B2C3
**Main Plan Overview:** [Main Plan Overview](../../../plans/ROO#TASK_20250605153100_A1B2C3_plan_overview.md)
**Relevant Plan Section:** [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:197) (Section 8.2: 迁移 `userData.store.ts`)

**Goal for Expert (rooroo-developer):**
实现 [`lib/store/user/userData.store.ts`](../../../../lib/store/user/userData.store.ts)。参考 [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:197) 第 8.2 节。定义 `UserDataState` 和 `UserDataActions`。迁移核心用户数据 (`users`)、细化的 `loading` 和 `error` 状态。迁移 `fetchUsers`, `refreshUsers`, `createUser`, `updateUser`, `deleteUser`, `changeUserStatus` 方法。实现或调整 `_handleApiCall`。确保与 `userCache.store` (将在后续任务中实现) 的交互逻辑。引用原始文件 [`lib/store/user-store.ts`](../../../../lib/store/user-store.ts:1) 和相关 actions/types ([`lib/actions/users/user.actions.ts`](../../../../lib/actions/users/user.actions.ts:1), [`lib/types/user.ts`](../../../../lib/types/user.ts:1))。

**Key Files for This Sub-task:**
*   [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md)
*   [`lib/store/user-store.ts`](../../../../lib/store/user-store.ts) (原始文件)
*   [`lib/actions/users/user.actions.ts`](../../../../lib/actions/users/user.actions.ts)
*   [`lib/types/user.ts`](../../../../lib/types/user.ts)
*   [`lib/store/user/userData.store.ts`](../../../../lib/store/user/userData.store.ts) (待实现)