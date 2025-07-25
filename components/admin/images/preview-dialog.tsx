"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Edit, 
  Trash2, 
  Calendar,
  FileImage,
  User,
  Eye,
  Share,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw
} from "lucide-react";
import { ImageItem } from "@/lib/types/image";
import { formatFileSize, formatDate } from "@/lib/dashboard/formatters";

interface ImagePreviewDialogProps {
  image: ImageItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImagePreviewDialog({ image, open, onOpenChange }: ImagePreviewDialogProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!image) {
    return null;
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'download':
        // TODO: 实现下载功能
        console.log('Download image:', image.id);
        break;
      case 'edit':
        // TODO: 实现编辑功能
        console.log('Edit image:', image.id);
        break;
      case 'delete':
        // TODO: 实现删除功能
        console.log('Delete image:', image.id);
        break;
      case 'share':
        // TODO: 实现分享功能
        console.log('Share image:', image.id);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        {/* 顶部工具栏 */}
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
          <DialogTitle className="text-lg font-semibold truncate pr-4">
            {image.originalFilename}
          </DialogTitle>
          <div className="flex items-center gap-2">
            {/* 缩放控制 */}
            <div className="flex items-center gap-1 border rounded-md">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            {/* 旋转 */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRotate}
              className="h-8 w-8 p-0"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            
            {/* 重置 */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              className="h-8 px-3"
            >
              重置
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            {/* 操作按钮 */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAction('download')}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAction('share')}
              className="h-8 w-8 p-0"
            >
              <Share className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAction('edit')}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleAction('delete')}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* 图片展示区域 */}
          <div className="flex-1 flex items-center justify-center bg-muted/20 p-4 overflow-hidden">
            <div className="relative max-w-full max-h-full overflow-auto">
              <img
                src={image.url}
                alt={image.originalFilename}
                className="max-w-none transition-transform duration-200"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center',
                }}
              />
            </div>
          </div>

          {/* 右侧信息面板 */}
          <div className="w-80 border-l bg-background p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="font-semibold mb-3">基本信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">文件名</span>
                    <span className="font-medium break-all">{image.filename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">原始名称</span>
                    <span className="break-all">{image.originalFilename}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">文件大小</span>
                    <span>{formatFileSize(image.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">图片尺寸</span>
                    <span>{image.width} × {image.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">文件类型</span>
                    <span>{image.mimeType}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 上传信息 */}
              <div>
                <h3 className="font-semibold mb-3">上传信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(image.uploadedAt)}</span>
                  </div>
                  {image.uploaderUsername && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{image.uploaderUsername}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* 统计信息 */}
              <div>
                <h3 className="font-semibold mb-3">统计信息</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      浏览次数
                    </span>
                    <span>{image.viewCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      下载次数
                    </span>
                    <span>{image.downloadCount}</span>
                  </div>
                </div>
              </div>

              {/* 标签 */}
              {image.tags && image.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">标签</h3>
                    <div className="flex flex-wrap gap-2">
                      {image.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* 描述 */}
              {image.description && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">描述</h3>
                    <p className="text-sm text-muted-foreground">
                      {image.description}
                    </p>
                  </div>
                </>
              )}

              {/* 状态信息 */}
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">状态</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">可见性</span>
                    <Badge variant={image.isPublic ? "default" : "secondary"}>
                      {image.isPublic ? "公开" : "私有"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">处理状态</span>
                    <Badge variant="outline">
                      {image.processingStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">审核状态</span>
                    <Badge variant="outline">
                      {image.moderationStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}