# 任务上下文：修复角色管理中的类型错误

根据用户反馈，在之前的重构后，以下文件引入了类型错误和调用错误。请修复这些问题。

## 核心目标
- 解决 `lib/store/role-store.ts` 中的类型不匹配和函数调用问题。
- 解决 `components/admin/roles/role-list.tsx` 中的类型错误，特别是与 `Role` 类型相关的属性。
- 解决 `components/admin/roles/role-permissions.tsx` 中导入和使用 `Role` 及 `Permission` 类型时的问题。
- 确保所有修改后的代码能够通过TypeScript编译且在运行时表现正常。

## 相关文件

请仔细检查以下文件及其相互之间的调用关系：

- **主要问题文件**:
  - [`lib/store/role-store.ts`](lib/store/role-store.ts)
  - [`components/admin/roles/role-list.tsx`](components/admin/roles/role-list.tsx)
  - [`components/admin/roles/role-permissions.tsx`](components/admin/roles/role-permissions.tsx)

- **相关类型定义 (重要参考)**:
  - [`lib/types/roles.ts`](lib/types/roles.ts)
  - [`lib/types/user.ts`](lib/types/user.ts)