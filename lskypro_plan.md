# Lsky Pro 图床系统：前端重构技术设计文档 (Next.js + shadcn UI)

## 1. 项目概述与目标

**项目背景：** Lsky Pro（兰空图床）是一款广受欢迎的开源在线图床系统。原系统为用户提供了便捷的图片上传、管理和分享功能。为适应日益增长的用户需求、提升系统性能、优化开发体验并引入更现代化的技术栈，本项目旨在对 Lsky Pro 的前端进行全面重构。

**重构动因：**

* **性能提升：** 利用 Next.js 的服务端渲染 (SSR)、静态站点生成 (SSG) 及图片优化能力，显著改善首屏加载速度和整体用户体验。
* **现代化开发体验：** 引入 Next.js 的约定式路由、API 路由，结合 shadcn UI 的高可定制性和 Tailwind CSS 的高效样式开发，提升开发效率和代码质量。
* **UI/UX 优化：** 采用 shadcn UI 构建更美观、灵活且高度可定制的用户界面，并重点考虑移动端兼容性。
* **SEO 友好：** Next.js 的 SSR/SSG 特性天然对搜索引擎友好，有助于提升公开图片和相册的可发现性。
* **前后端解耦：** 维持并优化前后端分离的架构，前端通过调用后端 Golang 提供的 RESTful API ([`lskypro-server/docs/swagger.yaml`](lskypro-server/docs/swagger.yaml:1)) 进行数据交互。

**项目目标：**
新版本 Lsky Pro 前端将致力于：
* **提供卓越性能：** 实现快速的页面加载和流畅的用户交互。
* **打造现代化 UI/UX：** 基于 shadcn UI 和 Tailwind CSS 构建美观、易用、响应式的用户界面，确保在桌面和移动设备上均有良好体验。
* **高效的功能实现：** 完整实现用户认证、图片上传管理、相册管理、分享机制、存储策略展示（管理由后端负责）、站点设置查看（管理由后端负责）等核心功能。
* **清晰的 API 集成：** 明确前端各模块如何与后端 API ([`lskypro-server/docs/swagger.yaml`](lskypro-server/docs/swagger.yaml:1)) 进行高效、安全的通信。
* **良好的可维护性与扩展性：** 采用模块化设计和清晰的代码结构，便于未来功能的迭代和维护。

## 2. 系统功能模块划分

重构后的前端系统将主要包含以下功能模块，这些模块将基于新的技术栈实现：

* **用户认证模块：**
  * 用户注册 ([`POST /auth/register`](lskypro-server/docs/swagger.yaml:820))
  * 用户登录 ([`POST /auth/login`](lskypro-server/docs/swagger.yaml:782))
  * 用户信息获取 ([`GET /me`](lskypro-server/docs/swagger.yaml:1017))
  * 移动端：表单优化，支持手势操作等。
* **图片管理模块：**
  * 图片上传 (支持单张/多张，拖拽，剪贴板粘贴) ([`POST /images`](lskypro-server/docs/swagger.yaml:888))
  * 图片列表展示 (分页、筛选、排序) ([`GET /images`](lskypro-server/docs/swagger.yaml:853))
  * 图片详情查看 ([`GET /images/{id}`](lskypro-server/docs/swagger.yaml:984))
  * 图片删除 ([`DELETE /images/{id}`](lskypro-server/docs/swagger.yaml:937))
  * 图片信息编辑（如图名、描述，若API支持）
  * 移动端：优化图片预览，支持手势缩放，列表自适应。
* **相册管理模块：**
  * 创建相册 ([`POST /albums`](lskypro-server/docs/swagger.yaml:528))
  * 相册列表展示 ([`GET /albums`](lskypro-server/docs/swagger.yaml:494))
  * 相册详情查看 (包含相册内图片列表) ([`GET /albums/{id}`](lskypro-server/docs/swagger.yaml:615), [`GET /albums/{id}/images`](lskypro-server/docs/swagger.yaml:719))
  * 编辑相册信息 ([`PUT /albums/{id}`](lskypro-server/docs/swagger.yaml:663))
  * 删除相册 ([`DELETE /albums/{id}`](lskypro-server/docs/swagger.yaml:571))
  * 移动端：相册卡片式布局，操作便捷性。
