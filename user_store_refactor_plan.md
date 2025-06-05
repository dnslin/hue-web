# `user-store.ts` 重构优化计划

## 1. 背景与目标

当前的 `lib/store/user-store.ts` 文件管理了所有与用户相关的状态和操作，导致文件体积庞大，逻辑复杂，难以维护和扩展。本次重构旨在将其拆分为多个职责更单一、更易于管理的 Zustand store，以提高代码的可读性、可维护性和可测试性，同时确保所有现有功能在重构后保持不变。

## 2. 核心拆分方案

将单一的 `user-store.ts` 拆分为以下六个独立的 Zustand store，每个 store 负责一部分特定的用户管理功能：

*   **`lib/store/user/user-data.store.ts`**: 用户核心数据管理
*   **`lib/store/user/user-filter.store.ts`**: 用户列表筛选与分页管理
*   **`lib/store/user/user-selection.store.ts`**: 用户列表选择管理
*   **`lib/store/user/user-batch.store.ts`**: 用户批量操作管理
*   **`lib/store/user/user-cache.store.ts`**: 用户数据缓存状态管理
*   **`lib/store/user/user-hydration.store.ts`**: Zustand 状态水合管理

## 3. 各 Store 详细职责

### 3.1. `user-data.store.ts`
*   **职责**: 管理核心用户数据、CRUD 及状态变更操作、以及从API获取的“结果性”分页信息。
*   **状态 (`UserDataState`)**:
    *   `users: User[]`
    *   `paginationResult: { totalItems: number, totalPages: number }` (存储从API获取的总条目数和计算出的总页数)
    *   `loading: { fetchList: boolean, create: boolean, update: boolean, delete: boolean, statusChange: boolean }`
    *   `error: { fetchList: string | null, create: string | null, update: string | null, delete: string | null, statusChange: string | null }`
*   **操作 (`UserDataActions`)**:
    *   `fetchUsers(params?: UserListParams, forceRefresh?: boolean): Promise<void>` (对应 `GET /admin/users`) - 成功后更新 `users` 和 `paginationResult`。
    *   `refreshUsers(): Promise<void>` (重新调用 `fetchUsers` 使用当前 `user-filter.store` 的参数)
    *   `createUser(userData: AdminUserCreateRequest): Promise<User | null>` (对应 `POST /admin/users`)
    *   `updateUser(id: number, userData: UserUpdateRequest): Promise<User | null>` (对应 `PUT /admin/users/{id}`)
    *   `deleteUser(id: number): Promise<boolean>` (对应 `DELETE /admin/users/{id}`)
    *   `changeUserStatus(userId: number, fromStatus: UserStatus, toStatus: UserStatus, reason?: string): Promise<User | null>` (根据 `toStatus` 调用 `/admin/users/{id}/approve`, `/ban`, `/reject`, `/unban`)
    *   `clearError(errorType: keyof UserDataState['error']): void`
*   **通信**:
    *   订阅 `user-filter.store` 的 `filters` 和 `requestPagination` (用户请求的分页参数) 变化来触发 `fetchUsers`。
    *   订阅 `user-batch.store` 的 `lastBatchSuccessAt` 变化来触发 `refreshUsers`。

### 3.2. `user-filter.store.ts`
*   **职责**: 管理用户列表的筛选条件和用户发起的“请求性”分页参数。
*   **状态 (`UserFilterState`)**:
    *   `filters: Omit<UserListParams, 'page' | 'pageSize'>` (存储除分页外的所有筛选字段)
    *   `requestPagination: { page: number, pageSize: number }` (用户请求的当前页码和每页数量)
    *   `isFilterOpen: boolean`
    *   `hasActiveFilters: boolean`
*   **操作 (`UserFilterActions`)**:
    *   `setFilters(newFilters: Partial<Omit<UserListParams, 'page' | 'pageSize'>>): void`
    *   `clearFilters(): void`
    *   `toggleFilterPanel(): void`
    *   `setPage(page: number): void` (更新 `requestPagination.page`)
    *   `setPageSize(pageSize: number): void` (更新 `requestPagination.pageSize` 和 `requestPagination.page` 重置为1)
