'use client'

import { useCallback, useRef, useState, useEffect, useMemo } from 'react'
import LightGallery from 'lightgallery/react'
import { LightGallery as ILightGallery } from 'lightgallery/lightgallery'
import lgZoom from 'lightgallery/plugins/zoom'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgFullscreen from 'lightgallery/plugins/fullscreen'
import { imageDataStore } from '@/lib/store/image/data'
import { useImageModalStore } from '@/hooks/images/use-image-modal'

// 导入样式文件
import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-zoom.css'
import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-fullscreen.css'

/**
 * 图片预览组件
 * 基于 LightGallery 实现图片预览、缩放和幻灯片功能
 */
interface ImageLightboxProps {
  isOpen?: boolean
  onClose?: () => void
  initialIndex?: number
}

export function ImageLightbox({ 
  isOpen = false, 
  onClose,
  initialIndex = 0 
}: ImageLightboxProps) {
  const lightGalleryRef = useRef<ILightGallery | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [galleryContainer, setGalleryContainer] = useState<HTMLDivElement | null>(null)
  const [dynamicData, setDynamicData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // 使用 modal store 的状态
  const { previewImages, currentPreviewIndex } = useImageModalStore()
  
  // 使用 previewImages 而不是直接从 imageDataStore 获取
  const images = previewImages

  // 初始化容器引用
  useEffect(() => {
    if (containerRef.current) {
      setGalleryContainer(containerRef.current)
    }
  }, [])

  // 预加载图片数据
  useEffect(() => {
    const loadGalleryImages = async () => {
      if (images.length === 0) return
      
      setIsLoading(true)
      try {
        const { getImageUrl } = imageDataStore.getState()
        const imageData = await Promise.all(
          images.map(async (image) => {
            const fullUrl = await getImageUrl(image.id.toString(), false)
            const thumbUrl = await getImageUrl(image.id.toString(), true)
            
            return {
              src: fullUrl || `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af">图片加载失败</text></svg>')}`,
              thumb: thumbUrl || fullUrl || '',
              subHtml: `
                <div class="lightgallery-captions">
                  <h4>${image.filename}</h4>
                  <p>尺寸: ${image.width}x${image.height} | 大小: ${formatFileSize(image.size)}</p>
                  <p>创建时间: ${formatDate(image.createdAt)}</p>
                </div>
              `,
              responsive: fullUrl ? `${fullUrl} 800` : '',
            }
          })
        )
        setDynamicData(imageData)
      } catch (error) {
        console.error('预加载图片数据失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadGalleryImages()
  }, [images])

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
    return new Date(dateString).toLocaleString('zh-CN')
  }

  // 初始化回调
  const onInit = useCallback((detail: { instance: ILightGallery }) => {
    if (detail) {
      lightGalleryRef.current = detail.instance
    }
  }, [])

  // 监听打开状态变化
  useEffect(() => {
    if (isOpen && lightGalleryRef.current && !isLoading && dynamicData.length > 0) {
      try {
        // 使用 currentPreviewIndex 而不是 initialIndex
        lightGalleryRef.current.openGallery(currentPreviewIndex)
      } catch (error) {
        // 忽略重复打开的错误
      }
    }
  }, [isOpen, currentPreviewIndex, isLoading, dynamicData])

  // 幻灯片切换前回调
  const onBeforeSlide = useCallback((detail: { index: number; prevIndex: number }) => {
    // 可以在这里添加切换逻辑，如预加载下一张图片等
  }, [])

  // 关闭后回调
  const onCloseAfter = useCallback(() => {
    if (onClose) {
      onClose()
    }
  }, [onClose])

  // 如果没有图片数据或数据正在加载，不渲染
  if (!images.length || !galleryContainer || isLoading || dynamicData.length === 0) {
    return <div ref={containerRef} style={{ display: 'none' }} />
  }

  return (
    <>
      <div ref={containerRef} style={{ display: 'none' }} />
      <LightGallery
        container={galleryContainer}
        onInit={onInit}
        onBeforeSlide={onBeforeSlide}
        onAfterClose={onCloseAfter}
        plugins={[lgZoom, lgThumbnail, lgFullscreen]}
        dynamic={true}
        dynamicEl={dynamicData}
        // 许可证配置 - 开发环境使用GPLv3许可证
        licenseKey="GPLv3"
        // 配置选项
        speed={500}
        thumbnail={true}
        zoom={true}
        fullScreen={true}
        // 关闭按钮和最大化按钮
        closable={true}
        showMaximizeIcon={true}
        // 缩略图配置
        thumbWidth={130}
        thumbHeight={'100px'}
        thumbMargin={6}
        // 字幕配置
        appendSubHtmlTo='.lg-item'
        slideDelay={400}
        // 不使用URL hash
        hash={false}
        // 自定义CSS类
        elementClassNames='hue-image-gallery'
      />
    </>
  )
}