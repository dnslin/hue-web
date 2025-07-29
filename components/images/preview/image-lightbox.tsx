'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import { imageDataStore } from '@/lib/store/image/data'
import { useImageModalStore } from '@/hooks/images/use-image-modal'
import 'react-photo-view/dist/react-photo-view.css'

/**
 * 图片预览组件
 * 基于 react-photo-view 实现图片预览、缩放和手势操作
 */
export function ImageLightbox() {
  const [imageDataList, setImageDataList] = useState<Array<{
    src: string
    key: string
    width: number
    height: number
    filename: string
    size: number
    createdAt: string
  }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)

  // 使用 modal store 的状态
  const { 
    previewImages, 
    currentPreviewIndex, 
    isPreviewOpen, 
    closePreview
  } = useImageModalStore()

  // 预加载图片数据
  useEffect(() => {
    const loadImages = async () => {
      if (previewImages.length === 0) {
        setImageDataList([])
        return
      }
      
      setIsLoading(true)
      try {
        const { getImageUrl } = imageDataStore.getState()
        
        // 并行获取所有图片URL
        const imageResults = await Promise.allSettled(
          previewImages.map(async (image) => {
            const fullUrl = await getImageUrl(image.id.toString(), false)
            return {
              src: fullUrl || '',
              key: image.id.toString(),
              width: image.width,
              height: image.height,
              filename: image.filename,
              size: image.size,
              createdAt: image.createdAt
            }
          })
        )
        
        // 提取成功的结果，为失败的图片提供fallback
        const processedData = imageResults
          .map((result, index) => {
            if (result.status === 'fulfilled' && result.value.src) {
              return result.value
            }
            // 为失败的图片提供fallback
            const image = previewImages[index]
            return {
              src: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af">加载失败</text></svg>')}`,
              key: image.id.toString(),
              width: image.width,
              height: image.height,
              filename: image.filename,
              size: image.size,
              createdAt: image.createdAt
            }
          })
        
        setImageDataList(processedData)
      } catch (error) {
        console.error('加载图片数据失败:', error)
        setImageDataList([])
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
  }, [previewImages])

  // 当需要打开预览且数据准备完成时，自动触发点击
  useEffect(() => {
    if (isPreviewOpen && imageDataList.length > 0 && !isLoading && triggerRef.current) {
      // 短延迟确保DOM渲染完成
      const timer = setTimeout(() => {
        if (triggerRef.current) {
          const targetChild = triggerRef.current.children[currentPreviewIndex] as HTMLElement
          if (targetChild) {
            targetChild.click()
          }
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isPreviewOpen, imageDataList.length, isLoading, currentPreviewIndex])

  // 格式化文件大小
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }, [])

  // 格式化日期
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }, [])

  // 自定义工具栏渲染
  const customToolbarRender = useCallback(({ index }: { index: number }) => {
    const currentImage = imageDataList[index]
    if (!currentImage) return null

    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/75 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h4 className="text-lg font-medium truncate">{currentImage.filename}</h4>
            <p className="text-sm text-gray-300">
              尺寸: {currentImage.width}×{currentImage.height} | 
              大小: {formatFileSize(currentImage.size)} | 
              创建时间: {formatDate(currentImage.createdAt)}
            </p>
          </div>
        </div>
      </div>
    )
  }, [imageDataList, formatFileSize, formatDate])

  // 关闭处理
  const handleVisibleChange = useCallback((visible: boolean) => {
    if (!visible) {
      closePreview()
    }
  }, [closePreview])

  // 加载状态
  if (isLoading && isPreviewOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="text-center text-white">
          <div className="mb-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
          <p className="text-lg">正在加载图片...</p>
        </div>
      </div>
    )
  }

  // 只有在需要预览且数据准备完成时才渲染
  if (!isPreviewOpen || imageDataList.length === 0) {
    return null
  }

  return (
    <PhotoProvider
      onVisibleChange={handleVisibleChange}
      speed={() => 400}
      easing={() => "cubic-bezier(0.25, 0.8, 0.25, 1)"}
      photoClosable={false}
      maskClosable={true}
      pullClosable={true}
      bannerVisible={false}
      loop={imageDataList.length >= 3}
      toolbarRender={customToolbarRender}
      className="hue-image-gallery"
    >
      <div ref={triggerRef} style={{ display: 'none' }}>
        {imageDataList.map((item) => (
          <PhotoView
            key={item.key}
            src={item.src}
            width={item.width}
            height={item.height}
          >
            <div />
          </PhotoView>
        ))}
      </div>
    </PhotoProvider>
  )
}