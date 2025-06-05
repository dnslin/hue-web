# Sub-task Context: S003 - 实现 `userCache.store.ts`

**Parent Task ID:** ROO#TASK_20250605153100_A1B2C3
**Main Plan Overview:** [Main Plan Overview](../../../plans/ROO#TASK_20250605153100_A1B2C3_plan_overview.md)
**Relevant Plan Section:** [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:205) (Section 8.3: 实现 `userCache.store.ts`)

**Goal for Expert (rooroo-developer):**
实现 [`lib/store/user/userCache.store.ts`](../../../../lib/store/user/userCache.store.ts)。参考 [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md:205) 第 8.3 节。定义 `UserCacheState` 和 `UserCacheActions`。实现 `markAsFetched`, `invalidateCache`, `updateCacheVersion`, `checkIfStale` 方法。确保 `invalidateCache` 和 `updateCacheVersion` 调用 [`lib/utils/cacheManager.ts`](../../../../lib/utils/cacheManager.ts:327) 中的 `cacheUtils.clearUserCache()`。

**Key Files for This Sub-task:**
*   [`user_store_refactor_plan.md`](../../../../user_store_refactor_plan.md)
*   [`lib/utils/cacheManager.ts`](../../../../lib/utils/cacheManager.ts)
*   [`lib/store/user/userCache.store.ts`](../../../../lib/store/user/userCache.store.ts) (待实现)