// lib/store/gallery/preview.ts
// 瀑布流画廊预览状态管理

import { create } from 'zustand';
import type { GalleryImageItem } from '@/lib/types/gallery';

/**
 * 预览模式
 */
export type PreviewMode = 'lightbox' | 'slideshow' | 'fullscreen';

/**
 * 预览过渡动画类型
 */
export type PreviewTransition = 'fade' | 'slide' | 'zoom' | 'none';

/**
 * 画廊预览状态接口
 */
export interface GalleryPreviewState {
  // 预览状态
  isPreviewOpen: boolean;
  currentIndex: number;
  previewImages: GalleryImageItem[];
  previewMode: PreviewMode;
  
  // UI 状态
  isLoading: boolean;
  showThumbnails: boolean;
  showToolbar: boolean;
  isFullscreen: boolean;
  autoPlay: boolean;
  autoPlayInterval: number;
  
  // 缩放和平移
  zoomLevel: number;
  maxZoomLevel: number;
  minZoomLevel: number;
  panOffset: { x: number; y: number };
  
  // 动画配置
  transitionType: PreviewTransition;
  transitionDuration: number;
  
  // 预览配置
  config: {
    enableKeyboardNavigation: boolean;
    enableMouseWheelZoom: boolean;
    enableTouchGestures: boolean;
    enableAutoPlay: boolean;
    thumbnailsPosition: 'bottom' | 'top' | 'left' | 'right';
    backgroundOpacity: number;
  };
  
  // 操作方法
  openPreview: (images: GalleryImageItem[], startIndex?: number) => void;
  closePreview: () => void;
  goToImage: (index: number) => void;
  nextImage: () => void;
  previousImage: () => void;
  
  // UI 控制方法
  toggleThumbnails: () => void;
  toggleToolbar: () => void;
  toggleFullscreen: () => void;
  toggleAutoPlay: () => void;
  setAutoPlayInterval: (interval: number) => void;
  
  // 缩放和平移方法
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoomLevel: (level: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  resetPan: () => void;
  
  // 配置方法
  updateConfig: (config: Partial<GalleryPreviewState['config']>) => void;
  setTransition: (type: PreviewTransition, duration?: number) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  
  // 工具方法
  getCurrentImage: () => GalleryImageItem | null;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  getImageAtIndex: (index: number) => GalleryImageItem | null;
}

/**
 * 默认配置
 */
const defaultConfig = {
  enableKeyboardNavigation: true,
  enableMouseWheelZoom: true,
  enableTouchGestures: true,
  enableAutoPlay: true,
  thumbnailsPosition: 'bottom' as const,
  backgroundOpacity: 0.9,
};

/**
 * 初始状态
 */
const initialState = {
  isPreviewOpen: false,
  currentIndex: 0,
  previewImages: [],
  previewMode: 'lightbox' as const,
  isLoading: false,
  showThumbnails: false,
  showToolbar: true,
  isFullscreen: false,
  autoPlay: false,
  autoPlayInterval: 3000,
  zoomLevel: 1,
  maxZoomLevel: 3,
  minZoomLevel: 0.5,
  panOffset: { x: 0, y: 0 },
  transitionType: 'fade' as const,
  transitionDuration: 300,
  config: defaultConfig,
};

/**
 * 瀑布流画廊预览 Store
 */
export const useGalleryPreviewStore = create<GalleryPreviewState>((set, get) => ({
  ...initialState,

  // 打开预览
  openPreview: (images: GalleryImageItem[], startIndex = 0) => {
    const validIndex = Math.max(0, Math.min(startIndex, images.length - 1));
    
    set({
      isPreviewOpen: true,
      previewImages: images,
      currentIndex: validIndex,
      zoomLevel: 1,
      panOffset: { x: 0, y: 0 },
      isLoading: false,
    });
  },

  // 关闭预览
  closePreview: () => {
    set({
      isPreviewOpen: false,
      previewImages: [],
      currentIndex: 0,
      zoomLevel: 1,
      panOffset: { x: 0, y: 0 },
      autoPlay: false,
      isFullscreen: false,
    });
  },

  // 跳转到指定图片
  goToImage: (index: number) => {
    const { previewImages } = get();
    if (index >= 0 && index < previewImages.length) {
      set({
        currentIndex: index,
        zoomLevel: 1,
        panOffset: { x: 0, y: 0 },
      });
    }
  },

  // 下一张图片
  nextImage: () => {
    const { currentIndex, previewImages } = get();
    if (currentIndex < previewImages.length - 1) {
      set({
        currentIndex: currentIndex + 1,
        zoomLevel: 1,
        panOffset: { x: 0, y: 0 },
      });
    }
  },

  // 上一张图片
  previousImage: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({
        currentIndex: currentIndex - 1,
        zoomLevel: 1,
        panOffset: { x: 0, y: 0 },
      });
    }
  },

  // 切换缩略图显示
  toggleThumbnails: () => {
    set(state => ({ showThumbnails: !state.showThumbnails }));
  },

  // 切换工具栏显示
  toggleToolbar: () => {
    set(state => ({ showToolbar: !state.showToolbar }));
  },

  // 切换全屏模式
  toggleFullscreen: () => {
    const { isFullscreen } = get();
    
    if (!isFullscreen) {
      // 进入全屏
      document.documentElement.requestFullscreen?.();
    } else {
      // 退出全屏
      document.exitFullscreen?.();
    }
    
    set({ isFullscreen: !isFullscreen });
  },

  // 切换自动播放
  toggleAutoPlay: () => {
    set(state => ({ autoPlay: !state.autoPlay }));
  },

  // 设置自动播放间隔
  setAutoPlayInterval: (interval: number) => {
    set({ autoPlayInterval: Math.max(1000, interval) });
  },

  // 放大
  zoomIn: () => {
    const { zoomLevel, maxZoomLevel } = get();
    const newZoomLevel = Math.min(zoomLevel * 1.2, maxZoomLevel);
    set({ zoomLevel: newZoomLevel });
  },

  // 缩小
  zoomOut: () => {
    const { zoomLevel, minZoomLevel } = get();
    const newZoomLevel = Math.max(zoomLevel / 1.2, minZoomLevel);
    set({ zoomLevel: newZoomLevel });
  },

  // 重置缩放
  resetZoom: () => {
    set({ 
      zoomLevel: 1,
      panOffset: { x: 0, y: 0 },
    });
  },

  // 设置缩放级别
  setZoomLevel: (level: number) => {
    const { maxZoomLevel, minZoomLevel } = get();
    const clampedLevel = Math.max(minZoomLevel, Math.min(level, maxZoomLevel));
    set({ zoomLevel: clampedLevel });
  },

  // 设置平移偏移
  setPanOffset: (offset: { x: number; y: number }) => {
    set({ panOffset: offset });
  },

  // 重置平移
  resetPan: () => {
    set({ panOffset: { x: 0, y: 0 } });
  },

  // 更新配置
  updateConfig: (configUpdates: Partial<GalleryPreviewState['config']>) => {
    const { config } = get();
    set({
      config: { ...config, ...configUpdates },
    });
  },

  // 设置过渡动画
  setTransition: (type: PreviewTransition, duration = 300) => {
    set({
      transitionType: type,
      transitionDuration: duration,
    });
  },

  // 设置预览模式
  setPreviewMode: (mode: PreviewMode) => {
    set({ previewMode: mode });
  },

  // 获取当前图片
  getCurrentImage: () => {
    const { previewImages, currentIndex } = get();
    return previewImages[currentIndex] || null;
  },

  // 检查是否可以下一张
  canGoNext: () => {
    const { currentIndex, previewImages } = get();
    return currentIndex < previewImages.length - 1;
  },

  // 检查是否可以上一张
  canGoPrevious: () => {
    const { currentIndex } = get();
    return currentIndex > 0;
  },

  // 获取指定索引的图片
  getImageAtIndex: (index: number) => {
    const { previewImages } = get();
    return previewImages[index] || null;
  },
}));

