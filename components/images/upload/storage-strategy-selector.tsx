"use client";

import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HardDrive, Cloud, AlertCircle, ChevronDown } from "lucide-react";
import { useStorageStrategyStore } from "@/lib/store/storage";
import { StorageStrategy } from "@/lib/types/storage";
import { cn } from "@/lib/utils";

interface StorageStrategySelectorProps {
  /**
   * 当前选中的存储策略ID
   */
  value?: number;
  /**
   * 选择变化回调
   */
  onValueChange?: (strategyId: number | undefined) => void;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 是否显示详细信息
   */
  showDetails?: boolean;
  /**
   * 选择器宽度样式类
   */
  className?: string;
}

/**
 * 存储策略选择器组件
 * 用于在上传时选择存储策略
 * 优化版本：改进样式、响应式设计和用户体验
 */
export function StorageStrategySelector({
  value,
  onValueChange,
  disabled = false,
  showDetails = true,
  className = "w-full",
}: StorageStrategySelectorProps) {
  const { strategies, isLoadingStrategies, error, fetchStrategies } =
    useStorageStrategyStore();

  const [availableStrategies, setAvailableStrategies] = useState<
    StorageStrategy[]
  >([]);

  // 加载存储策略
  useEffect(() => {
    if (strategies.length === 0 && !isLoadingStrategies) {
      fetchStrategies({ isEnabled: true });
    }
  }, [strategies.length, isLoadingStrategies, fetchStrategies]);

  // 过滤可用的存储策略（只显示启用的）
  useEffect(() => {
    const enabledStrategies = strategies.filter(
      (strategy) => strategy.isEnabled
    );
    setAvailableStrategies(enabledStrategies);
  }, [strategies]);

  // 获取存储策略图标
  const getStrategyIcon = (type: string, className = "h-4 w-4") => {
    const iconClass = cn(className, {
      "text-blue-600": type === "s3",
      "text-green-600": type === "local",
      "text-gray-500": !["s3", "local"].includes(type),
    });

    switch (type) {
      case "s3":
        return <Cloud className={iconClass} />;
      case "local":
        return <HardDrive className={iconClass} />;
      default:
        return <HardDrive className={iconClass} />;
    }
  };

  // 获取存储策略类型显示名称
  const getStrategyTypeName = (type: string) => {
    switch (type) {
      case "s3":
        return "S3 存储";
      case "local":
        return "本地存储";
      default:
        return "未知类型";
    }
  };

  // 获取存储策略描述信息
  const getStrategyDescription = (strategy: StorageStrategy) => {
    if (strategy.type === "s3" && strategy.s3Config) {
      return `${strategy.s3Config.bucket} (${strategy.s3Config.region})`;
    }
    if (strategy.type === "local" && strategy.localConfig) {
      return strategy.localConfig.basePath;
    }
    return "无配置信息";
  };

  // 处理选择变化
  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === "auto") {
      onValueChange?.(undefined);
    } else {
      const strategyId = parseInt(selectedValue);
      onValueChange?.(strategyId);
    }
  };

  // 加载状态 - 优化版本
  if (isLoadingStrategies) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">存储策略</Label>
        <div className="relative">
          <Skeleton className="h-11 w-full rounded-lg bg-gradient-to-r from-muted to-muted/60" />
          <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
            <Skeleton className="h-4 w-24 bg-muted-foreground/20" />
            <Skeleton className="h-4 w-4 bg-muted-foreground/20" />
          </div>
        </div>
        {showDetails && (
          <div className="space-y-2">
            <Skeleton className="h-3 w-3/4 bg-muted/80" />
            <Skeleton className="h-3 w-1/2 bg-muted/60" />
          </div>
        )}
      </div>
    );
  }

  // 错误状态 - 优化版本
  if (error) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">存储策略</Label>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-gradient-to-r from-red-50 to-red-50/70 text-red-800 shadow-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <div className="flex-1">
            <div className="font-medium text-sm">加载失败</div>
            <div className="text-xs text-red-600 mt-1">
              无法获取存储策略列表
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 没有可用策略 - 优化版本
  if (availableStrategies.length === 0) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">存储策略</Label>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-50/70 text-amber-800 shadow-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-500" />
          <div className="flex-1">
            <div className="font-medium text-sm">暂无可用策略</div>
            <div className="text-xs text-amber-600 mt-1">
              请联系管理员配置存储策略
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 获取当前选中的策略
  const selectedStrategy = value
    ? availableStrategies.find((s) => s.id === value)
    : null;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground">存储策略</Label>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Select
                value={value ? value.toString() : "auto"}
                onValueChange={handleValueChange}
                disabled={disabled}
              >
                <SelectTrigger
                  className={cn(
                    "h-11 px-4 py-2 bg-gradient-to-r from-background to-muted/30 border-2 border-border hover:border-primary/40 focus:border-primary transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-md",
                    "data-[state=open]:border-primary data-[state=open]:shadow-md data-[state=open]:bg-gradient-to-r data-[state=open]:from-primary/5 data-[state=open]:to-primary/10",
                    disabled &&
                      "opacity-50 cursor-not-allowed hover:border-border",
                    className
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* 选中策略的图标和名称 */}
                    {selectedStrategy ? (
                      <>
                        {getStrategyIcon(
                          selectedStrategy.type,
                          "h-4 w-4 flex-shrink-0"
                        )}
                        <div className="flex-1 min-w-0 text-left">
                          <div className="font-medium text-sm truncate">
                            {selectedStrategy.name}
                          </div>
                          {showDetails && (
                            <div className="text-xs text-muted-foreground truncate hidden sm:block">
                              {getStrategyTypeName(selectedStrategy.type)}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex-shrink-0 shadow-sm"></div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="font-medium text-sm">自动选择</div>
                          {showDetails && (
                            <div className="text-xs text-muted-foreground hidden sm:block">
                              系统智能选择
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                </SelectTrigger>
                <SelectContent className="min-w-[var(--radix-select-trigger-width)] max-h-[300px] bg-background/95 backdrop-blur-sm border-2 shadow-xl">
                  {/* 自动选择选项 */}
                  <SelectItem
                    value="auto"
                    className="cursor-pointer hover:bg-gradient-to-r hover:from-green-50 hover:to-green-50/70 focus:bg-gradient-to-r focus:from-green-50 focus:to-green-50/70 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-100 data-[state=checked]:to-green-50"
                  >
                    <div className="flex items-center gap-3 w-full py-1">
                      <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex-shrink-0 shadow-sm"></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">自动选择</div>
                        {showDetails && (
                          <div className="text-xs text-muted-foreground">
                            系统智能选择最佳策略
                          </div>
                        )}
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-700 border-green-200 hidden sm:flex"
                      >
                        推荐
                      </Badge>
                    </div>
                  </SelectItem>

                  {/* 分隔线 */}
                  <div className="h-px bg-border my-1"></div>

                  {/* 存储策略选项 */}
                  {availableStrategies.map((strategy) => (
                    <SelectItem
                      key={strategy.id}
                      value={strategy.id.toString()}
                      className="cursor-pointer hover:bg-gradient-to-r hover:from-muted/50 hover:to-muted/30 focus:bg-gradient-to-r focus:from-muted/50 focus:to-muted/30 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary/10 data-[state=checked]:to-primary/5"
                    >
                      <div className="flex items-center gap-3 w-full py-1">
                        {getStrategyIcon(
                          strategy.type,
                          "h-4 w-4 flex-shrink-0"
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {strategy.name}
                            </span>
                            {!showDetails && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs flex-shrink-0 hidden sm:flex",
                                  strategy.type === "s3" &&
                                    "border-blue-200 text-blue-700 bg-blue-50",
                                  strategy.type === "local" &&
                                    "border-green-200 text-green-700 bg-green-50"
                                )}
                              >
                                {getStrategyTypeName(strategy.type)}
                              </Badge>
                            )}
                          </div>
                          {showDetails && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">
                              {getStrategyDescription(strategy)}
                            </div>
                          )}
                        </div>
                        {showDetails && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs flex-shrink-0 hidden lg:flex",
                              strategy.type === "s3" &&
                                "border-blue-200 text-blue-700 bg-blue-50",
                              strategy.type === "local" &&
                                "border-green-200 text-green-700 bg-green-50"
                            )}
                          >
                            {getStrategyTypeName(strategy.type)}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          {/* 只在桌面端显示 Tooltip */}
          <TooltipContent
            className="max-w-sm p-4 bg-popover/95 backdrop-blur-sm text-popover-foreground border-2 shadow-xl hidden lg:block"
            side="right"
          >
            <div className="space-y-3">
              <p className="font-semibold text-sm text-foreground">
                存储策略说明
              </p>
              <div className="text-xs space-y-2 text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <strong className="text-foreground">自动选择：</strong>
                    系统根据设置自动选择最佳存储策略
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Cloud className="h-3 w-3 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">S3 对象存储：</strong>
                    支持阿里云OSS、腾讯云COS、AWS S3等
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <HardDrive className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">本地存储：</strong>
                    存储在服务器本地磁盘
                  </div>
                </div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* 选中策略的详细信息 - 优化版本 */}
      {showDetails && selectedStrategy && (
        <div className="p-4 rounded-lg bg-gradient-to-r from-muted/40 to-muted/20 border border-muted-foreground/20 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            {getStrategyIcon(selectedStrategy.type, "h-5 w-5")}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-foreground">
                {selectedStrategy.name}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {getStrategyTypeName(selectedStrategy.type)}
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                selectedStrategy.type === "s3" &&
                  "border-blue-200 text-blue-700 bg-blue-50",
                selectedStrategy.type === "local" &&
                  "border-green-200 text-green-700 bg-green-50"
              )}
            >
              已选中
            </Badge>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>配置信息</span>
              <span className="font-medium text-foreground">
                {getStrategyDescription(selectedStrategy)}
              </span>
            </div>
            {selectedStrategy.totalFiles !== undefined && (
              <div className="flex items-center justify-between">
                <span>已存储文件</span>
                <span className="font-medium text-foreground">
                  {selectedStrategy.totalFiles.toLocaleString()} 个
                </span>
              </div>
            )}
            {selectedStrategy.usedSpaceBytes !== undefined && (
              <div className="flex items-center justify-between">
                <span>已用空间</span>
                <span className="font-medium text-foreground">
                  {(
                    selectedStrategy.usedSpaceBytes /
                    1024 /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  GB
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 自动选择提示 - 优化版本 */}
      {!value && showDetails && (
        <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-50/70 border border-green-200 shadow-sm">
          <div className="flex items-center gap-3 text-green-800 mb-2">
            <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-sm"></div>
            <span className="text-sm font-semibold">自动选择模式</span>
            <Badge
              variant="secondary"
              className="text-xs bg-green-100 text-green-700 border-green-200"
            >
              推荐
            </Badge>
          </div>
          <div className="text-xs text-green-700 leading-relaxed">
            系统将根据当前用户权限和系统设置自动选择最佳的存储策略，确保最优的上传体验和存储效率。
          </div>
        </div>
      )}
    </div>
  );
}
