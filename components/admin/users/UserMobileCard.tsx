"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, UserRole } from "@/lib/types/user";
import { UserActions } from "./UserActions";

interface UserMobileCardProps {
  user: User;
  onUserUpdate: (user: User) => void;
  onUserDelete: (userId: number) => void;
}

export function UserMobileCard({
  user,
  onUserUpdate,
  onUserDelete,
}: UserMobileCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge variant="destructive">管理员</Badge>;
      case UserRole.MODERATOR:
        return <Badge variant="secondary">版主</Badge>;
      case UserRole.USER:
        return <Badge variant="outline">普通用户</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <Card className="admin-card mobile-user-card">
      <CardContent className="p-5">
        <div className="space-y-5">
          {/* 用户基本信息 */}
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 flex-shrink-0">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback className="text-base font-medium">
                {user.nickname?.charAt(0) ||
                  user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-base truncate leading-tight">
                    {user.nickname || user.username}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {user.email}
                  </p>
                  {user.nickname && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      @{user.username}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 ml-3">
                  <UserActions
                    user={user}
                    onUserUpdate={onUserUpdate}
                    onUserDelete={onUserDelete}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 角色和状态 */}
          <div className="flex items-center gap-2">
            {getRoleBadge(user.role)}
          </div>

          {/* 详细信息网格 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="text-muted-foreground text-xs font-medium">
                注册时间
              </div>
              <div className="font-semibold">{formatDate(user.created_at)}</div>
            </div>
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="text-muted-foreground text-xs font-medium">
                最后登录
              </div>
              <div className="font-semibold">
                {user.last_login ? formatDate(user.last_login) : "从未登录"}
              </div>
            </div>
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="text-muted-foreground text-xs font-medium">
                上传数量
              </div>
              <div className="font-semibold">{user.upload_count || 0}</div>
            </div>
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <div className="text-muted-foreground text-xs font-medium">
                存储使用
              </div>
              <div className="font-semibold">
                {formatFileSize(user.storage_used)} /{" "}
                {formatFileSize(user.storage_limit)}
              </div>
            </div>
          </div>

          {/* 存储使用进度条 */}
          {user.storage_limit && user.storage_used && (
            <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="font-medium">存储使用率</span>
                <span className="font-semibold">
                  {Math.round((user.storage_used / user.storage_limit) * 100)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    width: `${Math.min(
                      (user.storage_used / user.storage_limit) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
