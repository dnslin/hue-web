"use client";

import React from "react";
import { HardDrive, TrendingUp, Database, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { User as UserType } from "@/lib/types/user";

interface StorageStatsCardProps {
  user: UserType;
}

export const StorageStatsCard: React.FC<StorageStatsCardProps> = ({ user }) => {
  // 获取存储数据
  const usedStorageMb = user.usedStorageMb || 0;
  const totalStorageMb = user.storageCapacityMb || 0;
  
  // 计算使用率
  const usagePercentage = totalStorageMb > 0 ? (usedStorageMb / totalStorageMb) * 100 : 0;
  
  // 格式化存储大小
  const formatStorageSize = (mb: number) => {
    if (mb < 1024) {
      return `${mb.toFixed(1)} MB`;
    } else {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
  };

  // 获取使用率状态
  const getUsageStatus = (percentage: number) => {
    if (percentage >= 90) {
      return { color: "bg-red-500", label: "存储空间不足", variant: "destructive" as const, icon: Database };
    } else if (percentage >= 75) {
      return { color: "bg-orange-500", label: "存储空间偏高", variant: "secondary" as const, icon: TrendingUp };
    } else if (percentage >= 50) {
      return { color: "bg-yellow-500", label: "存储使用正常", variant: "secondary" as const, icon: Zap };
    } else {
      return { color: "bg-green-500", label: "存储空间充足", variant: "secondary" as const, icon: Database };
    }
  };

  const usageStatus = getUsageStatus(usagePercentage);
  const StatusIcon = usageStatus.icon;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* 主存储统计卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            存储统计
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 存储使用情况 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">存储使用情况</span>
              <Badge variant={usageStatus.variant} className="text-xs flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {usageStatus.label}
              </Badge>
            </div>
            
            {/* 进度条 */}
            <div className="space-y-2">
              <Progress 
                value={usagePercentage} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>已用: {formatStorageSize(usedStorageMb)}</span>
                <span className="font-medium">{usagePercentage.toFixed(1)}%</span>
                <span>总计: {formatStorageSize(totalStorageMb)}</span>
              </div>
            </div>
          </div>

          {/* 存储详情网格 */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">已使用</p>
              <div className="text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{formatStorageSize(usedStorageMb)}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">剩余空间</p>
              <div className="text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted" />
                <span>{formatStorageSize(totalStorageMb - usedStorageMb)}</span>
              </div>
            </div>
          </div>

          {/* 存储策略信息（如果有） */}
          {user.role?.storageStrategyIds && user.role.storageStrategyIds.length > 0 && (
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  可用存储策略: {user.role.storageStrategyIds.length} 个
                </span>
              </div>
            </div>
          )}

          {/* 使用提示 */}
          {usagePercentage >= 90 && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
              <p className="text-sm text-red-700 dark:text-red-300">
                存储空间即将用完，建议清理不需要的文件或联系管理员扩容。
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 大屏幕下的额外信息卡片 */}
      <div className="hidden lg:block">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              使用概览
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* 使用率环形指示器的文字版本 */}
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">
                {usagePercentage.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">总体使用率</p>
            </div>
            
            {/* 快速统计 */}
            <div className="grid grid-cols-1 gap-3 pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">存储效率</span>
                <span className="text-xs font-medium">
                  {usagePercentage > 0 ? "正常" : "未使用"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">剩余天数</span>
                <span className="text-xs font-medium">
                  {usagePercentage < 90 ? "充足" : "需要关注"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};