"use client";

import React from "react";
import { StorageStrategy } from "@/lib/types/storage";
import { StorageStrategyMobileCard } from "./mobile-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface StorageStrategyMobileListProps {
  strategies: StorageStrategy[];
  loading?: boolean;
  selectedStrategies?: number[];
  onSelect?: (id: number, checked: boolean) => void;
  onToggleEnabled?: (strategy: StorageStrategy) => void;
  onEdit?: (strategy: StorageStrategy) => void;
  onDelete?: (strategy: StorageStrategy) => void;
  onCreateNew?: () => void;
  onCleanupSuccess?: () => void;
  onRecalculateSuccess?: () => void;
  isSubmitting?: boolean;
}

export function StorageStrategyMobileList({
  strategies,
  loading = false,
  selectedStrategies = [],
  onSelect,
  onToggleEnabled,
  onEdit,
  onDelete,
  onCreateNew,
  onCleanupSuccess,
  onRecalculateSuccess,
  isSubmitting = false,
}: StorageStrategyMobileListProps) {
  if (loading) {
    return (
      <div className="space-y-3 mobile-scroll-container">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border p-3 mobile-user-card bg-card/50"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
              <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            <div className="mt-3 space-y-3">
              <div className="p-2 bg-muted/20 rounded-md">
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (strategies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-muted-foreground space-y-2">
          <div className="text-lg font-semibold">暂无存储策略</div>
          <div className="text-sm text-muted-foreground/80">
            请创建第一个存储策略来开始管理您的存储配置
          </div>
        </div>
        {onCreateNew && (
          <Button className="mt-4" onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            创建存储策略
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 mobile-scroll-container">
      {strategies.map((strategy) => (
        <StorageStrategyMobileCard
          key={strategy.id}
          strategy={strategy}
          isSelected={selectedStrategies.includes(strategy.id)}
          onSelect={onSelect}
          onToggleEnabled={onToggleEnabled}
          onEdit={onEdit}
          onDelete={onDelete}
          onCleanupSuccess={onCleanupSuccess}
          onRecalculateSuccess={onRecalculateSuccess}
          isSubmitting={isSubmitting}
        />
      ))}
    </div>
  );
}
