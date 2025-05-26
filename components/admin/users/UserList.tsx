"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { UserMobileList } from "./UserMobileList";
import { UserPagination } from "./UserPagination";
import { User, UserListParams, UserListResponse } from "@/lib/types/user";
import { getUserList, exportUsers } from "@/lib/api";

interface UserListProps {
  initialData?: UserListResponse;
  isMobile?: boolean;
}

export function UserList({ initialData, isMobile = false }: UserListProps) {
  const [users, setUsers] = useState<User[]>(initialData?.data || []);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<UserListParams>({
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: initialData?.total || 0,
    page: initialData?.page || 1,
    limit: initialData?.limit || 20,
    total_pages: initialData?.total_pages || 0,
  });

  // 获取用户列表
  const fetchUsers = useCallback(async (params: UserListParams) => {
    setLoading(true);
    try {
      const response = await getUserList(params);
      setUsers(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        total_pages: response.total_pages,
      });
    } catch (error) {
      console.error("获取用户列表失败:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 处理筛选变化
  const handleFiltersChange = useCallback(
    (newFilters: UserListParams) => {
      const updatedFilters = {
        ...filters,
        ...newFilters,
        page: 1, // 重置到第一页
      };
      setFilters(updatedFilters);
      fetchUsers(updatedFilters);
    },
    [filters, fetchUsers]
  );

  // 处理排序
  const handleSort = useCallback(
    (
      sortBy: UserListParams["sort_by"],
      sortOrder: UserListParams["sort_order"]
    ) => {
      const updatedFilters = {
        ...filters,
        sort_by: sortBy,
        sort_order: sortOrder,
        page: 1,
      };
      setFilters(updatedFilters);
      fetchUsers(updatedFilters);
    },
    [filters, fetchUsers]
  );

  // 处理分页
  const handlePageChange = useCallback(
    (page: number) => {
      const updatedFilters = { ...filters, page };
      setFilters(updatedFilters);
      fetchUsers(updatedFilters);
    },
    [filters, fetchUsers]
  );

  // 处理每页显示数量变化
  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      const updatedFilters = { ...filters, limit: pageSize, page: 1 };
      setFilters(updatedFilters);
      fetchUsers(updatedFilters);
    },
    [filters, fetchUsers]
  );

  // 处理用户更新
  const handleUserUpdate = useCallback((updatedUser: User) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  }, []);

  // 处理用户删除
  const handleUserDelete = useCallback((userId: number) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
  }, []);

  // 导出用户数据
  const handleExport = async () => {
    try {
      const blob = await exportUsers(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("导出用户数据失败:", error);
    }
  };

  // 初始化时如果没有数据则获取
  useEffect(() => {
    if (!initialData) {
      fetchUsers(filters);
    }
  }, [initialData, filters, fetchUsers]);

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
              loading={loading}
              onUserUpdate={handleUserUpdate}
              onUserDelete={handleUserDelete}
            />
          ) : (
            <UserTable
              users={users}
              loading={loading}
              onSort={handleSort}
              onUserUpdate={handleUserUpdate}
              onUserDelete={handleUserDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* 分页 */}
      <Card>
        <CardContent className="pt-6">
          <UserPagination
            currentPage={pagination.page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            isMobile={isMobile}
          />
        </CardContent>
      </Card>
    </div>
  );
}
