# 子任务 S003: UI体验优化 (显示角色别名)

## 关联计划

*   [**主要重构计划**](../../../plans/ROO#TASK_20250613091340_e8a1c4_plan_overview.md)
*   [**原始需求文档**](../../../role-refactor-plan.md)

## 核心目标

修改所有与角色相关的UI组件，使其优先展示用户友好的角色别名 (`alias`)，而不是内部使用的角色代码 (`name`)，从而提升界面的可读性和用户体验。

## 关键文件

*   [`components/shared/role-select.tsx`](../../../components/shared/role-select.tsx)
*   [`components/admin/roles/role-list.tsx`](../../../components/admin/roles/role-list.tsx)
*   [`components/admin/roles/role-permissions.tsx`](../../../components/admin/roles/role-permissions.tsx)

## 详细任务

1.  **修改 `role-select.tsx`**:
    *   找到渲染下拉选项和选中项显示文本的部分。
    *   将显示逻辑从 `role.name` 修改为 `role.alias || role.name`。这确保在 `alias` 存在时优先显示它，否则回退到显示 `name`。

2.  **修改 `role-list.tsx`**:
    *   定位到渲染角色列表项（例如，卡片或表格行）的标题部分。
    *   同样，将标题文本更新为 `role.alias || role.name`。

3.  **修改 `role-permissions.tsx`**:
    *   找到显示当前正在编辑权限的角色的标题或标签。
    *   将其文本更新为 `role.alias || role.name`。

## 验收标准

*   在用户选择角色的下拉菜单中，选项显示的是角色别名。
*   在角色管理列表中，每个角色的标题显示的是其别名。
*   在为角色分配权限的界面中，标题清晰地展示了当前操作角色的别名。
*   在任何别名 (`alias`) 为空的情况下，UI应能平滑地回退显示角色代码 (`name`)。