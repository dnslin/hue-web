"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, getUserDisplayName } from "@/lib/types/user";
import { getGravatarUrl, getUserInitials } from "@/lib/utils/gravatar";
import { getRoleBadgeInfo } from "@/lib/utils/role-helpers";
import { UserActions } from "./actions";

interface UserMobileCardProps {
  user: User;
}

export function UserMobileCard({ user }: UserMobileCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatStorageSize = (mb?: number) => {
    if (!mb) return "0 MB";
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  // This logic is now centralized in lib/utils/role-helpers.ts

  return (
    <Card className="admin-card mobile-user-card border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* 用户基本信息 - 优化布局 */}
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0 ring-1 ring-primary/10">
              <AvatarImage
                src={getGravatarUrl(user.email)}
                alt={user.username}
              />
              <AvatarFallback className="text-sm font-semibold bg-primary/10 text-primary">
                {getUserInitials(getUserDisplayName(user))}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pr-2">
              <div className="space-y-1">
                <div className="flex flex-col gap-2">
                  <h3
                    className="font-semibold text-sm leading-tight text-foreground truncate max-w-[300px]"
                    title={getUserDisplayName(user)}
                  >
                    {getUserDisplayName(user)}
                  </h3>
                  <Badge
                    variant={getRoleBadgeInfo(user.role).variant}
                    className="text-xs px-2 py-0.5"
                  >
                    {getRoleBadgeInfo(user.role).text}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground" title={user.email}>
                  {user.email}
                </p>
                {user.nickname && (
                  <p
                    className="text-xs text-muted-foreground/70 truncate max-w-[140px]"
                    title={`@${user.username}`}
                  >
                    @{user.username}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <UserActions user={user} />
            </div>
          </div>

          {/* 简化的详细信息网格 */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1 p-2 bg-muted/20 rounded-md border border-border/50">
              <div className="text-muted-foreground font-medium">注册时间</div>
              <div className="font-semibold text-foreground text-xs">
                {formatDate(user.createdAt)}
              </div>
            </div>
            <div className="space-y-1 p-2 bg-muted/20 rounded-md border border-border/50">
              <div className="text-muted-foreground font-medium">最后登录</div>
              <div className="font-semibold text-foreground text-xs">
                {user.lastLoginAt ? formatDate(user.lastLoginAt) : "从未"}
              </div>
            </div>
            {user.suspiciousLoginNotifiedAt && (
              <div className="col-span-2 space-y-1 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200 dark:border-orange-800">
                <div className="text-orange-700 dark:text-orange-300 font-medium">通知时间</div>
                <div className="font-semibold text-orange-800 dark:text-orange-200 text-xs">
                  {formatDate(user.suspiciousLoginNotifiedAt)}
                </div>
              </div>
            )}
          </div>

          {/* 存储信息和进度条 */}
          <div className="space-y-2 p-2 bg-gradient-to-r from-muted/10 to-muted/20 rounded-md border border-border/30">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground font-medium">
                  已用容量: {formatStorageSize(user.usedStorageMb)} /{" "}
                  {formatStorageSize(user.storageCapacityMb)}
                </span>
              </div>
              <span className="font-bold text-primary text-xs">
                {user.storageCapacityMb && user.usedStorageMb
                  ? Math.round((user.usedStorageMb / user.storageCapacityMb) * 100)
                  : 0}
                %
              </span>
            </div>
            {(user.storageCapacityMb != null && user.usedStorageMb != null) && (
              <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-primary/80 h-1.5 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(
                      (user.usedStorageMb! / user.storageCapacityMb!) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
