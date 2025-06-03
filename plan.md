# API模块重构详细计划 (plan.md)

**最后更新时间:** {{YYYY-MM-DD HH:MM}}

**核心目标：** 本次重构旨在优化项目前端的API调用架构，全面转向使用Next.js Server Actions处理所有后端数据交互，并建立一个统一的、直连后端的API客户端。**此重构主要集中在前端内部数据流和API调用机制的调整，目标是保持现有UI组件的功能和调用接口不变或高度兼容，最大程度减少对UI层代码的直接修改。**

**开发环境说明：** 本项目使用 `pnpm` 作为包管理工具，运行于 `Node.js 20.x` 环境，开发操作系统为 `Windows`。

**核心架构图 (Mermaid):**

```mermaid
graph TD
    subgraph Browser/Client Components
        A[React Components / UI] --> B{Zustand Stores};
        B --> C[Server Actions Call];
    end

    subgraph Next.js Server
        C --> D[Server Actions (/lib/actions/*/*.actions.ts)];
        D -- Reads/Writes --> E[HTTP-only Cookie (auth_token)];
        D -- Uses --> F[New API Service (/lib/api/apiService.ts)];
        F -- HTTP Requests (with auth_token) --> G[Backend API (e.g., http://127.0.0.1:8080/api/v1)];
    end

    G -- HTTP Responses --> F;
    F -- Returns Data/Status --> D;
    D -- Returns Data/Status --> C;
    C -- Updates --> B;
    B -- Updates --> A;

    H[/lib/types/*] --> A;
    H --> B;
    H --> D;
    H --> F;

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#ccf,stroke:#333,stroke-width:2px
    style C fill:#lightgrey,stroke:#333,stroke-width:2px
    style D fill:#cfc,stroke:#333,stroke-width:2px
    style E fill:#ff9,stroke:#333,stroke-width:2px
    style F fill:#fcf,stroke:#333,stroke-width:2px
    style G fill:#cff,stroke:#333,stroke-width:2px
    style H fill:#e6e6fa,stroke:#333,stroke-width:2px
```

---

## 详细步骤

### 阶段一：基础建设与新API客户端

#### 1.1. 配置后端API地址

*   **操作：** 检查或创建/更新项目根目录下的 `.env.local` 文件。
*   **内容：**
    ```env
    NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080/api/v1
    # 根据实际后端API调整上述URL
    ```
*   **目的：** 为新的API客户端提供后端服务的统一入口地址。**后端API的具体端点、请求方法、请求体和响应体结构应参考项目根目录下的 [`swagger.yaml`](swagger.yaml:1) 文件。**
*   **验证：** 确保此环境变量在本地开发和后续部署环境中均可访问。

#### 1.2. 创建新的统一API服务 (`/lib/api/apiService.ts`)

*   **操作：** 在 `/lib/api/` 目录下创建新文件 `apiService.ts`。
*   **目的：** 封装所有与后端API的直接HTTP通信，提供统一的请求配置、认证头附加及错误处理机制。**所有与后端API的交互细节（如端点路径、请求方法、参数、响应结构等）均应以 [`swagger.yaml`](swagger.yaml:1) 为权威参考。**
*   **核心实现点：**
    *   使用 `axios` (或 `node-fetch` / `undici` 如果偏好原生fetch API，但axios在错误处理和拦截器方面更成熟)。
    *   从 `process.env.NEXT_PUBLIC_API_BASE_URL` 读取 `baseURL`。
    *   设计 `createApiService` 函数，允许在创建实例时传入 `authToken`。
    *   **请求拦截器：**
        *   自动附加 `Content-Type: application/json` （可配置）。
        *   如果传入了 `authToken`，则附加到 `Authorization: Bearer <token>` 请求头。
    *   **响应拦截器：**
        *   成功响应时，默认直接返回 `response.data` 以简化调用。
        *   错误响应时：
            *   记录详细错误日志（请求URL、方法、状态码、后端返回的错误信息）。
            *   **识别401错误**：当后端返回401时，确保错误对象中包含明确的401状态码或特定错误类型，**但不在此处执行任何客户端跳转逻辑**。
            *   将后端返回的错误信息（通常在 `error.response.data`）包装成一个标准的错误对象或直接向上抛出，供Server Action捕获和处理。
    *   提供一个辅助函数 `getAuthenticatedApiService()`，它在内部使用 `cookies().get('auth_token')?.value` 获取token，并创建携带此token的 `apiService` 实例。此函数仅应在Server Actions内部使用。
    *   提供一个 `publicApiService` 实例，不携带认证信息，用于登录、注册等公开接口的调用。
