// lib/constants/gallery.ts
// 瀑布流图片画廊相关常量定义

import type { 
  WaterfallGalleryConfig, 
  ImageLoadStrategy, 
  GestureType 
} from '@/lib/types/gallery';

/**
 * 默认瀑布流布局配置
 */
export const DEFAULT_WATERFALL_CONFIG: WaterfallGalleryConfig = {
  layout: {
    columns: {
      mobile: 2,
      tablet: 3,
      desktop: 4,
    },
    gap: 12, // 12px 间距，符合项目 gap-3 标准
    minItemHeight: 200,
    maxItemHeight: 600,
    virtualScrolling: true,
  },
  virtualScroll: {
    bufferSize: 2, // 上下各缓冲2屏高度
    estimatedItemHeight: 300,
    scrollThrottle: 16, // 60fps
    enableScrollOptimization: true,
  },
  performance: {
    loadStrategy: 'lazy',
    maxConcurrentLoads: 6,
    imageQuality: 85,
    enableWebP: true,
    thumbnailSize: {
      width: 400,
      height: 300,
    },
  },
  accessibility: {
    enableKeyboardNavigation: true,
    enableScreenReader: true,
    focusIndicatorStyle: 'ring-2 ring-primary ring-offset-2',
    imageDescriptionStrategy: 'filename',
  },
  preview: {
    enabled: true,
    animationDuration: 300, // 符合项目标准过渡时间
    plugins: ['lg-zoom', 'lg-thumbnail', 'lg-fullscreen'],
  },
  editor: {
    enabled: true,
    tools: [
      'crop',
      'rotate',
      'flip',
      'filters',
      'adjust',
      'resize',
      'text',
      'shapes',
    ],
    maxFileSize: 50 * 1024 * 1024, // 50MB
  },
};

/**
 * 响应式断点（与项目保持一致）
 */
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
} as const;

/**
 * 图片加载策略选项
 */
export const IMAGE_LOAD_STRATEGIES: ImageLoadStrategy[] = [
  'eager',
  'lazy', 
  'progressive'
];

/**
 * 支持的手势类型
 */
export const SUPPORTED_GESTURES: GestureType[] = [
  'tap',
  'longPress',
  'pinch',
  'pan',
  'swipe'
];

/**
 * 长按手势识别时间（毫秒）
 */
export const LONG_PRESS_DURATION = 500;

/**
 * 双击识别时间间隔（毫秒）
 */
export const DOUBLE_CLICK_INTERVAL = 300;

/**
 * 最小滑动距离（像素）
 */
export const MIN_SWIPE_DISTANCE = 50;

/**
 * 图片缓存配置
 */
export const IMAGE_CACHE_CONFIG = {
  /** 缓存时间（毫秒）- 24小时 */
  TTL: 24 * 60 * 60 * 1000,
  /** 最大缓存数量 */
  MAX_CACHE_SIZE: 1000,
  /** 清理阈值（达到此比例时清理） */
  CLEANUP_THRESHOLD: 0.8,
} as const;

/**
 * 虚拟滚动性能配置
 */
export const VIRTUAL_SCROLL_CONFIG = {
  /** 滚动节流时间 */
  SCROLL_THROTTLE: 16,
  /** 渲染节流时间 */
  RENDER_THROTTLE: 8,
  /** 最大同时渲染项目数 */
  MAX_RENDER_ITEMS: 200,
  /** 预渲染项目数 */
  PRERENDER_ITEMS: 20,
} as const;

/**
 * LightGallery 默认配置
 */
