"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DEFAULT_WATERFALL_CONFIG } from "@/lib/constants/gallery";
import type { 
  WaterfallGalleryConfig, 
  GalleryImageItem, 
  GalleryQueryParams,
  GalleryEvent,
  GalleryEventType
} from "@/lib/types/gallery";

import { WaterfallLayout } from "./waterfall/waterfall-layout";
import { GalleryToolbar } from "./controls/gallery-toolbar";
import { ImagePreview } from "./preview/image-preview";
import { ImageEditor } from "./editor/image-editor";
import { GalleryLoadingState } from "./ui/gallery-loading-state";
import { GalleryEmptyState } from "./ui/gallery-empty-state";

interface WaterfallGalleryProps {
  /** 图片数据列表 */
  images?: GalleryImageItem[];
  /** 画廊配置 */
  config?: Partial<WaterfallGalleryConfig>;
  /** 查询参数 */
  queryParams?: GalleryQueryParams;
  /** 加载状态 */
  loading?: boolean;
  /** 错误信息 */
  error?: string | null;
  /** 是否有更多数据 */
  hasMore?: boolean;
  /** 是否正在加载更多 */
  loadingMore?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 事件处理器 */
  onEvent?: (event: GalleryEvent) => void;
  /** 加载更多回调 */
  onLoadMore?: () => void;
  /** 查询参数变化回调 */
  onQueryChange?: (params: GalleryQueryParams) => void;
}

/**
 * 瀑布流图片画廊主组件
 * 整合了布局、预览、编辑等功能模块
 */
export const WaterfallGallery: React.FC<WaterfallGalleryProps> = ({
  images = [],
  config = {},
  queryParams = {},
  loading = false,
  error = null,
  hasMore = false,
  loadingMore = false,
  className,
  onEvent,
  onLoadMore,
  onQueryChange,
}) => {
  // 合并配置
  const galleryConfig = { ...DEFAULT_WATERFALL_CONFIG, ...config };
  
  // 组件状态
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [editorVisible, setEditorVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState<GalleryImageItem | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  
  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // 监听容器尺寸变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // 事件处理函数
  const handleGalleryEvent = (type: GalleryEventType, data: any) => {
    const event: GalleryEvent = {
      type,
      data,
      timestamp: Date.now(),
    };
    
    // 内部事件处理
    switch (type) {
      case 'imageClick':
        if (isSelectionMode) {
          handleImageSelect(data.image.id);
        } else if (galleryConfig.preview.enabled) {
          handlePreviewOpen(data.index);
        }
        break;
        
      case 'imageDoubleClick':
        if (galleryConfig.preview.enabled) {
          handlePreviewOpen(data.index);
        }
        break;
        
      case 'imageLongPress':
        if (!isSelectionMode) {
          setIsSelectionMode(true);
          handleImageSelect(data.image.id);
        }
        break;
        
      case 'previewOpen':
        setPreviewVisible(true);
        setPreviewIndex(data.index);
        break;
        
      case 'previewClose':
        setPreviewVisible(false);
        break;
        
      case 'editorOpen':
        setEditorVisible(true);
        setCurrentImage(data.image);
        break;
        
      case 'editorClose':
        setEditorVisible(false);
        setCurrentImage(null);
        break;
    }
    
    // 向父组件传递事件
    onEvent?.(event);
  };

  // 图片选择处理
  const handleImageSelect = (imageId: number) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      
      // 如果没有选中项，退出选择模式
      if (newSet.size === 0) {
        setIsSelectionMode(false);
      }
      
      return newSet;
    });
  };

  // 预览相关处理
  const handlePreviewOpen = (index: number) => {
    handleGalleryEvent('previewOpen', { index });
  };

  const handlePreviewClose = () => {
    handleGalleryEvent('previewClose', {});
  };

  // 编辑器相关处理
  const handleEditorOpen = (image: GalleryImageItem) => {
    handleGalleryEvent('editorOpen', { image });
  };

  const handleEditorClose = () => {
    handleGalleryEvent('editorClose', {});
  };

  // 批量操作处理
  const handleBatchOperation = (operation: string, params?: any) => {
    handleGalleryEvent('batchSelect', {
      operation,
      imageIds: Array.from(selectedImages),
      params,
    });
  };

  // 清空选择
  const handleClearSelection = () => {
    setSelectedImages(new Set());
    setIsSelectionMode(false);
  };

  // 全选
  const handleSelectAll = () => {
    setSelectedImages(new Set(images.map(img => img.id)));
  };

  // 渲染内容
  const renderContent = () => {
    // 错误状态
    if (error && !loading) {
      return (
        <GalleryEmptyState
          type="error"
          title="加载失败"
          description={error}
          action={{
            label: "重试",
            onClick: () => onLoadMore?.(),
          }}
        />
      );
    }

    // 初始加载状态
    if (loading && images.length === 0) {
      return <GalleryLoadingState />;
    }

    // 空状态
    if (!loading && images.length === 0) {
      return (
        <GalleryEmptyState
          type="empty"
          title="暂无图片"
          description="还没有上传任何图片"
        />
      );
    }

    // 瀑布流布局
    return (
      <WaterfallLayout
        images={images}
        config={galleryConfig}
        containerSize={containerSize}
        selectedImages={selectedImages}
        isSelectionMode={isSelectionMode}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onImageClick={(image, index) => handleGalleryEvent('imageClick', { image, index })}
        onImageDoubleClick={(image, index) => handleGalleryEvent('imageDoubleClick', { image, index })}
        onImageLongPress={(image, index) => handleGalleryEvent('imageLongPress', { image, index })}
        onImageSelect={handleImageSelect}
        onLoadMore={onLoadMore}
        onScrollEnd={() => handleGalleryEvent('scrollEnd', {})}
      />
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full",
        "bg-background text-foreground",
        className
      )}
    >
      {/* 工具栏 */}
      <GalleryToolbar
        config={galleryConfig}
        queryParams={queryParams}
        selectedCount={selectedImages.size}
        isSelectionMode={isSelectionMode}
        onQueryChange={onQueryChange}
        onBatchOperation={handleBatchOperation}
        onClearSelection={handleClearSelection}
        onSelectAll={handleSelectAll}
        onToggleSelectionMode={() => setIsSelectionMode(!isSelectionMode)}
      />

      {/* 主内容区域 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative flex-1 overflow-hidden"
      >
        {renderContent()}
      </motion.div>

      {/* 图片预览模态框 */}
      <AnimatePresence>
        {previewVisible && (
          <ImagePreview
            images={images}
            currentIndex={previewIndex}
            config={galleryConfig.preview}
            onClose={handlePreviewClose}
            onEdit={galleryConfig.editor.enabled ? handleEditorOpen : undefined}
            onIndexChange={setPreviewIndex}
          />
        )}
      </AnimatePresence>

      {/* 图片编辑器模态框 */}
      <AnimatePresence>
        {editorVisible && currentImage && (
          <ImageEditor
            image={currentImage}
            config={galleryConfig.editor}
            onClose={handleEditorClose}
            onSave={(editedImage) => {
              handleGalleryEvent('imageSave', { original: currentImage, edited: editedImage });
              handleEditorClose();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WaterfallGallery;