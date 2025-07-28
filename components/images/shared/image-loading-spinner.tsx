'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageLoadingSpinnerProps {
  /**
   * 加载器大小
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /**
   * 显示文本
   */
  text?: string
  /**
   * 自定义样式类名
   */
  className?: string
  /**
   * 是否显示背景遮罩
   */
  overlay?: boolean
}

/**
 * 图片加载指示器组件
 * 用于在图片加载过程中显示美观的加载动画
 */
export function ImageLoadingSpinner({ 
  size = 'md',
  text = '加载中...',
  className,
  overlay = false
}: ImageLoadingSpinnerProps) {
  // 根据尺寸定义图标大小和文本样式
  const sizeConfig = {
    sm: { icon: 'size-4', text: 'text-xs' },
    md: { icon: 'size-6', text: 'text-sm' },
    lg: { icon: 'size-8', text: 'text-base' },
    xl: { icon: 'size-12', text: 'text-lg' }
  }

  const config = sizeConfig[size]

  const SpinnerContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-muted-foreground",
        className
      )}
    >
      {/* 旋转的加载图标 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Loader2 className={cn(config.icon, 'text-green-600')} />
      </motion.div>
      
      {/* 加载文本 */}
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className={cn(config.text, 'font-medium')}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  )

  // 如果需要遮罩层
  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
        {SpinnerContent}
      </div>
    )
  }

  return SpinnerContent
}

/**
 * 简化版本的加载指示器，仅显示图标
 */
export function SimpleImageSpinner({ 
  size = 'md',
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const sizeConfig = {
    sm: 'size-4',
    md: 'size-6', 
    lg: 'size-8'
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
      className={cn("text-green-600", className)}
    >
      <Loader2 className={sizeConfig[size]} />
    </motion.div>
  )
}