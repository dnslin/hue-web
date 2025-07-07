"use client";

import { useEffect } from "react";
import { useStore } from "zustand";
import { Plus, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserFilters } from "./filters";
import { UserTable } from "./table";
import { UserMobileList } from "./mobile-list";
import { UserPagination } from "./pagination";
import { UserCreateDialog } from "./create-dialog";
import { User } from "@/lib/types/user";
import { userDataStore } from "@/lib/store/user/user-data.store";
import { useUserFilterStore } from "@/lib/store/user/user-filter.store";
import { useUserDataHydration } from "@/lib/store/user/user-hydration.store";
import { getAllUsersForExportAction } from "@/lib/actions/users/user.actions";
import { showToast } from "@/lib/utils/toast";

interface UserListProps {
  isMobile?: boolean;
}

export function UserList({ isMobile = false }: UserListProps) {
  const { users, total, loading, error } = useStore(userDataStore);
  const { filters, setFilters } = useUserFilterStore();
  const isHydrated = useUserDataHydration();

  useEffect(() => {
    if (error) {
      // store中已经显示了toast，这里只记录日志用于调试
      console.error("User list error:", error);
    }
  }, [error]);

  // 如果状态未水合完成，显示加载状态
  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-4"></div>
          <div className="h-32 bg-muted rounded mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // 导出用户数据
  const handleExport = async () => {
    try {
      const usersOrError = await getAllUsersForExportAction(filters);

      if (!Array.isArray(usersOrError)) {
        console.error("导出用户数据失败 (获取数据时):", usersOrError.message);
        showToast.error("导出用户数据失败", usersOrError.message);
        return;
      }

      const usersToExport: User[] = usersOrError;

      if (usersToExport.length === 0) {
        showToast.warning("没有可导出的用户数据");
        return;
      }

      // 2. Convert users array to CSV string
      const headers = [
        "ID",
        "用户名",
        "昵称",
        "邮箱",
        "角色",
        "状态",
        "注册时间",
        "最后登录时间",
        "最后登录IP",
        "通知时间",
        "已用容量(MB)",
        "存储容量(MB)",
      ];
      const csvRows = [
        headers.join(","),
        ...usersToExport.map((user) =>
          [
            user.id,
            `"${user.username.replace(/"/g, '""')}"`, // Handle quotes in username
            `"${(user.nickname || "").replace(/"/g, '""')}"`,
            user.email,
            user.role?.name || "",
            user.status,
            user.createdAt
              ? new Date(user.createdAt).toLocaleString("zh-CN")
              : "",
            user.lastLoginAt
              ? new Date(user.lastLoginAt).toLocaleString("zh-CN")
              : "",
            user.lastLoginIp || "",
            user.suspiciousLoginNotifiedAt
              ? new Date(user.suspiciousLoginNotifiedAt).toLocaleString("zh-CN")
              : "",
            user.usedStorageMb || 0,
            user.storageCapacityMb || "无限制",
          ].join(",")
        ),
      ];
      const csvString = csvRows.join("\n");

      // 3. Create Blob and trigger download
      const blob = new Blob(["\uFEFF" + csvString], {
        type: "text/csv;charset=utf-8;",
      }); // Add BOM for Excel compatibility
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("导出用户数据时发生意外错误:", error);
      showToast.error("导出用户数据时发生意外错误");
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1
            className={
              isMobile ? "text-xl font-semibold" : "text-2xl font-semibold"
            }
          >
            用户管理
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              导出数据
            </Button>
          )}
          <UserCreateDialog>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              {isMobile ? "添加" : "添加用户"}
            </Button>
          </UserCreateDialog>
        </div>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardContent className="pt-6">
          <UserFilters isMobile={isMobile} />
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>用户列表</span>
            <span className="text-sm font-normal text-muted-foreground">
              共 {total} 个用户
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <UserMobileList users={users} loading={loading} />
          ) : (
            <UserTable
              users={users}
              loading={loading}
              onSort={(sortBy, sortOrder) => {
                setFilters({ sortBy: sortBy, sortOrder: sortOrder });
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      <Card className="py-2 mb-1">
        <CardContent className="px-2">
          <UserPagination isMobile={isMobile} />
        </CardContent>
      </Card>
    </div>
  );
}
