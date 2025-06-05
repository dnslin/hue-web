# 任务规划上下文：重构 `user-store.ts`

**用户主要请求：**

对 [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md) 文件中描述的重构计划进行详细的任务拆解，保证每一个子任务都能正常完成。

**核心规划文件：**

*   [user_store_refactor_plan.md](../../../../user_store_refactor_plan.md)

**相关原始代码文件 (供参考)：**

*   [lib/store/user-store.ts](../../../../lib/store/user-store.ts) (原始待重构文件)
*   [lib/actions/users/user.actions.ts](../../../../lib/actions/users/user.actions.ts)
*   [lib/types/user.ts](../../../../lib/types/user.ts)
*   [lib/utils/cacheManager.ts](../../../../lib/utils/cacheManager.ts)

**期望输出：**

Planner 应输出一系列可执行的子任务，这些子任务可以被分配给 `rooroo-developer`。每个子任务应足够小，以便于管理和验证。任务拆解应覆盖计划中提到的所有方面，包括：
1.  创建新的 store 文件和目录结构。
2.  逐步迁移和实现每个新的子 store (userData, userFilter, userSelection, userBatch, userCache, userHydration)。
3.  处理 store 间的通信。
4.  配置持久化。
5.  更新 UI 组件对 store 的引用。
6.  更新或创建自定义 hooks (选择器)。
7.  定义测试步骤或要点，以确保重构的正确性。