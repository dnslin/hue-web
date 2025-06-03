# 子任务上下文: 类型定义检查 (`/lib/types/*`)

**父任务ID:** ROO#TASK_20250603141306_4F8B1A
**主计划概览:** [Main Plan Overview](../../../plans/ROO#TASK_20250603141306_4F8B1A_plan_overview.md)
**源计划文件:** [plan.md](../../../plan.md)

## 目标

根据 [plan.md (章节 4.3)](../../../plan.md#43-类型定义检查--libtypes) 的指导，回顾并更新项目中的类型定义文件（主要位于 `/lib/types/` 目录下，例如 [`/lib/types/user.ts`](../../../lib/types/user.ts), [`/lib/types/dashboard.ts`](../../../lib/types/dashboard.ts) 等）。
目标是确保所有类型定义与新的Server Actions的参数、返回值以及后端API（参照 [`swagger.yaml`](../../../swagger.yaml)）保持一致和准确。

## 关键信息

*   **涉及文件:** `/lib/types/` 目录下的所有相关 `.ts` 文件。
*   **操作步骤:**
    1.  **对照检查:**
        *   将现有的类型定义与项目根目录下的 **[`swagger.yaml`](../../../swagger.yaml)** 中定义的后端API实际请求体和响应体结构进行比对。
        *   将类型定义与新创建的Server Actions的参数和返回值设计进行比对。
    2.  **更新类型:** 根据比对结果，添加、修改或删除类型定义，确保：
        *   类型准确反映了数据的实际结构。
        *   类型与 [`swagger.yaml`](../../../swagger.yaml) 保持一致性。
        *   类型覆盖了所有Server Actions的输入输出。
*   **重点关注:**
    *   请求参数类型。
    *   响应数据类型。
    *   Server Actions的参数类型和返回类型Promise的解析值类型。
    *   任何在重构过程中可能发生变化的数据结构。

## 预期产出

*   `/lib/types/` 目录下的所有相关类型定义文件已更新并保持最新。
*   类型系统准确反映了当前应用的数据结构和API协定。
*   减少因类型不匹配导致的潜在运行时错误。