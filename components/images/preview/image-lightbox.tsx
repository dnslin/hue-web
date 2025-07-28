'use client'

import { useCallback, useRef, useState, useEffect, useMemo } from 'react'
import LightGallery from 'lightgallery/react'
import { LightGallery as ILightGallery } from 'lightgallery/lightgallery'
import lgZoom from 'lightgallery/plugins/zoom'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgFullscreen from 'lightgallery/plugins/fullscreen'
import { imageDataStore } from '@/lib/store/image/data'
import { useStore } from 'zustand'

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
  
  const { images } = useStore(imageDataStore)

  // 初始化容器引用
  useEffect(() => {
    if (containerRef.current) {
      setGalleryContainer(containerRef.current)
    }
  }, [])

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

  // 准备 LightGallery 动态数据
  const dynamicEl = useMemo(() => 
    images.map(image => ({
      src: image.url,
      thumb: image.url, // 可以使用缩略图URL if available
      subHtml: `
        <div class="lightgallery-captions">
          <h4>${image.filename}</h4>
          <p>尺寸: ${image.width}x${image.height} | 大小: ${formatFileSize(image.size)}</p>
          <p>创建时间: ${formatDate(image.createdAt)}</p>
        </div>
      `,
      responsive: `${image.url} 800`, // 响应式图片
    }))
  , [images])

  // 初始化回调
  const onInit = useCallback((detail: { instance: ILightGallery }) => {
    if (detail) {
      lightGalleryRef.current = detail.instance
      // 如果需要打开画廊，可以在这里调用 openGallery
      if (isOpen) {
        lightGalleryRef.current.openGallery(initialIndex)
      }
    }
  }, [isOpen, initialIndex])

  // 幻灯片切换前回调
  const onBeforeSlide = useCallback((detail: { index: number; prevIndex: number }) => {
    const { index, prevIndex } = detail
    console.log('切换图片:', { from: prevIndex, to: index })
  }, [])

  // 关闭后回调
  const onCloseAfter = useCallback(() => {
    if (onClose) {
      onClose()
    }
  }, [onClose])

  // 如果没有图片数据，不渲染
  if (!images.length || !galleryContainer) {
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
        dynamicEl={dynamicEl}
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