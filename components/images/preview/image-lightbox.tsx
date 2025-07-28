'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
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
export function ImageLightbox() {
  const lightGalleryRef = useRef<ILightGallery | null>(null)
  const [galleryItems, setGalleryItems] = useState<Array<{
    id: string
    src: string
    thumb: string
    subHtml: string
    'data-lg-size': string
  }>>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // 使用 modal store 的状态
  const { previewImages, currentPreviewIndex, isPreviewOpen, closePreview } = useImageModalStore()

  // 预加载图片数据并构建gallery items
  useEffect(() => {
    const loadGalleryImages = async () => {
      if (previewImages.length === 0) {
        setGalleryItems([])
        return
      }
      
      setIsLoading(true)
      try {
        const { getImageUrl } = imageDataStore.getState()
        
        // 创建一个fallback图片的base64编码
        const fallbackImage = `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af">Image Load Failed</text></svg>')}`
        
        const imageData = await Promise.allSettled(
          previewImages.map(async (image) => {
            try {
              const fullUrl = await getImageUrl(image.id.toString(), false)
              const thumbUrl = await getImageUrl(image.id.toString(), true)
              
              return {
                id: image.id.toString(),
                src: fullUrl || fallbackImage,
                thumb: thumbUrl || fullUrl || fallbackImage,
                subHtml: `
                  <div class="lightgallery-captions">
                    <h4>${image.filename}</h4>
                    <p>尺寸: ${image.width}x${image.height} | 大小: ${formatFileSize(image.size)}</p>
                    <p>创建时间: ${formatDate(image.createdAt)}</p>
                  </div>
                `,
                'data-lg-size': `${image.width}-${image.height}`
              }
            } catch (error) {
              return {
                id: image.id.toString(),
                src: fallbackImage,
                thumb: fallbackImage,
                subHtml: `
                  <div class="lightgallery-captions">
                    <h4>${image.filename} (Load Failed)</h4>
                    <p>尺寸: ${image.width}x${image.height} | 大小: ${formatFileSize(image.size)}</p>
                    <p>创建时间: ${formatDate(image.createdAt)}</p>
                  </div>
                `,
                'data-lg-size': `${image.width}-${image.height}`
              }
            }
          })
        )
        
        // 提取成功和失败的结果
        const processedData = imageData.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value
          } else {
            const image = previewImages[index]
            return {
              id: image.id.toString(),
              src: fallbackImage,
              thumb: fallbackImage,
              subHtml: `
                <div class="lightgallery-captions">
                  <h4>${image.filename} (Process Failed)</h4>
                  <p>尺寸: ${image.width}x${image.height} | 大小: ${formatFileSize(image.size)}</p>
                  <p>创建时间: ${formatDate(image.createdAt)}</p>
                </div>
              `,
              'data-lg-size': `${image.width}-${image.height}`
            }
          }
        })
        
        setGalleryItems(processedData)
      } catch (error) {
        setGalleryItems([])
      } finally {
        setIsLoading(false)
      }
    }

    loadGalleryImages()
  }, [previewImages])

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

  // 刷新gallery当items改变时
  useEffect(() => {
    if (lightGalleryRef.current && galleryItems.length > 0) {
      lightGalleryRef.current.refresh()
    }
  }, [galleryItems])

  // 当组件挂载且数据准备好时打开gallery
  useEffect(() => {
    if (lightGalleryRef.current && galleryItems.length > 0) {
      // 使用短延迟确保DOM元素和样式都已就绪，保持动画效果
      setTimeout(() => {
        if (lightGalleryRef.current) {
          lightGalleryRef.current.openGallery(currentPreviewIndex)
        }
      }, 50) // 减少延迟时间，保持动画但提高响应速度
    }
  }, [galleryItems, currentPreviewIndex]) // 移除isPreviewOpen依赖，因为组件已经条件渲染

  // LightGallery 关闭后的回调
  const onAfterClose = useCallback(() => {
    closePreview()
  }, [closePreview])

  // 构建gallery items的渲染函数
  const getGalleryItems = useCallback(() => {
    return galleryItems.map((item) => (
      <div
        key={item.id}
        data-lg-size={item['data-lg-size']}
        className="gallery-item"
        data-src={item.src}
        data-sub-html={item.subHtml}
        style={{ display: 'none' }} // 隐藏原始图片元素，防止显示在页面中
      >
        <img 
          className="img-responsive" 
          src={item.thumb} 
          alt="" 
          style={{ display: 'none' }} // 确保图片也被隐藏
        />
      </div>
    ))
  }, [galleryItems])

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="text-center text-white">
              <div className="mb-4">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              </div>
              <p className="text-lg">正在加载图片...</p>
            </div>
          </div>
        )}
      </>
    )
  }

  // 只有在需要预览且有数据时才渲染LightGallery
  if (!isPreviewOpen || galleryItems.length === 0) {
    return null
  }

  return (
    <LightGallery
      onInit={onInit}
      onAfterClose={onAfterClose}
      plugins={[lgZoom, lgThumbnail, lgFullscreen]}
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
    >
      {getGalleryItems()}
    </LightGallery>
  )
}