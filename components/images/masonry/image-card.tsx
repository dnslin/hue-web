'use client'

import { motion } from 'motion/react'
import { useState } from 'react'
import { ImageResponse } from '@/lib/types/image'
import { MagicCard } from '@/components/magicui/magic-card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AuthenticatedImage } from '@/components/shared/authenticated-image'
import { imageBatchStore } from '@/lib/store/image/batch'
import { imageDataStore } from '@/lib/store/image/data'
import { useImageModalStore } from '@/hooks/images/use-image-modal'
import { useStore } from 'zustand'
import { 
  Eye, 
  EyeOff, 
  Edit, 
  Download, 
  Trash2, 
  MoreHorizontal,
  FileText,
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

/**
 * 图片卡片组件
 * 遵循 CLAUDE.md 的移动优先设计和触摸标准
 */
interface ImageCardProps {
  image: ImageResponse
}

export function ImageCard({ image }: ImageCardProps) {
  const { 
    isSelectionMode, 
    toggleImageSelection,
    isImageSelected 
  } = useStore(imageBatchStore)
  
  const { images } = useStore(imageDataStore)
  const { openPreview, openEditor } = useImageModalStore()
  
  const isSelected = isImageSelected(image.id)

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
          <div className="absolute top-2 left-2 z-20">
            <Button
              variant={isSelected ? "default" : "secondary"}
              size="sm"
              onClick={handleToggleSelection}
              className="h-8 w-8 p-0 rounded-full"
              style={{
                // 确保触摸目标最小 44x44px (CLAUDE.md 标准)
                minHeight: '44px',
                minWidth: '44px'
              }}
            >
              {isSelected ? '✓' : ''}
            </Button>
          </div>
        )}

        {/* 图片区域 */}
        <div className="relative">
          {!imageLoaded && !imageError && (
            <div 
              className="w-full bg-muted/30 animate-pulse flex items-center justify-center"
              style={{ height: '200px' }}
            >
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
          )}
          
          {imageError ? (
            <div 
              className="w-full bg-muted/30 flex flex-col items-center justify-center text-muted-foreground"
              style={{ height: '200px' }}
            >
              <FileText className="h-8 w-8 mb-2" />
              <span className="text-sm">图片加载失败</span>
            </div>
          ) : (
            <img
              src={image.url}
              alt={image.filename}
              className={`
                w-full h-auto object-cover transition-opacity duration-200
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              `}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
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
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    下载
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
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
    </motion.div>
  )
}