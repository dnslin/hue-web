// lib/types/gallery.ts
// 图片瀑布流组件专用类型定义

import { ImageItem, WaterfallConfig } from './image';

/**
 * Virtuoso Masonry 相关类型
 */
export interface VirtuosoMasonryProps {
  items: ImageItem[];
  columns: number;
  itemContent: (index: number, item: ImageItem) => React.ReactNode;
  gap?: number;
  overscan?: number;
  scrollSeekConfiguration?: ScrollSeekConfiguration;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 滚动优化配置
 */
export interface ScrollSeekConfiguration {
  enter: (velocity: number) => boolean;
  exit: (velocity: number) => boolean;
  change: (velocity: number, range: ListRange) => void;
}

/**
 * 列表范围类型
 */
export interface ListRange {
  startIndex: number;
  endIndex: number;
}

/**
 * 图片项尺寸信息
 */
export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  // 瀑布流计算后的显示尺寸
  displayWidth?: number;
  displayHeight?: number;
}

/**
 * 图片项位置信息
 */
export interface ImagePosition {
  column: number;
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * 瀑布流项目类型
 */
export interface WaterfallItem extends ImageItem {
  // 缓存的尺寸信息
  dimensions?: ImageDimensions;
  // 计算后的位置信息
  position?: ImagePosition;
  // 加载状态
  loaded?: boolean;
  // 错误状态
  loadError?: boolean;
}

/**
 * 瀑布流状态
 */
export interface WaterfallState {
  // 当前配置
  config: WaterfallConfig;
  // 当前列数
  columns: number;
  // 列高度追踪
  columnHeights: number[];
  // 容器宽度
  containerWidth: number;
  // 项目宽度
  itemWidth: number;
  // 布局计算完成标志
  layoutReady: boolean;
}

/**
 * 瀑布流操作类型
 */
export type WaterfallAction = 
  | { type: 'SET_CONFIG'; payload: WaterfallConfig }
  | { type: 'SET_COLUMNS'; payload: number }
  | { type: 'SET_CONTAINER_WIDTH'; payload: number }
  | { type: 'RESET_LAYOUT' }
  | { type: 'UPDATE_COLUMN_HEIGHT'; payload: { column: number; height: number } };

/**
 * LightGallery 配置类型
 */
export interface LightGalleryConfig {
  // 核心配置
  selector?: string;
  mode: 'lg-slide' | 'lg-fade' | 'lg-zoom-in' | 'lg-zoom-in-big' | 'lg-zoom-out' | 'lg-zoom-out-big';
  cssEasing: string;
  easing: string;
  speed: number;
  
  // 插件配置
  plugins: Array<'lg-zoom' | 'lg-thumbnail' | 'lg-fullscreen' | 'lg-autoplay' | 'lg-pager'>;
  
  // 缩放插件配置
  zoom?: {
    scale?: number;
    enableZoomAfter?: number;
  };
  
  // 缩略图插件配置
  thumbnail?: {
    showThumb?: boolean;
    thumbWidth?: number;
    thumbHeight?: number;
    thumbMargin?: number;
  };
  
  // 全屏插件配置
  fullscreen?: {
    exitOnEsc?: boolean;
  };
  
  // 样式相关
  addClass?: string;
  closable?: boolean;
  loop?: boolean;
  escKey?: boolean;
  keyPress?: boolean;
  controls?: boolean;
  slideEndAnimation?: boolean;
  hideControlOnEnd?: boolean;
  mousewheel?: boolean;
  
  // 响应式配置
  mobileSettings?: {
    controls: boolean;
    showCloseIcon: boolean;
    download: boolean;
    rotate: boolean;
  };
}

/**
 * 图片预览模态框状态
 */
export interface PreviewModalState {
  isOpen: boolean;
  currentIndex: number;
  images: ImageItem[];
  config: LightGalleryConfig;
}

/**
 * Filerobot Editor 配置类型
 */
export interface FilerobotEditorConfig {
  // 基础配置
  source: string;
  onSave: (editedImageObject: any, designState: any) => void;
  onClose: () => void;
  
  // 编辑器选项
  annotationsCommon?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowBlur?: number;
    shadowColor?: string;
    shadowOpacity?: number;
  };
  
  // 工具栏配置
  tabsIds?: Array<
    | 'Adjust'
    | 'Annotate' 
    | 'Watermark'
    | 'Finetune'
    | 'Filters'
    | 'Resize'
    | 'Crop'
  >;
  
