'use client'

import React from 'react'
import { 
  File, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RotateCcw,
  Pause,
  Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/lib/dashboard/formatters'
import { motion } from 'framer-motion'
import type { UploadFileState } from '@/lib/store/image/upload'

interface UploadFileItemProps {
  file: UploadFileState
  onRemove: (fileId: string) => void
  onRetry: (fileId: string) => void
  onCancel?: (fileId: string) => void
  showActions?: boolean
  className?: string
}

/**
 * 上传文件项组件
 * 显示文件信息、上传进度和操作按钮
 */
export function UploadFileItem({
  file,
  onRemove,
  onRetry,
  onCancel,
  showActions = true,
  className,
}: UploadFileItemProps) {
  // 获取状态图标
  const getStatusIcon = () => {
    switch (file.status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'uploading':
        return (
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        )
      case 'cancelled':
        return <X className="h-4 w-4 text-muted-foreground" />
      default:
        return <File className="h-4 w-4 text-muted-foreground" />
    }
  }

  // 获取状态颜色
  const getStatusColor = () => {
    switch (file.status) {
      case 'success':
        return 'border-green-200 bg-green-50/50'
      case 'error':
        return 'border-red-200 bg-red-50/50'
      case 'uploading':
        return 'border-primary/20 bg-primary/5'
      case 'cancelled':
        return 'border-muted bg-muted/30'
      default:
        return 'border-border bg-background'
    }
  }

  // 获取状态徽章
  const getStatusBadge = () => {
    switch (file.status) {
      case 'success':
        return (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            已完成
          </Badge>
        )
      case 'error':
        return (
          <Badge variant="destructive">
            失败
          </Badge>
        )
      case 'uploading':
        return (
          <Badge variant="default">
            上传中
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="secondary">
            已取消
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            等待中
          </Badge>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex items-center gap-3 p-4 border rounded-lg transition-all duration-200",
        "hover:shadow-sm",
        getStatusColor(),
        className
      )}
    >
      {/* 文件预览缩略图 */}
      <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {file.preview ? (
          <img
            src={file.preview}
            alt={file.file.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <File className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      {/* 文件信息 */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* 文件名和状态 */}
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium text-sm truncate" title={file.file.name}>
            {file.file.name}
          </span>
          {getStatusBadge()}
        </div>

        {/* 文件详情 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(file.file.size)}</span>
          
          {file.status === 'uploading' && (
            <>
              <span>•</span>
              <span className="text-primary font-medium">
                {file.progress}%
              </span>
            </>
          )}
          
          {file.error && (
            <>
              <span>•</span>
              <span className="text-red-600 truncate" title={file.error}>
                {file.error}
              </span>
            </>
          )}
          
          {file.result && (
            <>
              <span>•</span>
              <span className="text-green-600">
                上传成功
              </span>
            </>
          )}
        </div>

        {/* 进度条 */}
        {file.status === 'uploading' && (
          <div className="space-y-1">
            <Progress value={file.progress} className="h-1.5" />
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      {showActions && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* 重试按钮 */}
          {file.status === 'error' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRetry(file.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
              title="重试上传"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}

          {/* 取消按钮 */}
          {file.status === 'uploading' && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(file.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-yellow-600"
              title="取消上传"
            >
              <Pause className="h-3 w-3" />
            </Button>
          )}

          {/* 移除按钮 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(file.id)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
            title="移除文件"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </motion.div>
  )
}

/**
 * 文件列表组件
 * 渲染多个文件项
 */
interface UploadFileListProps {
  files: UploadFileState[]
  onRemove: (fileId: string) => void
  onRetry: (fileId: string) => void
  onCancel?: (fileId: string) => void
  showActions?: boolean
  className?: string
  emptyMessage?: string
}

export function UploadFileList({
  files,
  onRemove,
  onRetry,
  onCancel,
  showActions = true,
  className,
  emptyMessage = '暂无文件',
}: UploadFileListProps) {
  if (files.length === 0) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-8 text-center",
        className
      )}>
        <File className="h-12 w-12 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      {files.map((file) => (
        <UploadFileItem
          key={file.id}
          file={file}
          onRemove={onRemove}
          onRetry={onRetry}
          onCancel={onCancel}
          showActions={showActions}
        />
      ))}
    </div>
  )
}