* **分享模块：**
  * 创建图片/相册分享链接 ([`POST /shares`](lskypro-server/docs/swagger.yaml:1099))
  * 管理已创建的分享链接 (查看、删除 [`DELETE /shares/{token}`](lskypro-server/docs/swagger.yaml:1148))
  * 公开分享页面展示 ([`GET /shares/{token}`](lskypro-server/docs/swagger.yaml:1189))
  * 移动端：分享链接页面响应式设计。
* **用户中心模块:**
  * 查看和修改个人信息 (若 API 支持 [`PUT /users/{id}`](lskypro-server/docs/swagger.yaml:1298) 针对 `/me`)
  * 管理 API Token (若后端支持)
* **设置模块 (前端主要为展示):**
  * 查看站点配置信息 ([`GET /settings`](lskypro-server/docs/swagger.yaml:1040))
  * 管理员可修改部分前端相关设置 (若 API 支持 [`PUT /settings`](lskypro-server/docs/swagger.yaml:1066))
* **管理后台模块 (若前端需开发部分界面):**
  * 用户列表查看 ([`GET /users`](lskypro-server/docs/swagger.yaml:1220))
  * 存储策略列表查看 ([`GET /admin/storage-strategies`](lskypro-server/docs/swagger.yaml:319))
  * (其他管理功能主要由后端API直接操作，或有专门的后端管理界面)

## 3. 技术架构与选型

### 3.1. 前端技术栈

* **框架: Next.js**
  * **选择理由:**
    * **性能优化:** SSR, SSG, ISR, 自动代码分割, 图片优化 (`next/image`)。
    * **开发体验:** 基于文件系统的路由, API Routes (可用于 BFF), TypeScript 原生支持, 快速热重载。
    * **SEO:** 对搜索引擎友好。
    * **生态系统:** 庞大且活跃的社区，Vercel 提供的优秀托管和部署支持。
  * **关键特性应用:**
    * **页面渲染:** 根据页面特性选择 SSR (如用户个性化内容页面) 或 SSG (如公开分享页、帮助文档)。ISR 可用于需要定期更新的半静态内容。
    * **数据获取:** 使用 `getServerSideProps`, `getStaticProps`, 或客户端数据获取库 (如 SWR/React Query) 与后端 API 交互。
    * **API Routes:** 可用于处理表单提交、代理到后端服务、或实现简单的后端逻辑，简化前端直接调用复杂 API 的场景。
    * **图片优化:** 全面使用 `next/image` 组件优化图片加载和显示。
* **UI 组件库: shadcn UI**
  * **选择理由:**
    * **高度可定制:** 非传统组件库，提供可复制粘贴的组件代码，基于 Radix UI 和 Tailwind CSS。开发者拥有完全控制权，易于定制样式和行为。
    * **Tailwind CSS 集成:** 与 Tailwind CSS 无缝集成，享受原子化 CSS 带来的高效开发和样式一致性。
    * **可访问性:** 基于 Radix UI，关注可访问性 (a11y)。
    * **按需引入:** 只将实际使用的组件代码集成到项目中，有助于控制打包体积。
  * **使用策略:**
    * 直接将所需组件代码复制到项目中，并根据 Lsky Pro 的视觉风格进行定制。
    * 对于 shadcn UI 未提供的复杂组件，可基于其基础组件或 Radix UI 自行构建。
* **CSS 方案: Tailwind CSS**
  * **选择理由:**
    * **高效开发:** 原子化 CSS 类使得 UI 构建和迭代非常快速。
    * **一致性:** 易于维护统一的设计语言。
    * **性能:** 通过 PurgeCSS 等工具可以生成极小的 CSS 文件。
    * **可定制性:** `tailwind.config.js` 文件提供了强大的主题和变体定制能力。