*   **通信**: 当 `filters` 或 `requestPagination` 状态变化时，其改变会被 `user-data.store` 订阅。
*   **持久化**: 此 store 的 `filters` (部分，如 `sort_by`, `order`) 和 `requestPagination.pageSize` 将被持久化。

### 3.3. `user-selection.store.ts`
*   **状态 (`UserSelectionState`)**:
    *   `selectedIds: Set<number>`
    *   `isAllSelected: boolean`
    *   `isIndeterminate: boolean`
*   **操作 (`UserSelectionActions`)**:
    *   `selectUser(id: number): void`
    *   `selectUsers(ids: number[]): void`
    *   `unselectUser(id: number): void`
    *   `unselectUsers(ids: number[]): void`
    *   `selectAll(allUserIds: number[]): void`
    *   `unselectAll(): void`
    *   `toggleUserSelection(id: number): void`
    *   `toggleAllSelection(allUserIds: number[]): void`
*   **通信**:
    *   `selectAll` 和 `toggleAllSelection` 可能需要从 `user-data.store` 获取当前用户列表。
    *   订阅 `user-batch.store` 的批量操作成功信号来触发 `unselectAll`。

### 3.4. `user-batch.store.ts`
*   **状态 (`UserBatchState`)**:
    *   `loading: boolean` (统一的批量操作加载状态)
    *   `error: string | null` (统一的批量操作错误状态)
    *   `lastBatchSuccessAt: number | null` (用于通知其他 store 操作成功的时间戳)
*   **操作 (`UserBatchActions`)**:
    *   `batchApprove(userIds: number[]): Promise<BatchOperationResult | null>` (对应 `POST /admin/users/batch-approve`)
    *   `batchReject(userIds: number[], reason?: string): Promise<BatchOperationResult | null>` (对应 `POST /admin/users/batch-reject`)
    *   `batchBan(userIds: number[]): Promise<BatchOperationResult | null>` (对应 `POST /admin/users/batch-ban`)
    *   `batchUnban(userIds: number[]): Promise<BatchOperationResult | null>` (对应 `POST /admin/users/batch-unban`)
    *   (所有批量操作成功后会更新 `lastBatchSuccessAt`)
*   **通信**: 批量操作成功后，通过更新 `lastBatchSuccessAt` 来通知 `user-data.store` 和 `user-selection.store`。
*   **备注**: 后端批量操作接口在 Swagger 中描述的成功响应为 `utils.SuccessResponse`，其 `data` 字段具体结构未明确是否为前端定义的 `BatchOperationResult` (包含 `success_count`, `failed_count` 等)。实现时需注意适配后端实际返回。

### 3.5. `user-cache.store.ts`
*   **状态 (`UserCacheState`)**:
    *   `lastFetchTimestamp: number`
    *   `cacheVersion: number`
    *   `isStale: boolean`
*   **操作 (`UserCacheActions`)**:
    *   `markAsFetched(): void`
    *   `invalidateCache(): void` (调用 `cacheUtils.clearUserCache()`)
    *   `updateCacheVersion(): void` (调用 `cacheUtils.clearUserCache()`)
    *   `checkIfStale(expiryTime: number): boolean`

### 3.6. `user-hydration.store.ts`
*   **状态 (`UserHydrationState`)**:
    *   `isHydrated: boolean` (可以扩展为记录每个持久化 store 的水合状态)
*   **操作 (`UserHydrationActions`)**:
    *   `setHydrated(storeName: string, status: boolean): void`
    *   `setGlobalHydrated(status: boolean): void`

## 4. Store 间通信机制

