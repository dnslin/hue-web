// components/admin/images/waterfall/waterfall-gallery.tsx
// 瀑布流图片画廊主组件

'use client';

import { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { MasonryContainer } from '@virtuoso.dev/masonry';
import { motion, AnimatePresence } from 'motion/react';

import {
  WaterfallGalleryProps,
  WaterfallItem,
  ImageDimensions,
  GALLERY_CONSTANTS,
} from '@/lib/types/gallery';
import { ImageItem, ImageViewMode } from '@/lib/types/image';
import {
  useGalleryStore,
  useWaterfallState,
  useLoadingState,
  useResponsiveState,
  useGalleryActions,
} from '@/lib/store/images/gallery';
import { useImageCache } from '@/lib/store/images';

import ImageGridItem from './image-grid-item';
import PreviewDialog from './preview-dialog';
import EditorDialog from './editor-dialog';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * 瀑布流骨架屏组件
 */
const WaterfallSkeleton = ({ columns, count = 20 }: { columns: number; count?: number }) => {
  const skeletonItems = Array.from({ length: count }, (_, index) => (
    <Card key={index} className="p-0 overflow-hidden">
      <Skeleton className="w-full aspect-[3/4]" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </Card>
  ));

  return (
    <div 
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {skeletonItems}
    </div>
  );
};

/**
 * 瀑布流图片画廊组件
 */
const WaterfallGallery: React.FC<WaterfallGalleryProps> = ({
  images = [],
  loading = false,
  error = null,
  config: customConfig,
  onLoadMore,
  onImageClick,
  onImageSelect,
  onImagePreview,
  onImageEdit,
  onImageDelete,
  selectedIds = [],
  multiSelect = false,
  className = '',
  style,
  enableVirtualization = true,
  overscan = 5,
  enableScrollSeek = true,
  debug = false,
}) => {
  // 状态管理
  const waterfallState = useWaterfallState();
  const loadingState = useLoadingState();
  const responsive = useResponsiveState();
  const actions = useGalleryActions();
  const { cacheImageDimensions, getImageDimensions } = useImageCache();

  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // 初始化配置
  useEffect(() => {
    if (customConfig) {
      actions.updateWaterfallConfig(customConfig);
    }
  }, [customConfig, actions]);

  // 响应式监听
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
        actions.updateContainerWidth(width);
        actions.updateScreenWidth(window.innerWidth);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
      handleResize(); // 初始计算
    }

    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [actions]);

  // 处理图片加载完成
  const handleImageLoad = useCallback((imageId: number, dimensions: ImageDimensions) => {
    cacheImageDimensions(imageId, dimensions.width, dimensions.height);
    actions.removePreloadingImage(imageId);
  }, [cacheImageDimensions, actions]);

  // 处理图片加载错误
  const handleImageError = useCallback((imageId: number, error: string) => {
    actions.removePreloadingImage(imageId);
    if (debug) {
      console.warn(`图片加载失败 (ID: ${imageId}):`, error);
    }
  }, [actions, debug]);

  // 转换图片数据为瀑布流项目
  const waterfallItems: WaterfallItem[] = useMemo(() => {
    return images.map(image => {
      const cachedDimensions = getImageDimensions(image.id);
      
      return {
        ...image,
        dimensions: cachedDimensions ? {
          width: cachedDimensions.width,
          height: cachedDimensions.height,
          aspectRatio: cachedDimensions.width / cachedDimensions.height,
        } : undefined,
        loaded: !loadingState.preloadingImages.has(image.id),
        loadError: false,
      };
    });
  }, [images, getImageDimensions, loadingState.preloadingImages]);

  // 计算项目宽度
  const itemWidth = useMemo(() => {
    if (!waterfallState.layoutReady || waterfallState.columns === 0) {
      return 0;
    }
    return (containerWidth - (waterfallState.columns - 1) * waterfallState.config.gap) / waterfallState.columns;
  }, [waterfallState.layoutReady, waterfallState.columns, waterfallState.config.gap, containerWidth]);

  // 项目内容渲染函数
  const renderItem = useCallback((index: number, item: WaterfallItem) => {
    const isSelected = selectedIds.includes(item.id);
    
    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: GALLERY_CONSTANTS.ANIMATION_CONFIG.STANDARD_DURATION / 1000,
          ease: GALLERY_CONSTANTS.ANIMATION_CONFIG.EASING,
          delay: index * 0.05, // 交错动画
        }}
      >
        <ImageGridItem
          image={item}
          index={index}
          width={itemWidth}
          selected={isSelected}
          loading={!item.loaded}
          onClick={onImageClick}
          onSelect={multiSelect ? onImageSelect : undefined}
          onPreview={onImagePreview}
          onEdit={onImageEdit}
          onDelete={onImageDelete}
          onLoad={handleImageLoad}
          onError={handleImageError}
          enableHoverEffect={!responsive.isMobile}
          enableSelectAnimation={multiSelect}
          showActions={true}
          showMetadata={!responsive.isMobile}
        />
      </motion.div>
    );
  }, [
    selectedIds,
    itemWidth,
    responsive.isMobile,
    multiSelect,
    onImageClick,
    onImageSelect,
    onImagePreview,
    onImageEdit,
    onImageDelete,
    handleImageLoad,
    handleImageError,
  ]);

  // 加载更多处理
  const handleLoadMore = useCallback(() => {
    if (onLoadMore && !loadingState.loadingMore && !loading) {
      onLoadMore();
    }
  }, [onLoadMore, loadingState.loadingMore, loading]);

  // 如果没有布局就绪，显示骨架屏
  if (!waterfallState.layoutReady || loading) {
    return (
      <div ref={containerRef} className={`w-full ${className}`} style={style}>
        <WaterfallSkeleton 
          columns={responsive.optimalColumns} 
          count={responsive.isMobile ? 10 : 20} 
        />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div ref={containerRef} className={`w-full ${className}`} style={style}>
        <Card className="p-8 text-center">
          <div className="text-destructive mb-2">加载图片时出错</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </Card>
      </div>
    );
  }

  // 空状态
  if (waterfallItems.length === 0 && !loading) {
    return (
      <div ref={containerRef} className={`w-full ${className}`} style={style}>
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">暂无图片</div>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className={`w-full ${className}`} style={style}>
        {enableVirtualization && waterfallItems.length > GALLERY_CONSTANTS.PERFORMANCE_CONFIG.VIRTUALIZATION_THRESHOLD ? (
          // 虚拟化瀑布流
          <MasonryContainer
            items={waterfallItems}
            itemContent={renderItem}
            columns={waterfallState.columns}
            gap={waterfallState.config.gap}
            overscan={overscan}
            className="waterfall-masonry"
            style={{ minHeight: '100vh' }}
            onEndReached={handleLoadMore}
            endReachedThreshold={waterfallState.config.threshold}
          />
        ) : (
          // 简单网格布局
          <motion.div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${waterfallState.columns}, 1fr)`,
              gap: `${waterfallState.config.gap}px`,
            }}
            layout
          >
            <AnimatePresence mode="popLayout">
              {waterfallItems.map((item, index) => renderItem(index, item))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* 加载更多指示器 */}
        {loadingState.loadingMore && (
          <div className="mt-8 text-center">
            <WaterfallSkeleton 
              columns={waterfallState.columns} 
              count={waterfallState.columns * 2} 
            />
          </div>
        )}
      </div>

      {/* 预览对话框 */}
      <PreviewDialog />

      {/* 编辑器对话框 */}
      <EditorDialog />
    </>
  );
};

export default WaterfallGallery;