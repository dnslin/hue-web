import { useState, useCallback } from 'react'
import { ImageResponse } from '@/lib/types/image'

/**
 * 图片预览状态管理 Hook
 * 管理LightGallery图片预览的状态
 */
export function useImagePreview() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewImages, setPreviewImages] = useState<ImageResponse[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // 打开预览
  const openPreview = useCallback((images: ImageResponse[], index: number = 0) => {
    setPreviewImages(images)
    setCurrentImageIndex(index)
    setIsPreviewOpen(true)
  }, [])

  // 关闭预览
  const closePreview = useCallback(() => {
    setIsPreviewOpen(false)
    setPreviewImages([])
    setCurrentImageIndex(0)
  }, [])

  // 切换到指定图片
  const goToImage = useCallback((index: number) => {
    if (index >= 0 && index < previewImages.length) {
      setCurrentImageIndex(index)
    }
  }, [previewImages.length])

  return {
    isPreviewOpen,
    previewImages,
    currentImageIndex,
    openPreview,
    closePreview,
    goToImage
  }
}