*   **示例代码片段 (axios):**
    ```typescript
    // lib/api/apiService.ts
    import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
    import { cookies } from 'next/headers'; // 用于 getAuthenticatedApiService

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    export class AuthenticationError extends Error {
      constructor(message: string, public status: number = 401) {
        super(message);
        this.name = 'AuthenticationError';
      }
    }

    interface ApiServiceOptions {
      authToken?: string;
    }

    const createApiService = (options?: ApiServiceOptions): AxiosInstance => {
      const instance = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15秒超时
      });

      instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
          const tokenToUse = options?.authToken;
          if (tokenToUse) {
            config.headers.Authorization = `Bearer ${tokenToUse}`;
          }
          // console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
          return config;
        },
        (error: AxiosError) => {
          console.error('[API Request Error Interceptor]', error);
          return Promise.reject(error);
        }
      );

      instance.interceptors.response.use(
        (response: AxiosResponse) => response.data, // 直接返回data部分
        (error: AxiosError<any>) => {
          const errorMessage = error.response?.data?.message || error.message || 'An unknown API error occurred';
          const statusCode = error.response?.status;

          console.error(`[API Response Error] Status: ${statusCode}, Message: ${errorMessage}`, error.response?.data);

          if (statusCode === 401) {
            return Promise.reject(new AuthenticationError(errorMessage, statusCode));
          }
          // 可以根据项目需求抛出自定义错误或返回特定格式
          return Promise.reject({ message: errorMessage, code: statusCode, data: error.response?.data });
        }
      );
      return instance;
    };

    export const getAuthenticatedApiService = () => {
      const cookieStore = cookies(); // 在Server Action中调用
      const token = cookieStore.get('auth_token')?.value;
      // console.log('[API Service] Auth Token from cookie:', token ? 'Token Found' : 'No Token');
      return createApiService({ authToken: token });
    };

    export const publicApiService = createApiService(); // 用于公开接口

    export default createApiService;
    ```
*   **依赖安装：** 如果选择 `axios`，执行 `pnpm add axios`。

---

### 阶段二：认证逻辑迁移

#### 2.1. 创建认证相关的Server Actions

*   **操作：** 在 `/lib/actions/auth/` 目录下创建 `auth.actions.ts` 文件。
*   **目的：** 将原有的认证HTTP端点逻辑（登录、注册、登出、获取当前用户）迁移到Server Actions。
*   **核心实现点：**
    *   文件顶部添加 `'use server';`。
    *   导入 `cookies` from `next/headers`，以及 `redirect` from `next/navigation`。
    *   导入 `publicApiService` 和 `getAuthenticatedApiService` from `@/lib/api/apiService`。
    *   导入相关的请求/响应类型 from `@/lib/types/user` 或 `@/lib/types/auth` (如果需要新建)。
    *   **`loginAction(credentials: LoginRequest): Promise<AuthResponse | ErrorResponse>`**
        *   调用 `publicApiService.post('/auth/login', credentials)`。
        *   **成功时：**
            *   从响应中提取 `token` 和 `user` 信息。
            *   使用 `cookies().set('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 30 * 24 * 60 * 60 /* 30天 */ })` 设置cookie。
            *   返回包含用户信息和成功状态的 `AuthResponse`。
        *   **失败时：** 捕获错误，返回包含错误信息的 `ErrorResponse`。
    *   **`registerAction(userData: RegisterRequest): Promise<AuthResponse | ErrorResponse>`**
        *   调用 `publicApiService.post('/auth/register', userData)`。
        *   **成功时：** 如果后端返回token，则自动登录（同上设置cookie）。返回成功状态或用户信息。
        *   **失败时：** 返回错误信息。
    *   **`logoutAction(): Promise<{ success: boolean }>`**
        *   可选：调用 `getAuthenticatedApiService().post('/auth/logout')` 通知后端。
        *   使用 `cookies().delete('auth_token', { path: '/' })` 清除cookie。
        *   返回 `{ success: true }`。
    *   **`getCurrentUserAction(): Promise<User | null>`**
        *   调用 `getAuthenticatedApiService().get('/me')`。
        *   **成功时：** 返回用户信息。
        *   **失败时（包括401）：** 捕获 `AuthenticationError` 或其他错误，记录日志，返回 `null`。**不在此处执行 `redirect`**，将决策权交给调用方（例如页面级Server Component）。
*   **错误处理：** 在每个Action中使用 `try...catch` 块，确保捕获来自 `apiService` 的错误，并返回统一的错误响应结构给客户端。

#### 2.2. 更新认证状态管理 (`/lib/store/authStore.ts`)

