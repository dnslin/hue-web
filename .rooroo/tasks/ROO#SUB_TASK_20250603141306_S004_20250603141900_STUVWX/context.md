# 子任务上下文: 更新认证状态管理 (`/lib/store/authStore.ts`)

**父任务ID:** ROO#TASK_20250603141306_4F8B1A
**主计划概览:** [Main Plan Overview](../../../plans/ROO#TASK_20250603141306_4F8B1A_plan_overview.md)
**源计划文件:** [plan.md](../../../plan.md)

## 目标

根据 [plan.md (章节 2.2)](../../../plan.md#22-更新认证状态管理--libstoreauthstorets) 的指导，修改现有的Zustand认证状态管理文件 [`/lib/store/authStore.ts`](../../../lib/store/authStore.ts)。
目标是使其方法调用新创建的认证Server Actions (`loginAction`, `registerAction`, `logoutAction`, `getCurrentUserAction`) 并正确处理其返回结果。

## 关键信息

*   **文件路径:** [`/lib/store/authStore.ts`](../../../lib/store/authStore.ts)
*   **核心修改点:**
    *   移除对旧 `authService.ts` 和 `apiClient.ts` 的导入和使用。
    *   导入新创建的 `loginAction`, `registerAction`, `logoutAction`, `getCurrentUserAction` from `@/lib/actions/auth/auth.actions.ts` (由前一任务创建)。
    *   修改 `login` 方法：调用 `loginAction`，并根据返回结果更新Store状态。
    *   修改 `register` 方法：调用 `registerAction`，并根据返回结果处理状态。
    *   修改 `logout` 方法：调用 `logoutAction`，成功后清除本地认证状态。
    *   修改 `initializeAuth` (或 `checkAuthStatus`) 方法：调用 `getCurrentUserAction`，并据此设置或清除认证状态。
*   **兼容性:** 确保Store暴露给UI组件的接口（方法名、参数、返回的Promise解析值）与重构前保持一致或高度兼容，以最小化UI层改动。
*   **参考:**
    *   [`plan.md`](../../../plan.md) 中关于Store方法修改的具体指导。
    *   现有的 [`/lib/store/authStore.ts`](../../../lib/store/authStore.ts) 文件结构。

## 预期产出

*   文件 [`/lib/store/authStore.ts`](../../../lib/store/authStore.ts) 已按要求更新。
*   认证相关的Store方法能正确调用新的Server Actions并更新状态。
*   UI组件与 `authStore` 的交互保持兼容。