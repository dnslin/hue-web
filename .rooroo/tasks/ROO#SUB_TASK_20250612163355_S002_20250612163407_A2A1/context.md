# 子任务上下文: 数据命名一致性验证

**任务 ID:** `ROO#SUB_TASK_20250612163355_S002_20250612163407_A2A1`

## 关联计划

*   [**主计划概览**](../../plans/ROO#TASK_20250612163355_A4B5C6_plan_overview.md)
*   [**原始作战计划**](../../../data-refactor-plan.md)

## 专家目标 (`rooroo-analyzer`)

你的目标是执行 [原始作战计划](../../../data-refactor-plan.md) 中的 **Phase 3**，即在开发人员完成 API 层改造后，对整个代码库进行全面的数据命名风格审查。

### 具体审查点:

1.  **类型定义 (`lib/types`):**
    *   **检查**: 确保所有 `interface` 和 `type` 定义都使用 `camelCase`。
    *   **报告**: 识别并报告任何仍然使用 `snake_case` 或存在冗余转换逻辑的类型文件。

2.  **业务逻辑 (`lib/actions`, `lib/store`):**
    *   **检查**: 确认 Actions 和 Stores 中处理的数据对象属性均为 `camelCase`。
    *   **报告**: 标记出任何直接处理 `snake_case` 数据的逻辑点。

3.  **UI 层 (`components`, `app`):**
    *   **检查**: 抽查关键组件（如 `user-list.tsx`）和页面，验证从 props 或 store 接收的数据是 `camelCase`。
    *   **报告**: 记录任何 UI 组件中存在的数据格式不匹配问题。

## 产出要求

生成一份 Markdown 格式的分析报告，总结你的发现。报告应清晰地列出所有需要修正或确认的问题点，并提供具体的文件路径和代码行号。如果未发现问题，请明确指出代码库在数据命名方面是干净的。