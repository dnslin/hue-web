# 项目：前端类型系统升级与模块重构 (V2 - 详细版)

**目标：** 确保前端类型与后端API精确同步，提升代码库的类型安全、一致性和可维护性，并完全重构相关逻辑以适应新的类型系统，同时保障现有页面功能的稳定性。

**核心步骤：**

1.  **阶段一：深入分析与类型定义精准对齐 (`lib/types`)**
    1.  **1.1. 解析 `swagger.yaml`**:
        *   **任务**: 彻底分析 [`swagger.yaml`](swagger.yaml) 文件，提取所有 `paths` (API端点) 和 `definitions` (模型定义)。
        *   **重点**:
            *   请求参数 (路径参数、查询参数、请求体)。
            *   响应数据结构 (不同状态码的响应模型)。
            *   模型定义 (`definitions`)，特别是 `dtos.*` 和 `models.*`，关注其属性、类型、是否必需 (`required`) 以及其他约束 (如 `format`, `minLength`, `maxLength`, `enum`)。
        *   **输出**: 一个内部的、结构化的API和模型定义列表，作为后续类型对齐的基准。
    2.  **1.2. 审查与重构 `lib/types`**:
        *   **任务**: 彻底审查并重构 [`lib/types/auth.ts`](lib/types/auth.ts), [`lib/types/dashboard.ts`](lib/types/dashboard.ts), [`lib/types/roles.ts`](lib/types/roles.ts), [`lib/types/settings.ts`](lib/types/settings.ts), [`lib/types/user.ts`](lib/types/user.ts)。
        *   **对齐原则**:
            *   **命名转换**: 严格使用 [`lib/utils/case-converter.ts`](lib/utils/case-converter.ts) 进行 `snake_case` 到 `camelCase` 的转换。
            *   **后端响应结构对齐**:
                *   特别关注后端 `utils.Response` 结构 (`code`, `msg`, `data`, `request_id`, `meta`)。前端现有的通用响应类型如 [`PaginatedResponse`](lib/types/user.ts:111) (应包含 `code`, `message`, `data`, `meta`)、[`SuccessResponse`](lib/types/user.ts:122) (应包含 `code`, `message`, `data?`, `meta?`) 和 [`ErrorResponse`](lib/types/user.ts:130) (应包含 `code`, `message`, `error?`) 需要严格以此为基础进行统一和调整。字段名 `msg` 对应前端的 `message`。
                *   后端 `utils.PaginationMeta` (`page`, `page_size`, `total`) 对应前端的 [`PaginationMeta`](lib/types/user.ts:104) (`page`, `pageSize`, `total`)。
            *   **后端错误结构对齐**:
                *   后端 `models.AppError` (`HTTPStatus`, `BizCode`, `Msg`) 的概念需要反映在前端错误类型中。前端的 [`ActionErrorResponse`](lib/types/auth.ts:43) (包含 `success: false`, `message`, `error?`, `code?`) 中的 `code` 应尝试映射后端的 `BizCode`，`message` 对应后端的 `Msg`。
            *   **完全重构**: 坚决执行“不兼容以前的逻辑，而是完全重构”的原则。
            *   **新增与Swagger缺失的类型**: 补全所有必要的类型定义。
        *   **特别注意**:
            *   [`lib/types/settings.ts`](lib/types/settings.ts) 中的 Zod schema 需根据 `swagger.yaml` 的约束（如 `dtos.AdminBasicSiteSettingsDTO` 等）进行更新。
            *   [`UserStatus`](lib/types/user.ts:2) 枚举与 `swagger.yaml` 中 `models.User` 的 `status` 字段描述（0-正常, 1-禁用, 2-待审核, 3-已删除, 4-审核拒绝, 5-待邮件激活）保持一致。
        *   **输出**: 更新后的 `lib/types` 目录下的各个类型文件。

