"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { User, UserListParams, UserListResponse } from "@/lib/types/user";
import { getUserList, exportUsers } from "@/lib/api/users";

interface UserListProps {
  initialData?: UserListResponse;
}

export function UserList({ initialData }: UserListProps) {
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
          <h1 className="text-2xl font-semibold">用户管理</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            导出数据
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            添加用户
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
          />
        </CardContent>
      </Card>

      {/* 用户表格 */}
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
          <UserTable
            users={users}
            loading={loading}
            onSort={handleSort}
            onUserUpdate={handleUserUpdate}
            onUserDelete={handleUserDelete}
          />
        </CardContent>
      </Card>

      {/* 分页 */}
      {pagination.total_pages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                显示第 {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                条，共 {pagination.total} 条
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                >
                  上一页
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.total_pages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.total_pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.page >=
                        pagination.total_pages - 2
                      ) {
                        pageNum = pagination.total_pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            pageNum === pagination.page ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={
                    pagination.page >= pagination.total_pages || loading
                  }
                >
                  下一页
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
