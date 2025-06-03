# API模块重构计划 - 概览

**父任务ID:** ROO#TASK_20250603141306_4F8B1A
**源计划文件:** [plan.md](../../plan.md)

## 整体策略

遵循 [plan.md](../../plan.md) 中详细描述的API模块重构计划，将项目前端的API调用架构全面转向使用Next.js Server Actions，并建立统一的API客户端。此过程将分阶段进行，确保每个阶段的稳定性和可验证性。

## 子任务列表

以下是按顺序执行的子任务：

1.  **配置后端API地址** ([`plan.md`](../../plan.md) 章节 1.1)
    *   **目标:** 确保新的API客户端有正确的后端服务入口。
    *   **专家:** rooroo-developer
2.  **创建新的统一API服务 (`/lib/api/apiService.ts`)** ([`plan.md`](../../plan.md) 章节 1.2)
    *   **目标:** 封装所有与后端API的直接HTTP通信。
    *   **专家:** rooroo-developer
3.  **创建认证相关的Server Actions (`/lib/actions/auth/auth.actions.ts`)** ([`plan.md`](../../plan.md) 章节 2.1)
    *   **目标:** 将认证逻辑迁移到Server Actions。
    *   **专家:** rooroo-developer
4.  **更新认证状态管理 (`/lib/store/authStore.ts`)** ([`plan.md`](../../plan.md) 章节 2.2)
    *   **目标:** 使认证Store调用新的Server Actions。
    *   **专家:** rooroo-developer
5.  **创建业务模块的Server Actions** ([`plan.md`](../../plan.md) 章节 3.1)
    *   **目标:** 将业务逻辑迁移到各模块的Server Actions。
    *   **专家:** rooroo-developer
6.  **更新业务相关的状态管理** ([`plan.md`](../../plan.md) 章节 3.2)
    *   **目标:** 使业务Store调用新的Server Actions。
    *   **专家:** rooroo-developer
7.  **移除旧的API路由和相关工具文件** ([`plan.md`](../../plan.md) 章节 4.1)
    *   **目标:** 清理项目结构，移除不再使用的代码。
    *   **专家:** rooroo-developer
8.  **代码审查与依赖更新** ([`plan.md`](../../plan.md) 章节 4.2)
    *   **目标:** 确保整个应用的数据流已切换到新架构。
    *   **专家:** rooroo-developer
9.  **类型定义检查 (`/lib/types/*`)** ([`plan.md`](../../plan.md) 章节 4.3)
    *   **目标:** 保持类型系统的健全性。
    *   **专家:** rooroo-developer

## 关键依赖

子任务严格按顺序执行。

## 假设

*   项目根目录下的 [`swagger.yaml`](../../swagger.yaml) 文件是最新的，并准确描述了后端API。
*   开发环境已按 [`plan.md`](../../plan.md) 中所述配置完毕（pnpm, Node.js 20.x）。
*   后端API服务 (`http://127.0.0.1:8080/api/v1` 或 `.env.local` 中配置的地址) 已启动并可访问。

## 潜在风险

*   [`plan.md`](../../plan.md) 中的某些细节可能需要根据实际编码情况微调。
*   迁移过程中可能出现预料之外的兼容性问题。
*   对 [`swagger.yaml`](../../swagger.yaml) 的理解可能存在偏差，导致与后端接口不匹配。