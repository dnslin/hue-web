"use client";

import { useState, useEffect } from "react";
import { useStore } from "zustand";
import { Search, Filter, X, Calendar, Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserStatus } from "@/lib/types/user";
import {
  useUserFilterStore,
  UserFilters as UserFilterState,
} from "@/lib/store/user/user-filter.store";
import { userDataStore } from "@/lib/store/user/user-data.store";
import { useRoleStore } from "@/lib/store/role";
import { Role } from "@/lib/types/roles";

interface UserFiltersProps {
  isMobile?: boolean;
}

export function UserFilters({ isMobile = false }: UserFiltersProps) {
  const { filters, setFilters, resetFilters } = useUserFilterStore();
  const { total, users } = useStore(userDataStore);
  const { roles, fetchRoles } = useRoleStore();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (roles.length === 0) {
      fetchRoles();
    }
  }, [fetchRoles, roles.length]);

  const updateFilters = (newFilters: Partial<UserFilterState>) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    resetFilters();
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== ""
  );

  const getStatusLabel = (status: UserStatus) => {
    switch (status) {
      case UserStatus.NORMAL:
        return "正常";
      case UserStatus.BANNED:
        return "封禁";
      case UserStatus.PENDING:
        return "待审核";
      case UserStatus.DELETED:
        return "已删除";
      case UserStatus.REJECTED:
        return "审核拒绝";
      default:
        return "未知";
    }
  };

  const getRoleLabel = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.alias || role.name : "未知";
  };

  return (
    <div className={isMobile ? "space-y-3 p-4" : "space-y-4"}>
      {/* 搜索栏和筛选按钮 */}
      <div className={isMobile ? "space-y-3" : "flex items-center gap-4"}>
        {/* 搜索框 - 移动端优化 */}
        <div className={isMobile ? "w-full" : "relative flex-1 max-w-md"}>
          {isMobile ? (
            // 移动端：搜索图标在右侧，避免重叠
            <div className="relative">
              <Input
                placeholder="搜索用户名、邮箱..."
                value={filters.search || ""}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="h-11 pr-10 text-base"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          ) : (
            // 桌面端：保持原有布局
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                placeholder="搜索用户名、邮箱..."
                value={filters.search || ""}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-10 pr-4"
              />
            </div>
          )}
        </div>

        {/* 筛选按钮区域 */}
        <div
          className={
            isMobile ? "flex justify-between items-center" : "flex gap-2"
          }
        >
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size={isMobile ? "default" : "default"}
                className={
                  isMobile ? "gap-2 h-11 flex-1 max-w-[120px]" : "gap-2"
                }
              >
                <Filter className="h-4 w-4" />
                筛选
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {
                      Object.values(filters).filter(
                        (v) => v !== undefined && v !== ""
                      ).length
                    }
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={isMobile ? "w-[calc(100vw-2rem)] mx-4" : "w-80"}
              align={isMobile ? "center" : "end"}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">筛选条件</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-7 px-2 text-xs"
                    >
                      清除全部
                    </Button>
                  )}
                </div>

                {/* 用户状态筛选 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    用户状态
                  </label>
                  <Select
                    value={filters.status?.toString() || "ALL_STATUS"}
                    onValueChange={(value: string) =>
                      updateFilters({
                        status:
                          value === "ALL_STATUS"
                            ? undefined
                            : (parseInt(value) as UserStatus),
                      })
                    }
                  >
                    <SelectTrigger className={isMobile ? "h-11" : "h-9"}>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL_STATUS">全部状态</SelectItem>
                      <SelectItem value={UserStatus.NORMAL.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          正常
                        </div>
                      </SelectItem>
                      <SelectItem value={UserStatus.BANNED.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          封禁
                        </div>
                      </SelectItem>
                      <SelectItem value={UserStatus.PENDING.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          待审核
                        </div>
                      </SelectItem>
                      <SelectItem value={UserStatus.DELETED.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          已删除
                        </div>
                      </SelectItem>
                      <SelectItem value={UserStatus.REJECTED.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          审核拒绝
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 用户角色筛选 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    用户角色
                  </label>
                  <Select
                    value={filters.roleId?.toString() || "ALL_ROLES"}
                    onValueChange={(value: string) =>
                      updateFilters({
                        roleId:
                          value === "ALL_ROLES" ? undefined : parseInt(value, 10),
                      })
                    }
                  >
                    <SelectTrigger className={isMobile ? "h-11" : "h-9"}>
                      <SelectValue placeholder="选择角色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL_ROLES">全部角色</SelectItem>
                      {roles.map((role: Role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.alias || role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 排序方式 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    排序方式
                  </label>
                  <div
                    className={
                      isMobile ? "space-y-2" : "grid grid-cols-2 gap-2"
                    }
                  >
                    <Select
                      value={filters.sortBy || "DEFAULT_SORT"}
                      onValueChange={(value: string) =>
                        updateFilters({
                          sortBy:
                            value === "DEFAULT_SORT"
                              ? undefined
                              : (value as UserFilterState["sortBy"]),
                        })
                      }
                    >
                      <SelectTrigger className={isMobile ? "h-11" : "h-9"}>
                        <SelectValue placeholder="排序字段" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DEFAULT_SORT">默认</SelectItem>
                        <SelectItem value="created_at">注册时间</SelectItem>
                        <SelectItem value="updated_at">更新时间</SelectItem>
                        <SelectItem value="last_login_at">最后登录</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.sortOrder || "desc"}
                      onValueChange={(value: string) =>
                        updateFilters({
                          sortOrder: value as "asc" | "desc",
                        })
                      }
                    >
                      <SelectTrigger className={isMobile ? "h-11" : "h-9"}>
                        <SelectValue placeholder="排序方向" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">降序</SelectItem>
                        <SelectItem value="asc">升序</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size={isMobile ? "default" : "sm"}
              onClick={clearFilters}
              className={isMobile ? "gap-2 h-11 px-4" : "gap-1 px-2"}
            >
              <X className="h-4 w-4" />
              清除
            </Button>
          )}
        </div>
      </div>

      {/* 活跃筛选标签 - 移动端优化 */}
      {hasActiveFilters && (
        <div
          className={
            isMobile ? "flex flex-wrap gap-2" : "flex flex-wrap gap-1.5"
          }
        >
          {filters.search && (
            <Badge
              variant="secondary"
              className={
                isMobile
                  ? "gap-2 text-sm px-3 py-1.5"
                  : "gap-1 text-xs px-2 py-1"
              }
            >
              搜索:{" "}
              {filters.search.length > (isMobile ? 6 : 8)
                ? filters.search.slice(0, isMobile ? 6 : 8) + "..."
                : filters.search}
              <X
                className={`${
                  isMobile ? "h-4 w-4" : "h-3 w-3"
                } cursor-pointer hover:bg-muted-foreground/20 rounded-sm`}
                onClick={() => updateFilters({ search: undefined })}
              />
            </Badge>
          )}
          {filters.status !== undefined && (
            <Badge
              variant="secondary"
              className={
                isMobile
                  ? "gap-2 text-sm px-3 py-1.5"
                  : "gap-1 text-xs px-2 py-1"
              }
            >
              状态: {getStatusLabel(filters.status as UserStatus)}
              <X
                className={`${
                  isMobile ? "h-4 w-4" : "h-3 w-3"
                } cursor-pointer hover:bg-muted-foreground/20 rounded-sm`}
                onClick={() => updateFilters({ status: undefined })}
              />
            </Badge>
          )}
          {filters.roleId && (
            <Badge
              variant="secondary"
              className={
                isMobile
                  ? "gap-2 text-sm px-3 py-1.5"
                  : "gap-1 text-xs px-2 py-1"
              }
            >
              角色: {getRoleLabel(filters.roleId)}
              <X
                className={`${
                  isMobile ? "h-4 w-4" : "h-3 w-3"
                } cursor-pointer hover:bg-muted-foreground/20 rounded-sm`}
                onClick={() => updateFilters({ roleId: undefined })}
              />
            </Badge>
          )}
        </div>
      )}

      {/* 统计信息 */}
      <div
        className={`flex items-center justify-between ${
          isMobile ? "text-sm" : "text-xs"
        } text-muted-foreground`}
      >
        <div>
          {hasActiveFilters ? (
            <>
              显示 {users.length} 个结果，共 {total} 个用户
            </>
          ) : (
            <>共 {total} 个用户</>
          )}
        </div>
      </div>
    </div>
  );
}