export const LIGHTGALLERY_CONFIG = {
  plugins: ['lg-zoom', 'lg-thumbnail', 'lg-fullscreen'],
  speed: 300, // 符合项目动画标准
  thumbnail: true,
  animateThumb: true,
  showThumbByDefault: false,
  thumbWidth: 100,
  thumbHeight: 80,
  thumbMargin: 5,
  appendThumbnailsTo: '.lg-components',
  toggleThumb: true,
  enableThumbDrag: true,
  enableThumbSwipe: true,
  thumbSwipeThreshold: 50,
  loadYouTubeThumbnail: false,
  youTubeThumbSize: 1,
  loadVimeoThumbnail: false,
  vimeoThumbSize: 'thumbnail_medium',
  // 全屏配置
  fullScreen: true,
  // 缩放配置
  zoom: true,
  scale: 1,
  enableZoomAfter: 300,
  // 主题配置
  addClass: 'lg-hue-theme', // 自定义主题类
  appendSubHtmlTo: '.lg-sub-html',
  preload: 2,
  showAfterLoad: true,
  selector: 'a',
  selectWithin: '',
  nextHtml: '',
  prevHtml: '',
  index: 0,
  iframeMaxWidth: '100%',
  download: true,
  counter: true,
  appendCounterTo: '.lg-toolbar',
  swipeThreshold: 50,
  enableSwipe: true,
  enableDrag: true,
  dynamic: true,
  dynamicEl: [],
  extraProps: [],
  exThumbImage: '',
  isMobile: undefined,
  mobileSettings: {
    controls: false,
    showCloseIcon: true,
    download: false,
    rotate: false,
  },
  closable: true,
  loop: true,
  escKey: true,
  keyPress: true,
  controls: true,
  slideEndAnimation: true,
  hideControlOnEnd: false,
  mousewheel: true,
  getCaptionFromTitleOrAlt: true,
  appendSelector: '.lg-components',
  ariaLabelledby: '',
  ariaDescribedby: '',
  closableClass: 'lg-closable',
  youtubePlayerParams: false,
  vimeoPlayerParams: false,
  wistiaPlayerParams: false,
  gotoNextSlideOnVideoEnd: true,
  autoplayFirstVideo: true,
  videojs: false,
  videojsTheme: '',
  videojsOptions: {},
} as const;

/**
 * Filerobot 图片编辑器默认配置
 */
export const FILEROBOT_EDITOR_CONFIG = {
  // 主题配置（符合项目色彩系统）
  theme: {
    palette: {
      'bg-primary': 'oklch(1 0 0)', // --background
      'bg-secondary': 'oklch(0.97 0 0)', // --secondary  
      'txt-primary': 'oklch(0.145 0 0)', // --foreground
      'txt-secondary': 'oklch(0.565 0 0)', // muted foreground
      'accent-primary': 'oklch(0.205 0 0)', // --primary
      'accent-primary-active': 'oklch(0.185 0 0)', // primary hover
      'icons-primary': 'oklch(0.145 0 0)',
      'icons-secondary': 'oklch(0.565 0 0)',
      'borders-primary': 'oklch(0.89 0 0)', // --border
      'borders-secondary': 'oklch(0.97 0 0)',
      'light-shadow': '0 2px 8px rgba(0, 0, 0, 0.06)', // shadow-sm
      'heavy-shadow': '0 4px 12px rgba(0, 0, 0, 0.1)', // shadow
    },
    typography: {
      fontFamily: 'Geist Sans, system-ui, -apple-system, sans-serif',
    },
  },
  // 可用工具配置
  annotationsCommon: {
    fill: '#ff0000',
    stroke: '#ff0000',
    strokeWidth: 1,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: '#000000',
    shadowAlpha: 1,
    opacity: 1,
  },
  Crop: {
    minWidth: 50,
    minHeight: 50,
    maxWidth: 4000,
    maxHeight: 4000,
    ratio: 'custom',
    ratioTitleKey: '自定义',
    autoResize: false,
    presetsItems: [
      { titleKey: '原始比例', descriptionKey: '保持原始宽高比', ratio: 0 },
      { titleKey: '正方形', descriptionKey: '1:1', ratio: 1 },
      { titleKey: '横屏16:9', descriptionKey: '16:9', ratio: 16 / 9 },
      { titleKey: '竖屏9:16', descriptionKey: '9:16', ratio: 9 / 16 },
      { titleKey: '横屏4:3', descriptionKey: '4:3', ratio: 4 / 3 },
      { titleKey: '竖屏3:4', descriptionKey: '3:4', ratio: 3 / 4 },
    ],
  },
  Resize: {
    minWidth: 50,
    minHeight: 50,
    maxWidth: 8000,
    maxHeight: 8000,
    autoResize: false,
    preserveRatio: true,
  },
  Rotate: {
    angle: 90,
    componentType: 'buttons',
  },
  Flip: {
    componentType: 'buttons',
  },
  Brightness: {
    range: [-100, 100],
    value: 0,
  },
  Contrast: {
    range: [-100, 100], 
    value: 0,
  },
  HSV: {
    hue: { range: [-100, 100], value: 0 },
    saturation: { range: [-100, 100], value: 0 },
    value: { range: [-100, 100], value: 0 },
  },
  // 文本工具配置
  Text: {
    text: '添加文本',
    fontFamily: 'Geist Sans',
    fontSize: 20,
    letterSpacing: 0,
    lineHeight: 1,
    align: 'left',
    fontStyle: 'normal',
    fontVariant: 'normal',
    fontWeight: 'normal',
    fill: '#000000',
    stroke: '',
    strokeWidth: 0,
    padding: 0,
  },
  // 滤镜配置
  filters: [
    { name: 'original', titleKey: '原图' },
    { name: 'clarendon', titleKey: '克拉伦登' },
    { name: 'gingham', titleKey: '金厄姆' },
    { name: 'moon', titleKey: '月光' },
    { name: 'lark', titleKey: '云雀' },
    { name: 'reyes', titleKey: '瑞耶斯' },
    { name: 'juno', titleKey: '朱诺' },
    { name: 'slumber', titleKey: '睡眠' },
    { name: 'aden', titleKey: '亚丁' },
    { name: 'perpetua', titleKey: '佩尔佩图阿' },
  ],
  // 本地化配置
  language: 'zh',
  translations: {
    zh: {
      'generic.cancel': '取消',
      'generic.apply': '应用',
      'generic.save': '保存',
      'generic.download': '下载',
      'generic.loading': '加载中...',
      'toolbar.download': '下载',
      'toolbar.save': '保存',
      'toolbar.apply': '应用',
      'toolbar.cancel': '取消',
    },
  },
  // 保存配置
  savingPixelRatio: 1,
  previewPixelRatio: 1,
  observePluginContainerSize: true,
  showCanvasOnly: false,
  useBackendTranslations: false,
  avoidChangesNotSavedAlertOnLeave: true,
} as const;