*   **主要方式**: 使用 Zustand 的 `subscribe` API。
*   **具体实践**:
    *   订阅方 Store (如 `user-data.store`) 将 `subscribe` 到被订阅方 Store (如 `user-filter.store`) 的特定状态切片 (slice)。
    *   `subscribe` 方法将使用精确的 **selector 函数**来选择关心的状态。
    *   `subscribe` 方法将配置 **`equalityFn`** (例如 `shallow` from `zustand/shallow` 或 `isEqual` from `lodash`) 来比较新旧状态值，确保只有在值真正发生变化时才触发回调。
    *   回调函数中，订阅方 Store 将执行自身 Store 的 action，避免直接修改被订阅 Store 的状态以防止循环。

    ```typescript
    // 示例：user-data.store 订阅 user-filter.store
    // import { useUserFilterStore } from './user-filter.store';
    // import { shallow } from 'zustand/shallow';

    // const unsubscribe = useUserFilterStore.subscribe(
    //   (state) => ({ filters: state.filters, requestPagination: state.requestPagination }),
    //   (newSlice, oldSlice) => {
    //     // 内部可以再比较 newSlice 和 oldSlice 确保必要性
    //     get().fetchUsers();
    //   },
    //   { equalityFn: shallow }
    // );
    ```

## 5. 持久化策略 (`persist` middleware)

*   `user-filter.store.ts` 将是主要的持久化对象，用于保存用户的筛选设置（如 `sort_by`, `order`）和 `requestPagination.pageSize`。
*   每个需要持久化的 store 将独立配置 `persist` 中间件，并根据需要处理 `onRehydrateStorage` 和 `merge` 逻辑。
*   `user-hydration.store.ts` 将用于跟踪持久化 store 的水合状态。

## 6. 状态选择器 (Selectors/Hooks)

原 `lib/store/user-store.ts` 文件末尾的自定义 hooks (如 `useUserList`, `useUserPagination`) 将被更新或重新创建，以从新的、对应的 store 中选取状态。

例如:
*   `export const useUserList = () => useUserDataStore((state) => state.users);`
*   `export const useUserFilters = () => useUserFilterStore((state) => state.filters);`
*   `export const useUserRequestPagination = () => useUserFilterStore((state) => state.requestPagination);`
*   `export const useUserResultPagination = () => useUserDataStore((state) => state.paginationResult);`

## 7. 建议的目录结构

在 `lib/store/` 下创建 `user/` 子目录：
```
lib/
└── store/
    ├── user/
    │   ├── user-data.store.ts
    │   ├── user-filter.store.ts
    │   ├── user-selection.store.ts
    │   ├── user-batch.store.ts
    │   ├── user-cache.store.ts
    │   ├── user-hydration.store.ts
    │   └── index.ts  (可选，用于统一导出所有 user stores 和 hooks)
    ├── auth-store.ts
    ├── role-store.ts
    └── ...
```

## 8. Mermaid 图示 (交互概念)

```mermaid
graph TD
    subgraph Stores
        direction LR
        userData["user-data.store.ts\n(Users, CRUD Loading/Error, paginationResult)"]
        userFilter["user-filter.store.ts\n(Filters, requestPagination)"]
        userSelection["user-selection.store.ts\n(Selection State)"]
        userBatch["user-batch.store.ts\n(Batch Ops Loading/Error, lastBatchSuccessAt)"]
        userCache["user-cache.store.ts\n(Cache State)"]
        userHydration["user-hydration.store.ts\n(Hydration State)"]
    end

    userFilter -- "State Change (filters/requestPagination)" --> UF_State[userFilter State Slice]
    UF_State -- "Subscribed by (selector, equalityFn)" --> userData
    userData -- "Callback: fetchUsers()"

    userBatch -- "State Change (lastBatchSuccessAt)" --> UB_State[userBatch State Slice]
    UB_State -- "Subscribed by" --> userData
    userData -- "Callback: refreshUsers()"
    UB_State -- "Subscribed by" --> userSelection
    userSelection -- "Callback: unselectAll()"

    userData -- "Interacts with" --> userCache
    userSelection -- "May read users from" --> userData


    subgraph UI_Components
        UserTable["User Table Component"]
        FilterPanel["Filter Panel Component"]
        BatchActions["Batch Actions Component"]
    end

    UserTable --> userData
    UserTable --> userSelection
    FilterPanel --> userFilter
    BatchActions --> userBatch
    BatchActions --> userSelection

    userFilter -- "Persisted" --> LocalStorage
    userHydration -- "Manages Hydration for" --> userFilter

    classDef store fill:#E6F3FF,stroke:#007bff,stroke-width:2px
    class userData,userFilter,userSelection,userBatch,userCache,userHydration store
```

