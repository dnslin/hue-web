# `user-store.ts` 重构优化计划

## 1. 背景与目标

当前的 [`lib/store/user-store.ts`](lib/store/user-store.ts:1) 文件管理着所有与用户相关的状态和操作，导致文件体积庞大，逻辑耦合度高，难以维护和扩展。

**核心目标：**

*   将单一庞大的 `user-store.ts` 拆分为多个职责更单一、更易于维护的 Zustand store。
*   提高代码的可读性、可维护性和可测试性。
*   确保所有现有功能在重构后保持不变。

## 2. 拆分后的 Store 结构与职责

建议将原 `user-store` 拆分为以下六个独立的 store，存放在 `lib/store/user/` 目录下：

### 2.1. `lib/store/user/userData.store.ts` (用户核心数据管理)

*   **职责**: 管理核心用户数据 (`users`) 列表，以及与用户实体直接相关的增删改查 (CRUD) 和状态变更操作。处理这些操作的加载状态和错误信息。
*   **状态 (`UserDataState`)**:
    *   `users: User[]`: 当前用户列表。
    *   `loading: { fetchList: boolean, create: boolean, update: boolean, delete: boolean, statusChange: boolean }`: 细分的加载状态，对应不同的异步操作。
    *   `error: { fetchList: string | null, create: string | null, update: string | null, delete: string | null, statusChange: string | null }`: 细分的错误信息。
*   **操作 (`UserDataActions`)**:
    *   `fetchUsers(params?: UserListParams, forceRefresh?: boolean): Promise<void>`: 根据参数获取用户列表，并处理缓存逻辑。
    *   `refreshUsers(): Promise<void>`: 强制刷新当前用户列表。
    *   `createUser(userData: AdminUserCreateRequest): Promise<User | null>`: 创建新用户。
    *   `updateUser(id: number, userData: UserUpdateRequest): Promise<User | null>`: 更新指定用户信息。
    *   `deleteUser(id: number): Promise<boolean>`: 删除指定用户。
    *   `changeUserStatus(userId: number, fromStatus: UserStatus, toStatus: UserStatus, reason?: string): Promise<User | null>`: 更改用户状态。
    *   `_handleApiCall<T>(...)`: (内部辅助函数) 封装通用 API 调用逻辑，包括设置加载状态、处理成功/失败回调、记录错误等。

### 2.2. `lib/store/user/userFilter.store.ts` (用户列表筛选与分页管理)

*   **职责**: 管理用户列表的筛选条件、分页信息以及筛选面板的 UI 状态。
*   **状态 (`UserFilterState`)**:
    *   `filters: UserListParams`: 包含所有筛选字段，如 `username`, `email`, `role_id`, `status`, `created_at_start`, `created_at_end`, `sort_by`, `order`, `search`。
    *   `pagination: PaginationMeta`: 分页信息，如 `page`, `page_size`, `total`。
    *   `isFilterOpen: boolean`: 筛选面板是否展开。
    *   `hasActiveFilters: boolean`: 当前是否存在有效的筛选条件。
*   **操作 (`UserFilterActions`)**:
    *   `setFilters(newFilters: Partial<UserListParams>): void`: 设置新的筛选条件，并触发 `userData.store` 的 `fetchUsers`。
    *   `clearFilters(): void`: 清空所有筛选条件，并触发 `userData.store` 的 `fetchUsers`。
    *   `toggleFilterPanel(): void`: 切换筛选面板的显示状态。
    *   `setPage(page: number): void`: 设置当前页码，更新 `pagination` 和 `filters.page`，并触发 `userData.store` 的 `fetchUsers`。
    *   `setPageSize(pageSize: number): void`: 设置每页显示数量，更新 `pagination` 和 `filters.pageSize`，并触发 `userData.store` 的 `fetchUsers`。
    *   `_recalculateActiveFilters(): void`: (内部辅助函数) 根据 `filters` 状态计算 `hasActiveFilters` 的值。

### 2.3. `lib/store/user/userSelection.store.ts` (用户列表选择管理)

*   **职责**: 管理用户列表中的行选择状态。
*   **状态 (`UserSelectionState`)**:
    *   `selectedIds: Set<number>`: 已选中的用户 ID 集合。
    *   `isAllSelected: boolean`: 当前页是否已全选。
    *   `isIndeterminate: boolean`: 当前选择状态是否为半选（部分选中）。
