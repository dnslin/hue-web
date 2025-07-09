"use client";

import React, { useState, useEffect } from "react";
import { Calculator, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useStorageStrategyStore } from "@/lib/store/storage";
import { StorageStrategy } from "@/lib/types/storage";

interface RecalculateDialogProps {
  strategy: StorageStrategy;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

type RecalculateStep = "idle" | "confirm" | "recalculating" | "completed" | "error";

export function RecalculateDialog({ 
  strategy, 
  trigger, 
  onSuccess 
}: RecalculateDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<RecalculateStep>("idle");
  const [beforeStats, setBeforeStats] = useState<{
    totalFiles?: number;
    usedSpaceBytes?: number;
  } | null>(null);
  const [afterStats, setAfterStats] = useState<StorageStrategy | null>(null);

  const {
    isRecalculating,
    error,
    recalculateStorageStats,
    clearError,
  } = useStorageStrategyStore();

  // 清理状态
  useEffect(() => {
    if (!open) {
      setStep("idle");
      setBeforeStats(null);
      setAfterStats(null);
      clearError();
    }
  }, [open, clearError]);

  // 处理确认校准
  const handleConfirmRecalculate = () => {
    setBeforeStats({
      totalFiles: strategy.totalFiles,
      usedSpaceBytes: strategy.usedSpaceBytes,
    });
    setStep("confirm");
  };

  // 处理实际校准
  const handleRecalculate = async () => {
    setStep("recalculating");
    try {
      const result = await recalculateStorageStats(strategy.id);
      if (result) {
        setAfterStats(result);
        setStep("completed");
        onSuccess?.();
      } else {
        setStep("error");
      }
    } catch {
      setStep("error");
    }
  };

  // 关闭对话框
  const handleClose = () => {
    setOpen(false);
  };

  // 重新开始
  const handleRestart = () => {
    setStep("idle");
    setBeforeStats(null);
    setAfterStats(null);
    clearError();
  };

  // 格式化文件大小
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const renderStepContent = () => {
    switch (step) {
      case "idle":
        return (
          <div className="space-y-6">
            <Alert>
              <Calculator className="h-4 w-4" />
              <AlertDescription>
                校准操作将重新计算此存储策略的文件数量和使用空间统计。
                此操作可能需要一些时间，取决于存储空间的大小。
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">存储策略信息</div>
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{strategy.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {strategy.type === "s3" 
                            ? `S3 存储 - ${strategy.s3Endpoint}` 
                            : `本地存储 - ${strategy.localBasePath}`}
                        </div>
                      </div>
                      <Badge variant={strategy.isEnabled ? "default" : "secondary"}>
                        {strategy.isEnabled ? "已启用" : "已禁用"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div>
                        <div className="text-sm text-muted-foreground">文件数量</div>
                        <div className="text-lg font-mono">
                          {strategy.totalFiles?.toLocaleString() || "0"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">使用空间</div>
                        <div className="text-lg font-mono">
                          {formatFileSize(strategy.usedSpaceBytes)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleConfirmRecalculate}
                disabled={isRecalculating}
                className="w-full sm:w-auto"
              >
                <Calculator className="mr-2 h-4 w-4" />
                开始校准统计
              </Button>
            </div>
          </div>
        );

      case "confirm":
        return (
          <div className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">确认校准操作</div>
                  <div>
                    此操作将扫描存储空间中的所有文件，重新计算准确的统计数据。
                    根据存储空间大小，可能需要较长时间。
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {beforeStats && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">当前统计数据</div>
                <Card>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">文件数量</div>
                        <div className="text-lg font-mono">
                          {beforeStats.totalFiles?.toLocaleString() || "0"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">使用空间</div>
                        <div className="text-lg font-mono">
                          {formatFileSize(beforeStats.usedSpaceBytes)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleRestart}>
                取消
              </Button>
              <Button 
                onClick={handleRecalculate}
                disabled={isRecalculating}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                确认校准
              </Button>
            </div>
          </div>
        );

      case "recalculating":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
              <div className="space-y-2">
                <div className="text-lg font-medium">正在校准统计数据...</div>
                <div className="text-sm text-muted-foreground">
                  正在扫描存储空间并重新计算统计信息，请稍候
                </div>
              </div>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        );

      case "completed":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <div className="text-lg font-medium">校准完成！</div>
              <div className="text-sm text-muted-foreground">
                统计数据已成功更新
              </div>
            </div>

            {beforeStats && afterStats && (
              <div className="space-y-4">
                <div className="text-sm font-medium">统计数据对比</div>
                
                <div className="grid grid-cols-1 gap-4">
                  {/* 文件数量对比 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">文件数量</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">更新前</span>
                        <span className="font-mono">
                          {beforeStats.totalFiles?.toLocaleString() || "0"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">更新后</span>
                        <span className="font-mono font-semibold">
                          {afterStats.totalFiles?.toLocaleString() || "0"}
                        </span>
                      </div>
                      {(beforeStats.totalFiles || 0) !== (afterStats.totalFiles || 0) && (
                        <div className="flex justify-between items-center pt-1 border-t">
                          <span className="text-sm text-muted-foreground">变化</span>
                          <span className={`font-mono text-sm ${
                            (afterStats.totalFiles || 0) > (beforeStats.totalFiles || 0) 
                              ? "text-green-600" 
                              : "text-red-600"
                          }`}>
                            {(afterStats.totalFiles || 0) > (beforeStats.totalFiles || 0) ? "+" : ""}
                            {((afterStats.totalFiles || 0) - (beforeStats.totalFiles || 0)).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 使用空间对比 */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">使用空间</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">更新前</span>
                        <span className="font-mono">
                          {formatFileSize(beforeStats.usedSpaceBytes)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">更新后</span>
                        <span className="font-mono font-semibold">
                          {formatFileSize(afterStats.usedSpaceBytes)}
                        </span>
                      </div>
                      {(beforeStats.usedSpaceBytes || 0) !== (afterStats.usedSpaceBytes || 0) && (
                        <div className="flex justify-between items-center pt-1 border-t">
                          <span className="text-sm text-muted-foreground">变化</span>
                          <span className={`font-mono text-sm ${
                            (afterStats.usedSpaceBytes || 0) > (beforeStats.usedSpaceBytes || 0) 
                              ? "text-green-600" 
                              : "text-red-600"
                          }`}>
                            {(afterStats.usedSpaceBytes || 0) > (beforeStats.usedSpaceBytes || 0) ? "+" : ""}
                            {formatFileSize(Math.abs((afterStats.usedSpaceBytes || 0) - (beforeStats.usedSpaceBytes || 0)))}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button onClick={handleClose}>完成</Button>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="space-y-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">校准失败</div>
                <div>{error || "未知错误，请稍后重试"}</div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleRestart}>
                重新尝试
              </Button>
              <Button onClick={handleClose}>关闭</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Calculator className="mr-2 h-4 w-4" />
            统计校准
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-purple-500" />
            统计数据校准
          </DialogTitle>
          <DialogDescription>
            重新计算存储策略的准确统计数据
          </DialogDescription>
        </DialogHeader>
        
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}