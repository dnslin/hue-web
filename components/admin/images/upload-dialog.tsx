"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ImageUploadDialog({ open, onOpenChange, onSuccess }: ImageUploadDialogProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    // TODO: 实现图片上传逻辑
    setTimeout(() => {
      setUploading(false);
      onOpenChange(false);
      onSuccess?.();
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>上传图片</DialogTitle>
          <DialogDescription>
            选择要上传的图片文件，支持 JPG、PNG、GIF、WebP 格式。
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* 拖拽上传区域 */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">拖拽文件到此处或点击选择</p>
              <p className="text-xs text-muted-foreground">
                最大文件大小：10MB
              </p>
            </div>
            <Button className="mt-4" disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              选择文件
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            取消
          </Button>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "上传中..." : "开始上传"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}