*   **操作：** 修改 `/lib/store/authStore.ts`。
*   **目的：** 使Store的认证方法调用新的Server Actions，并处理其返回结果。
*   **核心修改点：**
    *   移除对旧 `authService.ts` 和 `apiClient.ts` 的导入和使用。
    *   导入新创建的 `loginAction`, `registerAction`, `logoutAction`, `getCurrentUserAction`。
    *   **`login` 方法：**
        *   调用 `loginAction(credentials)`。
        *   根据返回结果更新 `user`, `isAuthenticated`, `error`, `isLoading` 状态。
    *   **`register` 方法：**
        *   调用 `registerAction(userData)`。
        *   根据返回结果处理状态。
    *   **`logout` 方法：**
        *   调用 `logoutAction()`。
        *   成功后清除本地认证状态 (`user: null`, `isAuthenticated: false`)。
    *   **`initializeAuth` (或 `checkAuthStatus`) 方法：**
        *   调用 `getCurrentUserAction()`。
        *   如果成功获取到用户，则设置认证状态；否则清除认证状态。
        *   此方法通常在应用加载时（例如在根布局的Server Component或Client Component的 `useEffect` 中）调用一次。
*   **兼容性：** 确保Store暴露给UI组件的接口（方法名、参数、返回的Promise解析值）与重构前保持一致或兼容，以减少UI层改动。

---

### 阶段三：业务API迁移

#### 3.1. 创建业务模块的Server Actions (例如 `/lib/actions/users/user.actions.ts`, `/lib/actions/roles/role.actions.ts`)

*   **操作：** 根据功能模块组织，在 `/lib/actions/` 下创建子目录和对应的 `.actions.ts` 文件。
*   **目的：** 将所有原先通过 `/app/api/...` 路由处理的业务逻辑（如用户管理、角色管理等）迁移到Server Actions。
*   **核心实现点 (以 `user.actions.ts` 为例)：**
    *   **重要：** 创建所有Server Actions时，其调用的后端API端点、HTTP方法、请求参数、请求体以及期望的响应数据结构，**均需严格参照项目根目录下的 [`swagger.yaml`](swagger.yaml:1) 文件中的定义。**
    *   文件顶部添加 `'use server';`。
    *   导入 `getAuthenticatedApiService` from `@/lib/api/apiService`。
    *   导入相关的请求/响应类型 from `@/lib/types/*`。
    *   为原 [`lib/api/adminUsers.ts`](lib/api/adminUsers.ts:1) 中的每个函数（如 `getAdminUserList`, `createAdminUser`, `updateAdminUser`, `deleteAdminUser`, `approveUser`, `banUser`, `batchApproveUsers` 等）创建对应的Server Action。
    *   **示例 `getUsersAction(params: UserListParams): Promise<UserListResponse | ErrorResponse>`:**
        ```typescript
        // /lib/actions/users/user.actions.ts
        'use server';
        import { getAuthenticatedApiService, AuthenticationError } from '@/lib/api/apiService';
        import { UserListParams, UserListResponse } from '@/lib/types/user';
        import { redirect } from 'next/navigation'; // 用于页面级数据获取失败时的重定向

        export async function getUsersAction(params: UserListParams): Promise<UserListResponse> {
          try {
            const apiService = getAuthenticatedApiService();
            // 假设apiService的baseURL是 .../api/v1，则原 /v1/admin/users 对应这里的 /admin/users
            const response = await apiService.get('/admin/users', { params });
            return response; // apiService已配置直接返回data
          } catch (error: any) {
            console.error('[Action Error] getUsersAction:', error.message);
            if (error instanceof AuthenticationError) {
              // 对于页面级数据获取，如果未认证，可以直接重定向
              // 但如果此Action被客户端组件内的逻辑调用，则不应直接redirect，而是抛出或返回错误
              // 此处假设主要用于服务端数据获取或需要强制登录的场景
              redirect('/login'); // 或者根据调用上下文返回错误对象
            }
            // 返回一个符合预期的错误结构，或者直接抛出以便上层try-catch
            throw { message: error.message || 'Failed to fetch users', code: error.code || 500, data: error.data };
          }
        }
        ```
    *   **`createUserAction(userData: AdminUserCreateRequest): Promise<User | ErrorResponse>`** 等写操作Action：
        *   调用 `getAuthenticatedApiService().post(...)`, `put(...)`, `delete(...)`。
        *   **401处理：** 如果捕获到 `AuthenticationError`，不应 `redirect`。应返回一个明确的错误对象给客户端，由客户端的Store或UI逻辑处理用户重新登录的引导。
        *   成功时返回操作结果，失败时返回错误对象。
