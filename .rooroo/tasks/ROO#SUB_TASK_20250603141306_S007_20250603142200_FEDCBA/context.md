# 子任务上下文: 移除旧的API路由和相关工具文件

**父任务ID:** ROO#TASK_20250603141306_4F8B1A
**主计划概览:** [Main Plan Overview](../../../plans/ROO#TASK_20250603141306_4F8B1A_plan_overview.md)
**源计划文件:** [plan.md](../../../plan.md)

## 目标

根据 [plan.md (章节 4.1)](../../../plan.md#41-移除旧的api路由和相关工具文件) 的指导，在确认所有相关功能已通过Server Actions和新的 `apiService` 实现后，清理项目中不再使用的旧API相关文件和目录。

## 关键信息

*   **操作步骤:**
    1.  **备份（可选但推荐）：** 在进行删除前，可以将旧的API相关文件备份到项目外的一个临时目录。
    2.  **删除 `/app/api/` 目录** 及其所有子内容。
    3.  **删除 [`lib/api/apiUtils.ts`](../../../lib/api/apiUtils.ts)。**
    4.  **删除旧的 [`lib/api/apiClient.ts`](../../../lib/api/apiClient.ts)** (如果 `apiService.ts` 是全新创建且不依赖它)。
    5.  **删除 [`lib/api/authService.ts`](../../../lib/api/authService.ts)。**
    6.  **删除 [`lib/api/adminUsers.ts`](../../../lib/api/adminUsers.ts) 和 [`lib/api/roles.ts`](../../../lib/api/roles.ts)** (在确认所有功能已通过Server Actions实现后)。
    7.  **更新或删除 [`lib/api/index.ts`](../../../lib/api/index.ts)：** 根据实际情况决定。
*   **重要前提:** 必须确保所有先前依赖这些旧文件和路由的功能已经完全迁移到新的Server Actions架构，并且经过了初步验证。

## 预期产出

*   指定的旧API相关目录和文件已从项目中移除。
*   项目结构更加清晰，只包含当前架构下使用的代码。