"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Edit, Download, Share2, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryImageItem } from "@/lib/types/gallery";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// 动态导入 LightGallery（减少初始包大小）
let LightGallery: any = null;
let lgZoom: any = null;
let lgThumbnail: any = null;
let lgFullscreen: any = null;

interface ImagePreviewProps {
  /** 图片列表 */
  images: GalleryImageItem[];
  /** 当前显示的图片索引 */
  currentIndex: number;
  /** 预览配置 */
  config: {
    enabled: boolean;
    animationDuration: number;
    plugins: string[];
  };
  /** 关闭回调 */
  onClose: () => void;
  /** 编辑回调 */
  onEdit?: (image: GalleryImageItem) => void;
  /** 索引变化回调 */
  onIndexChange: (index: number) => void;
}

/**
 * 图片预览组件
 * 基于 LightGallery 实现高性能图片预览
 */
export const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  currentIndex,
  config,
  onClose,
  onEdit,
  onIndexChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState<GalleryImageItem | null>(null);

  // 动态加载 LightGallery
  useEffect(() => {
    const loadLightGallery = async () => {
      try {
        const [
          { default: LightGalleryComponent },
          { default: lgZoomPlugin },
          { default: lgThumbnailPlugin },
          { default: lgFullscreenPlugin },
        ] = await Promise.all([
          import('lightgallery/react'),
          import('lightgallery/plugins/zoom'),
          import('lightgallery/plugins/thumbnail'),
          import('lightgallery/plugins/fullscreen'),
        ]);

        LightGallery = LightGalleryComponent;
        lgZoom = lgZoomPlugin;
        lgThumbnail = lgThumbnailPlugin;
        lgFullscreen = lgFullscreenPlugin;
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load LightGallery:', error);
        setIsLoading(false);
      }
    };

    loadLightGallery();
  }, []);

  // 更新当前图片
  useEffect(() => {
    if (images[currentIndex]) {
      setCurrentImage(images[currentIndex]);
    }
  }, [images, currentIndex]);

  // LightGallery 配置
  const lightGallerySettings = {
    plugins: [lgZoom, lgThumbnail, lgFullscreen].filter(Boolean),
    speed: config.animationDuration,
    thumbnail: true,
    animateThumb: true,
    showThumbByDefault: false,
    thumbWidth: 100,
    thumbHeight: 80,
    thumbMargin: 5,
    toggleThumb: true,
    enableThumbDrag: true,
    enableThumbSwipe: true,
    fullScreen: true,
    zoom: true,
    scale: 1,
    enableZoomAfter: 300,
    addClass: 'lg-hue-theme',
    preload: 2,
    showAfterLoad: true,
    download: true,
    counter: true,
    swipeThreshold: 50,
    enableSwipe: true,
    enableDrag: true,
    dynamic: true,
    dynamicEl: images.map(image => ({
      src: image.url,
      thumb: image.thumbnailUrl || image.url,
      subHtml: `
        <div class="lg-sub-html">
          <h4>${image.filename}</h4>
          <p>${image.width} × ${image.height} • ${(image.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      `,
    })),
    index: currentIndex,
    closable: true,
    loop: true,
    escKey: true,
    keyPress: true,
    controls: true,
    slideEndAnimation: true,
    mousewheel: true,
    mobileSettings: {
      controls: false,
      showCloseIcon: true,
      download: false,
      rotate: false,
    },
  };

  // LightGallery 事件处理
  const handleLightGalleryEvents = {
    onInit: (detail: any) => {
      galleryRef.current = detail.instance;
    },
    
    onBeforeSlide: (detail: any) => {
      const { index } = detail.detail;
      onIndexChange(index);
    },
    
    onAfterClose: () => {
      onClose();
    },
  };

  // 自定义工具栏操作
  const handleCustomAction = (action: string) => {
    switch (action) {
      case 'edit':
        if (currentImage && onEdit) {
          onEdit(currentImage);
        }
        break;
        
      case 'download':
        if (currentImage) {
          const link = document.createElement('a');
          link.href = currentImage.url;
          link.download = currentImage.filename;
          link.click();
        }
        break;
        
      case 'share':
        if (currentImage && navigator.share) {
          navigator.share({
            title: currentImage.filename,
            url: currentImage.url,
          });
        }
        break;
        
      case 'close':
        onClose();
        break;
    }
  };

  // 如果还在加载 LightGallery
  if (isLoading || !LightGallery) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
    >
      {/* 自定义顶部工具栏 */}
      <div className="absolute top-0 left-0 right-0 z-[60] bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          {/* 图片信息 */}
          <div className="flex items-center gap-4 text-white">
            {currentImage && (
              <>
                <div>
                  <h3 className="font-medium">{currentImage.filename}</h3>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {currentIndex + 1} / {images.length}
                    </Badge>
                    <span>{currentImage.width} × {currentImage.height}</span>
                    <span>{(currentImage.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={() => handleCustomAction('edit')}
                title="编辑图片"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => handleCustomAction('download')}
              title="下载图片"
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => handleCustomAction('share')}
              title="分享图片"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6 bg-white/30" />
            
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => handleCustomAction('close')}
              title="关闭预览"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* LightGallery 组件 */}
      <div ref={containerRef} className="w-full h-full">
        <LightGallery
          {...lightGallerySettings}
          {...handleLightGalleryEvents}
        />
      </div>

      {/* 自定义样式 */}
      <style jsx global>{`
        .lg-hue-theme {
          --lg-backdrop-color: rgba(0, 0, 0, 0.9);
        }
        
        .lg-hue-theme .lg-toolbar {
          display: none; /* 隐藏默认工具栏，使用自定义工具栏 */
        }
        
        .lg-hue-theme .lg-counter {
          display: none; /* 隐藏默认计数器，使用自定义计数器 */
        }
        
        .lg-hue-theme .lg-sub-html {
          display: none; /* 隐藏默认信息显示 */
        }
        
        .lg-hue-theme .lg-thumb-outer {
          background-color: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
        }
        
        .lg-hue-theme .lg-thumb-item {
          border-radius: 8px;
          overflow: hidden;
        }
        
        .lg-hue-theme .lg-thumb-item.lg-thumb-active {
          border-color: hsl(var(--primary));
        }
      `}</style>
    </motion.div>
  );
};

export default ImagePreview;