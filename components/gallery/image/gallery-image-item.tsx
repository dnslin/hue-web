"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Heart, Share2, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { DOUBLE_CLICK_INTERVAL, LONG_PRESS_DURATION } from "@/lib/constants/gallery";
import type { GalleryImageItem as GalleryImageType, WaterfallGalleryConfig } from "@/lib/types/gallery";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MagicCard } from "@/components/magicui/magic-card";

interface GalleryImageItemProps {
  /** 图片数据 */
  image: GalleryImageType;
  /** 是否已选中 */
  isSelected: boolean;
  /** 是否在选择模式 */
  isSelectionMode: boolean;
  /** 画廊配置 */
  config: WaterfallGalleryConfig;
  /** 点击回调 */
  onClick: () => void;
  /** 双击回调 */
  onDoubleClick: () => void;
  /** 长按回调 */
  onLongPress: () => void;
  /** 选择回调 */
  onSelect: () => void;
}

/**
 * 瀑布流图片项组件
 * 支持懒加载、手势识别、选择状态、hover效果
 */
export const GalleryImageItem: React.FC<GalleryImageItemProps> = ({
  image,
  isSelected,
  isSelectionMode,
  config,
  onClick,
  onDoubleClick,
  onLongPress,
  onSelect,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // 手势识别状态
  const clickTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressRef = useRef(false);

  // 图片加载处理
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  // 清理定时器的 effect
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current !== null) {
        window.clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // 点击手势处理
  const handlePointerDown = useCallback(() => {
    isLongPressRef.current = false;
    
    // 设置长按定时器
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, LONG_PRESS_DURATION);
  }, [onLongPress]);

  const handlePointerUp = useCallback(() => {
    // 清除长按定时器
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // 如果是长按，不触发点击事件
    if (isLongPressRef.current) {
      return;
    }

    const now = Date.now();
    const timeSinceLastClick = now - clickTimeRef.current;

    if (timeSinceLastClick < DOUBLE_CLICK_INTERVAL) {
      // 双击
      onDoubleClick();
    } else {
      // 单击
      window.setTimeout(() => {
        const timeSinceClick = Date.now() - now;
        if (timeSinceClick >= DOUBLE_CLICK_INTERVAL) {
          onClick();
        }
      }, DOUBLE_CLICK_INTERVAL);
    }

    clickTimeRef.current = now;
  }, [onClick, onDoubleClick]);

  // 选择框点击处理
  const handleSelectionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  }, [onSelect]);

  // 快速操作按钮点击处理
  const handleQuickAction = useCallback((action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'like':
        // 处理点赞
        break;
      case 'share':
        // 处理分享
        break;
      case 'download':
        // 处理下载
        break;
      case 'edit':
        // 处理编辑
        break;
      case 'delete':
        // 处理删除
        break;
    }
  }, []);

  // 渲染图片内容
  const renderImageContent = () => {
    if (imageError) {
      return (
        <div
          className={cn(
            "flex items-center justify-center",
            "bg-muted text-muted-foreground",
            "text-sm"
          )}
          style={{
            width: image.displayWidth,
            height: image.displayHeight,
          }}
        >
          <div className="text-center space-y-2">
            <div className="text-2xl">📷</div>
            <div>加载失败</div>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* 加载骨架屏 */}
        {!imageLoaded && (
          <Skeleton
            className="absolute inset-0 rounded-xl"
            style={{
              width: image.displayWidth,
              height: image.displayHeight,
            }}
          />
        )}

        <img
          src={image.url}
          alt={image.filename}
          loading={config.performance.loadStrategy === 'lazy' ? 'lazy' : 'eager'}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={cn(
            "absolute inset-0 w-full h-full object-cover rounded-xl",
            "transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            width: image.displayWidth,
            height: image.displayHeight,
          }}
        />
      </>
    );
  };

  // 渲染选择指示器
  const renderSelectionIndicator = () => {
    if (!isSelectionMode && !isSelected) return null;

    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.2, ease: "backOut" }}
        className="absolute top-2 left-2 z-20"
      >
        <Button
          size="icon"
          variant={isSelected ? "default" : "secondary"}
          className={cn(
            "h-6 w-6 rounded-full shadow-lg",
            isSelected && "bg-primary text-primary-foreground"
          )}
          onClick={handleSelectionClick}
        >
          {isSelected && <Check className="h-3 w-3" />}
        </Button>
      </motion.div>
    );
  };

  // 渲染快速操作按钮
  const renderQuickActions = () => {
    if (isSelectionMode || !isHovered) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-2 right-2 z-20 flex gap-1"
      >
        <Button
          size="icon"
          variant="secondary"
          className="h-6 w-6 rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
          onClick={(e) => handleQuickAction('like', e)}
        >
          <Heart className="h-3 w-3" />
        </Button>
        
        <Button
          size="icon"
          variant="secondary"
          className="h-6 w-6 rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
          onClick={(e) => handleQuickAction('share', e)}
        >
          <Share2 className="h-3 w-3" />
        </Button>
        
        {config.editor.enabled && (
          <Button
            size="icon"
            variant="secondary"
            className="h-6 w-6 rounded-full shadow-lg bg-background/80 backdrop-blur-sm"
            onClick={(e) => handleQuickAction('edit', e)}
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
      </motion.div>
    );
  };

  // 渲染图片信息
  const renderImageInfo = () => {
    if (isSelectionMode || !isHovered) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-2 left-2 z-20"
      >
        <div className="flex flex-col gap-1">
          {image.filename && (
            <Badge
              variant="secondary"
              className="text-xs bg-background/80 backdrop-blur-sm max-w-32 truncate"
            >
              {image.filename}
            </Badge>
          )}
          
          <Badge
            variant="outline"
            className="text-xs bg-background/80 backdrop-blur-sm"
          >
            {image.width} × {image.height}
          </Badge>
        </div>
      </motion.div>
    );
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden cursor-pointer group",
        "rounded-xl border-0 shadow-sm bg-card",
        "transition-all duration-200 ease-out",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isHovered && "shadow-lg transform -translate-y-1"
      )}
      style={{
        width: image.displayWidth,
        height: image.displayHeight,
      }}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <MagicCard
        className="absolute inset-0 w-full h-full"
        gradientColor="rgba(var(--primary), 0.1)"
        gradientOpacity={isHovered ? 0.3 : 0}
      >
        {/* 图片内容 */}
        {renderImageContent()}

        {/* 选择状态覆盖层 */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/20 rounded-xl"
            />
          )}
        </AnimatePresence>

        {/* 悬停状态覆盖层 */}
        <AnimatePresence>
          {isHovered && !isSelectionMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/10 rounded-xl"
            />
          )}
        </AnimatePresence>

        {/* 选择指示器 */}
        <AnimatePresence>
          {renderSelectionIndicator()}
        </AnimatePresence>

        {/* 快速操作按钮 */}
        <AnimatePresence>
          {renderQuickActions()}
        </AnimatePresence>

        {/* 图片信息 */}
        <AnimatePresence>
          {renderImageInfo()}
        </AnimatePresence>

        {/* 加载指示器 */}
        {image.loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl"
          >
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
          </motion.div>
        )}
      </MagicCard>
    </div>
  );
};

export default GalleryImageItem;