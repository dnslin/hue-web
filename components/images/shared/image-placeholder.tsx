'use client'

import { motion } from 'framer-motion'
import { ImageIcon, Upload, Search, FileImage } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImagePlaceholderProps {
  /**
   * 占位符类型
   */
  type?: 'loading' | 'empty' | 'search' | 'upload' | 'preview'
  /**
   * 显示的文本
   */
  text?: string
  /**
   * 子文本（描述）
   */
  subtext?: string
  /**
   * 自定义样式类名
   */
  className?: string
  /**
   * 尺寸大小
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /**
   * 是否显示动画
   */
  animated?: boolean
  /**
   * 点击回调
   */
  onClick?: () => void
}

/**
 * 图片占位符组件
 * 用于在各种情况下显示占位符内容
 */
export function ImagePlaceholder({
  type = 'loading',
  text,
  subtext,
  className,
  size = 'md',
  animated = true,
  onClick
}: ImagePlaceholderProps) {
  // 根据类型定义不同的配置
  const typeConfig = {
    loading: {
      icon: ImageIcon,
      defaultText: '正在加载...',
      defaultSubtext: '请稍候',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/30'
    },
    empty: {
      icon: ImageIcon,
      defaultText: '暂无图片',
      defaultSubtext: '还没有上传任何图片',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20'
    },
    search: {
      icon: Search,
      defaultText: '未找到相关图片',
      defaultSubtext: '尝试调整搜索条件',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20'
    },
    upload: {
      icon: Upload,
      defaultText: '点击上传图片',
      defaultSubtext: '支持 JPG、PNG、GIF 等格式',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20'
    },
    preview: {
      icon: FileImage,
      defaultText: '图片预览',
      defaultSubtext: '点击查看完整图片',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20'
    }
  }

  // 根据尺寸定义样式
  const sizeConfig = {
    sm: {
      container: 'h-24 p-3',
      icon: 'size-6',
      text: 'text-xs',
      subtext: 'text-xs'
    },
    md: {
      container: 'h-32 p-4',
      icon: 'size-8',
      text: 'text-sm',
      subtext: 'text-xs'
    },
    lg: {
      container: 'h-40 p-6',
      icon: 'size-10',
      text: 'text-base',
      subtext: 'text-sm'
    },
    xl: {
      container: 'h-48 p-8',
      icon: 'size-12',
      text: 'text-lg',
      subtext: 'text-base'
    }
  }

  const config = typeConfig[type]
  const sizing = sizeConfig[size]
  const IconComponent = config.icon

  const containerClasses = cn(
    "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 transition-colors",
    config.bgColor,
    sizing.container,
    onClick && "cursor-pointer hover:bg-opacity-70",
    className
  )

  const content = (
    <>
      {/* 图标 */}
      <motion.div
        initial={animated ? { scale: 0.8, opacity: 0 } : false}
        animate={animated ? { scale: 1, opacity: 1 } : false}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mb-3"
      >
        <IconComponent className={cn(sizing.icon, config.color)} />
      </motion.div>

      {/* 主文本 */}
      <motion.h3
        initial={animated ? { opacity: 0, y: 10 } : false}
        animate={animated ? { opacity: 1, y: 0 } : false}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={cn(sizing.text, "font-medium text-foreground mb-1 text-center")}
      >
        {text || config.defaultText}
      </motion.h3>

      {/* 子文本 */}
      {(subtext || config.defaultSubtext) && (
        <motion.p
          initial={animated ? { opacity: 0, y: 10 } : false}
          animate={animated ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={cn(sizing.subtext, "text-muted-foreground text-center max-w-xs")}
        >
          {subtext || config.defaultSubtext}
        </motion.p>
      )}
    </>
  )

  if (onClick) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={containerClasses}
      >
        {content}
      </motion.button>
    )
  }

  return (
    <div className={containerClasses}>
      {content}
    </div>
  )
}

/**
 * 图片网格占位符
 * 用于瀑布流布局中的占位符显示
 */
export function ImageGridPlaceholder({
  count = 6,
  animated = true,
  className
}: {
  count?: number
  animated?: boolean
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={animated ? { opacity: 0, scale: 0.9 } : false}
          animate={animated ? { opacity: 1, scale: 1 } : false}
          transition={{ 
            delay: animated ? index * 0.1 : 0, 
            duration: 0.3 
          }}
          className="aspect-square bg-muted/20 rounded-xl border border-dashed border-border/30 flex items-center justify-center"
        >
          <ImageIcon className="size-8 text-muted-foreground/40" />
        </motion.div>
      ))}
    </div>
  )
}

/**
 * 紧凑型图片占位符
 * 用于小型图片位置的占位符
 */
export function CompactImagePlaceholder({
  className,
  aspect = 'square'
}: {
  className?: string
  aspect?: 'square' | 'video' | 'wide'
}) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[3/2]'
  }

  return (
    <div className={cn(
      "bg-muted/20 rounded-lg border border-dashed border-border/30 flex items-center justify-center",
      aspectClasses[aspect],
      className
    )}>
      <ImageIcon className="size-6 text-muted-foreground/40" />
    </div>
  )
}