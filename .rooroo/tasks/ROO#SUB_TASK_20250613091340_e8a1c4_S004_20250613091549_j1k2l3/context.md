# 子任务 S004: 代码库清理

## 关联计划

*   [**主要重构计划**](../../../plans/ROO#TASK_20250613091340_e8a1c4_plan_overview.md)
*   [**原始需求文档**](../../../role-refactor-plan.md)

## 核心目标

移除项目中所有与角色管理相关的、现已废弃的模拟数据代码，保持代码库的整洁和可维护性。

## 关键文件

*   **待删除文件 1**: [`lib/mock/role-data.ts`](../../../lib/mock/role-data.ts)
*   **待删除文件 2**: [`lib/api/roles.mock.ts`](../../../lib/api/roles.mock.ts)

## 详细任务

1.  **全局搜索引用**:
    *   在整个项目中执行一次全局搜索，确认没有任何文件导入或引用 `lib/mock/role-data.ts` 或 `lib/api/roles.mock.ts`。
    *   这是一个安全检查步骤，确保删除操作不会引起编译或运行时错误。

2.  **安全删除文件**:
    *   确认没有引用后，从文件系统中删除 `lib/mock/role-data.ts` 和 `lib/api/roles.mock.ts` 这两个文件。

## 验收标准

*   项目中不再存在 `lib/mock/role-data.ts` 文件。
*   项目中不再存在 `lib/api/roles.mock.ts` 文件。
*   删除文件后，整个项目可以正常编译和运行，没有任何与此相关的错误。