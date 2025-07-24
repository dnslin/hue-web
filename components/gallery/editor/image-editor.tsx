"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Download, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { FILEROBOT_EDITOR_CONFIG } from "@/lib/constants/gallery";
import type { GalleryImageItem } from "@/lib/types/gallery";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { showToast } from "@/lib/utils/toast";

// Filerobot Editor 类型定义
interface FilerobotEditorConfig {
  source: string;
  onSave: (editedImageObject: FilerobotImageObject, designState: FilerobotDesignState) => void;
  onClose: (closingReason: string) => void;
  onModify: () => void;
  [key: string]: unknown;
}

interface FilerobotImageObject {
  imageCanvas?: HTMLCanvasElement;
  [key: string]: unknown;
}

interface FilerobotDesignState {
  annotations?: unknown[];
  [key: string]: unknown;
}

interface FilerobotEditorInstance {
  reset: () => void;
  getCurrentImgDataUrl: (callback: (dataURL: string) => void) => void;
  [key: string]: unknown;
}

// 动态导入的组件类型
type FilerobotImageEditorComponent = React.ComponentType<FilerobotEditorConfig>;

interface ImageEditorProps {
  /** 待编辑的图片 */
  image: GalleryImageItem;
  /** 编辑器配置 */
  config: {
    enabled: boolean;
    tools: string[];
    maxFileSize: number;
  };
  /** 关闭回调 */
  onClose: () => void;
  /** 保存回调 */
  onSave: (editedImage: {
    originalId: number;
    editedBlob: Blob;
    editedDataURL: string;
    operations: unknown[];
  }) => void;
}

/**
 * 图片编辑器组件
 * 基于 Filerobot Image Editor 实现专业的图片编辑功能
 */
