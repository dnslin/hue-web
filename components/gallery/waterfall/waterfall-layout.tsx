"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { VirtuosoMasonry } from "react-virtuoso";
import { cn } from "@/lib/utils";
import { GALLERY_ANIMATIONS } from "@/lib/constants/gallery";
import type { 
  WaterfallGalleryConfig, 
  GalleryImageItem, 
  WaterfallRenderItem,
  WaterfallColumn
} from "@/lib/types/gallery";

import { GalleryImageItem as ImageItemComponent } from "../image/gallery-image-item";
import { LoadMoreTrigger } from "../ui/load-more-trigger";

interface WaterfallLayoutProps {
  /** 图片数据列表 */
  images: GalleryImageItem[];
  /** 画廊配置 */
  config: WaterfallGalleryConfig;
  /** 容器尺寸 */
  containerSize: { width: number; height: number };
  /** 选中的图片ID集合 */
  selectedImages: Set<number>;
  /** 是否在选择模式 */
  isSelectionMode: boolean;
  /** 是否有更多数据 */
  hasMore: boolean;
  /** 是否正在加载更多 */
  loadingMore: boolean;
  /** 图片点击回调 */
  onImageClick: (image: GalleryImageItem, index: number) => void;
  /** 图片双击回调 */
  onImageDoubleClick: (image: GalleryImageItem, index: number) => void;
  /** 图片长按回调 */
  onImageLongPress: (image: GalleryImageItem, index: number) => void;
  /** 图片选择回调 */
  onImageSelect: (imageId: number) => void;
  /** 加载更多回调 */
  onLoadMore?: () => void;
  /** 滚动结束回调 */
  onScrollEnd: () => void;
}

/**
 * 瀑布流布局核心组件
 * 基于 react-virtuoso 实现虚拟化瀑布流布局
 */
