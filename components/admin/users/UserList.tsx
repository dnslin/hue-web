"use client";

import { useEffect } from "react";
import { Plus, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { UserMobileList } from "./UserMobileList";
import { UserPagination } from "./UserPagination";
import { UserListParams } from "@/lib/types/user";
import { 
  useUserStore,
  useUserList,
  useUserPagination,
  useUserFilters,
  useUserLoading,
  useUserError
} from "@/lib/store/userStore";
import { getAllUsersForExportAction } from "@/lib/actions/users/user.actions";
import { User } from "@/lib/types/user"; 

interface UserListProps {
  isMobile?: boolean;
}

export function UserList({ isMobile = false }: UserListProps) {
  // 使用store状态
  const users = useUserList();
  const pagination = useUserPagination();
  const filters = useUserFilters();
  const loading = useUserLoading();
  const error = useUserError();
  
  // 使用store方法
  const { 
    fetchUsers, 
    setFilters, 
    setPage, 
    setPageSize,
    clearError 
  } = useUserStore();

  // 处理筛选变化
  const handleFiltersChange = (newFilters: UserListParams) => {
    setFilters(newFilters);
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setPage(page);
  };

  // 处理每页显示数量变化
  const handlePageSizeChange = (pageSize: number) => {
    setPageSize(pageSize);
  };

  // 导出用户数据
  const handleExport = async () => {
    try {
      // 1. Fetch all users based on current filters
      const usersOrError = await getAllUsersForExportAction(filters);

      if (!Array.isArray(usersOrError)) { // Check if it's an ErrorResponse
        console.error("导出用户数据失败 (获取数据时):", usersOrError.message);
        alert(`导出失败: ${usersOrError.message}`);
        return;
      }

      const usersToExport: User[] = usersOrError;

      if (usersToExport.length === 0) {
        alert("没有可导出的用户数据。");
        return;
      }

      // 2. Convert users array to CSV string
      const headers = ["ID", "用户名", "昵称", "邮箱", "角色", "状态", "注册时间", "最后登录时间", "上传数量", "已用存储(MB)", "存储上限(MB)"];
      const csvRows = [
        headers.join(','),
        ...usersToExport.map(user => [
          user.id,
          `"${user.username.replace(/"/g, '""')}"`, // Handle quotes in username
          `"${(user.nickname || '').replace(/"/g, '""')}"`,
          user.email,
          user.role,
          user.status,
          user.created_at ? new Date(user.created_at).toLocaleString('zh-CN') : '',
          user.last_login ? new Date(user.last_login).toLocaleString('zh-CN') : '',
          user.upload_count || 0,
          user.storage_used ? (user.storage_used / (1024 * 1024)).toFixed(2) : 0,
          user.storage_limit ? (user.storage_limit / (1024 * 1024)).toFixed(2) : '无限制',
        ].join(','))
      ];
      const csvString = csvRows.join('\n');

      // 3. Create Blob and trigger download
      const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Excel compatibility
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
      alert("导出用户数据时发生意外错误。");
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 清除错误
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

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
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            {isMobile ? "添加" : "添加用户"}
          </Button>
        </div>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardContent className="pt-6">
          <UserFilters
            onFiltersChange={handleFiltersChange}
            totalCount={pagination.total}
            filteredCount={users.length}
            isMobile={isMobile}
          />
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>用户列表</span>
            <span className="text-sm font-normal text-muted-foreground">
              共 {pagination.total} 个用户
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <UserMobileList
              users={users}
              loading={loading.list}
              onUserUpdate={() => {}} // TODO: 实现用户更新
              onUserDelete={() => {}} // TODO: 实现用户删除
            />
          ) : (
            <UserTable
              users={users}
              loading={loading.list}
              onSort={(sortBy, sortOrder) => {
                setFilters({ sort_by: sortBy, sort_order: sortOrder });
              }}
              onUserUpdate={() => {}} // TODO: 实现用户更新
              onUserDelete={() => {}} // TODO: 实现用户删除
            />
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      <Card className="py-2 mb-1">
        <CardContent className="px-2">
          <UserPagination
            currentPage={pagination.page}
            totalPages={Math.ceil(pagination.total / pagination.page_size)}
            totalItems={pagination.total}
            pageSize={pagination.page_size}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading.list}
            isMobile={isMobile}
          />
        </CardContent>
      </Card>
    </div>
  );
}
