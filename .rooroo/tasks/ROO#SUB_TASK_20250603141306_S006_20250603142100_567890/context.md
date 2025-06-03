# 子任务上下文: 更新业务相关的状态管理

**父任务ID:** ROO#TASK_20250603141306_4F8B1A
**主计划概览:** [Main Plan Overview](../../../plans/ROO#TASK_20250603141306_4F8B1A_plan_overview.md)
**源计划文件:** [plan.md](../../../plan.md)

## 目标

根据 [plan.md (章节 3.2)](../../../plan.md#32-更新业务相关的状态管理-例如--libstoreuserstorets--libstorerolestorets) 的指导，修改项目中各业务模块的Zustand Store (例如 [`/lib/store/userStore.ts`](../../../lib/store/userStore.ts), `/lib/store/roleStore.ts` 等)。
目标是使这些Store的数据获取和操作方法调用新创建的对应模块的Server Actions。

## 关键信息

*   **涉及文件:** 项目中所有业务相关的Zustand Store文件 (例如 [`/lib/store/userStore.ts`](../../../lib/store/userStore.ts), `/lib/store/admin-store.ts` 等，根据实际项目结构确定)。
*   **核心修改点:**
    *   移除对旧API文件（如 `adminUsers.ts`, `roles.ts`）的导入和使用。
    *   导入新创建的对应模块的Server Actions (由前一任务创建)。
    *   修改Store中所有的数据获取和操作方法（如 `fetchUsers`, `createUser`, `updateRole` 等），使其调用对应的Server Action。
    *   **处理Server Action的返回值:**
        *   成功时，更新Store的状态。
        *   失败时（包括认证错误），更新Store中的 `error` 状态，并可能需要清除部分数据或用户认证状态（如果错误是401，应由 `authStore` 统一处理跳转，业务Store仅更新错误状态）。
*   **兼容性:** 再次强调，Store暴露给UI组件的接口应保持兼容，以减少UI层改动。
*   **参考:**
    *   [`plan.md`](../../../plan.md) 中关于Store方法修改的通用指导。
    *   现有的各业务Store文件结构。

## 预期产出

*   所有相关的业务Store文件已按要求更新。
*   业务Store的方法能正确调用新的Server Actions并更新状态。
*   UI组件与各业务Store的交互保持兼容。