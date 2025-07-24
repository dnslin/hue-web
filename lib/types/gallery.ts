// lib/types/gallery.ts
// 瀑布流图片画廊相关类型定义，集成现有的 image.ts 类型系统

import type { ImageResponse, ImageDetail, ImageFilters, ImageSortBy } from './image';
import type { BaseQueryParams, PaginationMeta, LoadingState } from './common';

/**
 * 瀑布流布局配置
 */
export interface WaterfallLayoutConfig {
  /** 列数配置 */
  columns: {
    mobile: number;    // 移动端列数（默认2）
    tablet: number;    // 平板列数（默认3）
    desktop: number;   // 桌面列数（默认4）
  };
  /** 列间距（px） */
  gap: number;
  /** 图片项最小高度（px） */
  minItemHeight: number;
  /** 图片项最大高度（px） */
  maxItemHeight: number;
  /** 是否启用虚拟滚动 */
  virtualScrolling: boolean;
}

/**
 * 图片项在瀑布流中的扩展信息
 */
export interface GalleryImageItem extends ImageResponse {
  /** 计算后的显示宽度 */
  displayWidth: number;
  /** 计算后的显示高度 */
  displayHeight: number;
  /** 宽高比 */
  aspectRatio: number;
  /** 是否已选中 */
  selected?: boolean;
  /** 是否正在加载 */
  loading?: boolean;
  /** 缩略图URL（可选） */
  thumbnailUrl?: string;
}

/**
 * 瀑布流查询参数，扩展基础查询参数和图片过滤器
 */
export interface GalleryQueryParams extends BaseQueryParams {
  /** 图片过滤条件 */
  filters?: ImageFilters;
  /** 排序字段 */
  sortBy?: ImageSortBy;
  /** 预加载图片数量 */
  preloadCount?: number;
  /** 是否只获取有尺寸信息的图片 */
  withDimensions?: boolean;
}

/**
 * 瀑布流状态
 */
export interface GalleryState extends LoadingState {
  /** 图片列表 */
  images: GalleryImageItem[];
  /** 分页信息 */
  pagination: PaginationMeta;
  /** 布局配置 */
  layoutConfig: WaterfallLayoutConfig;
  /** 当前视口信息 */
  viewport: {
    width: number;
    height: number;
    scrollTop: number;
  };
  /** 选中的图片ID列表 */
  selectedIds: number[];
  /** 查询参数 */
  queryParams: GalleryQueryParams;
  /** 是否有更多数据 */
  hasMore: boolean;
  /** 是否正在加载更多 */
  loadingMore: boolean;
}

/**
 * 图片预览模态框状态
 */
export interface ImagePreviewState {
  /** 是否显示预览 */
  visible: boolean;
  /** 当前预览的图片索引 */
  currentIndex: number;
  /** 预览的图片列表 */
  images: ImageDetail[];
  /** 是否显示缩略图导航 */
  showThumbnails: boolean;
  /** 是否全屏模式 */
  isFullscreen: boolean;
  /** 缩放级别 */
  zoomLevel: number;
}

/**
 * 图片编辑器状态
 */
export interface ImageEditorState {
  /** 是否显示编辑器 */
  visible: boolean;
  /** 正在编辑的图片 */
  currentImage?: ImageDetail;
  /** 编辑器配置 */
  config: {
    /** 可用的编辑工具 */
    tools: string[];
    /** 主题配置 */
    theme: {
      colors: Record<string, string>;
      fontFamily: string;
    };
    /** 本地化配置 */
    locale: string;
  };
  /** 编辑历史 */
  history: {
    canUndo: boolean;
    canRedo: boolean;
  };
  /** 是否正在保存 */
  saving: boolean;
}

/**
 * 批量操作状态
 */
export interface BatchOperationState extends LoadingState {
  /** 操作类型 */
  operationType?: string;
  /** 受影响的图片数量 */
  affectedCount: number;
  /** 操作进度（0-100） */
  progress: number;
  /** 操作结果 */
  result?: {
    successCount: number;
    failedCount: number;
    failedItems: Array<{
      id: number;
      filename: string;
      error: string;
    }>;
  };
}

/**
 * 图片尺寸缓存项
 */
export interface ImageDimensionCache {
  /** 图片ID */
  imageId: number;
  /** 原始宽度 */
  originalWidth: number;
  /** 原始高度 */
  originalHeight: number;
  /** 宽高比 */
  aspectRatio: number;
  /** 缓存时间戳 */
  cachedAt: number;
  /** 缓存过期时间（毫秒） */
  ttl: number;
}