  // 主题配置
  theme?: {
    palette?: {
      'bg-primary'?: string;
      'bg-secondary'?: string;
      'accent-primary'?: string;
      'accent-primary-active'?: string;
      'icons-primary'?: string;
      'icons-secondary'?: string;
      'borders-secondary'?: string;
      'borders-primary'?: string;
      'borders-strong'?: string;
      'light-shadow'?: string;
      'finish-button'?: string;
      'finish-button-active'?: string;
      'finish-button-text'?: string;
      'warning'?: string;
    };
    typography?: {
      fontFamily?: string;
    };
  };
  
  // 本地化配置
  language?: 'en' | 'zh' | 'zh-CN';
  translations?: Record<string, any>;
  
  // 保存配置
  savingPixelRatio?: number;
  previewPixelRatio?: number;
  observePluginContainerSize?: boolean;
  useBackendTranslations?: boolean;
  
  // 默认值配置
  defaultSavedImageName?: string;
  defaultSavedImageType?: 'png' | 'jpeg' | 'jpg' | 'webp';
  defaultSavedImageQuality?: number;
  forceToPngInEllipticalCrop?: boolean;
}

/**
 * 图片编辑模态框状态
 */
export interface EditorModalState {
  isOpen: boolean;
  image: ImageItem | null;
  config: FilerobotEditorConfig;
  loading: boolean;
  error: string | null;
}

/**
 * 瀑布流加载状态
 */
export interface WaterfallLoadingState {
  // 初始加载
  initialLoading: boolean;
  // 加载更多
  loadingMore: boolean;
  // 图片预加载状态
  preloadingImages: Set<number>;
  // 错误状态
  error: string | null;
  // 重试次数
  retryCount: number;
}

/**
 * 瀑布流性能监控类型
 */
export interface WaterfallPerformance {
  // 渲染性能
  renderTime: number;
  // 布局计算时间
  layoutTime: number;
  // 图片加载时间
  imageLoadTime: Record<number, number>;
  // 内存使用情况
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

/**
 * 瀑布流组件 Props
 */
export interface WaterfallGalleryProps {
  // 数据
  images: ImageItem[];
  loading?: boolean;
  error?: string | null;
  
  // 配置
  config?: Partial<WaterfallConfig>;
  
  // 事件处理
  onLoadMore?: () => void;
  onImageClick?: (image: ImageItem, index: number) => void;
  onImageSelect?: (imageId: number) => void;
  onImagePreview?: (image: ImageItem, index: number) => void;
  onImageEdit?: (image: ImageItem) => void;
  onImageDelete?: (image: ImageItem) => void;
  
  // 选择状态
  selectedIds?: number[];
  multiSelect?: boolean;
  
  // 样式
  className?: string;
  style?: React.CSSProperties;
  
  // 性能配置
  enableVirtualization?: boolean;
  overscan?: number;
  enableScrollSeek?: boolean;
  
  // 调试模式
  debug?: boolean;
}

/**
 * 图片网格项组件 Props
 */
export interface ImageGridItemProps {
  image: WaterfallItem;
  index: number;
  width: number;
  selected?: boolean;
  loading?: boolean;
  
  // 事件处理
  onClick?: (image: ImageItem, index: number) => void;
  onSelect?: (imageId: number) => void;
  onPreview?: (image: ImageItem, index: number) => void;
  onEdit?: (image: ImageItem) => void;
  onDelete?: (image: ImageItem) => void;
  onLoad?: (imageId: number, dimensions: ImageDimensions) => void;
  onError?: (imageId: number, error: string) => void;
  
  // 样式配置
  borderRadius?: number;
  showOverlay?: boolean;
  showActions?: boolean;
  showMetadata?: boolean;
  
  // 动画配置
  enableHoverEffect?: boolean;
  enableSelectAnimation?: boolean;
  
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 预览对话框组件 Props
 */
export interface PreviewDialogProps {
  images: ImageItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (image: ImageItem) => void;
  onDelete?: (image: ImageItem) => void;
  onDownload?: (image: ImageItem) => void;
  config?: Partial<LightGalleryConfig>;
}

/**
 * 编辑器对话框组件 Props
 */
export interface EditorDialogProps {
  image: ImageItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedImage: any, originalImage: ImageItem) => void;
  config?: Partial<FilerobotEditorConfig>;
  loading?: boolean;
  error?: string | null;
}

/**
 * 瀑布流钩子返回类型
 */
export interface UseWaterfallGallery {
  // 状态
  state: WaterfallState;
  loadingState: WaterfallLoadingState;
  previewState: PreviewModalState;
  editorState: EditorModalState;
  
