// components/admin/images/waterfall/preview-dialog.tsx
// 图片预览对话框组件

'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { PreviewDialogProps } from '@/lib/types/gallery';
import { usePreviewState, useGalleryActions } from '@/lib/store/images/gallery';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Share,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatBytes, formatDate } from '@/lib/utils/date-formatter';

/**
 * 预览控制栏组件
 */
const PreviewControls = ({
  currentIndex,
  totalCount,
  onPrevious,
  onNext,
  onEdit,
  onDelete,
  onDownload,
  onClose,
}: {
  currentIndex: number;
  totalCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onClose: () => void;
}) => (
  <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
    {/* 左侧：关闭按钮和导航 */}
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        className="size-10 p-0 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <X className="size-4" />
      </Button>
      
      {totalCount > 1 && (
        <>
          <Button
            size="sm"
            variant="ghost"
            className="size-10 p-0 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
            onClick={onPrevious}
            disabled={totalCount <= 1}
          >
            <ChevronLeft className="size-4" />
          </Button>
          
          <Badge variant="secondary" className="bg-black/50 text-white border-white/20">
            {currentIndex + 1} / {totalCount}
          </Badge>
          
          <Button
            size="sm"
            variant="ghost"
            className="size-10 p-0 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
            onClick={onNext}
            disabled={totalCount <= 1}
          >
            <ChevronRight className="size-4" />
          </Button>
        </>
      )}
    </div>

    {/* 右侧：操作按钮 */}
    <div className="flex items-center gap-2">
      {onDownload && (
        <Button
          size="sm"
          variant="ghost"
          className="size-10 p-0 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
          onClick={onDownload}
        >
          <Download className="size-4" />
        </Button>
      )}
      
      {onEdit && (
        <Button
          size="sm"
          variant="ghost"
          className="size-10 p-0 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
          onClick={onEdit}
        >
          <Edit className="size-4" />
        </Button>
      )}
      
      {onDelete && (
        <Button
          size="sm"
          variant="ghost"
          className="size-10 p-0 bg-black/50 text-destructive hover:bg-destructive/20 backdrop-blur-sm"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  </div>
);

/**
 * 图片信息面板组件
 */
const ImageInfoPanel = ({ 
  image, 
  isVisible 
}: { 
  image: any; 
  isVisible: boolean 
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ duration: 0.3 }}
        className="absolute top-0 right-0 bottom-0 w-80 bg-background/95 backdrop-blur-md border-l p-6 overflow-y-auto"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">图片信息</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">文件名：</span>
                <span className="ml-2">{image.originalFilename}</span>
              </div>
              <div>
                <span className="text-muted-foreground">尺寸：</span>
                <span className="ml-2">{image.width} × {image.height}</span>
              </div>
              <div>
                <span className="text-muted-foreground">大小：</span>
                <span className="ml-2">{formatBytes(image.size)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">类型：</span>
                <span className="ml-2">{image.mimeType}</span>
              </div>
              <div>
                <span className="text-muted-foreground">上传时间：</span>
                <span className="ml-2">{formatDate(image.uploadedAt)}</span>
              </div>
              {image.uploaderUsername && (
                <div>
                  <span className="text-muted-foreground">上传者：</span>
                  <span className="ml-2">{image.uploaderUsername}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">统计信息</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">查看次数：</span>
                <span className="ml-2">{image.viewCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">下载次数：</span>
                <span className="ml-2">{image.downloadCount}</span>
              </div>
            </div>
          </div>
          
          {image.description && (
            <div>
              <h4 className="font-medium mb-2">描述</h4>
              <p className="text-sm text-muted-foreground">{image.description}</p>
            </div>
          )}
          
          {image.tags && image.tags.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">标签</h4>
              <div className="flex flex-wrap gap-1">
                {image.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/**
 * 图片预览对话框组件
 */
const PreviewDialog: React.FC<PreviewDialogProps> = ({
  images: propImages,
  initialIndex: propInitialIndex,
  isOpen: propIsOpen,
  onClose: propOnClose,
  onEdit,
  onDelete,
  onDownload,
  config,
}) => {
  // 使用全局状态（如果没有传入 props）
  const previewState = usePreviewState();
  const actions = useGalleryActions();
  
  // 确定使用哪个状态源
  const images = propImages || previewState.images;
  const initialIndex = propInitialIndex ?? previewState.currentIndex;
  const isOpen = propIsOpen ?? previewState.isOpen;
  const onClose = propOnClose || actions.closePreview;
  
  const imageRef = useRef<HTMLImageElement>(null);
  
  const currentImage = images[initialIndex];

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (images.length > 1) {
            actions.navigatePreview('prev');
          }
          break;
        case 'ArrowRight':
          if (images.length > 1) {
            actions.navigatePreview('next');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, actions, onClose]);

  // 处理操作
  const handleEdit = () => {
    if (onEdit && currentImage) {
      onEdit(currentImage);
    } else if (currentImage) {
      actions.openEditor(currentImage);
    }
  };

  const handleDelete = () => {
    if (onDelete && currentImage) {
      onDelete(currentImage);
    }
  };

  const handleDownload = () => {
    if (onDownload && currentImage) {
      onDownload(currentImage);
    } else if (currentImage) {
      window.open(currentImage.url, '_blank');
    }
  };

  if (!currentImage) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none"
        hideCloseButton
      >
        {/* 控制栏 */}
        <PreviewControls
          currentIndex={initialIndex}
          totalCount={images.length}
          onPrevious={() => actions.navigatePreview('prev')}
          onNext={() => actions.navigatePreview('next')}
          onEdit={onEdit || currentImage ? handleEdit : undefined}
          onDelete={onDelete ? handleDelete : undefined}
          onDownload={handleDownload}
          onClose={onClose}
        />

        {/* 主要内容区域 */}
        <div className="relative w-full h-full flex items-center justify-center p-4 pt-20">
          <motion.img
            ref={imageRef}
            key={currentImage.id}
            src={currentImage.url}
            alt={currentImage.originalFilename}
            className="max-w-full max-h-full object-contain"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            draggable={false}
          />
        </div>

        {/* 图片信息面板（暂时隐藏，后续可添加切换按钮） */}
        {/* <ImageInfoPanel image={currentImage} isVisible={false} /> */}
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;