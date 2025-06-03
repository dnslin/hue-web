# 子任务上下文: 创建业务模块的Server Actions

**父任务ID:** ROO#TASK_20250603141306_4F8B1A
**主计划概览:** [Main Plan Overview](../../../plans/ROO#TASK_20250603141306_4F8B1A_plan_overview.md)
**源计划文件:** [plan.md](../../../plan.md)

## 目标

根据 [plan.md (章节 3.1)](../../../plan.md#31-创建业务模块的server-actions-例如--libactionsusersuseractionsts--libactionsrolesroleactionsts) 的指导，为项目中的业务模块（如用户管理、角色管理等）创建对应的Server Actions。
这些Actions将取代原有的 `/app/api/...` 路由处理逻辑。

## 关键信息

*   **文件结构:** 在 `/lib/actions/` 目录下，根据功能模块组织创建子目录和对应的 `.actions.ts` 文件 (例如 `/lib/actions/users/user.actions.ts`, `/lib/actions/roles/role.actions.ts`)。
*   **核心实现点 (通用):**
    *   文件顶部添加 `'use server';` 指令。
    *   导入 `getAuthenticatedApiService` from `@/lib/api/apiService` (由先前任务创建)。
    *   导入相关的请求/响应类型 from `@/lib/types/*`。
    *   为原API层（例如 [`lib/api/adminUsers.ts`](../../../lib/api/adminUsers.ts), [`lib/api/roles.ts`](../../../lib/api/roles.ts)）中的每个函数创建对应的Server Action。
    *   **重要:** 所有Server Actions调用的后端API端点、HTTP方法、请求参数/体及响应结构，**均需严格参照项目根目录下的 [`swagger.yaml`](../../../swagger.yaml) 文件中的定义。**
    *   **错误处理:**
        *   使用 `try...catch` 捕获错误。
        *   对于 `AuthenticationError` (401)，不应执行 `redirect`，而是返回明确的错误对象给客户端。
        *   其他错误也应返回统一的错误结构或直接抛出。
    *   **重定向:** 对于页面级数据获取失败（如列表页），如果发生认证错误，可以考虑 `redirect('/login')`，但这取决于Action的具体调用上下文。
*   **示例参考:** [`plan.md`](../../../plan.md) 中提供的 `getUsersAction` 示例。

## 预期产出

*   为所有相关业务模块创建了对应的Server Actions文件 (例如 [`/lib/actions/users/user.actions.ts`](../../../lib/actions/users/user.actions.ts), [`/lib/actions/roles/role.actions.ts`](../../../lib/actions/roles/role.actions.ts) 等)。
*   原API层中的业务逻辑已成功迁移到新的Server Actions中。
*   所有Server Actions均遵循 [`swagger.yaml`](../../../swagger.yaml) 定义并包含恰当的错误处理。