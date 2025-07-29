'use client'

import { motion } from 'motion/react'
import { useState, useEffect } from 'react'
import { ImageResponse } from '@/lib/types/image'
import { MagicCard } from '@/components/magicui/magic-card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { imageBatchStore } from '@/lib/store/image/batch'
import { imageDataStore } from '@/lib/store/image/data'
import { useImageModalStore } from '@/hooks/images/use-image-modal'
import { useStore } from 'zustand'
import { cn } from '@/lib/utils'
import { 
  Eye, 
  EyeOff, 
  Edit, 
  Download, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  HardDrive
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/**
 * 图片卡片组件
 */
interface ImageCardProps {
  image: ImageResponse
}

export function ImageCard({ image }: ImageCardProps) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const { 
    isSelectionMode, 
    toggleImageSelection,
    isImageSelected 
  } = useStore(imageBatchStore)
  
  const { images, getImageUrl, deleteImage } = useStore(imageDataStore)
  const { openPreview, openEditor } = useImageModalStore()
  
  const isSelected = isImageSelected(image.id)

  // 加载图片
  useEffect(() => {
    const loadImage = async () => {
      setImageLoading(true)
      setImageError(false)
      
      try {
        const imageUrl = await getImageUrl(image.id.toString(), true) // 使用缩略图
        if (imageUrl) {
          setImageSrc(imageUrl)
        } else {
          setImageError(true)
        }
      } catch (error) {
        console.error('加载图片失败:', error)
        setImageError(true)
      } finally {
        setImageLoading(false)
      }
    }

    loadImage()
  }, [image.id, getImageUrl])

  // 处理图片选择
  const handleToggleSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleImageSelection(image.id)
  }

  // 处理卡片点击
  const handleCardClick = () => {
    if (isSelectionMode) {
      toggleImageSelection(image.id)
    } else {
      // 找到当前图片在列表中的索引，打开预览
      const currentIndex = images.findIndex(img => img.id === image.id)
      openPreview(images, currentIndex >= 0 ? currentIndex : 0)
    }
  }

  // 处理删除图片
  const handleDeleteImage = async () => {
    setIsDeleting(true)
    try {
      const success = await deleteImage(image.id)
      if (success) {
        setShowDeleteDialog(false)
      } else {
        // 删除失败的错误已经在 store 中处理，这里可以添加 toast 通知
        console.error('删除失败')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.2, // CLAUDE.md 标准动画时长
        ease: [0.4, 0, 0.2, 1] // CLAUDE.md 标准缓动函数
      }}
      className="p-2" // 遵循 CLAUDE.md 的间距标准
    >
      <div onClick={handleCardClick}>
        <MagicCard
          className={`
            relative overflow-hidden rounded-xl cursor-pointer
            transition-all duration-200 ease-out
            hover:scale-[1.02] hover:shadow-lg
            ${isSelected ? 'ring-2 ring-green-500 shadow-lg' : ''}
            ${isSelectionMode ? 'hover:ring-2 hover:ring-green-300' : ''}
          `}
          gradientColor="#10B981" // 使用 CLAUDE.md 定义的图片相关色彩
        >
        {/* 选中状态边框动画 */}
        {isSelected && (
          <BorderBeam 
            className="absolute inset-0 z-10"
            colorFrom="#10B981"
            colorTo="#059669"
          />
        )}

        {/* 选择模式复选框 */}
        {isSelectionMode && (
          <div 
            className="absolute top-2 left-2 z-20 cursor-pointer"
            onClick={handleToggleSelection}
            style={{
              // 确保触摸目标最小 44x44px (CLAUDE.md 标准)
              minHeight: '44px',
              minWidth: '44px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
              padding: '8px'
            }}
          >
            <div
              className={cn(
                "flex items-center justify-center",
                "w-5 h-5 rounded-sm border-[1.5px]",
                "transition-all duration-200 ease-out",
                "hover:scale-105 active:scale-95",
                "backdrop-blur-md",
                isSelected
                  ? "bg-green-600 border-green-600 shadow-md shadow-green-600/40"
                  : "bg-white/95 border-white/80 hover:border-green-400 hover:bg-green-50/95 shadow-sm"
              )}
            >
              {isSelected && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* 图片区域 */}
        <div className="relative">
          {imageLoading && (
            <div 
              className="w-full bg-muted/30 animate-pulse flex items-center justify-center"
              style={{ height: '200px' }}
            >
              <span className="text-xs text-muted-foreground">加载中...</span>
            </div>
          )}
          
          {imageError && !imageLoading && (
            <div 
              className="w-full bg-muted/30 flex flex-col items-center justify-center text-muted-foreground"
              style={{ height: '200px' }}
            >
              <span className="text-sm">图片加载失败</span>
            </div>
          )}

          {!imageLoading && !imageError && imageSrc && (
            <img
              src={imageSrc}
              alt={image.filename}
              className="w-full h-auto object-cover"
              style={{
                // 确保触摸目标最小 44x44px (CLAUDE.md 标准)
                minHeight: '44px'
              }}
            />
          )}

          {/* 公开状态标识 */}
          <div className="absolute top-2 right-2">
            <Badge 
              variant={image.isPublic ? "default" : "secondary"}
              className="text-xs"
            >
              {image.isPublic ? (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  公开
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  私有
                </>
              )}
            </Badge>
          </div>

          {/* 操作按钮 */}
          {!isSelectionMode && (
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    const currentIndex = images.findIndex(img => img.id === image.id)
                    openPreview(images, currentIndex >= 0 ? currentIndex : 0)
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    预览
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openEditor(image)}>
                    <Edit className="h-4 w-4 mr-2" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async (e) => {
                    e.stopPropagation()
                    try {
                      const imageUrl = await getImageUrl(image.id.toString(), false) // 获取原图
                      if (imageUrl) {
                        const link = document.createElement('a')
                        link.href = imageUrl
                        link.download = image.filename
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }
                    } catch (error) {
                      console.error('下载图片失败:', error)
                    }
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    下载
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDeleteDialog(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* 图片元信息 */}
        <div className="p-3 bg-background/80 backdrop-blur-sm space-y-2">
          <div>
            <h3 className="text-sm font-medium truncate" title={image.filename}>
              {image.filename}
            </h3>
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span>{image.width} × {image.height}</span>
              <span>•</span>
              <span className="flex items-center">
                <HardDrive className="h-3 w-3 mr-1" />
                {formatFileSize(image.size)}
              </span>
            </div>
          </div>

          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(image.createdAt)}
          </div>
        </div>
        </MagicCard>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="pt-6">
            <div className="flex items-center justify-center mb-4">
              {/* 带动画的警告图标 */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/20 animate-ping opacity-75" />
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800">
                  <Trash2 className="h-8 w-8 text-red-500 animate-pulse" />
                </div>
              </div>
            </div>
            
            <AlertDialogTitle className="text-center text-xl font-semibold text-foreground mb-2">
              删除图片
            </AlertDialogTitle>
            
            <AlertDialogDescription className="text-center text-base text-muted-foreground mb-4">
              确定要删除这张图片吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {/* 文件信息卡片 - 移出 AlertDialogDescription */}
          <div className="px-6 mb-4">
            <div className="mx-auto max-w-xs p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                {/* 缩略图预览 */}
                <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden bg-muted">
                  {imageSrc ? (
                    <img 
                      src={imageSrc} 
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <HardDrive className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* 文件信息 */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate" title={image.filename}>
                    {image.filename}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {image.width} × {image.height} • {formatFileSize(image.size)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 提示信息 */}
          <div className="px-6 mb-6">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/10 px-3 py-2 rounded-md border border-blue-200 dark:border-blue-800">
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
              此操作会将图片移到回收站，您可以稍后恢复
            </div>
          </div>
          
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel 
              disabled={isDeleting}
              className="flex-1 h-11 font-medium transition-all duration-200 hover:scale-[1.02]"
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteImage}
              disabled={isDeleting}
              className={cn(
                "flex-1 h-11 font-medium transition-all duration-200",
                "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
                "text-white shadow-lg hover:shadow-xl hover:scale-[1.02]",
                "disabled:from-red-300 disabled:to-red-400 disabled:shadow-none disabled:scale-100",
                isDeleting && "cursor-not-allowed"
              )}
            >
              {isDeleting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="relative">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                  <span className="text-sm">删除中...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span>确认删除</span>
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}