/**
 * 瀑布流渲染项
 */
export interface WaterfallRenderItem {
  /** 图片数据 */
  image: GalleryImageItem;
  /** 渲染位置信息 */
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** 所在列索引 */
  columnIndex: number;
  /** 是否在可视区域内 */
  inViewport: boolean;
}

/**
 * 瀑布流列信息
 */
export interface WaterfallColumn {
  /** 列索引 */
  index: number;
  /** 列当前高度 */
  height: number;
  /** 列中的图片项 */
  items: WaterfallRenderItem[];
}

/**
 * 虚拟滚动配置
 */
export interface VirtualScrollConfig {
  /** 缓冲区大小（屏幕高度的倍数） */
  bufferSize: number;
  /** 预估图片高度 */
  estimatedItemHeight: number;
  /** 滚动节流时间（ms） */
  scrollThrottle: number;
  /** 是否启用滚动优化 */
  enableScrollOptimization: boolean;
}

/**
 * 图片加载策略
 */
export type ImageLoadStrategy = 'eager' | 'lazy' | 'progressive';

/**
 * 瀑布流性能配置
 */
export interface PerformanceConfig {
  /** 图片加载策略 */
  loadStrategy: ImageLoadStrategy;
  /** 最大并发加载数 */
  maxConcurrentLoads: number;
  /** 图片质量（1-100） */
  imageQuality: number;
  /** 是否启用WebP */
  enableWebP: boolean;
  /** 缩略图尺寸 */
  thumbnailSize: {
    width: number;
    height: number;
  };
}

/**
 * 手势识别类型
 */
export type GestureType = 'tap' | 'longPress' | 'pinch' | 'pan' | 'swipe';

/**
 * 手势事件数据
 */
export interface GestureEvent {
  /** 手势类型 */
  type: GestureType;
  /** 触发的图片项 */
  target?: GalleryImageItem;
  /** 手势坐标 */
  position: {
    x: number;
    y: number;
  };
  /** 额外数据 */
  data?: {
    scale?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    velocity?: number;
  };
}

/**
 * 无障碍访问配置
 */
export interface AccessibilityConfig {
  /** 是否启用键盘导航 */
  enableKeyboardNavigation: boolean;
  /** 是否启用屏幕阅读器支持 */
  enableScreenReader: boolean;
  /** 焦点指示器样式 */
  focusIndicatorStyle: string;
  /** 图片描述策略 */
  imageDescriptionStrategy: 'filename' | 'alt' | 'auto';
}

/**
 * 瀑布流完整配置
 */
export interface WaterfallGalleryConfig {
  /** 布局配置 */
  layout: WaterfallLayoutConfig;
  /** 虚拟滚动配置 */
  virtualScroll: VirtualScrollConfig;
  /** 性能配置 */
  performance: PerformanceConfig;
  /** 无障碍配置 */
  accessibility: AccessibilityConfig;
  /** 预览配置 */
  preview: {
    /** 是否启用预览 */
    enabled: boolean;
    /** 预览动画持续时间 */
    animationDuration: number;
    /** 支持的预览插件 */
    plugins: string[];
  };
  /** 编辑配置 */
  editor: {
    /** 是否启用编辑 */
    enabled: boolean;
    /** 可用工具列表 */
    tools: string[];
    /** 最大文件大小（字节） */
    maxFileSize: number;
  };
}

/**
 * 瀑布流事件类型
 */
export type GalleryEventType = 
  | 'imageClick'
  | 'imageDoubleClick'
  | 'imageLongPress'
  | 'imageSelect'
  | 'imageDeselect'
  | 'batchSelect'
  | 'scrollEnd'
  | 'loadMore'
  | 'previewOpen'
  | 'previewClose'
  | 'editorOpen'
  | 'editorClose';

/**
 * 瀑布流事件数据
 */
export interface GalleryEvent<T = unknown> {
  /** 事件类型 */
  type: GalleryEventType;
  /** 事件数据 */
  data: T;
  /** 事件时间戳 */
  timestamp: number;
}

/**
 * 瀑布流操作结果
 */
export interface GalleryOperationResult<T = unknown> {
  /** 是否成功 */
  success: boolean;
  /** 结果数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 受影响的项目数量 */
  affectedCount?: number;
}