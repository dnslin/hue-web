# 子任务上下文: 核心数据转换逻辑实现

**任务 ID:** `ROO#SUB_TASK_20250612163355_S001_20250612163407_D3V1`

## 关联计划

*   [**主计划概览**](../../plans/ROO#TASK_20250612163355_A4B5C6_plan_overview.md)
*   [**原始作战计划**](../../../data-refactor-plan.md)

## 专家目标 (`rooroo-developer`)

你的目标是执行 [原始作战计划](../../../data-refactor-plan.md) 中的 **Phase 1** 和 **Phase 2**。

### 具体步骤:

1.  **安装依赖:** 执行 `pnpm add change-case`。
2.  **创建工具函数:** 在 `lib/utils/` 目录下创建 `case-converter.ts` 文件，并实现一个可以深度转换对象键名（snake_case <=> camelCase）的递归函数。
3.  **改造 API 服务:**
    *   在 `lib/api/apiService.ts` 中导入你创建的转换工具。
    *   在 Axios 请求拦截器中，使用 `deepConvertToSnakeCase` 转换发出的数据。
    *   在 Axios 响应拦截器中，使用 `deepConvertToCamelCase` 转换收到的数据。

## 验收标准

*   `package.json` 中包含 `change-case` 依赖。
*   `lib/utils/case-converter.ts` 文件存在且功能正确。
*   `lib/api/apiService.ts` 文件被修改，包含了请求和响应的自动转换逻辑。