*   **操作 (`UserSelectionActions`)**:
    *   `selectUser(id: number): void`: 选中单个用户。
    *   `selectUsers(ids: number[]): void`: 批量选中用户。
    *   `unselectUser(id: number): void`: 取消选中单个用户。
    *   `unselectUsers(ids: number[]): void`: 批量取消选中用户。
    *   `selectAll(allUserIdsOnPage: number[]): void`: 全选当前页用户 (需要从 `userData.store` 获取当前页用户 ID 列表)。
    *   `unselectAll(): void`: 取消所有选择。
    *   `toggleUserSelection(id: number): void`: 切换单个用户的选中状态。
    *   `toggleAllSelection(allUserIdsOnPage: number[]): void`: 切换全选状态。
    *   `_updateSelectionState(currentUserCountOnPage: number): void`: (内部辅助函数) 根据当前页用户数量和已选 ID 更新 `isAllSelected` 和 `isIndeterminate`。

### 2.4. `lib/store/user/userBatch.store.ts` (用户批量操作管理)

*   **职责**: 管理针对多个用户的批量操作，如批量批准、封禁等，并处理这些操作的加载和错误状态。
*   **状态 (`UserBatchState`)**:
    *   `loading: boolean`: 统一的批量操作加载状态。
    *   `error: string | null`: 统一的批量操作错误信息。
*   **操作 (`UserBatchActions`)**:
    *   `batchApprove(userIds: number[]): Promise<BatchOperationResult | null>`: 批量批准用户。
    *   `batchReject(userIds: number[], reason?: string): Promise<BatchOperationResult | null>`: 批量拒绝用户。
    *   `batchBan(userIds: number[]): Promise<BatchOperationResult | null>`: 批量封禁用户。
    *   `batchUnban(userIds: number[]): Promise<BatchOperationResult | null>`: 批量解封用户。
    *   成功后，这些操作会调用 `userData.store` 的 `refreshUsers` 以更新列表，并调用 `userSelection.store` 的 `unselectAll` 来清空选择。
    *   `_handleBatchApiCall<T extends BatchOperationResult>(...)`: (内部辅助函数) 封装通用批量 API 调用逻辑。

### 2.5. `lib/store/user/userCache.store.ts` (用户数据缓存状态管理)

*   **职责**: 管理与用户数据获取相关的缓存控制状态，辅助 `userData.store` 实现缓存策略。
*   **状态 (`UserCacheState`)**:
    *   `lastFetchTimestamp: number`: 上次成功获取用户列表的时间戳。
    *   `cacheVersion: number`: 缓存版本号，用于主动使缓存失效。
    *   `isStale: boolean`: 标记缓存是否已陈旧，需要刷新。
*   **操作 (`UserCacheActions`)**:
    *   `markAsFetched(): void`: 标记数据已成功获取，更新 `lastFetchTimestamp` 和 `isStale`。
    *   `invalidateCache(): void`: 使缓存失效，会调用 [`lib/utils/cacheManager.ts`](lib/utils/cacheManager.ts:1) 中的 `cacheUtils.clearUserCache()` 并设置 `isStale = true`。
    *   `updateCacheVersion(): void`: 更新缓存版本号，并调用 `cacheUtils.clearUserCache()`。
    *   `checkIfStale(expiryTime: number): boolean`: 检查缓存是否根据指定过期时间判断为陈旧。

### 2.6. `lib/store/user/userHydration.store.ts` (Zustand 状态水合管理)

*   **职责**: 管理 Zustand 持久化状态的水合 (rehydration) 过程。
*   **状态 (`UserHydrationState`)**:
    *   `isHydrated: boolean`: 标记持久化状态是否已从存储中恢复完成。
*   **操作 (`UserHydrationActions`)**:
    *   `setHydrated(status: boolean): void`: 设置水合状态。

## 3. Store 间通信机制

*   **主要方式**: 在一个 store 的 action 内部，通过 `get()` 方法（Zustand 提供）获取其他 store 的当前 state，或者直接调用其他 store 导出的 action 方法。
*   **示例**:
    *   `userFilter.store` 中的 `setFilters` action 执行后，会调用 `userData.store.getState().fetchUsers()` 来根据新的筛选条件获取数据。
    *   `userBatch.store` 中的批量操作成功后，会调用 `userData.store.getState().refreshUsers()` 和 `userSelection.store.getState().unselectAll()`。

## 4. 持久化策略 (`persist` middleware)

*   **主要持久化对象**: `userFilter.store.ts` 将是主要的持久化目标，用以保存用户的筛选偏好设置（例如每页数量 `pageSize`、默认排序字段 `sort_by` 和排序方向 `order`）。
*   **配置**: 每个需要持久化的 store 都需要独立配置 Zustand 的 `persist` 中间件。
*   **水合管理**:
    *   `onRehydrateStorage`: 用于在状态从存储恢复后执行特定逻辑（例如，在 `userFilter.store` 恢复后立即触发一次数据获取）。
    *   `merge`: 自定义如何合并持久化状态和初始状态。
    *   `userHydration.store.ts` 可以用于跟踪一个或多个持久化 store 的整体水合完成状态，便于 UI 在水合完成前显示加载指示或阻止操作。

