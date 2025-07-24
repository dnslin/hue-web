"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface GalleryLoadingStateProps {
  /** 加载项数量 */
  itemCount?: number;
  /** 自定义类名 */
  className?: string;
}

/**
 * 图片画廊加载状态组件
 * 显示瀑布流布局的骨架屏
 */
export const GalleryLoadingState: React.FC<GalleryLoadingStateProps> = ({
  itemCount = 12,
  className,
}) => {
  // 生成随机高度的骨架屏项目
  const generateSkeletonItems = () => {
    const heights = [200, 250, 300, 350, 280, 320, 240, 290, 260, 310, 220, 270];
    
    return Array.from({ length: itemCount }, (_, index) => ({
      id: index,
      height: heights[index % heights.length],
    }));
  };

  const skeletonItems = generateSkeletonItems();

  return (
    <div className={cn("p-6", className)}>
      {/* 工具栏骨架屏 */}
      <div className="mb-6 space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      {/* 瀑布流骨架屏 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="columns-2 md:columns-3 lg:columns-4 gap-4"
      >
        {skeletonItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              ease: "easeOut",
            }}
            className="mb-4 break-inside-avoid"
          >
            <Skeleton
              className="w-full rounded-xl"
              style={{ height: item.height }}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default GalleryLoadingState;