2.  **阶段二：公共类型提取与组织**
    1.  **2.1. 识别可复用类型**: (同前一个计划)
    2.  **2.2. 整合至共享模块**:
        *   **任务**: 创建 [`lib/types/common.ts`](lib/types/common.ts)。
        *   **内容**:
            *   统一的API响应接口，例如：
                ```typescript
                // lib/types/common.ts
                export interface ApiResponse<TData = any, TMeta = PaginationMeta> {
                  code: number; // 对应后端的 bizCode
                  message: string; // 对应后端的 msg
                  data?: TData;
                  requestId?: string; // 可选，如果前端需要
                  meta?: TMeta;
                }

                export interface PaginationMeta {
                  page: number;
                  pageSize: number;
                  total: number;
                }

                export type PaginatedApiResponse<TItem> = ApiResponse<TItem[], PaginationMeta>;
                export type SuccessApiResponse<TData = any> = ApiResponse<TData>; // code 为 0
                export interface ErrorApiResponse extends Omit<ApiResponse<null>, 'data' | 'meta'> {
                  error?: any; // 更详细的原始错误信息
                }
                ```
            *   其他如 `BatchOperationResult` ([`lib/types/user.ts`](lib/types/user.ts:137)) 等如果多处复用，也可以考虑移入。
        *   **策略**: 优先放入全局 [`lib/types/common.ts`](lib/types/common.ts)。特定领域的大量共享类型，若有必要，再考虑领域内common文件。
        *   **输出**: 创建/更新的 [`lib/types/common.ts`](lib/types/common.ts)，并更新所有旧类型引用。