* **状态管理:**
  * **方案选择:** 根据项目复杂度和团队熟悉度，可选择 Zustand、Jotai、Recoil 或 React Context API。
    * **Zustand/Jotai:** 轻量级、简单易用，适合中小型项目或对 Redux 样板代码感到冗余的场景。
    * **React Context API:** 适用于简单场景或局部状态管理。
  * **原则:** 避免不必要的全局状态，优先考虑组件局部状态和 Props 传递。仅将真正需要在多组件间共享且与业务逻辑紧密相关的状态放入全局 Store。
* **数据请求: SWR / React Query (推荐) 或 Fetch API / Axios**
  * **选择理由 (SWR/React Query):**
    * **缓存与同步:** 自动处理数据缓存、后台更新、请求去重、状态同步等。
    * **乐观更新:** 提升用户体验。
    * **分页与无限滚动:** 内置支持。
    * **Devtools:** 提供强大的开发调试工具。
  * **API 交互:** 所有与后端 [`lskypro-server/docs/swagger.yaml`](lskypro-server/docs/swagger.yaml:1) 的交互将通过封装的请求函数进行。
* **表单处理: React Hook Form (推荐)**
  * **选择理由:** 高性能、易用、支持校验、与 UI 库解耦。
* **代码规范与质量:**
  * **ESLint 和 Prettier:** 强制代码风格统一和潜在错误检查。
  * **TypeScript:** 全面使用 TypeScript 提升代码健壮性和可维护性。

### 3.2. 与后端 Golang 的交互

* **通信协议:** HTTP/S。
* **API 风格:** 前端将消费后端提供的 RESTful API (定义于 [`lskypro-server/docs/swagger.yaml`](lskypro-server/docs/swagger.yaml:1))。
* **数据格式:** JSON。
* **认证机制:** 基于 JWT (JSON Web Token)。
  * 登录成功后，后端返回 JWT。
  * 前端将 JWT 存储在安全的 HttpOnly Cookie (如果使用 Next.js API Routes 作为 BFF 代理) 或 LocalStorage/SessionStorage (如果前端直连 API，需注意 XSS 风险，并配合其他安全措施)。推荐通过 BFF 模式由服务端处理 Token 的存储与传递。
  * 后续请求中，前端在 HTTP Header 的 `Authorization` 字段中携带 `Bearer <JWT>`。
* **错误处理:** 统一处理后端返回的 HTTP 状态码 (4xx, 5xx) 和错误响应体，向用户提供友好的错误提示。

## 4. 系统架构设计

### 4.1. 前端架构

* **项目结构 (基于 Next.js):**

    ```
    lskypro-web/
    ├── app/                     # Next.js App Router (推荐)
    │   ├── (auth)/              # 认证相关页面路由组
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   ├── (dashboard)/         # 用户主操作界面路由组
    │   │   ├── layout.tsx       # Dashboard 布局 (含导航、侧边栏)
    │   │   ├── page.tsx         # Dashboard 首页
    │   │   ├── images/page.tsx
    │   │   ├── albums/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   └── settings/page.tsx
    │   ├── api/                 # Next.js API Routes (BFF)
    │   │   ├── auth/[...nextauth].ts # (如果使用 NextAuth.js)
    │   │   └── upload/route.ts    # (示例：处理上传代理)
    │   ├── layout.tsx           # 全局根布局
    │   ├── globals.css          # 全局样式 (Tailwind 指令)
    │   └── favicon.ico
    ├── components/              # UI 组件 (shadcn UI 定制组件及自定义组件)
    │   ├── ui/                  # shadcn UI 原始组件 (通过 CLI 添加)
    │   ├── shared/              # 项目共享的通用组件 (如 PageHeader, EmptyState)
    │   └── specific/            # 特定页面或功能的组件 (如 ImageCard, AlbumForm)
    ├── lib/                     # 工具函数、常量、类型定义
    │   ├── utils.ts
    │   ├── hooks/               # 自定义 Hooks
    │   ├── store/               # 状态管理 (Zustand, Jotai 等)
    │   └── types/               # TypeScript 类型定义
    ├── public/                  # 静态资源
    ├── tailwind.config.ts       # Tailwind CSS 配置
    ├── next.config.mjs          # Next.js 配置
    ├── tsconfig.json            # TypeScript 配置
    └── package.json
    ```

