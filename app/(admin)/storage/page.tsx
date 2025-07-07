"use client";

import React, { useEffect, useState } from "react";
import { Plus, Search, Filter, Trash2, Power, PowerOff } from "lucide-react";
import { useStorageStrategyStore } from "@/lib/store/storage";
import PageContainer from "@/components/layouts/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { showToast } from "@/lib/utils/toast";
import { StorageStrategy } from "@/lib/types/storage";
import { StorageStrategyCreateDialog } from "@/components/admin/storage/create-dialog";
import { StorageStrategyEditDialog } from "@/components/admin/storage/edit-dialog";
import { StorageStrategyDeleteDialog } from "@/components/admin/storage/delete-dialog";
import { StorageStrategyMobileList } from "@/components/admin/storage/mobile-list";
import { StorageStrategyPagination } from "@/components/admin/storage/pagination";

export default function StorageStrategiesPage() {
  const {
    strategies,
    stats,
    isLoadingStrategies,
    isLoadingStats,
    isSubmitting,
    error,
    pagination,
    queryParams,
    fetchStrategies,
    fetchStats,
    deleteStrategy,
    toggleStrategyEnabled,
    batchDeleteStrategies,
    batchEnableStrategies,
    batchDisableStrategies,
    setQueryParams,
    clearError,
  } = useStorageStrategyStore();

  // 本地状态
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedStrategies, setSelectedStrategies] = useState<number[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingStrategy, setEditingStrategy] =
    useState<StorageStrategy | null>(null);
  const [deletingStrategy, setDeletingStrategy] =
    useState<StorageStrategy | null>(null);

  // 移动端检测
  const [isMobile, setIsMobile] = useState(false);

  // 移动端检测逻辑
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 页面加载时获取数据
  useEffect(() => {
    const loadData = async () => {
      await fetchStrategies();
      await fetchStats();
    };
    loadData();
  }, [fetchStrategies, fetchStats]);

  // 处理搜索和筛选
  const handleSearch = () => {
    const params = {
      ...queryParams,
      page: 1,
      name: searchTerm || undefined,
      type:
        selectedType && selectedType !== "all"
          ? (selectedType as "s3" | "local")
          : undefined,
      isEnabled:
        selectedStatus && selectedStatus !== "all"
          ? selectedStatus === "enabled"
          : undefined,
    };
    setQueryParams(params);
    fetchStrategies(params);
  };

  // 重置筛选
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedStatus("all");
    const params = { page: 1, pageSize: 10 };
    setQueryParams(params);
    fetchStrategies(params);
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    const params = { ...queryParams, page };
    setQueryParams(params);
    fetchStrategies(params);
  };

  // 处理选中状态
  const handleSelectStrategy = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedStrategies((prev) => [...prev, id]);
    } else {
      setSelectedStrategies((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStrategies(strategies.map((s) => s.id));
    } else {
      setSelectedStrategies([]);
    }
  };

  // 批量操作
  const handleBatchDelete = async () => {
    if (selectedStrategies.length === 0) return;

    const success = await batchDeleteStrategies(selectedStrategies);
    if (success) {
      setSelectedStrategies([]);
      showToast.success(
        "批量删除成功",
        `已删除 ${selectedStrategies.length} 个存储策略`
      );
    }
  };

  const handleBatchEnable = async () => {
    if (selectedStrategies.length === 0) return;

    const success = await batchEnableStrategies(selectedStrategies);
    if (success) {
      showToast.success(`成功启用 ${selectedStrategies.length} 个存储策略`);
      setSelectedStrategies([]);
    }
  };

  const handleBatchDisable = async () => {
    if (selectedStrategies.length === 0) return;

    const success = await batchDisableStrategies(selectedStrategies);
    if (success) {
      showToast.success(`成功禁用 ${selectedStrategies.length} 个存储策略`);
      setSelectedStrategies([]);
    }
  };

  // 单个操作
  const handleToggleEnabled = async (strategy: StorageStrategy) => {
    const result = await toggleStrategyEnabled(strategy.id);
    if (result) {
      showToast.success(
        strategy.isEnabled ? "存储策略已禁用" : "存储策略已启用",
        `${strategy.name} 状态已更新`
      );
    }
  };

  const handleDelete = async (strategy: StorageStrategy) => {
    const success = await deleteStrategy(strategy.id);
    if (success) {
      setDeletingStrategy(null);
      showToast.success("删除成功", `存储策略 "${strategy.name}" 已删除`);
    }
  };

  // 清理错误
  useEffect(() => {
    if (error) {
      showToast.error("操作失败", error);
      clearError();
    }
  }, [error, clearError]);

  return (
    <PageContainer
      title="存储策略"
      description="管理图片存储配置，支持本地存储和S3兼容存储"
    >
      {/* 统计卡片 */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总策略数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStrategies}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已启用</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.enabledStrategies}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">S3 存储</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.s3Strategies}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本地存储</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.localStrategies}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* 操作栏 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>存储策略管理</CardTitle>
              <CardDescription>
                创建和管理存储策略，配置图片存储位置
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新建策略
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div
            className={
              isMobile
                ? "space-y-4 mb-6"
                : "flex flex-col lg:flex-row gap-4 mb-6"
            }
          >
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索策略名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={isMobile ? "pl-10 h-11" : "pl-10"}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <div
              className={
                isMobile ? "space-y-3" : "flex flex-col sm:flex-row gap-2"
              }
            >
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger
                  className={isMobile ? "w-full h-11" : "w-full sm:w-[140px]"}
                >
                  <SelectValue placeholder="存储类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="s3">S3 存储</SelectItem>
                  <SelectItem value="local">本地存储</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger
                  className={isMobile ? "w-full h-11" : "w-full sm:w-[120px]"}
                >
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="enabled">已启用</SelectItem>
                  <SelectItem value="disabled">已禁用</SelectItem>
                </SelectContent>
              </Select>
              <div
                className={isMobile ? "grid grid-cols-2 gap-2" : "flex gap-2"}
              >
                <Button
                  onClick={handleSearch}
                  variant="default"
                  className={isMobile ? "h-11" : ""}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  筛选
                </Button>
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className={isMobile ? "h-11" : ""}
                >
                  重置
                </Button>
              </div>
            </div>
          </div>

          {/* 批量操作 */}
          {selectedStrategies.length > 0 && (
            <div
              className={
                isMobile
                  ? "p-3 bg-muted rounded-lg mb-4 space-y-3"
                  : "flex items-center gap-2 p-3 bg-muted rounded-lg mb-4"
              }
            >
              <span className="text-sm text-muted-foreground">
                已选择 {selectedStrategies.length} 个策略
              </span>
              <div
                className={
                  isMobile ? "grid grid-cols-3 gap-2" : "flex gap-2 ml-auto"
                }
              >
                <Button
                  size={isMobile ? "default" : "sm"}
                  onClick={handleBatchEnable}
                  variant="outline"
                  className={isMobile ? "h-10" : ""}
                >
                  <Power
                    className={isMobile ? "mr-1 h-4 w-4" : "mr-1 h-3 w-3"}
                  />
                  启用
                </Button>
                <Button
                  size={isMobile ? "default" : "sm"}
                  onClick={handleBatchDisable}
                  variant="outline"
                  className={isMobile ? "h-10" : ""}
                >
                  <PowerOff
                    className={isMobile ? "mr-1 h-4 w-4" : "mr-1 h-3 w-3"}
                  />
                  禁用
                </Button>
                <Button
                  size={isMobile ? "default" : "sm"}
                  onClick={handleBatchDelete}
                  variant="destructive"
                  className={isMobile ? "h-10" : ""}
                >
                  <Trash2
                    className={isMobile ? "mr-1 h-4 w-4" : "mr-1 h-3 w-3"}
                  />
                  删除
                </Button>
              </div>
            </div>
          )}

          {/* 策略列表 */}
          {isMobile ? (
            <StorageStrategyMobileList
              strategies={strategies}
              loading={isLoadingStrategies}
              selectedStrategies={selectedStrategies}
              onSelect={handleSelectStrategy}
              onToggleEnabled={handleToggleEnabled}
              onEdit={setEditingStrategy}
              onDelete={setDeletingStrategy}
              onCreateNew={() => setShowCreateDialog(true)}
              isSubmitting={isSubmitting}
            />
          ) : isLoadingStrategies ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-4" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[300px]" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : strategies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">暂无存储策略</p>
                <Button
                  className="mt-4"
                  onClick={() => setShowCreateDialog(true)}
                >
                  创建第一个存储策略
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* 全选 */}
              <div className="flex items-center space-x-2 px-4 py-2 border rounded-lg bg-muted/30">
                <Checkbox
                  checked={
                    strategies.length > 0 &&
                    selectedStrategies.length === strategies.length
                  }
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  全选 ({strategies.length} 个策略)
                </span>
              </div>

              {/* 策略卡片 */}
              {strategies.map((strategy) => (
                <div key={strategy.id}>
                  <Card
                    className={`transition-all duration-200 hover:shadow-md ${
                      selectedStrategies.includes(strategy.id)
                        ? "ring-2 ring-primary/20 bg-primary/5"
                        : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Checkbox
                            checked={selectedStrategies.includes(strategy.id)}
                            onCheckedChange={(checked) =>
                              handleSelectStrategy(
                                strategy.id,
                                checked as boolean
                              )
                            }
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium">{strategy.name}</h3>
                              <Badge
                                variant={
                                  strategy.type === "s3"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {strategy.type === "s3"
                                  ? "S3 存储"
                                  : "本地存储"}
                              </Badge>
                              <Badge
                                variant={
                                  strategy.isEnabled ? "default" : "secondary"
                                }
                                className={
                                  strategy.isEnabled
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                                }
                              >
                                {strategy.isEnabled ? "已启用" : "已禁用"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {strategy.type === "s3"
                                ? `端点: ${strategy.s3Endpoint}`
                                : `路径: ${strategy.localBasePath}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              创建时间:{" "}
                              {new Date(strategy.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleEnabled(strategy)}
                            disabled={isSubmitting}
                          >
                            {strategy.isEnabled ? (
                              <>
                                <PowerOff className="mr-1 h-3 w-3" />
                                禁用
                              </>
                            ) : (
                              <>
                                <Power className="mr-1 h-3 w-3" />
                                启用
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingStrategy(strategy)}
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeletingStrategy(strategy)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {/* 分页 */}
          {!isLoadingStrategies && strategies.length > 0 && (
            <div className="pt-4">
              <StorageStrategyPagination
                currentPage={pagination.page}
                totalItems={pagination.total}
                pageSize={pagination.pageSize}
                onPageChange={handlePageChange}
                isMobile={isMobile}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 对话框 */}
      <StorageStrategyCreateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          fetchStrategies();
          fetchStats();
        }}
      />

      {editingStrategy && (
        <StorageStrategyEditDialog
          strategy={editingStrategy}
          open={!!editingStrategy}
          onOpenChange={(open) => !open && setEditingStrategy(null)}
          onSuccess={() => {
            setEditingStrategy(null);
            fetchStrategies();
            fetchStats();
          }}
        />
      )}

      {deletingStrategy && (
        <StorageStrategyDeleteDialog
          strategy={deletingStrategy}
          open={!!deletingStrategy}
          onOpenChange={(open) => !open && setDeletingStrategy(null)}
          onConfirm={() => handleDelete(deletingStrategy)}
        />
      )}
    </PageContainer>
  );
}
