"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { User, UserListParams, getUserDisplayName } from "@/lib/types/user";
import { getRoleBadgeInfo } from "@/lib/utils/role-helpers";
import { getGravatarUrl, getUserInitials } from "@/lib/utils/gravatar";
import { useUserSelectionStore } from "@/lib/store/user/user-selection.store";
import { UserActions } from "./actions";

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

  const formatStorageSize = (mb?: number) => {
    if (!mb) return "0 MB";
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
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
                  onClick={() => handleSort("created_at")}
                >
                  注册时间
                  {getSortIcon("created_at")}
                </Button>
              </th>
              <th className="text-left p-4 font-medium">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort("last_login_at")}
                >
                  最后登录
                  {getSortIcon("last_login_at")}
                </Button>
              </th>
              <th className="text-left p-4 font-medium">登录IP</th>
              <th className="text-left p-4 font-medium">通知时间</th>
              <th className="text-left p-4 font-medium">存储容量</th>
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
                        src={getGravatarUrl(user.email)}
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
                <td className="p-4">
                  <Badge variant={getRoleBadgeInfo(user.role).variant}>
                    {getRoleBadgeInfo(user.role).text}
                  </Badge>
                </td>
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
                <td className="p-4 text-sm text-muted-foreground">
                  {user.suspiciousLoginNotifiedAt
                    ? formatDate(user.suspiciousLoginNotifiedAt)
                    : "无通知"}
                </td>
                <td className="p-4 text-sm">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {formatStorageSize(user.usedStorageMb)} /{" "}
                      {formatStorageSize(user.storageCapacityMb)}
                    </div>
                    {(user.storageCapacityMb != null && user.usedStorageMb != null) && (
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
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
