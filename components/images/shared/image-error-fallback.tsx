'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCcw, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageErrorFallbackProps {
  /**
   * 错误消息
   */
  error?: string | null
  /**
   * 错误类型
   */
  type?: 'network' | 'loading' | 'permission' | 'notfound' | 'general'
  /**
   * 重试回调函数
   */
  onRetry?: () => void
  /**
   * 自定义样式类名
   */
  className?: string
  /**
   * 显示模式
   */
  variant?: 'minimal' | 'detailed' | 'compact'
  /**
   * 是否显示重试按钮
   */
  showRetry?: boolean
}

/**
 * 图片错误状态组件
 * 用于在图片加载失败或其他错误情况下显示友好的错误提示
 */
export function ImageErrorFallback({
  error,
  type = 'general',
  onRetry,
  className,
  variant = 'detailed',
  showRetry = true
}: ImageErrorFallbackProps) {
  // 根据错误类型定义不同的提示信息
  const errorConfig = {
    network: {
      title: '网络连接失败',
      message: '请检查网络连接后重试',
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    loading: {
      title: '图片加载失败',
      message: '图片无法正常加载，请重试',
      icon: ImageIcon,
      color: 'text-red-600'
    },
    permission: {
      title: '访问权限不足',
      message: '您没有权限查看此图片',
      icon: AlertTriangle,
      color: 'text-amber-600'
    },
    notfound: {
      title: '图片不存在',
      message: '请求的图片资源未找到',
      icon: ImageIcon,
      color: 'text-gray-600'
    },
    general: {
      title: '加载出错',
      message: '图片处理过程中出现错误',
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  }

  const config = errorConfig[type]
  const IconComponent = config.icon

  // 最小化模式
  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "flex items-center justify-center p-4 bg-muted/30 rounded-lg",
          className
        )}
      >
        <IconComponent className={cn("size-6", config.color)} />
      </motion.div>
    )
  }

  // 紧凑模式
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center gap-2 p-3 bg-muted/30 rounded-lg text-sm",
          className
        )}
      >
        <IconComponent className={cn("size-4", config.color)} />
        <span className="text-muted-foreground">{config.title}</span>
        {showRetry && onRetry && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onRetry}
            className="ml-auto h-6 px-2 text-xs"
          >
            重试
          </Button>
        )}
      </motion.div>
    )
  }

  // 详细模式（默认）
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col items-center justify-center p-6 bg-muted/20 rounded-xl border border-border/50",
        className
      )}
    >
      {/* 错误图标 */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full bg-background/80 mb-4",
          "ring-2 ring-offset-2 ring-offset-background",
          config.color === 'text-red-600' ? 'ring-red-200' :
          config.color === 'text-orange-600' ? 'ring-orange-200' :
          config.color === 'text-amber-600' ? 'ring-amber-200' : 'ring-gray-200'
        )}
      >
        <IconComponent className={cn("size-6", config.color)} />
      </motion.div>

      {/* 错误标题 */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.2 }}
        className="text-base font-medium text-foreground mb-2"
      >
        {config.title}
      </motion.h3>

      {/* 错误消息 */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.2 }}
        className="text-sm text-muted-foreground text-center mb-4 max-w-xs"
      >
        {error || config.message}
      </motion.p>

      {/* 重试按钮 */}
      {showRetry && onRetry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.2 }}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCcw className="size-4" />
            重新加载
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

/**
 * 图片卡片错误状态组件
 * 专门用于图片卡片中的错误显示
 */
export function ImageCardError({
  onRetry,
  className
}: {
  onRetry?: () => void
  className?: string
}) {
  return (
    <div className={cn(
      "aspect-square bg-muted/30 rounded-lg flex flex-col items-center justify-center p-4 text-muted-foreground",
      className
    )}>
      <ImageIcon className="size-8 mb-2 text-muted-foreground/60" />
      <p className="text-xs text-center mb-3">图片加载失败</p>
      {onRetry && (
        <Button
          size="sm"
          variant="ghost"
          onClick={onRetry}
          className="h-7 px-3 text-xs"
        >
          重试
        </Button>
      )}
    </div>
  )
}