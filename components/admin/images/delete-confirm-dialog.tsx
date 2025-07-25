"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { ImageItem } from "@/lib/types/image";
import { AuthenticatedImage } from "@/components/shared/authenticated-image";
import { formatFileSize } from "@/lib/dashboard/formatters";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: ImageItem[];
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  images,
  onConfirm,
  title,
  description
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false);
  // 内部缓存图片数据，避免竞态条件
  const [cachedImages, setCachedImages] = useState<ImageItem[]>([]);
  
  // 当对话框打开且有图片数据时，缓存数据
  useEffect(() => {
    if (open && images.length > 0) {
      setCachedImages(images);
    }
  }, [open, images]);
  
  // 当对话框关闭时，清空缓存
  useEffect(() => {
    if (!open) {
      setCachedImages([]);
    }
  }, [open]);
  
  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // 错误处理在父组件中完成
    } finally {
      setDeleting(false);
    }
  };

  // 使用缓存的图片数据
  const displayImages = cachedImages.length > 0 ? cachedImages : images;
  
  // 如果没有图片数据，不渲染对话框
  if (displayImages.length === 0) {
    return null;
  }

  const isBatch = displayImages.length > 1;
  const totalSize = displayImages.reduce((sum, img) => sum + img.size, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                {title || (isBatch ? `删除 ${displayImages.length} 张图片` : "删除图片")}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {description || "此操作无法撤销，请确认是否继续"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* 警告提示 */}
          <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">
              删除后的图片将无法恢复，请谨慎操作！
            </p>
          </div>

          {/* 统计信息 */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {isBatch ? `${displayImages.length} 张图片` : "1 张图片"}
            </Badge>
            <Badge variant="outline">
              总大小: {formatFileSize(totalSize)}
            </Badge>
          </div>

          {/* 图片预览 */}
          <div className="space-y-3">
            {isBatch ? (
              // 批量删除 - 显示网格预览
              <div>
                <h4 className="text-sm font-medium mb-2">将要删除的图片：</h4>
                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                  {displayImages.slice(0, 18).map((image) => (
                    <div
                      key={image.id}
                      className="aspect-square rounded-lg overflow-hidden bg-muted"
                    >
                      <AuthenticatedImage
                        imageId={image.id.toString()}
                        fileName={image.originalFilename}
                        className="w-full h-full object-cover"
                        thumb={true}
                      />
                    </div>
                  ))}
                  {displayImages.length > 18 && (
                    <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        +{displayImages.length - 18}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 单个删除 - 显示详细信息
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <AuthenticatedImage
                    imageId={displayImages[0].id.toString()}
                    fileName={displayImages[0].originalFilename}
                    className="w-full h-full object-cover"
                    thumb={true}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{displayImages[0].originalFilename}</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>大小: {formatFileSize(displayImages[0].size)}</div>
                    <div>尺寸: {displayImages[0].width} × {displayImages[0].height}</div>
                    <div>类型: {displayImages[0].mimeType}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting}
            className="gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                删除中...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                确认删除
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}