## 5. 状态选择器 (Selectors / Custom Hooks)

*   原 [`lib/store/user-store.ts`](lib/store/user-store.ts:1) 文件末尾定义的自定义 hooks (如 `useUserList`, `useUserPagination`, `useUserFilters` 等) 需要进行更新。
*   它们将从新的、对应的、拆分后的 store 中选取所需的状态。
*   **示例**:
    *   `export const useUserList = () => useUserDataStore((state) => state.users);`
    *   `export const useUserFilters = () => useUserFilterStore((state) => state.filters);`
    *   `export const useUserPagination = () => useUserFilterStore((state) => state.pagination);`
    *   `export const useIsUserFilterOpen = () => useUserFilterStore((state) => state.isFilterOpen);`
    *   `export const useUserSelection = () => useUserSelectionStore((state) => state.selection);` // 或者更细粒度的选择器
    *   `export const useUserBatchLoading = () => useUserBatchStore((state) => state.loading);`

## 6. 建议的目录结构

```
lib/
└── store/
    ├── user/                               # 新建目录存放所有用户相关 stores
    │   ├── userData.store.ts
    │   ├── userFilter.store.ts
    │   ├── userSelection.store.ts
    │   ├── userBatch.store.ts
    │   ├── userCache.store.ts
    │   ├── userHydration.store.ts
    │   └── index.ts                        # (可选) 用于统一导出所有 user stores 和 hooks
    ├── auth-store.ts                       # 现有其他 stores
    ├── role-store.ts
    └── use-app-store.ts
    └── admin-store.ts
```

## 7. Mermaid 图示 (细化交互与依赖)

```mermaid
graph TD
    subgraph Stores [拆分后的用户 Stores]
        direction LR
        userData["userData.store.ts\n(用户数据, CRUD 操作, 加载/错误状态)"]
        userFilter["userFilter.store.ts\n(筛选条件, 分页, UI状态)"]
        userSelection["userSelection.store.ts\n(列表选择状态)"]
        userBatch["userBatch.store.ts\n(批量操作, 加载/错误状态)"]
        userCache["userCache.store.ts\n(数据缓存控制状态)"]
        userHydration["userHydration.store.ts\n(持久化水合状态)"]
    end

    %% Store 间依赖与调用
    userFilter -- "调用 fetchUsers()" --> userData
    userBatch -- "调用 refreshUsers()" --> userData
    userBatch -- "调用 unselectAll()" --> userSelection
    userData -- "依赖/更新" --> userCache
    userSelection -- "依赖 users (用于 selectAll)" --> userData

    subgraph UI_Components [UI 组件 (示例)]
        UserTable["用户表格组件 (UserTable)"]
        FilterPanel["筛选面板组件 (UserFilterPanel)"]
        BatchActionsButton["批量操作按钮 (UserBatchActions)"]
        PaginationControls["分页控制组件"]
    end

    %% UI 与 Store 的交互
    UserTable --> userData
    UserTable --> userSelection
    FilterPanel --> userFilter
    BatchActionsButton --> userBatch
    BatchActionsButton --> userSelection
    PaginationControls --> userFilter

    %% 持久化
    userFilter -- "Persisted to" --> LocalStorage["localStorage (via persist middleware)"]
    userHydration -- "Manages hydration for" --> userFilter

    classDef store fill:#E6F3FF,stroke:#007bff,stroke-width:2px,color:#000
    class userData,userFilter,userSelection,userBatch,userCache,userHydration store
    classDef uicomp fill:#FFF2CC,stroke:#D6B656,stroke-width:2px,color:#000
    class UserTable,FilterPanel,BatchActionsButton,PaginationControls uicomp
```

## 8. 实施步骤概要

1.  **创建新文件与目录结构**: 按照第 6 点的建议，在 `lib/store/` 下创建 `user/` 目录，并在其中创建对应的 `.store.ts` 文件。
2.  **迁移 `userData.store.ts`**:
    *   定义 `UserDataState` 和 `UserDataActions` 接口。
    *   迁移核心用户数据 (`users`) 状态。
    *   迁移 `loading` 和 `error` 状态，并细化为具体操作的加载/错误状态。
    *   迁移 `fetchUsers`, `refreshUsers`, `createUser`, `updateUser`, `deleteUser`, `changeUserStatus` 方法。
    *   实现或调整内部的 `_handleApiCall` 辅助函数。
    *   确保与 `userCache.store` 的交互逻辑（读取缓存状态，更新缓存状态）。
