"use client";

import React from "react";
import {
  Power,
  PowerOff,
  Edit3,
  Trash2,
  Server,
  HardDrive,
  Calculator,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StorageStrategy } from "@/lib/types/storage";
import { StorageCleanupDialog } from "./cleanup-dialog";
import { RecalculateDialog } from "./recalculate-dialog";

interface StorageStrategyMobileCardProps {
  strategy: StorageStrategy;
  isSelected?: boolean;
  onSelect?: (id: number, checked: boolean) => void;
  onToggleEnabled?: (strategy: StorageStrategy) => void;
  onEdit?: (strategy: StorageStrategy) => void;
  onDelete?: (strategy: StorageStrategy) => void;
  onCleanupSuccess?: () => void;
  onRecalculateSuccess?: () => void;
  isSubmitting?: boolean;
}

export function StorageStrategyMobileCard({
  strategy,
  isSelected = false,
  onSelect,
  onToggleEnabled,
  onEdit,
  onDelete,
  onCleanupSuccess,
  onRecalculateSuccess,
  isSubmitting = false,
}: StorageStrategyMobileCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStrategyIcon = (type: string) => {
    return type === "s3" ? Server : HardDrive;
  };

  const getStrategyTypeText = (type: string) => {
    return type === "s3" ? "S3 存储" : "本地存储";
  };

  const getStrategyConfig = (strategy: StorageStrategy) => {
    if (strategy.type === "s3") {
      return strategy.s3Endpoint || "未配置端点";
    }
    return strategy.localBasePath || "未配置路径";
  };

  const StrategyIcon = getStrategyIcon(strategy.type);

  return (
    <Card className="admin-card mobile-user-card border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* 策略基本信息 - 优化布局 */}
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) =>
                  onSelect?.(strategy.id, checked as boolean)
                }
                className="mt-1"
              />
              <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                <StrategyIcon className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {strategy.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {getStrategyConfig(strategy)}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Badge
                    variant={strategy.type === "s3" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {getStrategyTypeText(strategy.type)}
                  </Badge>
                  <Badge
                    variant={strategy.isEnabled ? "default" : "secondary"}
                    className={`text-xs ${
                      strategy.isEnabled
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-gray-500 hover:bg-gray-600"
                    }`}
                  >
                    {strategy.isEnabled ? "已启用" : "已禁用"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* 策略详细信息 */}
          <div className="space-y-2 p-2 bg-gradient-to-r from-muted/10 to-muted/20 rounded-md border border-border/30">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">
                创建时间: {formatDate(strategy.createdAt)}
              </span>
              <span className="text-muted-foreground font-medium">
                类型: {getStrategyTypeText(strategy.type)}
              </span>
            </div>

            {/* 配置信息 */}
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">配置: </span>
              <span className="break-all">{getStrategyConfig(strategy)}</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="grid grid-cols-5 gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggleEnabled?.(strategy)}
              disabled={isSubmitting}
              className="mobile-action-button text-xs px-1"
            >
              {strategy.isEnabled ? (
                <>
                  <PowerOff className="h-3 w-3" />
                </>
              ) : (
                <>
                  <Power className="h-3 w-3" />
                </>
              )}
            </Button>

            <StorageCleanupDialog
              strategy={strategy}
              onSuccess={onCleanupSuccess}
              trigger={
                <Button
                  size="sm"
                  variant="outline"
                  className="mobile-action-button text-xs px-1"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              }
            />

            <RecalculateDialog
              strategy={strategy}
              onSuccess={onRecalculateSuccess}
              trigger={
                <Button
                  size="sm"
                  variant="outline"
                  className="mobile-action-button text-xs px-1"
                >
                  <Calculator className="h-3 w-3" />
                </Button>
              }
            />

            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit?.(strategy)}
              className="mobile-action-button text-xs px-1"
            >
              <Edit3 className="h-3 w-3" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete?.(strategy)}
              className="mobile-action-button text-xs px-1 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