  // 操作方法
  actions: {
    updateConfig: (config: Partial<WaterfallConfig>) => void;
    updateColumns: (columns: number) => void;
    resetLayout: () => void;
    loadMore: () => void;
    previewImage: (image: ImageItem, index: number) => void;
    editImage: (image: ImageItem) => void;
    closePreview: () => void;
    closeEditor: () => void;
    selectImage: (imageId: number) => void;
    selectAll: () => void;
    deselectAll: () => void;
    deleteImages: (imageIds: number[]) => void;
  };
  
  // 性能数据
  performance?: WaterfallPerformance;
  
  // 响应式数据
  responsive: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    screenWidth: number;
    optimalColumns: number;
  };
}

/**
 * 常量定义
 */
export const GALLERY_CONSTANTS = {
  // 默认配置
  DEFAULT_LIGHTGALLERY_CONFIG: {
    mode: 'lg-fade' as const,
    cssEasing: 'ease',
    easing: 'linear',
    speed: 400,
    plugins: ['lg-zoom', 'lg-thumbnail', 'lg-fullscreen'] as const,
    zoom: {
      scale: 1,
      enableZoomAfter: 50,
    },
    thumbnail: {
      showThumb: true,
      thumbWidth: 80,
      thumbHeight: 60,
      thumbMargin: 5,
    },
    fullscreen: {
      exitOnEsc: true,
    },
    addClass: 'hue-lightgallery',
    closable: true,
    loop: true,
    escKey: true,
    keyPress: true,
    controls: true,
    slideEndAnimation: true,
    hideControlOnEnd: false,
    mousewheel: true,
    mobileSettings: {
      controls: false,
      showCloseIcon: true,
      download: true,
      rotate: true,
    },
  } as LightGalleryConfig,
  
  // 默认编辑器配置
  DEFAULT_EDITOR_CONFIG: {
    tabsIds: [
      'Adjust',
      'Annotate', 
      'Finetune',
      'Filters',
      'Resize',
      'Crop'
    ] as const,
    language: 'zh-CN' as const,
    defaultSavedImageType: 'jpeg' as const,
    defaultSavedImageQuality: 0.92,
    savingPixelRatio: 4,
    previewPixelRatio: 1,
    forceToPngInEllipticalCrop: false,
    theme: {
      palette: {
        'bg-primary': 'hsl(var(--background))',
        'bg-secondary': 'hsl(var(--muted))',
        'accent-primary': 'hsl(var(--primary))',
        'accent-primary-active': 'hsl(var(--primary) / 0.9)',
        'icons-primary': 'hsl(var(--foreground))',
        'icons-secondary': 'hsl(var(--muted-foreground))',
        'borders-secondary': 'hsl(var(--border))',
        'borders-primary': 'hsl(var(--border))',
        'borders-strong': 'hsl(var(--foreground) / 0.2)',
        'light-shadow': 'hsl(var(--foreground) / 0.1)',
        'finish-button': 'hsl(var(--primary))',
        'finish-button-active': 'hsl(var(--primary) / 0.9)',
        'finish-button-text': 'hsl(var(--primary-foreground))',
        'warning': 'hsl(var(--destructive))',
      },
      typography: {
        fontFamily: 'var(--font-sans)',
      },
    },
  } as Partial<FilerobotEditorConfig>,
  
  // 性能配置
  PERFORMANCE_CONFIG: {
    // 虚拟化阈值
    VIRTUALIZATION_THRESHOLD: 100,
    // 预加载距离
    PRELOAD_DISTANCE: 5,
    // 滚动优化阈值
    SCROLL_SEEK_VELOCITY_THRESHOLD: 300,
    // 内存监控间隔
    MEMORY_MONITOR_INTERVAL: 30000,
    // 最大重试次数
    MAX_RETRY_COUNT: 3,
    // 布局计算防抖延迟
    LAYOUT_DEBOUNCE_DELAY: 150,
  },
  
  // 响应式断点
  RESPONSIVE_BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
  },
  
  // 动画配置
  ANIMATION_CONFIG: {
    // 标准动画时长
    STANDARD_DURATION: 200,
    // 快速动画时长
    FAST_DURATION: 150,
    // 慢速动画时长
    SLOW_DURATION: 300,
    // 缓动函数
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // 弹性缓动
    ELASTIC_EASING: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;