# 子任务上下文: 创建新的统一API服务 (`/lib/api/apiService.ts`)

**父任务ID:** ROO#TASK_20250603141306_4F8B1A
**主计划概览:** [Main Plan Overview](../../../plans/ROO#TASK_20250603141306_4F8B1A_plan_overview.md)
**源计划文件:** [plan.md](../../../plan.md)

## 目标

根据 [plan.md (章节 1.2)](../../../plan.md#12-创建新的统一api服务--libapiapiservicets) 的指导，在 `/lib/api/` 目录下创建新文件 `apiService.ts`。
该服务将封装所有与后端API的直接HTTP通信，提供统一的请求配置、认证头附加及错误处理机制。

## 关键信息

*   **文件路径:** `/lib/api/apiService.ts`
*   **核心实现点:**
    *   使用 `axios` (或备选方案)。
    *   从 `process.env.NEXT_PUBLIC_API_BASE_URL` 读取 `baseURL` (此环境变量应由前一任务配置)。
    *   实现 `createApiService` 函数，支持传入 `authToken`。
    *   实现请求拦截器 (附加 `Content-Type`, `Authorization` 头)。
    *   实现响应拦截器 (成功时返回 `response.data`, 错误时记录日志、识别401并包装错误)。
    *   提供 `getAuthenticatedApiService()` 辅助函数 (从cookie获取token)。
    *   提供 `publicApiService` 实例 (无认证信息)。
*   **参考:**
    *   [`plan.md`](../../../plan.md) 中提供的示例代码片段。
    *   后端API的详细信息请参考项目根目录下的 [`swagger.yaml`](../../../swagger.yaml)。
*   **依赖:** `axios` (如果选择)。

## 预期产出

*   文件 [`/lib/api/apiService.ts`](../../../lib/api/apiService.ts) 已按要求创建和实现。
*   如果使用 `axios`，已通过 `pnpm add axios` 安装。