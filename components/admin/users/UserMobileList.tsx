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
      <div className="space-y-4 mobile-scroll-container">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-5 mobile-user-card">
            <div className="flex items-start gap-4">
              <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-52" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-muted-foreground">
          <div className="text-xl font-semibold mb-3">暂无用户数据</div>
          <div className="text-base">请尝试调整筛选条件或添加新用户</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mobile-scroll-container">
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
