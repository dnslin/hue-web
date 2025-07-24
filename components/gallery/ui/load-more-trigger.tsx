"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

interface LoadMoreTriggerProps {
  /** 是否正在加载 */
  loading?: boolean;
  /** 加载更多回调 */
  onLoadMore?: () => void;
  /** 是否自动触发（滚动到可视区域时） */
  autoTrigger?: boolean;
  /** 触发阈值（像素） */
  threshold?: number;
  /** 自定义类名 */
  className?: string;
  /** 自定义加载文本 */
  loadingText?: string;
  /** 自定义按钮文本 */
  buttonText?: string;
}

/**
 * 加载更多触发器组件
 * 支持手动点击和自动触发两种模式
 */
export const LoadMoreTrigger: React.FC<LoadMoreTriggerProps> = ({
  loading = false,
  onLoadMore,
  autoTrigger = true,
  threshold = 200,
  className,
  loadingText = "正在加载更多图片...",
  buttonText = "加载更多",
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  // 处理手动触发
  const handleManualTrigger = () => {
    if (loading || !onLoadMore) return;
    setHasTriggered(true);
    onLoadMore();
  };

  // 交叉观察器处理自动触发
  useEffect(() => {
    if (!autoTrigger || !triggerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsInView(entry.isIntersecting);
        
        // 自动触发加载更多
        if (
          entry.isIntersecting && 
          !loading && 
          !hasTriggered && 
          onLoadMore
        ) {
          setHasTriggered(true);
          onLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1,
      }
    );

    observer.observe(triggerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [autoTrigger, loading, hasTriggered, onLoadMore, threshold]);

  // 重置触发状态
  useEffect(() => {
    if (!loading) {
      // 延迟重置，避免立即重新触发
      const timer = setTimeout(() => {
        setHasTriggered(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <motion.div
        ref={triggerRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex flex-col items-center justify-center py-12 px-6",
          className
        )}
      >
        {/* 加载动画 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="mb-4"
        >
          <Loader2 className="h-8 w-8 text-primary" />
        </motion.div>

        {/* 加载文本 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-sm"
        >
          {loadingText}
        </motion.p>

        {/* 加载进度条动画 */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mt-4 h-1 bg-primary/20 rounded-full overflow-hidden max-w-xs w-full"
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-full w-1/3 bg-primary rounded-full"
          />
        </motion.div>
      </motion.div>
    );
  }

  // 如果是自动触发模式，只显示观察目标（不显示按钮）
  if (autoTrigger) {
    return (
      <div
        ref={triggerRef}
        className={cn("h-1 w-full", className)}
        aria-hidden="true"
      />
    );
  }

  // 手动触发模式，显示按钮
  return (
    <motion.div
      ref={triggerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center py-8 px-6",
        className
      )}
    >
      {/* 加载更多按钮 */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <ShimmerButton
          size="lg"
          onClick={handleManualTrigger}
          disabled={loading}
          className="gap-2"
        >
          <ChevronDown 
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isInView && "animate-bounce"
            )} 
          />
          {buttonText}
        </ShimmerButton>
      </motion.div>

      {/* 提示文本 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs text-muted-foreground mt-3 text-center max-w-xs"
      >
        点击按钮或滚动到底部自动加载更多内容
      </motion.p>
    </motion.div>
  );
};

export default LoadMoreTrigger;