- **数据流:**
  * 页面组件通过 Hooks (如 `useEffect`, SWR/React Query 的 `useSWR`) 发起数据请求。
  * 请求函数调用封装的 API 服务，与后端或 Next.js API Routes 通信。
  * 获取数据后，更新组件状态或全局状态，触发 UI 重新渲染。
  * 用户交互触发事件，调用处理函数，可能再次发起 API 请求或更新状态。

### 4.2. 前后端交互流程 (示例：图片上传)

1. **前端 (用户操作):** 用户在图片上传页面选择文件，可选填相册 ID、存储策略 ID。
2. **前端 (请求准备):**
    * 使用 `FormData` 构建请求体，包含文件和其他参数。
    * 调用封装的上传服务函数。
3. **前端 (API 调用):**
    * 请求 `POST /api/v1/images` ([`lskypro-server/docs/swagger.yaml:888`](lskypro-server/docs/swagger.yaml:888))。
    * Header 中携带 `Authorization: Bearer <JWT>`。
    * (可选BFF) 或者，前端请求 Next.js API Route (如 `/api/upload`)，该 API Route 再调用后端 `/api/v1/images`，这样做的好处是可以处理一些前端不便处理的逻辑，或统一管理对后端API的调用。
4. **后端 (处理):**
    * 验证 JWT，用户权限。
    * 校验参数 (文件大小、类型，相册、存储策略有效性)。
    * 根据存储策略保存文件 (本地或云存储)。
    * 在数据库 `images` 表创建记录。
    * (可选) 触发异步任务 (如生成缩略图、内容审核)。
5. **后端 (响应):** 返回成功信息 (含图片 URL、ID 等) 或错误信息。
    * 成功响应示例 (201 Created):

      ```json
      {
        "code": 201,
        "message": "Upload successful",
        "data": {
          "id": 101,
          "url": "https://img.example.com/...",
          "filename": "example.jpg",
          // ... 其他图片元数据
        }
      }
      ```

6. **前端 (处理响应):**
    * 显示成功提示，更新图片列表或跳转到图片详情。
    * 若失败，显示错误信息。

### 4.3. 前端组件划分

* **基础 UI 组件 (来自 shadcn UI 或自定义):**
  * `Button`, `Input`, `Select`, `Checkbox`, `RadioGroup`, `Dialog`, `DropdownMenu`, `Tooltip`, `Avatar`, `Badge`, `Card`, `Table`, `Tabs`, `Toast` 等。
  * 这些组件将根据项目视觉规范进行统一样式定制。
* **布局组件:**
  * `MainLayout`: 包含导航栏、侧边栏、页脚的整体布局。
  * `AuthLayout`: 用于登录、注册页面的居中布局。
  * `PageWrapper`: 包裹页面内容，提供统一的边距、标题等。
* **业务组件:**
  * `ImageUploader`: 图片上传组件，支持拖拽、预览、进度显示。
  * `ImageCard`: 单个图片展示卡片。
  * `ImageList`: 图片列表展示，支持分页、筛选。
  * `AlbumForm`: 创建/编辑相册的表单。
  * `ShareDialog`: 生成分享链接的对话框。
  * `UserProfileForm`: 用户个人信息编辑表单。

### 4.4. 移动端兼容性设计原则

* **响应式布局:**
  * 使用 Tailwind CSS 的响应式断点 (`sm`, `md`, `lg`, `xl`, `2xl`) 来调整布局、字体大小、元素显隐等。
  * 采用 Grid 和 Flexbox 构建灵活的页面结构。
* **触摸友好:**
  * 确保按钮、链接等交互元素有足够大的点击区域。
  * 支持常见的手势操作 (如图片预览时的滑动切换、捏合缩放)。
* **性能优化:**
  * `next/image` 自动提供适用于移动设备的优化图片。
  * 代码分割和懒加载对移动端网络环境尤其重要。
* **导航适配:**
  * 桌面端可能使用顶部导航栏和侧边栏。
  * 移动端可考虑使用底部 Tab 导航、汉堡菜单或抽屉式导航。