3.  **阶段三：统一API调用模式，重构 Actions 和 Store，并确保健壮性**
    1.  **3.1. 定义标准化API处理模式 (细化)**:
        *   **请求成功判断**:
            *   **HTTP层面**: API 调用首先检查 HTTP 状态码，2xx (如 200, 201) 通常表示 HTTP 请求成功。这部分由 [`lib/api/apiService.ts`](lib/api/apiService.ts) 的 Axios 拦截器处理。
            *   **业务层面**: 在获取到 HTTP 成功响应后，**必须检查响应体中 `code` 字段 (对应后端 `utils.Response.Code`)。`code === 0` 表示业务操作成功。** 非 `0` 的 `code` 表示业务逻辑错误，即使 HTTP 状态码是 200。
        *   **请求参数类型**: (同前)
        *   **响应数据类型**: (同前，强调使用新的 `ApiResponse<TData, TMeta>` 等通用类型)
        *   **加载状态管理**:
            *   在各个 Store 模块中（如 [`auth-store.ts`](lib/store/auth-store.ts:46), [`role-store.ts`](lib/store/role-store.ts:40), [`settings.store.ts`](lib/store/settings.store.ts:28)），应为每个主要的异步操作（通常是调用 Action）维护独立的加载状态（例如 `isLoadingLogin`, `isLoadingFetchRoles`, `isSubmittingSettings`）。
            *   Action 开始时设置为 `true`，结束后（无论成功或失败）设置为 `false`。
        *   **错误处理与展示逻辑 (细化)**:
            *   **A. `lib/api/apiService.ts` 层面**:
                *   **响应拦截器**:
                    *   HTTP 错误 (非 2xx): 拦截器应格式化错误信息，至少包含原始 HTTP 状态码、从响应体尝试解析的错误消息 (如后端 `utils.Response.Msg`) 和业务码 (如后端 `utils.Response.Code`)，然后抛出一个结构化的错误对象（例如，可以扩展内置 `Error` 或使用自定义错误类）。
                    *   HTTP 成功 (2xx)，但业务失败 (响应体 `code !== 0`): 拦截器也应识别这种情况，并将其转换为与 HTTP 错误类似的结构化错误对象抛出，确保上层调用方（Actions）以统一的方式处理错误。
                    *   `AuthenticationError` ([`lib/api/apiService.ts`](lib/api/apiService.ts:17)) 继续用于处理 401 错误，并由拦截器抛出。
            *   **B. `lib/actions/*` 层面**:
                *   Action 函数必须使用 `try...catch` 块来捕获来自 `apiService` 的所有错误。
                *   捕获到的结构化错误对象，其包含的 `code` (业务码) 和 `message` (错误消息) 应被用来填充返回给 Store 的 `ErrorApiResponse`。
            *   **C. `lib/store/*` 层面**:
                *   Store 中的异步方法（通常是调用 Actions 的方法）在 `catch` 块中接收 Action 返回的 `ErrorApiResponse`。
                *   将 `ErrorApiResponse` 中的 `message` 和 `code` 更新到 Store 对应的 `error` 状态字段中 (例如，`authError`, `rolesError`)。
                *   可以考虑使用 [`lib/utils/error-handler.ts`](lib/utils/error-handler.ts) 中的 `ErrorHandler.handleStoreError` (或类似逻辑) 来标准化这个过程，该函数内部可以调用 `showToast` ([`lib/utils/toast.ts`](lib/utils/toast.ts)) 来向用户展示一个通用的错误提示。
            *   **D. UI 组件 (`@/components`) 展示**:
                *   组件可以订阅 Store 中的特定错误状态。
                *   根据错误状态，在 UI 的合适位置（如表单下方、特定区域的提示条，或通过全局 `Sonner` 组件）显示更具体的错误信息。
                *   对于需要用户注意的严重错误或操作失败，`showToast` 提供即时反馈。
        *   **命名转换**: (同前)
    2.  **3.2. 重构 `lib/actions` 目录 (细化)**:
        *   **任务**: (同前)
        *   **重构内容**:
            *   Action 函数的返回值统一为 `Promise<SuccessApiResponse<ExpectedData> | ErrorApiResponse>`。
            *   在 Action 内部，调用 `apiService` 后，**严格检查响应体中的 `code` 字段。只有 `code === 0` 才认为是业务成功**，并构造 `SuccessApiResponse`。否则，即使 HTTP 状态码是 200，也应从响应体中提取业务错误码和消息，构造并返回 `ErrorApiResponse`。
            *   确保所有路径（成功、业务失败、HTTP失败、代码异常）都有明确的返回。
        *   **输出**: (同前)
    3.  **3.3. 重构 `lib/store` 目录 (细化)**:
        *   **任务**: (同前)
        *   **重构内容**:
            *   **State更新**: (同前)
            *   **异步操作适配**: Store 内调用 Action 后，根据 Action 返回的 `SuccessApiResponse` 或 `ErrorApiResponse` 来更新 state (包括数据和错误状态)。
            *   **缓存处理策略 (细化)** (涉及 [`lib/utils/cache-manager.ts`](lib/utils/cache-manager.ts)):
                *   **读取 (Getters/Selectors/Actions)**:
                    *   对于列表数据（如用户列表、角色列表）和不常变的详情数据（如特定设置、角色详情），在发起 API 请求前，优先尝试从 `cacheManager` 读取。
                    *   缓存的 key 应设计得合理，例如列表数据可以包含筛选和分页参数的序列化字符串作为 key 的一部分，以确保缓存的准确性 ([`cacheUtils.getUsersListKey`](lib/utils/cache-manager.ts:417) 是一个好例子)。
                *   **写入 (Actions/Store 异步方法成功回调)**:
                    *   当 Action 返回 `SuccessApiResponse` 且业务成功 (`code === 0`) 时，将 `data` 部分存入 `cacheManager`。
                    *   确保缓存的数据结构与新定义的类型一致。
                *   **失效 (Actions/Store 异步方法成功回调中执行写操作后)**:
                    *   **用户操作**: 创建、更新、删除用户后，必须失效用户列表缓存 (如 `CACHE_KEYS.USERS_LIST` 和所有相关的带参数的列表缓存键) 和被操作用户的详情缓存 (如 `CACHE_KEYS.USER_DETAIL(id)`).
                    *   **角色操作**: 创建、更新、删除角色，或修改角色权限后，失效角色列表缓存 (`CACHE_KEYS.ROLES_LIST`) 和相关角色详情缓存 (`CACHE_KEYS.ROLE_DETAIL(id)`). [`role-store.ts`](lib/store/role-store.ts) 中已有 `cacheUtils.clearRoleCache()` 和 `cacheManager.invalidate(CACHE_KEYS.ROLE_DETAIL(id))` 的良好实践。
                    *   **设置操作**: 更新任一类型的设置后，失效对应的设置缓存 (如 `CACHE_KEYS.SETTINGS_BASIC`) 以及可能的全局设置缓存 (`CACHE_KEYS.SETTINGS_ALL`)。[`settings.store.ts`](lib/store/settings.store.ts) 中已有此逻辑。
                    *   `cacheManager.invalidate(pattern)` 方法对于批量失效某一类缓存非常有用。
                *   **Store 初始化/水合**: 考虑在 Store 初始化时，是否需要从缓存加载初始数据。
        *   **输出**: (同前)

