"use client";

import { User } from "@/lib/types/user";
import { UserMobileCard } from "./mobile-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useUserSelectionStore } from "@/lib/store/user/selection";

interface UserMobileListProps {
  users: User[];
  loading?: boolean;
}

export function UserMobileList({
  users,
  loading = false,
}: UserMobileListProps) {
  const { selectedUserIds, toggleAllUsersSelection, isAllSelected, clearSelection } = useUserSelectionStore();
  
  const allUserIdsOnPage = users.map((u) => u.id);
  const isAllOnPageSelected = isAllSelected(allUserIdsOnPage);
  const hasSelection = selectedUserIds.size > 0;

  if (loading) {
    return (
      <div className="space-y-3 mobile-scroll-container">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border p-3 mobile-user-card bg-card/50"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-muted-foreground space-y-2">
          <div className="text-lg font-semibold">暂无用户数据</div>
          <div className="text-sm text-muted-foreground/80">
            请尝试调整筛选条件或添加新用户
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 移动端批量选择控制栏 */}
      {users.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isAllOnPageSelected}
              onCheckedChange={(checked: boolean | "indeterminate") =>
                toggleAllUsersSelection(allUserIdsOnPage, !!checked)
              }
              aria-label="Select all users on this page"
            />
            <span className="text-sm font-medium">
              {isAllOnPageSelected ? "取消全选" : "全选当前页"}
            </span>
          </div>
          {hasSelection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="text-xs"
            >
              清除选择 ({selectedUserIds.size})
            </Button>
          )}
        </div>
      )}
      
      {/* 用户卡片列表 */}
      <div className="space-y-3 mobile-scroll-container">
        {users.map((user) => (
          <UserMobileCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
