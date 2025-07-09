"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Search, AlertTriangle, CheckCircle, X } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useStorageStrategyStore } from "@/lib/store/storage";
import { StorageStrategy } from "@/lib/types/storage";
import { showToast } from "@/lib/utils/toast";

interface StorageCleanupDialogProps {
  strategy: StorageStrategy;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

type CleanupStep = "idle" | "scanning" | "preview" | "cleaning" | "completed" | "error";

export function StorageCleanupDialog({ 
  strategy, 
  trigger, 
  onSuccess 
}: StorageCleanupDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<CleanupStep>("idle");
  const [confirmCleanup, setConfirmCleanup] = useState(false);

  const {
    isCleaningOrphaned,
    orphanedResult,
    cleanupError,
    previewOrphanedFiles,
    cleanOrphanedFiles,
    clearOrphanedResult,
    clearCleanupError,
  } = useStorageStrategyStore();

  // 清理状态
  useEffect(() => {
    if (!open) {
      setStep("idle");
      setConfirmCleanup(false);
      clearOrphanedResult();
      clearCleanupError();
    }
  }, [open, clearOrphanedResult, clearCleanupError]);

  // 处理扫描预览
  const handleScanPreview = async () => {
    setStep("scanning");
    try {
      const result = await previewOrphanedFiles(strategy.id);
      if (result) {
        setStep("preview");
      } else {
        setStep("error");
      }
    } catch {
      setStep("error");
    }
  };

  // 处理实际清理
  const handleCleanup = async () => {
    if (!confirmCleanup) {
      showToast.error("请确认清理操作", "这是不可逆的操作");
      return;
    }

    setStep("cleaning");
    try {
      const result = await cleanOrphanedFiles(strategy.id);
      if (result) {
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
    setConfirmCleanup(false);
    clearOrphanedResult();
    clearCleanupError();
  };

  const renderStepContent = () => {
    switch (step) {
      case "idle":
        return (
          <div className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                将扫描存储空间，找出在物理上存在但在数据库中没有记录的孤立文件。
                这个操作是安全的，只会进行预览扫描。
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">存储策略信息</div>
              <Card>
                <CardContent className="pt-4">
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
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleScanPreview}
                disabled={isCleaningOrphaned}
                className="w-full sm:w-auto"
              >
                <Search className="mr-2 h-4 w-4" />
                开始扫描预览
              </Button>
            </div>
          </div>
        );

      case "scanning":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
              <div className="space-y-2">
                <div className="text-lg font-medium">正在扫描存储空间...</div>
                <div className="text-sm text-muted-foreground">
                  正在查找孤立文件，请稍候
                </div>
              </div>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        );

      case "preview":
        return (
          <div className="space-y-6">
            {orphanedResult && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">扫描文件数</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{orphanedResult.scannedFiles}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">孤立文件数</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {orphanedResult.orphanedFiles?.length || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {(orphanedResult.orphanedFiles?.length || 0) > 0 ? (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="text-sm font-medium">孤立文件列表</div>
                      <ScrollArea className="h-[200px] w-full rounded-md border">
                        <div className="p-4 space-y-2">
                          {orphanedResult.orphanedFiles?.map((file, index) => (
                            <div 
                              key={index} 
                              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                            >
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                              <span className="text-sm font-mono">{file}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="font-medium">清理确认</div>
                          <div>找到 {orphanedResult.orphanedFiles?.length || 0} 个孤立文件。清理操作将永久删除这些文件，无法恢复。</div>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={confirmCleanup}
                              onChange={(e) => setConfirmCleanup(e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm">我确认要删除这些孤立文件（不可逆操作）</span>
                          </label>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-3 justify-end">
                      <Button variant="outline" onClick={handleRestart}>
                        重新扫描
                      </Button>
                      <Button 
                        onClick={handleCleanup}
                        disabled={!confirmCleanup || isCleaningOrphaned}
                        variant="destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        清理孤立文件
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium text-green-700">存储空间很干净！</div>
                        <div>未发现任何孤立文件，存储空间状态良好。</div>
                      </AlertDescription>
                    </Alert>
                    <div className="flex justify-center">
                      <Button onClick={handleClose}>关闭</Button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        );

      case "cleaning":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
              </div>
              <div className="space-y-2">
                <div className="text-lg font-medium">正在清理孤立文件...</div>
                <div className="text-sm text-muted-foreground">
                  正在删除孤立文件，请稍候
                </div>
              </div>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        );

      case "completed":
        return (
          <div className="space-y-6">
            {orphanedResult && (
              <>
                <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <div className="text-lg font-medium">清理完成！</div>
                  <div className="text-sm text-muted-foreground">
                    孤立文件清理操作已成功完成
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">成功清理</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {orphanedResult.cleanedCount}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">清理失败</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {orphanedResult.failedToDelete?.length || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {(orphanedResult.failedToDelete?.length || 0) > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-red-600">清理失败的文件</div>
                      <ScrollArea className="h-[150px] w-full rounded-md border">
                        <div className="p-4 space-y-2">
                          {orphanedResult.failedToDelete?.map((file, index) => (
                            <div 
                              key={index} 
                              className="flex items-center gap-2 p-2 rounded-lg bg-red-50"
                            >
                              <X className="h-4 w-4 text-red-500" />
                              <span className="text-sm font-mono">{file}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}

                <div className="flex justify-center">
                  <Button onClick={handleClose}>完成</Button>
                </div>
              </>
            )}
          </div>
        );

      case "error":
        return (
          <div className="space-y-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">操作失败</div>
                <div>{cleanupError || "未知错误，请稍后重试"}</div>
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
            <Trash2 className="mr-2 h-4 w-4" />
            空间清理
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-orange-500" />
            存储空间清理
          </DialogTitle>
          <DialogDescription>
            扫描并清理存储空间中的孤立文件
          </DialogDescription>
        </DialogHeader>
        
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}