4.  **阶段四：保障 UI 组件 (`@/components`) 兼容性与稳定性 (新增/细化)**
    1.  **4.1. 全面影响分析**:
        *   对于每一个被修改的 Store state 或 Action，利用 IDE 工具（如 VSCode 的 "Find All References"）追踪其在 `@/components` 目录下的所有使用点。
        *   记录下受影响的组件列表及其具体使用方式。
    2.  **4.2. UI 组件适配**:
        *   **Props 类型更新**: 如果组件的 props 依赖于 Store 的 state 或 Action 的参数/返回值类型，当这些类型更新后，组件的 props 类型定义也必须同步更新。
        *   **数据消费逻辑调整**: 组件内部从 Store 获取数据（通过 hooks）或处理 Action 返回值的逻辑，需要根据新的数据结构（如 `ApiResponse.data`）和类型进行调整。
        *   **错误状态展示**: 组件应订阅相关的 Store 错误状态。当错误发生时，在 UI 上提供明确、友好的提示。例如，表单提交失败时，在表单附近显示错误信息；列表加载失败时，显示错误提示并提供重试按钮。
        *   **加载状态展示**: 组件应订阅相关的 Store 加载状态，在数据加载或操作进行中时，显示加载指示器（如 Spinner、骨架屏），避免用户误操作或界面卡顿感。
    3.  **4.3. 防御性编码与可选链**:
        *   在模板和逻辑中处理可能为 `undefined` 或 `null` 的数据时（特别是从 API 或 Store 获取的数据），广泛使用可选链 (`?.`) 和空值合并运算符 (`??`)，以及条件渲染，防止运行时错误。
    4.  **4.4. 渐进式重构与测试 (实施阶段重点)**:
        *   **模块化推进**: 建议按功能模块（如 Auth, Users, Roles, Settings）逐步进行类型对齐、Action 重构、Store 重构和相关联的组件适配。
        *   **即时测试**: 完成一个模块的重构后，立即进行相关页面的手动测试和（如果已有）自动化测试，确保核心功能未受破坏。
        *   **关注边界情况**: 测试各种成功、失败（业务失败、网络失败）和加载场景。
        *   **代码审查**: 对重构的代码进行严格的代码审查，特别关注类型使用、错误处理和缓存逻辑。

**整体流程图 (Mermaid):**
```mermaid
graph TD
    subgraph "准备与分析阶段"
        A[获取与分析 Swagger, Types, Utils, API Service, Cache, Actions, Stores, 后端代码片段]
    end

    subgraph "类型与公共层重构"
        B[1. 对齐/重构 lib/types, 定义 ApiResponse 等]
        C[2. 提取公共类型到 lib/types/common.ts]
        A --> B --> C
    end

    subgraph "核心逻辑重构"
        D[3.1 重构 lib/actions]
        E[3.2 重构 lib/store (含加载/错误/缓存逻辑)]
        C --> D
        C --> E
        D --> E
    end

    subgraph "UI 适配与保障"
        F[4.1 分析 lib/actions, lib/store 变更对 @/components 的影响]
        G[4.2 适配受影响的 @/components (Props, 数据消费, 错误/加载展示)]
        H[4.3 防御性编码与可选链应用]
        E --> F
        D --> F
        F --> G
        G --> H
    end
    
    subgraph "测试与迭代 (贯穿实施)"
        I[单元测试 (Actions, Store utils)]
        J[集成测试 (Action-API, Store-Action)]
        K[手动/E2E测试 (核心用户流程)]
        D --> I
        E --> I
        E --> J
        H --> K
    end

    subgraph "最终产出"
        L[更新后的 lib/types/*]
        M[更新后的 lib/actions/*]
        N[更新后的 lib/store/*]
        O[适配后的 @/components/*]
    end
    B --> L
    D --> M
    E --> N
    G --> O