* **表单优化:**
  * 输入框类型适配 (如 `type="email"`, `type="tel"` 调起对应键盘)。
  * 简化移动端表单项，避免过多输入。
* **组件适配:**
  * shadcn UI 组件本身具有一定的响应式能力，但仍需针对性测试和调整。
  * 例如，`Table` 组件在小屏幕上可能需要转换为卡片列表或允许水平滚动。`Dialog` 组件在移动端应全屏或接近全屏显示。

## 5. API 设计风格 (前端消费视角)

前端将严格按照后端提供的 Swagger API 文档 ([`lskypro-server/docs/swagger.yaml`](lskypro-server/docs/swagger.yaml:1)) 进行接口调用。

* **请求封装:** 在 `lib/api/` 或类似目录下，按资源对 API 请求进行封装。例如:

  ```typescript
  // lib/api/imageService.ts
  import apiClient from './apiClient'; // apiClient 封装了基础URL、认证头、错误处理等

  export const uploadImage = (formData: FormData) => {
    return apiClient.post('/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  export const getImages = (params: { album_id?: number; page?: number; page_size?: number }) => {
    return apiClient.get('/images', { params });
  };
  ```

- **类型安全:** 利用 TypeScript 为 API 的请求参数和响应数据定义类型，这些类型可以基于 Swagger 文档生成或手动编写。
* **错误处理:** 封装通用的错误处理逻辑，例如对 401 (未授权) 跳转登录页，对 403 (禁止访问) 显示提示，对 5xx (服务器错误) 显示通用错误信息。
* **状态码处理:** 根据 HTTP 状态码判断请求结果。

## 6. 项目目录结构

(已在 4.1. 前端架构中详细说明)

## 7. 关键业务流程说明 (前端视角)

### 7.1. 用户注册与登录流程

* **注册:**
    1. 用户访问注册页面 (`/register`)。
    2. 填写表单 (用户名、邮箱、密码)，React Hook Form 进行前端校验。
    3. 提交表单，调用 `authService.register(data)`。
    4. `authService` 发送 `POST /api/v1/auth/register` 请求 ([`lskypro-server/docs/swagger.yaml:820`](lskypro-server/docs/swagger.yaml:820))。
    5. 成功后，后端返回用户信息和 JWT。前端存储 JWT，更新全局用户状态，跳转到用户主页或登录页。
    6. 失败则显示错误提示。
* **登录:**
    1. 用户访问登录页面 (`/login`)。
    2. 填写表单 (用户名/邮箱、密码)。
    3. 提交表单，调用 `authService.login(data)`。
    4. `authService` 发送 `POST /api/v1/auth/login` 请求 ([`lskypro-server/docs/swagger.yaml:782`](lskypro-server/docs/swagger.yaml:782))。
    5. 成功后，后端返回用户信息和 JWT。前端存储 JWT，更新全局用户状态，跳转到用户主页。
    6. 失败则显示错误提示。

### 7.2. 图片上传流程

(已在 4.2. 前后端交互流程中详细说明)

### 7.3. 相册管理流程

* **创建相册:**
    1. 用户在相册管理页面点击“创建相册”按钮。
    2. 弹出 `AlbumForm` 对话框，用户填写相册名称、描述等。
    3. 提交表单，调用 `albumService.createAlbum(data)`。
    4. `albumService` 发送 `POST /api/v1/albums` 请求 ([`lskypro-server/docs/swagger.yaml:528`](lskypro-server/docs/swagger.yaml:528))。
    5. 成功后，刷新相册列表，显示成功提示。
* **查看相册图片:**
    1. 用户点击某个相册。
    2. 页面跳转到相册详情页 (`/albums/[id]`)。
    3. 页面加载时，调用 `albumService.getAlbumDetails(albumId)` 和 `imageService.getImages({ album_id: albumId })`。
    4. 分别请求 `GET /api/v1/albums/{id}` ([`lskypro-server/docs/swagger.yaml:615`](lskypro-server/docs/swagger.yaml:615)) 和 `GET /api/v1/albums/{id}/images` ([`lskypro-server/docs/swagger.yaml:719`](lskypro-server/docs/swagger.yaml:719)) (或 `GET /images` 带 `album_id` 参数)。
    5. 展示相册信息和图片列表。

