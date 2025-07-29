"use client";

import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Upload,
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  File,
  Settings,
  Info,
} from "lucide-react";
import {
  useImageUploadStore,
  imageUploadStore,
} from "@/lib/store/image/upload";
import { getCurrentUploadConfig } from "@/lib/schema/image";
import { formatFileSize } from "@/lib/dashboard/formatters";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StorageStrategySelector } from "./storage-strategy-selector";

/**
 * 图片上传对话框组件
 * 支持拖拽上传、批量上传、进度跟踪和响应式布局
 * 优化版本：改进内存管理和资源清理
 */
export function ImageUploadDialog() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    // 对话框状态
    isDialogOpen,
    closeDialog,

    // 文件状态
    files,
    totalFiles,
    completedFiles,
    failedFiles,
    overallProgress,
    isUploading,
    globalError,

    // 配置
    uploadConfig,
    settingsLoaded,

    // 操作
    addFiles,
    removeFile,
    clearFiles,
    retryFile,
    startUpload,
    pauseUpload,
    cancelAllUploads,
    clearError,
    loadSettingsConfig,
    updateConfig,
    getMemoryUsage,
  } = useImageUploadStore();

  // 加载设置配置
  useEffect(() => {
    if (isDialogOpen && !settingsLoaded) {
      loadSettingsConfig();
    }
  }, [isDialogOpen, settingsLoaded, loadSettingsConfig]);

  // 组件卸载时的清理工作
  useEffect(() => {
    return () => {
      // 组件卸载时确保资源被清理
      if (!isDialogOpen) {
        console.log("🧹 ImageUploadDialog 组件卸载，执行资源清理");
      }
    };
  }, [isDialogOpen]);

  // 定期资源清理和内存监控
  useEffect(() => {
    if (!isDialogOpen) return;

    const cleanupInterval = setInterval(() => {
      // 执行定期清理
      const store = imageUploadStore.getState();
      if (store.performResourceCleanup) {
        store.performResourceCleanup();
      }

      // 检查内存使用
      if (store.checkMemoryUsage) {
        const memoryInfo = store.checkMemoryUsage();
        if (memoryInfo.fileCount > 15) {
          console.warn("📊 内存使用较高:", memoryInfo);
        }
      }
    }, 30000); // 每30秒执行一次

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [isDialogOpen]);

  // 文件选择处理
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      addFiles(files);
    }
    // 清空input以允许重复选择相同文件
    event.target.value = "";
  };

  // 拖拽处理
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      addFiles(files);
    }
  };

  // 获取上传配置信息用于显示
  const configInfo = getCurrentUploadConfig();

  // 计算统计信息
  const pendingCount = files.filter((f) => f.status === "pending").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;

  // 获取内存使用情况
  const memoryUsage = getMemoryUsage();

  // 状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "uploading":
        return (
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // 渲染预览图片 - 优化版本
  const renderPreviewImage = (file: { preview?: string; file: File }) => {
    if (!file.preview) {
      return <File className="h-6 w-6 text-muted-foreground" />;
    }

    return (
      <img
        src={file.preview}
        alt={file.file.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          // 图片加载失败时的处理
          console.warn(`预览图片加载失败: ${file.file.name}`);
          (e.target as HTMLImageElement).style.display = "none";
        }}
        onLoad={() => {
          // 图片加载成功的回调（可选）
        }}
      />
    );
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="!w-[1200px] !max-w-[95vw] h-[85vh] max-h-[700px] p-0 gap-0">
        {/* 头部 */}
        <DialogHeader className="px-6 py-5 border-b bg-gradient-to-r from-background to-muted/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-3">
              <DialogTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                图片上传
                {/* 内存使用指示器 */}
                {memoryUsage.fileCount > 10 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs">
                          <Info className="h-3 w-3" />
                          <span>{memoryUsage.fileCount} 文件</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>当前文件数: {memoryUsage.fileCount}</p>
                        <p>活跃模拟器: {memoryUsage.simulatorCount}</p>
                        <p>建议及时清理不需要的文件</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                选择要上传的图片文件，支持多种格式和批量上传
              </DialogDescription>
              {/* 配置信息展示 */}
              <div className="mt-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border cursor-help hover:bg-muted/70 transition-colors flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-1 text-sm">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="font-medium">
                            {configInfo.allowedFormats.length} 种格式
                          </span>
                        </div>
                        <div className="text-muted-foreground hidden sm:block">
                          •
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="font-medium">
                            {configInfo.maxSizeMB}MB 上限
                          </span>
                        </div>
                        <div className="text-muted-foreground hidden sm:block">
                          •
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span className="font-medium">
                            {configInfo.batchLimit} 个文件
                          </span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      className="max-w-sm p-4 bg-popover text-popover-foreground border"
                      side="bottom"
                      align="start"
                    >
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-sm mb-2 text-foreground">
                            支持的格式：
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {configInfo.allowedFormats.map((format, index) => (
                              <span
                                key={`${format}-${index}`}
                                className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded"
                              >
                                {format.replace("image/", "").toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground border-t pt-2">
                          单个文件最大 {configInfo.maxSizeMB}MB，一次最多上传{" "}
                          {configInfo.batchLimit} 个文件
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* 整体进度 */}
            {totalFiles > 0 && (
              <div className="text-right">
                <div className="text-sm font-medium">
                  {completedFiles}/{totalFiles} 完成
                </div>
                <div className="text-xs text-muted-foreground">
                  {failedFiles > 0 && `${failedFiles} 失败`}
                </div>
              </div>
            )}
          </div>

          {/* 整体进度条 */}
          {totalFiles > 0 && (
            <div className="mt-3">
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}
        </DialogHeader>

        {/* 主体内容 */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* 左侧：文件区域 */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* 移动端设置面板 */}
            <div className="lg:hidden px-6 py-4 border-b bg-muted/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Settings className="h-3 w-3 text-primary" />
                  </div>
                  <span className="font-medium text-sm">设置</span>
                </div>
              </div>
              <div className="space-y-4">
                {/* 存储策略选择 - 移动端 */}
                <StorageStrategySelector
                  value={uploadConfig.storageStrategyId}
                  onValueChange={(strategyId) =>
                    updateConfig({ storageStrategyId: strategyId })
                  }
                  showDetails={false}
                  className="w-full h-9"
                />

                {/* 公开访问设置 - 移动端 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    公开访问
                  </span>
                  <Switch
                    checked={uploadConfig.isPublic || false}
                    onCheckedChange={(checked) =>
                      updateConfig({ isPublic: checked })
                    }
                  />
                </div>
              </div>
            </div>
            {/* 全局错误提示 */}
            {globalError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{globalError}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearError}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* 拖拽区域或文件列表 */}
            <div className="flex-1 p-6 overflow-hidden">
              {files.length === 0 ? (
                // 空状态：拖拽上传区域
                <div
                  className={cn(
                    "h-full min-h-[300px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-6 transition-all duration-300 cursor-pointer group",
                    "border-muted-foreground/20 hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10"
                  )}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={handleFileSelect}
                >
                  <motion.div
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload className="h-12 w-12 text-primary" />
                  </motion.div>

                  <div className="text-center space-y-4 max-w-md">
                    <motion.h3
                      className="text-2xl font-semibold"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      点击或拖拽上传图片
                    </motion.h3>
                    <p className="text-muted-foreground leading-relaxed">
                      支持批量选择，拖拽文件到此区域即可开始上传。
                      <br />
                      支持 JPEG、PNG、WebP、GIF 等常见格式
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Upload className="h-5 w-5 mr-3" />
                      选择文件
                    </Button>
                  </motion.div>
                </div>
              ) : (
                // 文件列表
                <div className="h-full flex flex-col gap-4">
                  {/* 操作按钮行 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleFileSelect}
                        variant="outline"
                        size="sm"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        添加文件
                      </Button>

                      {files.length > 0 && (
                        <Button
                          onClick={clearFiles}
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                        >
                          <X className="h-4 w-4 mr-2" />
                          清空
                        </Button>
                      )}
                    </div>

                    {/* 状态统计 */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {pendingCount > 0 && (
                        <Badge variant="secondary">{pendingCount} 待上传</Badge>
                      )}
                      {uploadingCount > 0 && (
                        <Badge variant="default">{uploadingCount} 上传中</Badge>
                      )}
                      {completedFiles > 0 && (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200"
                        >
                          {completedFiles} 成功
                        </Badge>
                      )}
                      {failedFiles > 0 && (
                        <Badge variant="destructive">{failedFiles} 失败</Badge>
                      )}
                    </div>
                  </div>

                  {/* 文件列表 - 优化版本 */}
                  <div className="flex-1 overflow-y-auto space-y-2">
                    <AnimatePresence>
                      {files.map((file) => (
                        <motion.div
                          key={file.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          {/* 预览缩略图 - 优化版本 */}
                          <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                            {renderPreviewImage(file)}
                          </div>

                          {/* 文件信息 */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(file.status)}
                              <span className="font-medium text-sm truncate">
                                {file.file.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.file.size)}
                              </span>

                              {file.status === "uploading" && (
                                <>
                                  <span className="text-xs text-muted-foreground">
                                    •
                                  </span>
                                  <span className="text-xs text-primary">
                                    {file.progress}%
                                  </span>
                                </>
                              )}

                              {file.error && (
                                <>
                                  <span className="text-xs text-muted-foreground">
                                    •
                                  </span>
                                  <span className="text-xs text-red-600 truncate">
                                    {file.error}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* 进度条 */}
                            {file.status === "uploading" && (
                              <Progress
                                value={file.progress}
                                className="h-1 mt-2"
                              />
                            )}
                          </div>

                          {/* 操作按钮 */}
                          <div className="flex items-center gap-1">
                            {file.status === "error" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => retryFile(file.id)}
                                className="h-8 w-8 p-0"
                                title="重试"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                              title="移除"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：设置面板（桌面端显示） */}
          <div className="hidden lg:block w-80 border-l bg-gradient-to-b from-muted/20 to-muted/10">
            <div className="h-full flex flex-col">
              {/* 设置面板标题 */}
              <div className="p-5 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Settings className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-base">上传设置</h3>
                </div>
              </div>

              {/* 设置内容 - 可滚动区域，保持舒适布局 */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* 存储策略选择 */}
                <div className="space-y-3">
                  <StorageStrategySelector
                    value={uploadConfig.storageStrategyId}
                    onValueChange={(strategyId) =>
                      updateConfig({ storageStrategyId: strategyId })
                    }
                    showDetails={true}
                    className="w-full"
                  />
                </div>

                {/* 分隔线 */}
                <Separator />

                {/* 公开设置 - 舒适版本 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="public-switch-desktop"
                      className="font-medium text-sm cursor-pointer"
                    >
                      公开访问
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      开启后图片将对所有人可见，可以通过直链访问
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-3 h-3 rounded-full transition-colors",
                          uploadConfig.isPublic ? "bg-green-500" : "bg-gray-400"
                        )}
                      />
                      <span className="text-sm font-medium">
                        {uploadConfig.isPublic ? "公开" : "私有"}
                      </span>
                    </div>
                    <Switch
                      id="public-switch-desktop"
                      checked={uploadConfig.isPublic || false}
                      onCheckedChange={(checked) =>
                        updateConfig({ isPublic: checked })
                      }
                    />
                  </div>
                </div>

                {/* 分隔线 */}
                <Separator />

                {/* 目标相册 - 舒适版本 */}
                <div className="space-y-3">
                  <Label className="font-medium text-sm">目标相册</Label>
                  <p className="text-xs text-muted-foreground">
                    选择图片要保存到的相册
                  </p>
                  <div className="p-4 border-2 border-dashed rounded-lg bg-muted/30 text-center">
                    <div className="space-y-2">
                      <div className="w-8 h-8 mx-auto rounded-lg bg-muted flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        暂无相册可选
                      </p>
                      <p className="text-xs text-muted-foreground">
                        将保存到默认位置
                      </p>
                    </div>
                  </div>
                </div>

                {/* 新增：内存使用信息 */}
                {memoryUsage.fileCount > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <Label className="font-medium text-sm">资源使用</Label>
                      <div className="p-3 border rounded-lg bg-background space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            文件数量
                          </span>
                          <span className="font-medium">
                            {memoryUsage.fileCount}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            活跃模拟器
                          </span>
                          <span className="font-medium">
                            {memoryUsage.simulatorCount}
                          </span>
                        </div>
                        {memoryUsage.fileCount > 10 && (
                          <p className="text-xs text-orange-600">
                            文件较多，建议及时清理不需要的文件
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="px-6 py-4 border-t bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {files.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {totalFiles} 个文件
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* 上传控制按钮 */}
              {pendingCount > 0 && !isUploading && (
                <Button onClick={startUpload} disabled={totalFiles === 0}>
                  <Play className="h-4 w-4 mr-2" />
                  开始上传
                </Button>
              )}

              {isUploading && (
                <Button onClick={pauseUpload} variant="outline">
                  <Pause className="h-4 w-4 mr-2" />
                  暂停
                </Button>
              )}

              {!isUploading &&
                uploadingCount === 0 &&
                pendingCount === 0 &&
                completedFiles > 0 && (
                  <Button onClick={closeDialog}>完成</Button>
                )}

              {(isUploading || uploadingCount > 0) && (
                <Button onClick={cancelAllUploads} variant="destructive">
                  取消全部
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
}
