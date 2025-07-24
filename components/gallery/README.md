# 瀑布流图片画廊组件使用说明

这是一个基于 Next.js 15 + React 19 + shadcn/ui + Magic UI 的现代化瀑布流图片画廊组件系统。

## 快速开始

### 基本用法

```tsx
import { WaterfallGallery } from '@/components/gallery';
import type { GalleryImageItem, GalleryQueryParams } from '@/components/gallery';

export default function ImageGalleryPage() {
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [queryParams, setQueryParams] = useState<GalleryQueryParams>({});
  const [loading, setLoading] = useState(false);

  return (
    <div className="h-screen">
      <WaterfallGallery
        images={images}
        queryParams={queryParams}
        loading={loading}
        onQueryChange={setQueryParams}
        onEvent={(event) => {
          console.log('Gallery event:', event);
        }}
      />
    </div>
  );
}
```

### 自定义配置

```tsx
import { WaterfallGallery, DEFAULT_WATERFALL_CONFIG } from '@/components/gallery';

const customConfig = {
  ...DEFAULT_WATERFALL_CONFIG,
  layout: {
    columns: { mobile: 1, tablet: 2, desktop: 3 },
    gap: 16,
    minItemHeight: 150,
    maxItemHeight: 500,
    virtualScrolling: true,
  },
  preview: {
    enabled: true,
    animationDuration: 400,
    plugins: ['lg-zoom', 'lg-thumbnail', 'lg-fullscreen'],
  },
  editor: {
    enabled: true,
    tools: ['crop', 'rotate', 'filters', 'adjust'],
    maxFileSize: 25 * 1024 * 1024, // 25MB
  },
};

<WaterfallGallery config={customConfig} />
```

### 事件处理

```tsx
const handleGalleryEvent = (event: GalleryEvent) => {
  switch (event.type) {
    case 'imageClick':
      console.log('Image clicked:', event.data);
      break;
    case 'imageSelect':
      console.log('Image selected:', event.data);
      break;
    case 'batchSelect':
      console.log('Batch operation:', event.data);
      break;
    case 'previewOpen':
      console.log('Preview opened:', event.data);
      break;
  }
};
```

## 组件架构

### 主组件

- **WaterfallGallery**: 主画廊容器，整合所有功能
- **WaterfallLayout**: 瀑布流布局核心，处理虚拟化和定位
- **GalleryImageItem**: 单个图片项，支持选择和交互

### 功能组件

- **GalleryToolbar**: 搜索、筛选、排序工具栏
- **ImagePreview**: 基于 LightGallery 的图片预览
- **ImageEditor**: 基于 Filerobot 的图片编辑器

### UI 组件

- **GalleryLoadingState**: 加载状态骨架屏
- **GalleryEmptyState**: 多种空状态展示
- **LoadMoreTrigger**: 加载更多触发器

## 设计特性

### 现代化设计

- 遵循项目 OKLCH 色彩系统
- 使用 Magic UI 动画效果
- 支持深色/浅色主题切换
- 10px 圆角设计标准

### 响应式布局

- 移动端优先设计
- 自适应列数：手机2列，平板3列，桌面4列
- 触摸友好的交互设计
- iOS 安全区域适配

### 高性能优化

- 虚拟化长列表渲染
- 图片懒加载和缓存
- GPU 加速动画
- 智能预加载策略

### 无障碍性

- 键盘导航支持
- 屏幕阅读器兼容
- 适当的焦点指示器
- 语义化 HTML 结构

## 配置选项

### 布局配置 (WaterfallLayoutConfig)

```tsx
interface WaterfallLayoutConfig {
  columns: {
    mobile: number;    // 移动端列数
    tablet: number;    // 平板列数  
    desktop: number;   // 桌面列数
  };
  gap: number;                    // 列间距
  minItemHeight: number;          // 最小项目高度
  maxItemHeight: number;          // 最大项目高度
  virtualScrolling: boolean;      // 启用虚拟滚动
}
```

### 性能配置 (PerformanceConfig)

```tsx
interface PerformanceConfig {
  loadStrategy: 'eager' | 'lazy' | 'progressive';
  maxConcurrentLoads: number;     // 最大并发加载数
  imageQuality: number;           // 图片质量 (1-100)
  enableWebP: boolean;            // 启用 WebP 格式
  thumbnailSize: {               
    width: number;
    height: number;
  };
}
```

### 预览配置

```tsx
interface PreviewConfig {
  enabled: boolean;               // 启用预览
  animationDuration: number;      // 动画持续时间
  plugins: string[];              // LightGallery 插件
}
```

### 编辑器配置

```tsx
interface EditorConfig {
  enabled: boolean;               // 启用编辑器
  tools: string[];                // 可用工具
  maxFileSize: number;            // 最大文件大小
}
```

## 类型定义

所有组件都提供完整的 TypeScript 类型支持：

```tsx
import type {
  GalleryImageItem,
  GalleryQueryParams,
  GalleryEvent,
  WaterfallGalleryConfig,
  WaterfallLayoutConfig,
  PerformanceConfig,
} from '@/components/gallery';
```

## 样式定制

组件使用 Tailwind CSS 类名，可以通过传递 `className` 属性进行样式定制：

```tsx
<WaterfallGallery 
  className="custom-gallery-styles"
  config={{
    layout: {
      // 自定义布局配置
    }
  }}
/>
```

## 注意事项

1. **依赖项**: 确保已安装 `react-virtuoso`, `lightgallery`, `react-filerobot-image-editor`
2. **样式**: LightGallery 和 Filerobot Editor 的 CSS 文件需要在应用中导入
3. **图片格式**: 支持 JPEG, PNG, GIF, WebP, AVIF 等格式
4. **浏览器兼容性**: 现代浏览器 (ES2020+)

## 性能建议

- 对于大量图片，启用虚拟滚动
- 使用 WebP 格式减少文件大小
- 合理设置缓存策略
- 移动端适当降低图片质量