### 7.4. 分享流程

* **创建分享:**
    1. 用户在图片或相册旁点击“分享”按钮。
    2. 弹出 `ShareDialog`，可选填有效期。
    3. 确认分享，调用 `shareService.createShare({ type, resource_id, expire_days })`。
    4. `shareService` 发送 `POST /api/v1/shares` 请求 ([`lskypro-server/docs/swagger.yaml:1099`](lskypro-server/docs/swagger.yaml:1099))。
    5. 成功后，后端返回分享 token 和 URL。前端显示分享链接供用户复制。
* **访问分享页:**
    1. 用户通过分享链接 (如 `/s/[token]`) 访问。
    2. Next.js 页面组件 (`/s/[token]/page.tsx`) 加载。
    3. 组件调用 `shareService.getShareContent(token)`。
    4. `shareService` 发送 `GET /api/v1/shares/{token}` 请求 ([`lskypro-server/docs/swagger.yaml:1189`](lskypro-server/docs/swagger.yaml:1189))。
    5. 根据返回的资源类型 (图片/相册) 和数据，渲染分享内容。
    6. 若链接无效或过期，显示提示信息。

## 8. UI/UX 设计原则与组件库使用

* **设计语言:** 简洁、现代、易用。参考主流云存储和图床应用的优秀设计。
* **shadcn UI 定制:**
  * **主题色:** 根据 Lsky Pro 品牌形象定义主色调、辅助色。
  * **组件变体:** 对 shadcn UI 提供的组件进行样式微调，以符合整体风格。例如，调整按钮圆角、输入框高度、卡片阴影等。
  * **组件组合:** 利用基础组件组合出更复杂的业务组件。
* **Tailwind CSS 应用:**
  * **原子化优先:** 尽可能使用 Tailwind 的原子类构建界面。
  * **`@apply` 审慎使用:** 仅在需要抽取复杂、重复的样式组合时使用 `@apply`，避免滥用导致 CSS 文件膨胀。
  * **配置文件:** 在 `tailwind.config.ts` 中定义主题色、字体、间距、断点等，确保全局一致。
* **响应式设计:**
  * (已在 4.4. 移动端兼容性设计原则中详细说明)
  * 确保所有核心功能在不同尺寸屏幕上均可用且体验良好。
* **可访问性 (a11y):**
  * 使用语义化 HTML 标签。
  * 确保键盘导航友好。
  * 为图片提供 `alt` 文本。
  * shadcn UI 基于 Radix UI，本身对可访问性有较好支持，在此基础上进行检查和优化。
* **反馈与提示:**
  * 使用 `Toast` (shadcn UI 提供) 或类似组件提供操作成功、失败、加载中等即时反馈。
  * 对耗时操作提供加载指示 (如骨架屏、Spinner)。
  * 表单校验错误信息清晰明了。

## 9. 后续可扩展性说明 (前端视角)

* **模块化组件:** 清晰的组件划分使得添加新功能或修改现有功能时，影响范围可控。
* **API 版本管理:** 若后端 API 升级，前端可以通过调整 API 服务层进行适配，对业务组件影响较小。
* **Next.js 特性:**
  * **App Router:** 提供了更灵活的路由和布局方式，便于组织大型应用。
  * **Server Components & Server Actions (实验性):** 未来可能进一步简化数据获取和表单处理逻辑。
* **状态管理解耦:** 选用的状态管理方案 (如 Zustand) 通常与 UI 组件松耦合，便于测试和替换。
* **国际化 (i18n):** 若需支持多语言，可引入 `next-intl` 或类似库，结合 Next.js 路由实现。
* **主题切换:** 基于 Tailwind CSS 和 CSS 变量，可以相对容易地实现浅色/深色主题切换功能。

本文档旨在为 Lsky Pro 前端重构项目提供清晰的技术指引。在开发过程中，应持续关注技术社区的最佳实践，并根据实际需求灵活调整。
