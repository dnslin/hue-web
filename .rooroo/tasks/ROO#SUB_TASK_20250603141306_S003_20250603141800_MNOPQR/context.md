# 子任务上下文: 创建认证相关的Server Actions (`/lib/actions/auth/auth.actions.ts`)

**父任务ID:** ROO#TASK_20250603141306_4F8B1A
**主计划概览:** [Main Plan Overview](../../../plans/ROO#TASK_20250603141306_4F8B1A_plan_overview.md)
**源计划文件:** [plan.md](../../../plan.md)

## 目标

根据 [plan.md (章节 2.1)](../../../plan.md#21-创建认证相关的server-actions) 的指导，在 `/lib/actions/auth/` 目录下创建 `auth.actions.ts` 文件。
此文件将包含处理登录、注册、登出和获取当前用户等认证逻辑的Server Actions。

## 关键信息

*   **文件路径:** `/lib/actions/auth/auth.actions.ts`
*   **核心实现点:**
    *   添加 `'use server';` 指令。
    *   导入 `cookies` from `next/headers`, `redirect` from `next/navigation`。
    *   导入 `publicApiService`, `getAuthenticatedApiService` from `@/lib/api/apiService` (由前一任务创建)。
    *   导入相关请求/响应类型 (例如 from `@/lib/types/user`, `@/lib/types/auth`)。
    *   实现 `loginAction`: 调用 `publicApiService`, 成功后设置 `auth_token` cookie。
    *   实现 `registerAction`: 调用 `publicApiService`, 成功后可能设置cookie。
    *   实现 `logoutAction`: 可选调用后端登出，清除 `auth_token` cookie。
    *   实现 `getCurrentUserAction`: 调用 `getAuthenticatedApiService`, 失败时不重定向，返回 `null`。
    *   所有Action需使用 `try...catch` 处理错误，并返回统一的响应结构。
*   **参考:**
    *   [`plan.md`](../../../plan.md) 中关于各Action的具体实现细节和错误处理。
    *   后端API的详细信息请参考项目根目录下的 [`swagger.yaml`](../../../swagger.yaml)。

## 预期产出

*   文件 [`/lib/actions/auth/auth.actions.ts`](../../../lib/actions/auth/auth.actions.ts) 已按要求创建和实现。
*   所有认证相关的Server Actions功能正确。