# 计划概览: 重构 `user-store.ts`

**Parent Task ID:** ROO#TASK_20250605153100_A1B2C3
**原始规划文件:** [`user_store_refactor_plan.md`](../../../user_store_refactor_plan.md)
**父任务上下文:** [context.md](../../tasks/ROO#TASK_20250605153100_A1B2C3/context.md)

## 总体策略
本计划旨在将单一庞大的 `user-store.ts` 拆分为多个职责更单一、更易于维护的 Zustand store，遵循 [`user_store_refactor_plan.md`](../../../user_store_refactor_plan.md) 中定义的步骤。所有子任务主要由 `rooroo-developer` 执行，并按顺序进行。

## 子任务列表

1.  **S001: 创建目录结构和初始空文件**
    *   **ID**: `ROO#SUB_TASK_A1B2C3_S001_20250605153201_A1B2`
    *   **专家**: `rooroo-developer`
    *   **目标**: 创建 `lib/store/user/` 目录及所有新的 `.store.ts` 和 `index.ts` 空文件。
    *   **上下文**: [S001 Context](../../tasks/ROO#SUB_TASK_A1B2C3_S001_20250605153201_A1B2/context.md)

2.  **S002: 实现 `userData.store.ts`**
    *   **ID**: `ROO#SUB_TASK_A1B2C3_S002_20250605153202_A1B2`
    *   **专家**: `rooroo-developer`
    *   **目标**: 实现用户核心数据管理逻辑。
    *   **上下文**: [S002 Context](../../tasks/ROO#SUB_TASK_A1B2C3_S002_20250605153202_A1B2/context.md)

3.  **S003: 实现 `userCache.store.ts`**
    *   **ID**: `ROO#SUB_TASK_A1B2C3_S003_20250605153203_A1B2`
    *   **专家**: `rooroo-developer`
    *   **目标**: 实现用户数据缓存控制逻辑。
    *   **上下文**: [S003 Context](../../tasks/ROO#SUB_TASK_A1B2C3_S003_20250605153203_A1B2/context.md)

4.  **S004: 实现 `userFilter.store.ts`**
    *   **ID**: `ROO#SUB_TASK_A1B2C3_S004_20250605153204_A1B2`
    *   **专家**: `rooroo-developer`
    *   **目标**: 实现用户列表筛选与分页管理逻辑，包括持久化。
    *   **上下文**: [S004 Context](../../tasks/ROO#SUB_TASK_A1B2C3_S004_20250605153204_A1B2/context.md)

5.  **S005: 实现 `userSelection.store.ts`**
    *   **ID**: `ROO#SUB_TASK_A1B2C3_S005_20250605153205_A1B2`
    *   **专家**: `rooroo-developer`
    *   **目标**: 实现用户列表选择管理逻辑。
    *   **上下文**: [S005 Context](../../tasks/ROO#SUB_TASK_A1B2C3_S005_20250605153205_A1B2/context.md)

6.  **S006: 实现 `userBatch.store.ts`**
    *   **ID**: `ROO#SUB_TASK_A1B2C3_S006_20250605153206_A1B2`
    *   **专家**: `rooroo-developer`
    *   **目标**: 实现用户批量操作管理逻辑。
    *   **上下文**: [S006 Context](../../tasks/ROO#SUB_TASK_A1B2C3_S006_20250605153206_A1B2/context.md)

7.  **S007: 实现 `userHydration.store.ts`**
    *   **ID**: `ROO#SUB_TASK_A1B2C3_S007_20250605153207_A1B2`
    *   **专家**: `rooroo-developer`
    *   **目标**: 实现 Zustand 状态水合管理逻辑。
    *   **上下文**: [S007 Context](../../tasks/ROO#SUB_TASK_A1B2C3_S007_20250605153207_A1B2/context.md)

8.  **S008: 更新 UI 组件引用**
    *   **ID**: `ROO#SUB_TASK_A1B2C3_S008_20250605153208_A1B2`
    *   **专家**: `rooroo-developer`
    *   **目标**: 更新项目中所有 UI 组件对新 store 的引用。
    *   **上下文**: [S008 Context](../../tasks/ROO#SUB_TASK_A1B2C3_S008_20250605153208_A1B2/context.md)

9.  **S009: 更新/创建自定义 Hooks (选择器)**
    *   **ID**: `ROO#SUB_TASK_A1B2C3_S009_20250605153209_A1B2`
    *   **专家**: `rooroo-developer`
    *   **目标**: 更新或创建新的自定义 hooks (选择器) 以适配新的 store 结构。
    *   **上下文**: [S009 Context](../../tasks/ROO#SUB_TASK_A1B2C3_S009_20250605153209_A1B2/context.md)

10. **S010: 定义测试点和执行基本测试**
    *   **ID**: `ROO#SUB_TASK_A1B2C3_S010_20250605153210_A1B2`
    *   **专家**: `rooroo-developer`
    *   **目标**: 定义关键测试点清单，并执行冒烟测试。
    *   **上下文**: [S010 Context](../../tasks/ROO#SUB_TASK_A1B2C3_S010_20250605153210_A1B2/context.md)

11. **S011: 代码审查准备与清理**
    *   **ID**: `ROO#SUB_TASK_A1B2C3_S011_20250605153211_A1B2`
    *   **专家**: `rooroo-developer`
    *   **目标**: 代码最终检查、格式化、删除旧 `user-store.ts`。
    *   **上下文**: [S011 Context](../../tasks/ROO#SUB_TASK_A1B2C3_S011_20250605153211_A1B2/context.md)

## 关键依赖
子任务按顺序执行，后续任务通常依赖于前面任务的完成。特别是 UI 更新和测试任务依赖于所有 store 的正确实现。

## 假设
*   所有相关的 API 接口 (`user.actions.ts`) 已存在且功能符合预期。
*   Zustand 库已在项目中正确安装和配置。
*   开发者熟悉 Zustand 的使用和 TypeScript。

## 潜在风险 (可选)
*   UI 组件更新工作量可能较大，涉及组件范围广。
*   状态迁移过程中可能遗漏边缘情况。
*   持久化配置和水合逻辑可能需要仔细调试。