## 9. 实施步骤概要

1.  **创建新文件结构**: 按照上述目录建议创建新的 store 文件。
2.  **定义 Store 接口和初始状态**: 为每个拆分后的 store 定义清晰的 state 和 action 接口。
3.  **实现各个 Store 的核心逻辑**:
    *   在 `user-data.store` 中实现数据获取、CRUD 操作，并管理API返回的 `paginationResult`。
    *   在 `user-filter.store` 中实现筛选和用户请求的 `requestPagination` 逻辑，并配置持久化。
    *   实现 `user-selection.store`、`user-batch.store`、`user-cache.store` 和 `user-hydration.store` 的逻辑。
4.  **设置 Store 间的订阅关系**:
    *   在 `user-data.store` 初始化时，`subscribe` 到 `user-filter.store` 的 `filters` 和 `requestPagination` 状态切片 (使用 selector 和 `equalityFn`)，并在回调中调用 `fetchUsers`。
    *   类似地，设置 `user-batch.store` 与 `user-data.store` / `user-selection.store` 之间的订阅关系。
5.  **更新组件**: 修改所有使用旧 `useUserStore` 的地方，使其从对应的新 store 获取数据和方法。
6.  **更新/创建选择器**: 更新或创建新的自定义 hooks (如 `useUserList`, `useUserFilters` 等)。
7.  **全面测试**: 详细测试所有用户管理相关的功能，确保与重构前行为一致，并检查是否存在循环更新或性能问题。
8.  **代码审查与合并**。
9.  **清理**: 确认无误后，删除旧的 `lib/store/user-store.ts` 文件。

## 10. 风险与缓解

*   **循环更新**: 通过使用精确 selector、`equalityFn` 以及审慎设计回调逻辑来最小化此风险。
*   **功能遗漏/变更**: 通过详细的测试计划来确保所有原有功能得到保留。
*   **性能问题**: 拆分本身通常不会引入性能问题，但需要关注订阅回调的执行频率和复杂度。

这个计划旨在提供一个清晰的、可操作的重构路径。

## 11. 关于分页状态的进一步说明

为确保 `fetchUsers` 后更新分页信息不与 `user-filter.store` 的分页状态冲突，并避免循环：

*   **`user-filter.store.ts` 管理“请求参数”**:
    *   `requestPagination: { page: number, pageSize: number }` 存储用户想要查看的页码和每页数量。
    *   这些值由用户界面操作（如点击分页控件、更改每页显示数量）通过调用 `setPage` 或 `setPageSize` action 来更新。
    *   `user-data.store` 订阅这些值的变化以触发 API 请求。

*   **`user-data.store.ts` 管理“结果信息”**:
    *   `paginationResult: { totalItems: number, totalPages: number }` 存储从 API 响应中获取的总项目数，并据此计算出总页数。
    *   当 `fetchUsers` action 成功执行后，它会用 API 返回的 `meta.total` 来更新自身的 `totalItems`，并根据 `user-filter.store` 中的 `requestPagination.pageSize` 计算和更新 `totalPages`。
    *   **关键**: `fetchUsers` 的结果 **不会** 反过来修改 `user-filter.store` 中的 `page` 或 `pageSize`。这两个值是用户请求的输入。

*   **UI 组件的职责**:
    *   分页UI组件（如 `UserPagination`）会从 `user-filter.store` 获取当前的 `page` 和 `pageSize` 来高亮当前页码和设置每页数量选择器的值。
    *   同时，它会从 `user-data.store` 获取 `totalItems` 和 `totalPages` 来显示总数信息，并决定“上一页/下一页”按钮是否可用，以及渲染多少页码按钮。
    *   当用户与分页UI交互（如点击页码），UI组件会调用 `user-filter.store` 的 `setPage` 或 `setPageSize` action，从而启动新一轮的数据获取流程。

这种职责分离确保了数据流的单向性和清晰性，有效避免了因分页状态更新导致的潜在循环。