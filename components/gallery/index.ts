// 瀑布流图片画廊组件导出
// 基于 shadcn/ui + Magic UI 的现代化瀑布流画廊实现

// 主要组件
export { WaterfallGallery } from "./waterfall-gallery";
export { default as WaterfallGalleryDefault } from "./waterfall-gallery";

// 布局组件
export { WaterfallLayout } from "./waterfall/waterfall-layout";
export { default as WaterfallLayoutDefault } from "./waterfall/waterfall-layout";
export { WaterfallMasonry } from "./waterfall-masonry";

// 图片组件
export { GalleryImageItem } from "./image/gallery-image-item";
export { default as GalleryImageItemDefault } from "./image/gallery-image-item";

// 控制组件
export { GalleryToolbar } from "./controls/gallery-toolbar";
export { default as GalleryToolbarDefault } from "./controls/gallery-toolbar";
export { GalleryToolbar as GalleryToolbarNew } from "./gallery-toolbar";
export { GalleryFilterBar } from "./gallery-filter-bar";

// 预览和编辑组件
export { ImagePreview } from "./preview/image-preview";
export { default as ImagePreviewDefault } from "./preview/image-preview";
export { ImageEditor } from "./editor/image-editor";
export { default as ImageEditorDefault } from "./editor/image-editor";

// UI 状态组件
export { GalleryLoadingState } from "./ui/gallery-loading-state";
export { default as GalleryLoadingStateDefault } from "./ui/gallery-loading-state";
export { GalleryEmptyState } from "./ui/gallery-empty-state";
export { default as GalleryEmptyStateDefault } from "./ui/gallery-empty-state";
export { LoadMoreTrigger } from "./ui/load-more-trigger";
export { default as LoadMoreTriggerDefault } from "./ui/load-more-trigger";

// 类型定义重新导出
export type {
  WaterfallGalleryConfig,
  GalleryImageItem as GalleryImageItemType,
  GalleryQueryParams,
  GalleryEvent,
  GalleryEventType,
  WaterfallLayoutConfig,
  WaterfallRenderItem,
  WaterfallColumn,
  VirtualScrollConfig,
  PerformanceConfig,
  AccessibilityConfig,
  GestureEvent,
  GestureType,
  ImageLoadStrategy,
  GalleryOperationResult,
} from "@/lib/types/gallery";

// 常量重新导出
export {
  DEFAULT_WATERFALL_CONFIG,
  GALLERY_ANIMATIONS,
  LIGHTGALLERY_CONFIG,
  FILEROBOT_EDITOR_CONFIG,
  IMAGE_CACHE_CONFIG,
  VIRTUAL_SCROLL_CONFIG,
  ERROR_CONFIG,
  SEO_CONFIG,
  BREAKPOINTS,
  IMAGE_LOAD_STRATEGIES,
  SUPPORTED_GESTURES,
  LONG_PRESS_DURATION,
  DOUBLE_CLICK_INTERVAL,
  MIN_SWIPE_DISTANCE,
} from "@/lib/constants/gallery";
