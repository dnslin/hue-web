# hue 图片瀑布流组件开发计划

## 总体架构设计

### 核心页面架构
基于现有系统分析，图片管理模块将采用以下架构：

```
app/(admin)/images/
├── list/
│   └── page.tsx                 # 图片列表页面入口

lib/types/
├── image.ts                     # 图片相关类型定义（新建）

lib/store/images/
├── index.ts                     # 导出文件（新建）
├── data.ts                      # 图片数据管理（新建）
├── filter.ts                    # 筛选逻辑（新建）
├── cache.ts                     # 缓存管理（新建）

lib/actions/images/
├── list.ts                      # 图片列表API方法（新建）

components/admin/images/
├── list/
│   ├── image-list.tsx          # 主列表组件
│   ├── waterfall-gallery.tsx   # 瀑布流组件
│   ├── image-grid-item.tsx     # 图片项组件
│   ├── image-filters.tsx       # 筛选器组件
│   └── image-actions.tsx       # 操作栏组件
```

### 设计原则
1. **现有系统集成**: 完全遵循现有的状态管理、API、样式模式
2. **渐进式开发**: 先基础功能，后瀑布流增强
3. **性能优先**: 大数据量下的流畅体验
4. **移动端友好**: 触摸交互和响应式设计

## 阶段零：图片列表页面基础实现（预计：2-3小时）

### 0.1 核心类型定义创建
- 创建 `lib/types/image.ts` 定义图片实体类型
- 定义图片查询参数、筛选器、API响应类型
- 集成现有的 `BaseQueryParams` 和 `PaginatedApiResponse` 类型
- 创建图片操作相关的枚举和常量

### 0.2 图片状态管理架构
- 创建 `lib/store/images/` 模块化目录
- 实现 `data.ts` - 图片数据管理（参考 user/data.ts 模式）
- 实现 `filter.ts` - 筛选和排序逻辑
- 实现 `cache.ts` - 图片尺寸和预览缓存
- 创建 `index.ts` 统一导出和 hooks

### 0.3 图片API服务扩展
- 扩展 `lib/actions/images/` 添加列表查询方法
- 实现图片分页查询、筛选、搜索功能
- 集成现有的 `getAuthenticatedApiService` 和错误处理
- 添加批量操作支持（选择、删除等）

### 0.4 图片列表页面基础组件
- 创建 `app/(admin)/images/list/page.tsx` 页面入口
- 实现基础的网格布局组件（为瀑布流做准备） 使用 page-container.tsx 
- 创建图片项组件的基础版本
- 添加筛选器和操作栏组件
- 集成 Motion 动画和基础的 Magic UI 效果

## 阶段一：项目集成准备（预计：1-2小时）

### 1.1 依赖包安装配置
- 使用 `pnpm add` 安装 `react-virtuoso` 和 `@virtuoso.dev/masonry`
- 安装 `lightgallery` 及插件：`lg-zoom`、`lg-thumbnail`、`lg-fullscreen`
- 安装 `react-filerobot-image-editor` 图片编辑器
- 验证与现有依赖（React 19, Next.js 15）的兼容性
- 检查与 Motion 动画库的集成兼容性

### 1.2 TypeScript 类型系统集成
- 在 `lib/types/` 下创建 `gallery.ts` 集成现有的 `image.ts` 类型
- 扩展现有的 `ImageResponse` 接口以支持瀑布流需求
- 利用现有的 `BaseQueryParams` 和 `PaginatedApiResponse` 类型
- 创建与现有 API service 兼容的类型定义

### 1.3 项目结构融入
- 在 `components/dashboard/` 下创建图片相关组件
- 利用现有的 `components/shared/` 存放通用组件
- 在 `lib/store/images/` 模块化目录下添加瀑布流状态管理
- 集成现有的 `lib/actions/images/` Server Actions

## 阶段二：shadcn/ui 和 Magic UI 集成设计（预计：2-3小时）

### 2.1 基础组件架构设计
- 创建 `components/dashboard/image-gallery/WaterfallGallery.tsx` 主组件
- 使用现有的 shadcn/ui 组件：`Card`, `Button`, `Dialog`, `DropdownMenu`
- 集成 Magic UI 的 `MagicCard` 用于图片项的鼠标跟踪效果
- 利用 `ShimmerButton` 实现操作按钮的闪烁效果

