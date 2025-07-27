// components/admin/images/waterfall/editor-dialog.tsx
// 图片编辑器对话框组件

'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';

import { EditorDialogProps } from '@/lib/types/gallery';
import { useEditorState, useGalleryActions } from '@/lib/store/images/gallery';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { X, Save, RotateCcw, AlertCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * 编辑器加载状态组件
 */
const EditorLoading = () => (
  <div className="flex items-center justify-center h-full">
    <Card className="p-8 text-center max-w-md">
      <div className="space-y-4">
        <Skeleton className="w-16 h-16 rounded-full mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-3 w-48 mx-auto" />
      </div>
    </Card>
  </div>
);

/**
 * 编辑器错误状态组件
 */
const EditorError = ({ 
  error, 
  onRetry, 
  onClose 
}: { 
  error: string; 
  onRetry: () => void; 
  onClose: () => void; 
}) => (
  <div className="flex items-center justify-center h-full">
    <Card className="p-8 text-center max-w-md">
      <AlertCircle className="size-12 text-destructive mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">编辑器加载失败</h3>
      <p className="text-sm text-muted-foreground mb-6">{error}</p>
      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={onClose}>
          关闭
        </Button>
        <Button onClick={onRetry}>
          重试
        </Button>
      </div>
    </Card>
  </div>
);

/**
 * 图片编辑器对话框组件
 */
const EditorDialog: React.FC<EditorDialogProps> = ({
  image: propImage,
  isOpen: propIsOpen,
  onClose: propOnClose,
  onSave,
  config,
  loading: propLoading,
  error: propError,
}) => {
  // 使用全局状态（如果没有传入 props）
  const editorState = useEditorState();
  const actions = useGalleryActions();
  
  // 确定使用哪个状态源
  const image = propImage || editorState.image;
  const isOpen = propIsOpen ?? editorState.isOpen;
  const onClose = propOnClose || actions.closeEditor;
  const loading = propLoading ?? editorState.loading;
  const error = propError ?? editorState.error;
  
  // 编辑器实例状态
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [editorReady, setEditorReady] = useState(false);

  // 动态导入 Filerobot Editor
  const [FilerobotImageEditor, setFilerobotImageEditor] = useState<any>(null);
  
  useEffect(() => {
    if (isOpen && !FilerobotImageEditor) {
      actions.setEditorLoading(true);
      
      // 动态导入编辑器
      import('react-filerobot-image-editor')
        .then((module) => {
          setFilerobotImageEditor(() => module.default);
          actions.setEditorLoading(false);
          actions.setEditorError(null);
        })
        .catch((err) => {
          console.error('Failed to load image editor:', err);
          actions.setEditorError('图片编辑器加载失败，请检查网络连接');
          actions.setEditorLoading(false);
        });
    }
  }, [isOpen, FilerobotImageEditor, actions]);

  // 处理编辑器保存
  const handleSave = useCallback((editedImageObject: any, designState: any) => {
    if (onSave && image) {
      onSave(editedImageObject, image);
    } else if (image) {
      // 默认保存逻辑
      console.log('Edited image:', editedImageObject);
      console.log('Design state:', designState);
      
      // 这里可以调用 API 保存编辑后的图片
      // 暂时只关闭对话框
      onClose();
    }
  }, [onSave, image, onClose]);

  // 处理重试
  const handleRetry = useCallback(() => {
    setFilerobotImageEditor(null);
    setEditorReady(false);
    actions.setEditorError(null);
  }, [actions]);

  // 编辑器配置
  const editorConfig = {
    ...editorState.config,
    ...config,
    source: image?.url || '',
    onSave: handleSave,
    onClose: onClose,
  };

  if (!image) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] w-full h-full p-0"
        hideCloseButton
      >
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>编辑图片 - {image.originalFilename}</DialogTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="size-8 p-0"
            >
              <X className="size-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 relative">
          {loading && <EditorLoading />}
          
          {error && (
            <EditorError 
              error={error} 
              onRetry={handleRetry} 
              onClose={onClose} 
            />
          )}
          
          {!loading && !error && FilerobotImageEditor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <FilerobotImageEditor
                {...editorConfig}
                className="w-full h-full"
              />
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditorDialog;