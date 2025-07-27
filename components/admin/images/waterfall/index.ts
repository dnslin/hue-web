// components/admin/images/waterfall/index.ts
// 瀑布流组件统一导出

export { default as WaterfallGallery } from './waterfall-gallery';
export { default as ImageGridItem } from './image-grid-item';
export { default as PreviewDialog } from './preview-dialog';
export { default as EditorDialog } from './editor-dialog';

// 导出类型
export type {
  WaterfallGalleryProps,
  ImageGridItemProps,
  PreviewDialogProps,
  EditorDialogProps,
} from '@/lib/types/gallery';