### 2.2 样式系统集成
- 遵循项目的 OKLCH 色彩系统和 CSS 变量
- 使用项目定义的 `--radius` 系列边框圆角规范
- 应用项目的阴影系统：`shadow-sm`, `shadow`, `shadow-lg`
- 集成项目的 Tailwind CSS 4 配置和工具类

### 2.3 响应式布局适配
- 遵循项目断点：Mobile (< 768px), Tablet (768px-1023px), Desktop (≥ 1024px)
- 实现项目要求的触摸目标标准：最小 44x44px，8px 间距
- 适配移动端底部导航栏（64px height）布局
- 实现 iOS 安全区域适配

## 阶段三：Zustand 状态管理集成（预计：2小时）

### 3.1 模块化状态架构
- 在 `lib/store/images/` 下创建 `gallery.ts` 状态管理
- 参考现有的 `user/` 模块化结构：data.ts, filter.ts, cache.ts
- 集成现有的持久化机制和水合处理
- 遵循现有的领域特定状态管理模式

### 3.2 API 集成设计
- 利用现有的 `lib/actions/images/image.ts` Server Actions
- 集成现有的 `getAuthenticatedApiService` 和错误处理模式
- 使用现有的 camelCase ↔ snake_case 自动转换
- 复用现有的 `AuthenticationError` 处理机制

### 3.3 缓存和优化策略
- 参考现有的 `cache.ts` 模式实现图片尺寸缓存
- 集成现有的批量操作模式（参考 `batch.ts`）
- 利用现有的过滤和排序逻辑（参考 `filter.ts`）

## 阶段四：VirtuosoMasonry 核心集成（预计：3-4小时）

### 4.1 瀑布流布局配置
- 创建 `components/dashboard/image-gallery/VirtuosoMasonryGrid.tsx`
- 集成响应式列数计算（移动端2列，平板3列，桌面4列）
- 使用现有的 `useWindowWidth` hook 模式进行屏幕监听
- 应用项目的网格间距标准：gap-2 到 gap-6

### 4.2 性能优化实现
- 实现 `ScrollSeekPlaceholder` 组件，使用项目的骨架屏设计
- 配置 `isScrolling` 状态优化，减少滚动时的渲染负担
- 集成项目的 `will-change` 和 GPU 加速优化策略
- 应用项目的懒加载和渐进式加载策略

### 4.3 图片尺寸管理
- 创建 `hooks/useImageDimensions.ts` 集成现有的图片 API
- 利用现有的 `ImageResponse` 类型中的 width/height 字段
- 实现尺寸预缓存机制，避免布局重排
- 集成现有的图片优化和错误处理逻辑

## 阶段五：LightGallery 预览功能集成（预计：2-3小时）

### 5.1 预览模态框设计
- 创建 `components/dashboard/image-gallery/ImagePreviewModal.tsx`
- 使用 shadcn/ui 的 `Dialog` 组件作为基础
- 集成项目的模态框动画：0.2s cubic-bezier 过渡
- 应用项目的深度层级和阴影系统

### 5.2 LightGallery 配置集成
- 配置适合项目风格的主题色彩和样式
- 集成缩放、缩略图、全屏等核心插件
- 实现与现有图片 API 的数据对接
- 添加项目风格的加载状态和错误处理

### 5.3 动态内容管理
- 实现与 Zustand store 的状态同步
- 处理图片数据的动态更新和刷新
- 集成现有的图片分享和下载功能
- 适配移动端的触摸交互体验

## 阶段六：Filerobot Editor 编辑功能集成（预计：2-3小时）

### 6.1 编辑器模态框设计
- 创建 `components/dashboard/image-gallery/ImageEditorModal.tsx`
- 使用项目的全屏模态框设计模式
- 集成 Motion 动画库的页面过渡效果
- 应用项目的移动端优先设计原则

### 6.2 编辑器配置定制
- 配置符合项目色彩系统的编辑器主题
- 设置适合中文用户的工具栏和界面
- 集成项目的字体系统（Geist Sans, Geist Mono）
- 添加项目风格的成功/错误反馈机制

### 6.3 编辑结果处理
- 集成现有的图片上传和更新 API
- 实现编辑后的无缝状态更新
- 添加编辑历史和撤销功能
- 优化移动端的编辑体验和性能

## 阶段七：UI 组件和交互完善（预计：2-3小时）

### 7.1 图片项组件设计
- 创建 `components/dashboard/image-gallery/ImageGridItem.tsx`
- 使用 MagicCard 实现鼠标跟踪效果
- 集成 BorderBeam 动画用于选中状态
- 应用项目的卡片悬停效果：translateY(-2px)

