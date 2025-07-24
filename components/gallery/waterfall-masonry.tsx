// components/gallery/waterfall-masonry.tsx
// 基于 @virtuoso.dev/masonry 的瀑布流画廊组件

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { VirtuosoMasonry } from '@virtuoso.dev/masonry';
import { cn } from '@/lib/utils';
import { useWaterfallGallery } from '@/lib/store/gallery';
import type { GalleryImageItem } from '@/lib/types/gallery';

/**
 * 瀑布流配置接口
 */
interface WaterfallMasonryProps {
  /** 自定义样式类名 */
  className?: string;
  /** 是否启用无限滚动 */
  enableInfiniteScroll?: boolean;
  /** 加载更多回调 */
  onLoadMore?: () => void;
  /** 图片点击回调 */
  onImageClick?: (image: GalleryImageItem, index: number) => void;
  /** 图片长按回调 */
  onImageLongPress?: (image: GalleryImageItem, index: number) => void;
  /** 自定义空状态组件 */
  EmptyComponent?: React.ComponentType;
  /** 自定义加载组件 */
  LoadingComponent?: React.ComponentType;
  /** 自定义错误组件 */
  ErrorComponent?: React.ComponentType<{ error: string; onRetry: () => void }>;
}

/**
 * 瀑布流画廊组件
 */
export const WaterfallMasonry: React.FC<WaterfallMasonryProps> = ({
  className,
  enableInfiniteScroll = true,
  onLoadMore,
  onImageClick,
  onImageLongPress,
  EmptyComponent,
  LoadingComponent,
  ErrorComponent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout>(null);
  const [longPressTriggered, setLongPressTriggered] = useState(false);

  // 获取画廊状态和操作
  const {
    data,
    selection,
    layout,
    operations,
    stats,
  } = useWaterfallGallery();

  // 响应式列数计算
  const getColumnCount = useCallback(() => {
    const { layoutConfig, containerSize } = layout;
    const width = containerSize.width;
    
    if (width < 768) {
      return layoutConfig.columns.mobile;
    } else if (width < 1024) {
      return layoutConfig.columns.tablet;
    } else {
      return layoutConfig.columns.desktop;
    }
  }, [layout]);

  // 处理容器尺寸变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      
      operations.updateLayout({ width, height });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [operations]);

  // 处理图片交互
  const handleImageMouseDown = useCallback((
    image: GalleryImageItem,
    index: number
  ) => {
    // 长按检测
    longPressTimerRef.current = setTimeout(() => {
      setLongPressTriggered(true);
      onImageLongPress?.(image, index);
    }, 500);
  }, [onImageLongPress]);

  const handleImageMouseUp = useCallback((
    image: GalleryImageItem,
    index: number,
    event: React.MouseEvent
  ) => {
    // 清除长按定时器
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // 如果没有触发长按，执行点击
    if (!longPressTriggered) {
      handleImageClick(image, index, event);
    }

    setLongPressTriggered(false);
  }, [longPressTriggered]);

  const handleImageClick = useCallback((
    image: GalleryImageItem,
    index: number,
    event: React.MouseEvent
  ) => {
    // 处理选择模式
    if (selection.isSelectionMode) {
      const isRangeSelect = event.shiftKey;
      const allImageIds = data.images.map(img => img.id);
      operations.toggleSelection(image.id, isRangeSelect, allImageIds);
      return;
    }

    // 普通点击处理
    if (onImageClick) {
      onImageClick(image, index);
    } else {
      // 默认行为：打开预览
      operations.openPreview(image.id);
    }
  }, [selection.isSelectionMode, data.images, operations, onImageClick]);

  // 渲染单个图片项
  const ItemContent: React.ComponentType<{
    data: GalleryImageItem;
    index: number;
    context?: any;
  }> = useCallback(({ data: image, index }) => {
    const isSelected = selection.isImageSelected(image.id);
    const isSelectionMode = selection.isSelectionMode;

    return (
      <div
        className={cn(
          'relative group cursor-pointer overflow-hidden rounded-lg',
          'transition-all duration-200 hover:shadow-lg',
          isSelected && 'ring-2 ring-primary ring-offset-2',
          isSelectionMode && 'hover:ring-2 hover:ring-primary/50'
        )}
        onMouseDown={() => handleImageMouseDown(image, index)}
        onMouseUp={(e) => handleImageMouseUp(image, index, e)}
        onMouseLeave={() => {
          // 清除长按定时器
          if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
          }
          setLongPressTriggered(false);
        }}
      >
        {/* 图片容器 */}
        <div className="relative w-full">
          <img
            src={image.thumbnailUrl || image.url}
            alt={image.filename}
            className={cn(
              'w-full h-auto object-cover',
              'transition-transform duration-200 group-hover:scale-105'
            )}
            loading="lazy"
            draggable={false}
          />
          
          {/* 加载覆盖层 */}
          {image.loading && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* 选择覆盖层 */}
        {isSelectionMode && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center',
              isSelected 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'bg-background border-border'
            )}>
              {isSelected && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* 悬停信息 */}
        <div className={cn(
          'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent',
          'p-3 text-white text-sm',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-200'
        )}>
          <div className="font-medium truncate">{image.filename}</div>
          <div className="text-xs opacity-75">
            {image.width} × {image.height}
          </div>
        </div>
      </div>
    );
  }, [
    selection,
    handleImageMouseDown,
    handleImageMouseUp,
  ]);

  // 空状态渲染
  if (stats.isEmpty && !data.loading) {
    if (EmptyComponent) {
      return <EmptyComponent />;
    }
    
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">📸</div>
        <h3 className="text-lg font-medium mb-2">没有图片</h3>
        <p className="text-muted-foreground">
          {stats.hasActiveFilters ? '当前筛选条件下没有找到图片' : '还没有上传任何图片'}
        </p>
      </div>
    );
  }

  // 错误状态渲染
  if (data.error) {
    if (ErrorComponent) {
      return <ErrorComponent error={data.error} onRetry={() => operations.refresh()} />;
    }
    
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium mb-2">加载失败</h3>
        <p className="text-muted-foreground mb-4">{data.error}</p>
        <button
          onClick={() => operations.refresh()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          重试
        </button>
      </div>
    );
  }

  // 加载状态渲染
  if (data.loading && data.images.length === 0) {
    if (LoadingComponent) {
      return <LoadingComponent />;
    }
    
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-muted-foreground">加载中...</span>
      </div>
    );
  }

  const columnCount = getColumnCount();

  return (
    <div
      ref={containerRef}
      className={cn('w-full h-full', className)}
    >
      <VirtuosoMasonry
        data={data.images}
        columnCount={columnCount}
        ItemContent={ItemContent}
        className="virtuoso-masonry"
        style={{ height: '100%' }}
      />
      
      {/* 加载更多指示器 */}
      {data.loadingMore && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-muted-foreground">加载更多...</span>
        </div>
      )}
      
      {/* 已显示全部指示器 */}
      {!stats.hasMore && data.images.length > 0 && !data.loadingMore && (
        <div className="text-center py-8 text-muted-foreground">
          已显示全部图片
        </div>
      )}
    </div>
  );
};

export default WaterfallMasonry;