*   **对其他模块 (如 `role.actions.ts`) 进行类似处理。**

#### 3.2. 更新业务相关的状态管理 (例如 `/lib/store/userStore.ts`, `/lib/store/roleStore.ts`)

*   **操作：** 修改各业务模块的Zustand Store。
*   **目的：** 使Store的方法调用新创建的对应模块的Server Actions。
*   **核心修改点：**
    *   移除对旧API文件（如 `adminUsers.ts`, `roles.ts`）的导入和使用。
    *   导入新创建的Server Actions。
    *   修改Store中所有的数据获取和操作方法（如 `fetchUsers`, `createUser`, `updateRole` 等），使其调用对应的Server Action。
    *   **处理Server Action的返回值：**
        *   成功时，更新Store的状态。
        *   失败时（包括认证错误），更新Store中的 `error` 状态，并可能需要清除部分数据或用户认证状态（如果错误是401）。
*   **兼容性：** 再次强调，Store暴露给UI组件的接口应保持兼容。

---

### 阶段四：清理与最终检查

#### 4.1. 移除旧的API路由和相关工具文件

*   **操作：**
    1.  **备份（可选但推荐）：** 在进行删除前，可以将旧的API相关文件备份到项目外的一个临时目录。
    2.  **删除 `/app/api/` 目录：** 彻底删除此目录及其所有子内容。
    3.  **删除 `lib/api/apiUtils.ts`。**
    4.  **删除旧的 `lib/api/apiClient.ts`** (如果 `apiService.ts` 是全新创建且不依赖它)。
    5.  **删除 `lib/api/authService.ts`。**
    6.  **删除 `lib/api/adminUsers.ts` 和 `lib/api/roles.ts`** (在确认所有功能已通过Server Actions实现后)。
    7.  **更新或删除 `lib/api/index.ts`：** 如果所有API调用都直接通过导入Server Actions进行，此文件可能不再需要作为API的统一出口。如果仍有少量非Action的API工具函数（不太可能在此次重构后保留），则相应更新。
*   **目的：** 清理项目结构，移除不再使用的代码，避免混淆。

#### 4.2. 代码审查与依赖更新

*   **操作：**
    *   使用IDE的全局搜索功能，查找项目中对已删除文件或旧API函数的引用（例如搜索 `apiClient`, `authService`, `forwardRequest`, `/api/auth/login` 等）。
    *   将所有找到的引用点更新为使用新创建的Server Actions或新的 `apiService` (后者应仅限于Server Action内部)。
    *   仔细检查所有前端组件（尤其是那些直接或间接发起API调用的）和Zustand Store，确保它们：
        *   正确导入并调用了对应的Server Actions。
        *   正确处理了Server Actions返回的Promise（包括成功数据和错误对象）。
        *   对认证错误（如401）有恰当的响应（例如，通过Store触发跳转到登录页）。
*   **目的：** 确保整个应用的数据流已切换到新的架构，没有遗漏。

#### 4.3. 类型定义检查 (`/lib/types/*`)

*   **操作：**
    *   回顾 `/lib/types/user.ts`, `/lib/types/dashboard.ts` 等类型定义文件。
    *   对照项目根目录下的 **[`swagger.yaml`](swagger.yaml:1)** 中定义的后端API实际请求体和响应体结构，以及Server Actions的参数和返回值设计，检查类型定义是否仍然准确和完整。
    *   根据需要添加、修改或删除类型定义，确保与 [`swagger.yaml`](swagger.yaml:1) 保持一致。
*   **目的：** 保持类型系统的健全性，减少运行时错误。

---
**后续（由用户执行）：**

*   **全面手工测试：**
    *   认证流程：登录、注册、登出、会话超时后的行为。
    *   所有涉及数据交互的业务功能模块。
    *   错误处理：网络错误、后端业务逻辑错误、权限不足等情况下的前端表现。
    *   UI兼容性：确保UI组件在重构后行为符合预期。

---

**关于UI组件的兼容性再次强调：**

本次重构的核心在于替换数据获取和操作的底层机制。对于UI组件而言，它们通常依赖于Store（如 `useUserStore`, `useAuthStore`）获取数据和调用操作方法。只要Store暴露给UI的接口（如 `fetchUsers`, `login` 等方法及其参数、返回值结构）在重构过程中保持不变或兼容，UI组件本身的代码改动将非常小，甚至无需改动。例如，如果一个用户列表组件之前调用 `userStore.fetchUsers(params)`，重构后，`userStore.fetchUsers` 内部会从调用旧API改为调用 `getUsersAction`，但组件的调用方式不变。