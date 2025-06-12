# 前后端数据结构统一作战计划

## 1. 计划总览

我们的目标是无缝地将后端 `snake_case` 数据转换为前端惯用的 `camelCase` 数据，并将此过程隔离在 API 服务层，以最小化对现有业务逻辑的侵入。

```mermaid
graph TD
    A[Phase 1: 基础建设] --> B[Phase 2: API 层改造];
    B --> C[Phase 3: 类型与逻辑审查 (验证)];
    C --> D[Phase 4: 手动回归测试];
    D --> E[Phase 5: 完成与部署];

    subgraph A[Phase 1: 基础建设]
        A1[1.1: 安装 `change-case` 依赖];
        A2[1.2: 创建 `case-converter.ts` 工具函数];
    end

    subgraph B[Phase 2: API 层改造]
        B1[2.1: 修改 `lib/api/apiService.ts`];
        B2[2.2: 在拦截器中使用新的转换工具];
    end

    subgraph C[Phase 3: 类型与逻辑审查 (验证)]
        C1[3.1: 审查并统一 `lib/types`];
        C2[3.2: 验证 `lib/actions` 和 `lib/store`];
        C3[3.3: 验证 `components` 和 `app` 页面];
    end
    
    subgraph D[Phase 4: 手动回归测试]
        D1[4.1: 全面测试数据交互功能];
        D2[4.2: 使用浏览器工具验证数据格式];
    end

    subgraph E[Phase 5: 完成与部署]
        E1[5.1: 清理代码并提交];
    end
```

---

## 2. 详细执行步骤

### Phase 1: 基础建设

*   **任务 1.1: 安装 `change-case` 依赖**
    *   **操作**: 执行 `pnpm add change-case` 命令。
    *   **目的**: 引入统一的命名转换工具库。

*   **任务 1.2: 创建 `case-converter.ts` 工具函数**
    *   **操作**: 在 `lib/utils/` 目录下创建 `case-converter.ts` 文件。在其中，我们将编写一个递归函数，该函数接收一个对象和一个转换函数（例如 `camelCase` from `change-case`）作为参数，然后返回一个新的、所有键都被转换过的对象。
    *   **目的**: 构建我们自己的、可重用的深层对象键名转换器。

### Phase 2: API 层改造 (核心)

*   **任务 2.1: 修改 `lib/api/apiService.ts`**
    *   **操作**:
        1.  从我们新创建的 `lib/utils/case-converter.ts` 中导入 `deepConvertToCamelCase` 和 `deepConvertToSnakeCase` 函数。
        2.  在 Axios 的**请求拦截器**中，使用 `deepConvertToSnakeCase` 转换发出的数据。
        3.  在 Axios 的**响应拦截器**中，使用 `deepConvertToCamelCase` 转换收到的数据。
    *   **目的**: 实现全局、自动化的数据命名风格转换。

### Phase 3: 类型与逻辑审查 (验证和修改)

*   **任务 3.1**: 审查类型定义 (`lib/types`)。
    *   **操作**: 快速浏览 `lib/types` 下的文件，确保所有接口定义都统一使用 `camelCase`。移除之前为兼容 `snake_case` 而添加的辅助类型或转换函数。
    *   **目的**: 简化类型定义，使其成为前端唯一的“事实标准”。

*   **任务 3.2**: 验证 Actions (`lib/actions`) 和 Stores (`lib/store`)。
    *   **操作**: 快速检查关键的业务逻辑文件，确认它们处理的数据对象属性是 `camelCase`。
    *   **目的**: 确保数据在进入业务逻辑层时已经是正确的格式。

*   **任务 3.3: 验证组件和页面 (`components`, `app`)**
    *   **操作**: 抽查所有关键页面（如 `app/(admin)/users/page.tsx`）和它们使用的组件（如 `components/admin/users/user-list.tsx`）。确认它们从 props 或 store 中获取的数据已经是 `camelCase` 格式，并且渲染正常。
    *   **目的**: 确保我们的 API 适配器层成功地将数据转换逻辑与 UI 层隔离，验证 UI 层代码无需修改。

### Phase 4: 手动回归测试

*   **测试清单**:
    *   [ ] **用户管理**: 列表加载、筛选、排序、创建、编辑、删除、批量操作。
    *   [ ] **角色管理**: 列表加载、创建、编辑、删除、权限同步。
    *   [ ] **认证**: 登录、注册。
    *   [ ] **浏览器开发者工具**: 检查网络请求的 `payload` (应为 snake_case) 和 store 中的 `state` (应为 camelCase)。