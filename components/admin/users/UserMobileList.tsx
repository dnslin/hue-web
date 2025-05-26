"use client";

import { User } from "@/lib/types/user";
import { UserMobileCard } from "./UserMobileCard";
import { Skeleton } from "@/components/ui/skeleton";

interface UserMobileListProps {
  users: User[];
  loading?: boolean;
  onUserUpdate: (user: User) => void;
  onUserDelete: (userId: number) => void;
}

export function UserMobileList({
  users,
  loading = false,
  onUserUpdate,
  onUserDelete,
}: UserMobileListProps) {
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
    <div className="space-y-3 mobile-scroll-container">
      {users.map((user) => (
        <UserMobileCard
          key={user.id}
          user={user}
          onUserUpdate={onUserUpdate}
          onUserDelete={onUserDelete}
        />
      ))}
    </div>
  );
}