export const ImageEditor: React.FC<ImageEditorProps> = ({
  image,
  config,
  onClose,
  onSave,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editorInstance, setEditorInstance] = useState<FilerobotEditorInstance | null>(null);
  const [FilerobotImageEditor, setFilerobotImageEditor] = useState<FilerobotImageEditorComponent | null>(null);

  // 动态加载 Filerobot Image Editor
  useEffect(() => {
    const loadImageEditor = async () => {
      try {
        const { default: FilerobotImageEditorComponent } = await import('react-filerobot-image-editor');
        setFilerobotImageEditor(() => FilerobotImageEditorComponent as unknown as FilerobotImageEditorComponent);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load Filerobot Image Editor:', error);
        showToast.error('图片编辑器加载失败');
        setIsLoading(false);
      }
    };

    loadImageEditor();
  }, []);

  // 保存处理
  const handleSave = async (editedImageObject: FilerobotImageObject, designState: FilerobotDesignState) => {
    if (!editedImageObject) return;

    setIsSaving(true);
    
    try {
      // 检查文件大小
      if (editedImageObject.imageCanvas) {
        const canvas = editedImageObject.imageCanvas;
        
        // 转换为 Blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob: Blob | null) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/jpeg', 0.9);
        });

        // 检查大小限制
        if (blob.size > config.maxFileSize) {
          showToast.error(`编辑后的图片大小 (${(blob.size / 1024 / 1024).toFixed(2)}MB) 超过限制 (${config.maxFileSize / 1024 / 1024}MB)`);
          setIsSaving(false);
          return;
        }

        // 生成数据URL用于预览
        const dataURL = canvas.toDataURL('image/jpeg', 0.9);

        // 调用保存回调
        onSave({
          originalId: image.id,
          editedBlob: blob,
          editedDataURL: dataURL,
          operations: designState?.annotations || [],
        });

        showToast.success('图片编辑已保存');
      }
    } catch (error) {
      console.error('Save failed:', error);
      showToast.error('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 关闭处理
  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm('图片已被修改，确定要关闭编辑器吗？未保存的更改将丢失。');
      if (!confirmed) return;
    }
    
    onClose();
  };

  // 重置编辑
  const handleReset = () => {
    if (editorInstance?.reset) {
      const confirmed = window.confirm('确定要重置所有编辑吗？此操作无法撤销。');
      if (confirmed) {
        editorInstance.reset();
        setHasChanges(false);
      }
    }
  };

  // 下载编辑后的图片
  const handleDownload = () => {
    if (editorInstance?.getCurrentImgDataUrl) {
      editorInstance.getCurrentImgDataUrl((dataURL: string) => {
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `edited_${image.filename}`;
        link.click();
      });
    }
  };

  // 编辑器配置
  const editorConfig: FilerobotEditorConfig = {
    ...FILEROBOT_EDITOR_CONFIG,
    source: image.url,
    onSave: handleSave,
    onClose: (closingReason: string) => {
      if (closingReason === 'ui-close-btn-clicked' || closingReason === 'escape-key-pressed') {
        handleClose();
      }
    },
    onModify: () => {
      setHasChanges(true);
    },
    annotationsCommon: {
      ...FILEROBOT_EDITOR_CONFIG.annotationsCommon,
      fill: 'hsl(var(--primary))',
      stroke: 'hsl(var(--primary))',
    },
    Text: {
      ...FILEROBOT_EDITOR_CONFIG.Text,
      fill: 'hsl(var(--foreground))',
      fontFamily: 'var(--font-sans)',
    },
    // 限制可用工具
    tools: config.tools.map(tool => {
      switch (tool) {
        case 'crop': return 'Crop';
        case 'rotate': return 'Rotate';
        case 'flip': return 'Flip';
        case 'filters': return 'Filters';
        case 'adjust': return 'Adjust';
        case 'resize': return 'Resize';
        case 'text': return 'Text';
        case 'shapes': return 'Shapes';
        default: return tool;
      }
    }),
    defaultTabId: 'Adjust',
    defaultToolId: 'Crop',
  };

  // 如果还在加载编辑器
  if (isLoading || !FilerobotImageEditor) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      >
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-4" />
          <p>正在加载图片编辑器...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* 自定义顶部工具栏 */}
      <div className="absolute top-0 left-0 right-0 z-[60] bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          {/* 图片信息 */}
          <div className="flex items-center gap-4">
            <h3 className="font-medium">编辑图片</h3>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{image.filename}</span>
              <Badge variant="secondary">
                {image.width} × {image.height}
              </Badge>
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  已修改
                </Badge>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              disabled={!hasChanges}
              title="重置所有编辑"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              重置
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              title="下载编辑后的图片"
            >
              <Download className="h-4 w-4 mr-2" />
              下载
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClose}
              title="关闭编辑器"
            >
              <X className="h-4 w-4 mr-2" />
              关闭
            </Button>
          </div>
        </div>
      </div>

      {/* 编辑器容器 */}
      <div
        ref={containerRef}
        className="w-full h-full pt-[73px]" // 为顶部工具栏留出空间
      >
        <FilerobotImageEditor
          {...editorConfig}
          onBeforeComplete={(canvas: HTMLCanvasElement) => {
            // 编辑完成前的回调
            return canvas;
          }}
          onComplete={(editedImageObject: FilerobotImageObject) => {
            // 编辑完成的回调
            setEditorInstance(editedImageObject as FilerobotEditorInstance);
          }}
          className={cn(
            "w-full h-full",
            "[&_.FIE_root]:!bg-background",
            "[&_.FIE_topbar]:!bg-card [&_.FIE_topbar]:!border-border",
            "[&_.FIE_editor-content]:!bg-background",
            "[&_.FIE_tools-bar]:!bg-card [&_.FIE_tools-bar]:!border-border",
            "[&_.FIE_tools-bar-icon]:!text-foreground",
            "[&_.FIE_tools-bar-icon.FIE_tools-bar-icon-active]:!text-primary",
            "[&_.FIE_button]:!bg-primary [&_.FIE_button]:!text-primary-foreground",
            "[&_.FIE_button]:hover:!bg-primary/90",
            "[&_.FIE_input]:!bg-input [&_.FIE_input]:!border-border [&_.FIE_input]:!text-foreground",
            "[&_.FIE_slider]:!accent-primary",
            "[&_.FIE_color-picker-trigger]:!border-border",
          )}
        />
      </div>

      {/* 保存状态指示器 */}
      {isSaving && (
        <div className="absolute inset-0 z-[70] bg-black/50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg p-6 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
              <span>正在保存编辑后的图片...</span>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ImageEditor;