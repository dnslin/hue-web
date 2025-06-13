# 子任务 S002: API与类型校准

## 关联计划

*   [**主要重构计划**](../../../plans/ROO#TASK_20250613091340_e8a1c4_plan_overview.md)
*   [**原始需求文档**](../../../role-refactor-plan.md)

## 核心目标

确保前端的类型定义和API调用逻辑与 `swagger.json` 完全一致，这是保证数据准确性的关键一步。

## 关键文件

*   **校验对象 1**: [`lib/types/roles.ts`](../../../lib/types/roles.ts)
*   **校验对象 2**: [`lib/actions/roles/role.actions.ts`](../../../lib/actions/roles/role.actions.ts)
*   **事实来源**: [`swagger.json`](../../../swagger.json)

## 详细任务

1.  **校验 `lib/types/roles.ts`**:
    *   仔细比对 `Role` 和 `Permission` 接口中的每一个字段（名称、类型、是否可选）与 `swagger.json` 中对应的 DTO 定义。
    *   确保所有字段完全匹配。

2.  **校验 `lib/actions/roles/role.actions.ts`**:
    *   逐一核对每个 action 函数（如 `getRolesAction`, `createRoleAction` 等）。
    *   检查请求的 URL 路径、HTTP 方法、以及请求体/查询参数的结构是否与 `swagger.json` 中定义的端点一致。

## 验收标准

*   `lib/types/roles.ts` 中的类型定义与 `swagger.json` 完全同步。
*   `lib/actions/roles/role.actions.ts` 中所有函数的 API 调用细节（路径、方法、参数）与 `swagger.json` 完全一致。