/**
 * 瀑布流动画配置（符合项目标准）
 */
export const GALLERY_ANIMATIONS = {
  /** 图片项入场动画 */
  ITEM_ENTER: {
    duration: 200,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    keyframes: [
      { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
      { opacity: 1, transform: 'translateY(0px) scale(1)' },
    ],
  },
  /** 图片项悬停动画 */
  ITEM_HOVER: {
    duration: 150,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', // shadow-lg
  },
  /** 选中状态动画 */
  ITEM_SELECT: {
    duration: 200,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // elastic
    transform: 'scale(0.98)',
    borderColor: 'oklch(0.205 0 0)', // --primary
  },
  /** 加载动画 */
  LOADING: {
    duration: 1500,
    easing: 'ease-in-out',
    infinite: true,
    keyframes: [
      { opacity: 0.3 },
      { opacity: 0.7 },
      { opacity: 0.3 },
    ],
  },
} as const;

/**
 * 错误处理配置
 */
export const ERROR_CONFIG = {
  /** 图片加载失败重试次数 */
  MAX_RETRY_COUNT: 3,
  /** 重试间隔（毫秒） */
  RETRY_DELAY: 1000,
  /** 错误展示时间（毫秒） */
  ERROR_DISPLAY_DURATION: 5000,
  /** 默认错误图片占位符 */
  DEFAULT_ERROR_IMAGE: '/images/error-placeholder.svg',
  /** 默认加载图片占位符 */
  DEFAULT_LOADING_IMAGE: '/images/loading-placeholder.svg',
} as const;

/**
 * SEO 和元数据配置
 */
export const SEO_CONFIG = {
  /** 默认图片Alt文本模板 */
  DEFAULT_ALT_TEMPLATE: '图片 {filename}',
  /** 图片标题模板 */
  TITLE_TEMPLATE: '{filename} - {width}x{height}',
  /** 结构化数据类型 */
  STRUCTURED_DATA_TYPE: 'ImageGallery',
} as const;