### 7.2 操作按钮和菜单
- 使用 ShimmerButton 实现操作按钮
- 集成 shadcn/ui 的 DropdownMenu 用于上下文菜单
- 添加 TypingAnimation 用于状态提示
- 实现项目风格的 Badge 和标签系统

### 7.3 加载和错误状态
- 创建符合项目设计的骨架屏组件
- 使用 NumberTicker 实现计数动画
- 集成 Meteors 背景效果用于空状态
- 添加项目风格的错误边界和降级方案

## 阶段八：移动端优化和可访问性（预计：2小时）

### 8.1 移动端交互优化
- 实现项目要求的触摸目标尺寸标准
- 添加移动端手势支持（长按、滑动）
- 优化移动端的滚动性能和内存使用
- 集成 iOS 安全区域和滚动优化

### 8.2 可访问性实现
- 添加符合 WCAG 标准的键盘导航
- 实现语义化 HTML 和 ARIA 标签
- 确保足够的色彩对比度
- 添加屏幕阅读器支持和焦点管理

### 8.3 性能监控集成
- 集成项目的 Core Web Vitals 监控
- 添加图片加载性能追踪
- 实现渲染性能的监控和优化
- 集成现有的错误收集和报告机制

## 阶段九：Server Actions 和 API 完善（预计：1-2小时）

### 9.1 扩展现有 Actions
- 在 `lib/actions/images/` 下添加瀑布流特定的 Actions
- 集成现有的错误处理和认证机制
- 实现批量操作和分页加载
- 添加图片编辑和保存的 Server Actions

### 9.2 缓存和优化策略
- 利用现有的 API 缓存机制
- 实现图片预加载和懒加载策略
- 添加离线支持和重试机制
- 集成现有的请求去重和防抖逻辑

## 阶段十：测试和文档完善（预计：1小时）

### 10.1 组件测试
- 测试各设备和浏览器的兼容性
- 验证与现有组件系统的集成
- 测试大数据量下的性能表现
- 验证可访问性和键盘导航

### 10.2 中文文档和注释
- 添加完整的中文代码注释
- 编写组件使用文档和最佳实践
- 创建故障排除和常见问题指南
- 补充集成指南和配置说明

## 技术集成要点

### 与现有系统的深度集成
- 充分利用现有的 shadcn/ui + Magic UI 组件系统
- 遵循项目的设计系统和色彩规范
- 集成现有的状态管理和 API 架构
- 复用现有的错误处理和认证机制

### 性能和用户体验优化
- 遵循项目的移动优先设计原则
- 应用项目的动画和交互标准
- 集成现有的性能监控和优化策略
- 确保与项目整体体验的一致性

### 维护性和扩展性
- 遵循项目的模块化架构模式
- 使用项目的类型系统和验证机制
- 集成现有的开发工具和调试方法
- 确保代码的可维护性和扩展性

**总预计开发时间：18-25小时**
**技术栈完全贴合项目现有架构，最大化代码复用和系统集成度**

## 开发优先级和里程碑

### 第一里程碑：基础图片列表页面（阶段零）
- **目标**: 实现可用的图片列表页面，支持基础的网格布局和操作
- **交付物**: 完整的图片列表页面，包含筛选、搜索、分页功能
- **验收标准**: 页面正常显示图片，支持基础操作，响应式设计

### 第二里程碑：瀑布流核心功能（阶段一至四）
- **目标**: 集成 VirtuosoMasonry 实现高性能瀑布流布局
- **交付物**: 流畅的瀑布流展示，支持虚拟滚动和性能优化
- **验收标准**: 大数据量下流畅滚动，移动端体验良好

### 第三里程碑：增强功能完善（阶段五至十）
- **目标**: 添加预览、编辑、高级交互等完整功能
- **交付物**: 功能完备的图片管理系统
- **验收标准**: 所有功能正常运行，用户体验优秀

## 技术决策记录

### 架构选择
- **组件路径**: 选择 `components/admin/images/` 而非 `components/dashboard/`，更符合业务领域划分
- **状态管理**: 采用与用户管理相同的模块化 Zustand 架构
- **页面布局**: 图片列表使用自定义布局而非 PageContainer，以支持复杂的瀑布流需求

### 性能策略
- **渐进式加载**: 先实现基础网格，再升级到虚拟化瀑布流
- **缓存策略**: 图片尺寸缓存 + 预览缓存双重优化
- **移动端优化**: 遵循 44px 触摸目标，iOS 安全区域适配