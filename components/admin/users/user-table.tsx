"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  UserListParams,
  UserRole,
  getUserDisplayName,
} from "@/lib/types/user";
import { getGravatarUrl, getUserInitials } from "@/lib/utils/gravatar";
import { useUserSelectionStore } from "@/lib/store/user/user-selection.store";
import { UserActions } from "./user-actions";

interface UserTableProps {
  users: User[];
  loading?: boolean;
  onSort?: (
    sortBy: UserListParams["sortBy"],
    sortOrder: UserListParams["sortOrder"]
  ) => void;
}

interface SortConfig {
  key: UserListParams["sortBy"];
  direction: "asc" | "desc";
}

export function UserTable({ users, loading = false, onSort }: UserTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const {
    selectedUserIds,
    toggleUserSelection,
    toggleAllUsersSelection,
    isAllSelected,
  } = useUserSelectionStore();

  const allUserIdsOnPage = users.map((u) => u.id);
  const isAllOnPageSelected = isAllSelected(allUserIdsOnPage);

  const handleSort = (key: UserListParams["sortBy"]) => {
    let direction: "asc" | "desc" = "desc";

    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "desc"
    ) {
      direction = "asc";
    }

    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const getSortIcon = (key: UserListParams["sortBy"]) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4" />;
    }

    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
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
        return <Badge variant="secondary">封禁用户</Badge>;
      case UserRole.USER:
        return <Badge variant="outline">普通用户</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="p-4">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center">
          <div className="text-muted-foreground">
            <div className="text-lg font-medium mb-2">暂无用户数据</div>
            <div className="text-sm">请尝试调整筛选条件或添加新用户</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 w-12">
                <Checkbox
                  checked={isAllOnPageSelected}
                  onCheckedChange={(checked: boolean | "indeterminate") =>
                    toggleAllUsersSelection(allUserIdsOnPage, !!checked)
                  }
                  aria-label="Select all rows on this page"
                />
              </th>
              <th className="text-left p-4 font-medium">用户信息</th>
              <th className="text-left p-4 font-medium">角色</th>
              <th className="text-left p-4 font-medium">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort("createdAt")}
                >
                  注册时间
                  {getSortIcon("createdAt")}
                </Button>
              </th>
              <th className="text-left p-4 font-medium">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort("lastLoginAt")}
                >
                  最后登录
                  {getSortIcon("lastLoginAt")}
                </Button>
              </th>
              <th className="text-left p-4 font-medium">登录IP</th>
              <th className="text-left p-4 font-medium">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort("uploadCount")}
                >
                  上传数量
                  {getSortIcon("uploadCount")}
                </Button>
              </th>
              <th className="text-left p-4 font-medium">存储使用</th>
              <th className="text-right p-4 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b hover:bg-muted/25 transition-colors"
              >
                <td className="p-4">
                  <Checkbox
                    checked={selectedUserIds.has(user.id)}
                    onCheckedChange={() => toggleUserSelection(user.id)}
                    aria-label={`Select row for user ${user.username}`}
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user.avatar || getGravatarUrl(user.email)}
                        alt={user.username}
                      />
                      <AvatarFallback>
                        {getUserInitials(getUserDisplayName(user))}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {getUserDisplayName(user)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                      {user.nickname && (
                        <div className="text-xs text-muted-foreground">
                          @{user.username}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4">{getRoleBadge(user.role)}</td>
                <td className="p-4 text-sm text-muted-foreground">
                  {formatDate(user.createdAt)}
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  <div>
                    {user.lastLoginAt
                      ? formatDate(user.lastLoginAt)
                      : "从未登录"}
                  </div>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {user.lastLoginIp || "无记录"}
                </td>
                <td className="p-4 text-sm">
                  <div className="font-medium">{user.uploadCount || 0}</div>
                </td>
                <td className="p-4 text-sm">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {formatFileSize(user.storageUsed)} /{" "}
                      {formatFileSize(user.storageLimit)}
                    </div>
                    {user.storageLimit != null &&
                      user.storageUsed != null && (
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{
                              width: `${Math.min(
                                (user.storageUsed / user.storageLimit) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-end">
                    <UserActions user={user} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