/**
 * 画廊预览存储实例（用于外部访问）
 */
export const galleryPreviewStore = useGalleryPreviewStore;

/**
 * 预览相关的派生选择器
 */
export const galleryPreviewSelectors = {
  // 获取预览状态摘要
  getPreviewSummary: () => {
    const state = useGalleryPreviewStore.getState();
    return {
      isOpen: state.isPreviewOpen,
      currentIndex: state.currentIndex,
      totalImages: state.previewImages.length,
      currentImage: state.getCurrentImage(),
      canGoNext: state.canGoNext(),
      canGoPrevious: state.canGoPrevious(),
      isZoomed: state.zoomLevel !== 1,
      isPanned: state.panOffset.x !== 0 || state.panOffset.y !== 0,
    };
  },
  
  // 获取导航信息
  getNavigationInfo: () => {
    const { currentIndex, previewImages } = useGalleryPreviewStore.getState();
    return {
      current: currentIndex + 1,
      total: previewImages.length,
      hasNext: currentIndex < previewImages.length - 1,
      hasPrevious: currentIndex > 0,
      progress: previewImages.length > 0 ? (currentIndex + 1) / previewImages.length : 0,
    };
  },
  
  // 获取缩放信息
  getZoomInfo: () => {
    const { zoomLevel, maxZoomLevel, minZoomLevel } = useGalleryPreviewStore.getState();
    return {
      current: zoomLevel,
      max: maxZoomLevel,
      min: minZoomLevel,
      percentage: Math.round(zoomLevel * 100),
      canZoomIn: zoomLevel < maxZoomLevel,
      canZoomOut: zoomLevel > minZoomLevel,
      isDefault: zoomLevel === 1,
    };
  },
  
  // 检查是否支持键盘导航
  supportsKeyboardNavigation: () => {
    const { config, isPreviewOpen } = useGalleryPreviewStore.getState();
    return isPreviewOpen && config.enableKeyboardNavigation;
  },
};