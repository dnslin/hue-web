# 角色管理重构 - 总体计划

本计划遵循 [<role-refactor-plan.md>](../../role-refactor-plan.md) 进行分解。

## 总体策略

我们将按照重构计划中定义的四个阶段，依次执行四个独立的子任务。每个任务都将由 `rooroo-developer` 完成，确保代码修改的一致性和高质量。整个过程将是线性的，以保证每个步骤都能建立在稳固的基础上。

## 子任务列表

1.  **S001 - 数据层强化**: 优化 `role-store.ts`，集成缓存和统一的Toast通知。 (分配给: `rooroo-developer`)
2.  **S002 - API与类型校准**: 校验 `lib/types/roles.ts` 和 `lib/actions/roles/role.actions.ts`。 (分配给: `rooroo-developer`)
3.  **S003 - UI体验优化**: 修改相关组件，UI上优先展示角色别名 (`alias`)。 (分配给: `rooroo-developer`)
4.  **S004 - 代码库清理**: 移除项目中已废弃的角色管理模拟代码。 (分配给: `rooroo-developer`)

## 关键依赖

任务是严格顺序的： S001 -> S002 -> S003 -> S004。

## 假设

*   `swagger.json` 是最新的，并且是所有API和类型定义的唯一真实来源。
*   `cacheManager` 和 `showToast` 工具函数已经可用且功能稳定。