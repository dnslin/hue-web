# 子任务 S001: 数据层强化 (状态管理与缓存)

## 关联计划

*   [**主要重构计划**](../../../plans/ROO#TASK_20250613091340_e8a1c4_plan_overview.md)
*   [**原始需求文档**](../../../role-refactor-plan.md)

## 核心目标

优化 `lib/store/role-store.ts`，集成缓存机制和统一的 `showToast` 用户反馈。

## 关键文件

*   **主要修改**: [`lib/store/role-store.ts`](../../../lib/store/role-store.ts)
*   **依赖工具**: [`lib/utils/cacheManager.ts`](../../../lib/utils/cacheManager.ts), [`lib/utils/toast.ts`](../../../lib/utils/toast.ts)

## 详细任务

1.  **集成 `cacheManager`**:
    *   修改 `fetchRoles`, `fetchRoleById`, 和 `fetchPermissions` 函数。
    *   使用 `cacheManager.getOrSet` 来包装 API 调用。
    *   **缓存策略**: `memory` 存储, TTL 5分钟。

2.  **实现缓存失效**:
    *   在 `createRole`, `updateRole`, `deleteRole`, `updateRolePermissions` 等修改数据的函数成功执行后，调用 `cacheManager.invalidate()` 清除相关的缓存键。

3.  **统一用户反馈**:
    *   在所有与API交互的 action (包括增删改查) 的 `try...catch` 块中，调用 `showToast` 提供明确的成功或失败反馈。

## 验收标准

*   角色和权限数据在首次加载后被缓存，5分钟内刷新页面不会触发新的API请求。
*   任何成功的增、删、改操作后，相关缓存会失效，UI数据能获取到最新状态。
*   任何API操作失败时，屏幕上都会出现清晰的错误提示。