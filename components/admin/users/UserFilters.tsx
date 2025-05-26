"use client";

import { useState } from "react";
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
import { UserStatus, UserRole, UserListParams } from "@/lib/types/user";

interface UserFiltersProps {
  onFiltersChange: (filters: UserListParams) => void;
  totalCount?: number;
  filteredCount?: number;
  isMobile?: boolean;
}

export function UserFilters({
  onFiltersChange,
  totalCount = 0,
  filteredCount = 0,
  isMobile = false,
}: UserFiltersProps) {
  const [filters, setFilters] = useState<UserListParams>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const updateFilters = (newFilters: Partial<UserListParams>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      filters[key as keyof UserListParams] !== undefined &&
      filters[key as keyof UserListParams] !== ""
  );

  const getStatusLabel = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return "正常";
      case UserStatus.INACTIVE:
        return "未激活";
      case UserStatus.BANNED:
        return "已封禁";
      default:
        return "未知";
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "管理员";
      case UserRole.USER:
        return "普通用户";
      case UserRole.MODERATOR:
        return "版主";
      default:
        return "未知";
    }
  };

  return (
    <div
      className={isMobile ? "space-y-3 mobile-filter-container" : "space-y-4"}
    >
      {/* 搜索栏 - 修复图标重叠问题 */}
      <div
        className={isMobile ? "flex flex-col gap-2" : "flex items-center gap-4"}
      >
        <div
          className={isMobile ? "relative w-full" : "relative flex-1 max-w-md"}
        >
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder="搜索用户名、邮箱..."
            value={filters.search || ""}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className={`${isMobile ? "mobile-form-input h-10" : ""} pl-10 pr-4`}
          />
        </div>

        <div className={isMobile ? "flex gap-2" : "flex gap-2"}>
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                筛选
                {hasActiveFilters && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-4 w-4 rounded-full p-0 text-xs flex items-center justify-center"
                  >
                    {
                      Object.keys(filters).filter(
                        (key) =>
                          filters[key as keyof UserListParams] !== undefined &&
                          filters[key as keyof UserListParams] !== ""
                      ).length
                    }
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className={isMobile ? "w-[calc(100vw-2rem)] mx-4" : "w-80"}
              align="end"
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
                    value={filters.status?.toString() || ""}
                    onValueChange={(value: string) =>
                      updateFilters({
                        status: value
                          ? (parseInt(value) as UserStatus)
                          : undefined,
                      })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部状态</SelectItem>
                      <SelectItem value={UserStatus.ACTIVE.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          正常
                        </div>
                      </SelectItem>
                      <SelectItem value={UserStatus.INACTIVE.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          未激活
                        </div>
                      </SelectItem>
                      <SelectItem value={UserStatus.BANNED.toString()}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          已封禁
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
                    value={filters.role || ""}
                    onValueChange={(value: string) =>
                      updateFilters({ role: (value as UserRole) || undefined })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="选择角色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">全部角色</SelectItem>
                      <SelectItem value={UserRole.ADMIN}>管理员</SelectItem>
                      <SelectItem value={UserRole.MODERATOR}>版主</SelectItem>
                      <SelectItem value={UserRole.USER}>普通用户</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 排序方式 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    排序方式
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={filters.sort_by || ""}
                      onValueChange={(value: string) =>
                        updateFilters({
                          sort_by:
                            (value as UserListParams["sort_by"]) || undefined,
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="排序字段" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">默认</SelectItem>
                        <SelectItem value="created_at">注册时间</SelectItem>
                        <SelectItem value="updated_at">更新时间</SelectItem>
                        <SelectItem value="last_login">最后登录</SelectItem>
                        <SelectItem value="upload_count">上传数量</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={filters.sort_order || ""}
                      onValueChange={(value: string) =>
                        updateFilters({
                          sort_order: (value as "asc" | "desc") || undefined,
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
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
              size={isMobile ? "sm" : "sm"}
              onClick={clearFilters}
              className="gap-1 px-2"
            >
              <X className="h-3 w-3" />
              {!isMobile && "清除"}
            </Button>
          )}
        </div>
      </div>

      {/* 活跃筛选标签 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5">
          {filters.search && (
            <Badge variant="secondary" className="gap-1 text-xs px-2 py-1">
              搜索:{" "}
              {filters.search.length > 8
                ? filters.search.slice(0, 8) + "..."
                : filters.search}
              <X
                className="h-3 w-3 cursor-pointer hover:bg-muted-foreground/20 rounded-sm"
                onClick={() => updateFilters({ search: undefined })}
              />
            </Badge>
          )}
          {filters.status !== undefined && (
            <Badge variant="secondary" className="gap-1 text-xs px-2 py-1">
              状态: {getStatusLabel(filters.status)}
              <X
                className="h-3 w-3 cursor-pointer hover:bg-muted-foreground/20 rounded-sm"
                onClick={() => updateFilters({ status: undefined })}
              />
            </Badge>
          )}
          {filters.role && (
            <Badge variant="secondary" className="gap-1 text-xs px-2 py-1">
              角色: {getRoleLabel(filters.role)}
              <X
                className="h-3 w-3 cursor-pointer hover:bg-muted-foreground/20 rounded-sm"
                onClick={() => updateFilters({ role: undefined })}
              />
            </Badge>
          )}
        </div>
      )}

      {/* 统计信息 */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>
          {hasActiveFilters ? (
            <>
              显示 {filteredCount} 个结果，共 {totalCount} 个用户
            </>
          ) : (
            <>共 {totalCount} 个用户</>
          )}
        </div>
      </div>
    </div>
  );
}