export const WaterfallLayout: React.FC<WaterfallLayoutProps> = ({
  images,
  config,
  containerSize,
  selectedImages,
  isSelectionMode,
  hasMore,
  loadingMore,
  onImageClick,
  onImageDoubleClick,
  onImageLongPress,
  onImageSelect,
  onLoadMore,
  onScrollEnd,
}) => {
  // 响应式列数计算
  const columnCount = useMemo(() => {
    const { width } = containerSize;
    const { columns } = config.layout;
    
    if (width < 768) return columns.mobile;
    if (width < 1024) return columns.tablet;
    return columns.desktop;
  }, [containerSize.width, config.layout.columns]);

  // 计算列宽
  const columnWidth = useMemo(() => {
    if (containerSize.width === 0) return 0;
    const totalGap = config.layout.gap * (columnCount - 1);
    return Math.floor((containerSize.width - totalGap) / columnCount);
  }, [containerSize.width, columnCount, config.layout.gap]);

  // 计算每张图片的显示尺寸
  const processedImages = useMemo(() => {
    return images.map((image) => {
      const aspectRatio = image.width / image.height;
      const displayWidth = columnWidth;
      let displayHeight = Math.round(displayWidth / aspectRatio);
      
      // 限制高度范围
      displayHeight = Math.max(
        config.layout.minItemHeight,
        Math.min(config.layout.maxItemHeight, displayHeight)
      );

      return {
        ...image,
        displayWidth,
        displayHeight,
        aspectRatio,
      } as GalleryImageItem;
    });
  }, [images, columnWidth, config.layout]);

  // 瀑布流布局计算
  const layoutItems = useMemo(() => {
    if (columnWidth === 0) return [];

    const columns: WaterfallColumn[] = Array.from({ length: columnCount }, (_, index) => ({
      index,
      height: 0,
      items: [],
    }));

    const renderItems: WaterfallRenderItem[] = [];

    processedImages.forEach((image, imageIndex) => {
      // 找到最短的列
      const shortestColumn = columns.reduce((shortest, current) =>
        current.height < shortest.height ? current : shortest
      );

      const x = shortestColumn.index * (columnWidth + config.layout.gap);
      const y = shortestColumn.height;

      const renderItem: WaterfallRenderItem = {
        image,
        position: {
          x,
          y,
          width: image.displayWidth,
          height: image.displayHeight,
        },
        columnIndex: shortestColumn.index,
        inViewport: true, // Virtuoso 会处理可视区域判断
      };

      renderItems.push(renderItem);
      shortestColumn.items.push(renderItem);
      shortestColumn.height += image.displayHeight + config.layout.gap;
    });

    return renderItems;
  }, [processedImages, columnCount, columnWidth, config.layout.gap]);

  // 计算总高度
  const totalHeight = useMemo(() => {
    if (layoutItems.length === 0) return 0;
    
    return Math.max(
      ...Array.from({ length: columnCount }, (_, columnIndex) => {
        const columnItems = layoutItems.filter(item => item.columnIndex === columnIndex);
        if (columnItems.length === 0) return 0;
        
        const lastItem = columnItems[columnItems.length - 1];
        return lastItem.position.y + lastItem.position.height;
      })
    );
  }, [layoutItems, columnCount]);

  // 虚拟化渲染项
  const itemRenderer = useCallback((index: number) => {
    const renderItem = layoutItems[index];
    if (!renderItem) return null;

    const { image, position } = renderItem;
    const isSelected = selectedImages.has(image.id);

    return (
      <motion.div
        key={`${image.id}-${index}`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{
          duration: GALLERY_ANIMATIONS.ITEM_ENTER.duration / 1000,
          ease: "easeOut",
          delay: (index % columnCount) * 0.05, // 交错动画
        }}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          width: position.width,
          height: position.height,
          zIndex: isSelected ? 10 : 1,
        }}
        whileHover={{
          y: -2,
          transition: { duration: 0.15 },
        }}
      >
        <ImageItemComponent
          image={image}
          index={index}
          isSelected={isSelected}
          isSelectionMode={isSelectionMode}
          config={config}
          onClick={() => onImageClick(image, index)}
          onDoubleClick={() => onImageDoubleClick(image, index)}
          onLongPress={() => onImageLongPress(image, index)}
          onSelect={() => onImageSelect(image.id)}
        />
      </motion.div>
    );
  }, [
    layoutItems,
    selectedImages,
    isSelectionMode,
    config,
    columnCount,
    onImageClick,
    onImageDoubleClick,
    onImageLongPress,
    onImageSelect,
  ]);

  // 滚动到底部处理
  const handleScrollEnd = useCallback(() => {
    onScrollEnd();
    if (hasMore && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, loadingMore, onLoadMore, onScrollEnd]);

  // 如果启用了虚拟滚动
  if (config.virtualScroll.enableScrollOptimization && containerSize.height > 0) {
    return (
      <div className="relative w-full h-full">
        <VirtuosoMasonry
          totalCount={layoutItems.length}
          itemRenderer={itemRenderer}
          style={{ height: containerSize.height }}
          components={{
            Footer: () => hasMore ? (
              <LoadMoreTrigger
                loading={loadingMore}
                onLoadMore={onLoadMore}
              />
            ) : null,
          }}
          endReached={handleScrollEnd}
          scrollerRef={(ref) => {
            // 处理滚动优化
            if (ref) {
              ref.style.overflowX = "hidden";
              ref.style.overscrollBehavior = "contain";
            }
          }}
        />
      </div>
    );
  }

  // 标准布局（非虚拟化）
  return (
    <div
      className={cn(
        "relative w-full",
        "overflow-y-auto overflow-x-hidden",
        "scrollbar-thin scrollbar-thumb-muted-foreground/20",
        "scrollbar-track-transparent"
      )}
      style={{ height: containerSize.height }}
      onScroll={(e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        
        // 检查是否滚动到底部
        if (scrollHeight - scrollTop <= clientHeight + 100) {
          handleScrollEnd();
        }
      }}
    >
      {/* 瀑布流容器 */}
      <div
        className="relative w-full"
        style={{ height: totalHeight }}
      >
        {layoutItems.map((renderItem, index) => itemRenderer(index))}
      </div>

      {/* 加载更多触发器 */}
      {hasMore && (
        <LoadMoreTrigger
          loading={loadingMore}
          onLoadMore={onLoadMore}
          className="mt-6"
        />
      )}
    </div>
  );
};

export default WaterfallLayout;