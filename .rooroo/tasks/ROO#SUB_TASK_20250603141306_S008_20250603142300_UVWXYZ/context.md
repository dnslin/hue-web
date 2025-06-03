# 子任务上下文: 代码审查与依赖更新

**父任务ID:** ROO#TASK_20250603141306_4F8B1A
**主计划概览:** [Main Plan Overview](../../../plans/ROO#TASK_20250603141306_4F8B1A_plan_overview.md)
**源计划文件:** [plan.md](../../../plan.md)

## 目标

根据 [plan.md (章节 4.2)](../../../plan.md#42-代码审查与依赖更新) 的指导，进行全面的代码审查，确保所有对旧API的引用都已更新为使用新的Server Actions或 `apiService` (后者仅限Server Action内部)。同时，检查前端组件和Store对新架构的适应情况。

## 关键信息

*   **操作步骤:**
    1.  **全局搜索:** 使用IDE的全局搜索功能，查找项目中对已删除文件或旧API函数的残余引用（例如搜索 `apiClient`, `authService`, `forwardRequest`, `/api/auth/login` 等关键词，以及旧的API路径片段）。
    2.  **更新引用:** 将所有找到的引用点更新为使用新创建的Server Actions或新的 `apiService`。
    3.  **检查组件和Store:**
        *   确认前端组件（尤其是那些直接或间接发起API调用的）和Zustand Store正确导入并调用了对应的Server Actions。
        *   验证它们正确处理了Server Actions返回的Promise（包括成功数据和错误对象）。
        *   确保对认证错误（如401）有恰当的响应（例如，通过 `authStore` 触发跳转到登录页，或在UI上给出明确提示）。
*   **重点关注:**
    *   数据流的完整性：从UI交互到Server Action调用，再到Store更新，最后反馈到UI。
    *   错误处理逻辑的健壮性。
    *   UI兼容性，确保用户体验未受负面影响。

## 预期产出

*   项目中不再存在对旧API实现（已删除文件、旧函数、旧路由）的引用。
*   所有前端组件和Store均已正确适配新的Server Actions架构。
*   应用的数据流和错误处理机制在新架构下运行正常。