3.  **实现 `userCache.store.ts`**:
    *   定义 `UserCacheState` 和 `UserCacheActions`。
    *   实现 `markAsFetched`, `invalidateCache`, `updateCacheVersion`, `checkIfStale` 方法。
    *   `invalidateCache` 和 `updateCacheVersion` 应调用 `cacheUtils.clearUserCache()`。
4.  **实现 `userFilter.store.ts`**:
    *   定义 `UserFilterState` 和 `UserFilterActions`。
    *   迁移 `filters`, `pagination`, `isFilterOpen`, `hasActiveFilters` 状态。
    *   迁移 `setFilters`, `clearFilters`, `toggleFilterPanel`, `setPage`, `setPageSize` 方法。
    *   在 `setFilters`, `clearFilters`, `setPage`, `setPageSize` 中添加对 `userData.store.getState().fetchUsers()` 的调用。
    *   配置 `persist` 中间件，持久化必要的筛选条件 (如 `pageSize`, `sort_by`, `order`)。
    *   实现 `_recalculateActiveFilters` 辅助函数。
5.  **实现 `userSelection.store.ts`**:
    *   定义 `UserSelectionState` 和 `UserSelectionActions`。
    *   迁移 `selectedIds`, `isAllSelected`, `isIndeterminate` 状态。
    *   迁移 `selectUser`, `selectUsers`, `unselectUser`, `unselectUsers`, `selectAll`, `unselectAll`, `toggleUserSelection`, `toggleAllSelection` 方法。
    *   `selectAll` 和 `toggleAllSelection` 方法需要能够访问 `userData.store.getState().users` 来获取当前页的用户 ID。
    *   实现 `_updateSelectionState` 辅助函数。
6.  **实现 `userBatch.store.ts`**:
    *   定义 `UserBatchState` 和 `UserBatchActions`。
    *   迁移批量操作相关的 `loading` 和 `error` 状态。
    *   迁移 `batchApprove`, `batchReject`, `batchBan`, `batchUnban` 方法。
    *   在这些方法的成功回调中，调用 `userData.store.getState().refreshUsers()` 和 `userSelection.store.getState().unselectAll()`。
    *   实现或调整内部的 `_handleBatchApiCall` 辅助函数。
7.  **实现 `userHydration.store.ts`**:
    *   定义 `UserHydrationState` 和 `UserHydrationActions`。
    *   实现 `setHydrated` 方法。
    *   如果 `userFilter.store` (或其他 store) 配置了持久化，可以在其 `onRehydrateStorage` 回调中调用 `userHydration.store.getState().setHydrated(true)`。
8.  **更新组件引用**:
    *   逐个检查项目中使用了旧 `useUserStore` 及其派生 hooks 的组件。
    *   修改这些组件，使其从新的、对应的、拆分后的 store 中获取状态和调用方法。例如，原来使用 `useUserStore(state => state.users)` 的地方，改为 `useUserDataStore(state => state.users)`。
9.  **更新/创建自定义 Hooks (选择器)**:
    *   根据第 5 点的示例，更新或创建新的自定义 hooks，使其从正确的 store 中选取状态。
    *   如果创建了 `lib/store/user/index.ts`，可以从中统一导出所有新的 hooks 和 stores。
10. **全面测试**:
    *   对所有用户管理相关的功能进行彻底测试，包括列表展示、筛选、分页、单用户操作、批量操作、选择功能、缓存表现、持久化筛选条件的恢复等。
    *   确保所有功能与重构前完全一致，没有引入新的 bug。
11. **代码审查与清理**:
    *   对新代码进行审查。
    *   确认所有功能正常后，删除旧的 [`lib/store/user-store.ts`](lib/store/user-store.ts:1) 文件。

## 9. 预期收益

*   **提高可维护性**: 每个 store 的职责更清晰，代码量更少，修改和理解特定逻辑时更容易定位。
*   **提高可读性**: 逻辑分离使得代码结构更清晰。
*   **提高可测试性**: 更小的、独立的 store 更容易进行单元测试。
*   **更好的代码组织**: `user/` 子目录使得用户相关的状态管理代码更集中。
*   **潜在的性能优化**: 虽然不是主要目标，但更细粒度的状态更新可能有助于减少不必要的组件重渲染（需要结合组件的具体实现）。

这个详细计划为您提供了一个清晰的重构路径。