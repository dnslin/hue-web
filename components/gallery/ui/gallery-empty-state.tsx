"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ImageOff, 
  Upload, 
  AlertTriangle, 
  Search,
  FolderOpen,
  Wifi,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

type EmptyStateType = 'empty' | 'error' | 'no-results' | 'no-album' | 'offline';

interface GalleryEmptyStateProps {
  /** 空状态类型 */
  type: EmptyStateType;
  /** 标题 */
  title?: string;
  /** 描述 */
  description?: string;
  /** 操作按钮 */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'shimmer';
  };
  /** 次要操作按钮 */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** 自定义类名 */
  className?: string;
}

/**
 * 图片画廊空状态组件
 * 支持多种空状态类型的展示
 */
export const GalleryEmptyState: React.FC<GalleryEmptyStateProps> = ({
  type,
  title,
  description,
  action,
  secondaryAction,
  className,
}) => {
  // 根据类型获取默认配置
  const getStateConfig = (stateType: EmptyStateType) => {
    switch (stateType) {
      case 'empty':
        return {
          icon: ImageOff,
          title: title || '暂无图片',
          description: description || '还没有上传任何图片，开始上传第一张图片吧！',
          iconColor: 'text-muted-foreground',
        };
        
      case 'error':
        return {
          icon: AlertTriangle,
          title: title || '加载失败',
          description: description || '无法加载图片，请检查网络连接后重试',
          iconColor: 'text-destructive',
        };
        
      case 'no-results':
        return {
          icon: Search,
          title: title || '未找到相关图片',
          description: description || '尝试调整搜索条件或筛选器',
          iconColor: 'text-muted-foreground',
        };
        
      case 'no-album':
        return {
          icon: FolderOpen,
          title: title || '相册为空',
          description: description || '这个相册还没有添加图片',
          iconColor: 'text-muted-foreground',
        };
        
      case 'offline':
        return {
          icon: Wifi,
          title: title || '网络连接异常',
          description: description || '请检查网络连接后重试',
          iconColor: 'text-muted-foreground',
        };
        
      default:
        return {
          icon: ImageOff,
          title: title || '暂無内容',
          description: description || '',
          iconColor: 'text-muted-foreground',
        };
    }
  };

  const config = getStateConfig(type);
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center min-h-[400px] p-8 text-center",
        className
      )}
    >
      {/* 图标 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "backOut" }}
        className={cn(
          "mb-4 p-4 rounded-full bg-muted/50",
          config.iconColor
        )}
      >
        <IconComponent size={48} strokeWidth={1.5} />
      </motion.div>

      {/* 标题 */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-xl font-semibold mb-2"
      >
        {config.title}
      </motion.h3>

      {/* 描述 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="text-muted-foreground max-w-md mb-6"
      >
        {config.description}
      </motion.p>

      {/* 操作按钮 */}
      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          {action && (
            <>
              {action.variant === 'shimmer' ? (
                <ShimmerButton onClick={action.onClick}>
                  {action.label}
                </ShimmerButton>
              ) : (
                <Button onClick={action.onClick} size="lg">
                  {type === 'empty' && <Upload className="mr-2 h-4 w-4" />}
                  {type === 'error' && <RefreshCw className="mr-2 h-4 w-4" />}
                  {action.label}
                </Button>
              )}
            </>
          )}
          
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              size="lg"
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}

      {/* 装饰性元素 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
      >
        {/* 背景装饰圈 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-96 h-96 rounded-full border border-border/20 animate-pulse" />
          <div className="absolute inset-8 rounded-full border border-border/10 animate-pulse" 
               style={{ animationDelay: '1s' }} />
          <div className="absolute inset-16 rounded-full border border-border/5 animate-pulse" 
               style={{ animationDelay: '2s' }} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GalleryEmptyState;