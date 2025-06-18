# 角色管理重构计划：实现完全动态化

**核心目标：** 彻底清除前端代码中所有关于角色的静态定义和硬编码逻辑，转而完全依赖从 `role-store` 获取的动态数据，并集中管理与角色相关的UI表现。

---

## 第一阶段：净化数据层与状态管理 (The Source of Truth)

这是最关键的一步，我们将清理所有静态的角色定义，确保数据源的唯一性和动态性。

1.  **清理类型定义 `lib/types/user.ts`**:
    *   **删除** `UserRole` 枚举。
    *   **删除** `ROLE_ID_MAP` 和 `ID_ROLE_MAP` 两个常量。
    *   **删除** `getRoleId` 和 `getRoleFromId` 两个工具函数。

2.  **调整用户列表的查询参数 `lib/types/user.ts`**:
    *   在 `UserListParams` 接口中，将 `role?: UserRole;` 修改为 `roleId?: number;`。这使得筛选参数与后端和数据模型保持一致。

3.  **更新用户筛选状态 `lib/store/user/user-filter.store.ts`**:
    *   在 `UserFilters` 接口中，将 `role?: UserRole;` 修改为 `roleId?: number;`。
    *   相应地更新 `useUserFilterStore` 中 `setFilters` 和 `resetFilters` 的逻辑，以处理 `roleId`。

---

## 第二阶段：适配UI组件 (Component Refactoring)

现在，我们将根据纯净的数据层，改造依赖旧定义的UI组件。

1.  **改造用户筛选器 `components/admin/users/user-filters.tsx`**:
    *   **移除** `UserRole` 的导入。
    *   **动态化角色下拉菜单**：
        *   组件需要从 `useRoleStore` 中获取所有角色的列表 (`roles`)。
        *   使用 `roles` 数组动态渲染 `<SelectItem>`，其中 `value` 设为 `role.id`，显示文本为 `role.alias || role.name`。
        *   将 `onValueChange` 的逻辑修改为更新 `filters.roleId` (一个数字)。
    *   **移除** `getRoleLabel` 函数。
    *   **更新筛选标签**：当 `filters.roleId` 存在时，从 `role-store` 的 `roles` 数组中找到对应的角色，并显示其名称。

2.  **改造用户表格 `components/admin/users/user-table.tsx`**:
    *   **移除** `UserRole` 的导入。
    *   **重构 `getRoleBadge` 函数**：
        *   函数的参数从 `role: UserRole` 改为 `role: Role` (从 `lib/types/roles` 导入的完整角色对象)。
        *   内部的 `switch` 语句将基于 `role.name` (字符串) 进行判断。
    *   **修正调用**：将 `<td className="p-4">{getRoleBadge(user.role.name as UserRole)}</td>` 修改为 `<td className="p-4">{getRoleBadge(user.role)}</td>`。

---

## 第三阶段：集中化UI逻辑 (Centralizing UI Logic)

为了避免未来再次出现分散的硬编码，我们将创建一个统一处理角色样式的地方。

1.  **创建角色助手 `lib/utils/role-helpers.ts` (新文件)**:
    *   **迁移并重命名**：将 `user-table.tsx` 中的 `getRoleBadge` 函数迁移到此文件，并可以重命名为 `renderRoleBadge`。
    *   **迁移**：将 `role-list.tsx` 中的 `getRoleColor` 函数也迁移到此文件。
    *   这个文件将成为未来所有角色相关UI逻辑的“家”。

2.  **应用助手函数**:
    *   修改 `components/admin/users/user-table.tsx`，导入并使用新的 `renderRoleBadge` 函数。
    *   修改 `components/admin/roles/role-list.tsx`，导入并使用 `getRoleColor` 函数。

---

## 计划总览图

```mermaid
graph TD
    subgraph "Phase 1: 数据层 & 状态"
        A[修改 lib/types/user.ts] --> B[删除 UserRole, MAPs, 函数];
        A --> C[修改 UserListParams: role -> roleId];
        D[修改 user-filter.store.ts] --> E[修改 UserFilters: role -> roleId];
    end

    subgraph "Phase 2: 组件适配"
        F[改造 user-filters.tsx] --> G[动态加载角色Select];
        F --> H[移除 getRoleLabel];
        I[改造 user-table.tsx] --> J[重构 getRoleBadge(user.role)];
        I --> K[移除 UserRole 导入];
    end

    subgraph "Phase 3: UI逻辑集中化"
        L[创建 lib/utils/role-helpers.ts] --> M[迁移 getRoleBadge & getRoleColor];
        M --> N[组件统一调用 role-helpers];
    end

    B --> F;
    E --> F;
    C --> F;
    J --> L;

    N --> Z[完成: 角色管理完全动态化];