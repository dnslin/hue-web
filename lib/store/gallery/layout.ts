// lib/store/gallery/layout.ts
// 瀑布流画廊布局状态管理

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WaterfallGalleryConfig, WaterfallLayoutConfig, GalleryImageItem } from '@/lib/types/gallery';

/**
 * 容器尺寸信息
 */
export interface ContainerSize {
  width: number;
  height: number;
}

/**
 * 列信息
 */
export interface ColumnInfo {
  index: number;
  height: number;
  width: number;
  items: GalleryImageItem[];
}

/**
 * 视口信息
 */
export interface ViewportInfo {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  visibleRange: {
    start: number;
    end: number;
  };
}

/**
 * 画廊布局状态接口
 */
export interface GalleryLayoutState {
  // 容器和视口状态
  containerSize: ContainerSize;
  viewportInfo: ViewportInfo;
  
  // 布局配置
  layoutConfig: WaterfallLayoutConfig;
  columnCount: number;
  actualGap: number;
  itemWidth: number;
  
  // 列状态
  columns: ColumnInfo[];
  totalHeight: number;
  
  // 虚拟滚动状态
  virtualScrollEnabled: boolean;
  bufferSize: number;
  renderRange: {
    startIndex: number;
    endIndex: number;
  };
  
  // 响应式状态
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  isInitialized: boolean;
  
  // 操作方法
  updateContainerSize: (size: ContainerSize) => void;
  updateViewportInfo: (info: Partial<ViewportInfo>) => void;
  updateLayoutConfig: (config: Partial<WaterfallLayoutConfig>) => void;
  
  // 布局计算方法
  calculateLayout: (images: GalleryImageItem[]) => void;
  recalculateLayout: () => void;
  resetLayout: () => void;
  
  // 列操作方法
  getShortestColumn: () => ColumnInfo;
  addItemToColumn: (item: GalleryImageItem, columnIndex: number) => void;
  removeItemFromColumn: (itemId: number) => void;
  
  // 虚拟滚动方法
  updateRenderRange: () => void;
  setVirtualScrollEnabled: (enabled: boolean) => void;
  updateBufferSize: (size: number) => void;
  
  // 响应式方法
  updateBreakpoint: (width: number) => void;
  getColumnCountForBreakpoint: (breakpoint: 'mobile' | 'tablet' | 'desktop') => number;
  
  // 查询方法
  getVisibleItems: () => GalleryImageItem[];
  getItemPosition: (itemId: number) => { columnIndex: number; itemIndex: number } | null;
  isItemVisible: (itemId: number) => boolean;
  
  // 初始化方法
  initialize: (config: WaterfallGalleryConfig, containerSize: ContainerSize) => void;
}

/**
 * 默认布局配置
 */
const defaultLayoutConfig: WaterfallLayoutConfig = {
  columns: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
  gap: 16,
  minItemHeight: 200,
  maxItemHeight: 800,
  virtualScrolling: true,
};

/**
 * 初始状态
 */
const initialState = {
  containerSize: { width: 0, height: 0 },
  viewportInfo: {
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
    visibleRange: { start: 0, end: 0 },
  },
  layoutConfig: defaultLayoutConfig,
  columnCount: 0,
  actualGap: 16,
  itemWidth: 0,
  columns: [],
  totalHeight: 0,
  virtualScrollEnabled: true,
  bufferSize: 2,
  renderRange: { startIndex: 0, endIndex: 0 },
  breakpoint: 'desktop' as const,
  isInitialized: false,
};

/**
 * 瀑布流画廊布局 Store
 */
export const useGalleryLayoutStore = create<GalleryLayoutState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 更新容器尺寸
      updateContainerSize: (size: ContainerSize) => {
        const { containerSize, isInitialized } = get();
        
        // 检查是否真的发生了变化
        if (containerSize.width !== size.width || containerSize.height !== size.height) {
          set({ containerSize: size });
          
          // 如果已初始化，重新计算布局
          if (isInitialized) {
            get().updateBreakpoint(size.width);
            get().recalculateLayout();
          }
        }
      },

      // 更新视口信息
      updateViewportInfo: (info: Partial<ViewportInfo>) => {
        const { viewportInfo } = get();
        const newViewportInfo = { ...viewportInfo, ...info };
        
        set({ viewportInfo: newViewportInfo });
        
        // 更新渲染范围
        get().updateRenderRange();
      },

      // 更新布局配置
      updateLayoutConfig: (config: Partial<WaterfallLayoutConfig>) => {
        const { layoutConfig } = get();
        const newConfig = { ...layoutConfig, ...config };
        
        set({ layoutConfig: newConfig });
        
        // 重新计算布局
        get().recalculateLayout();
      },

      // 计算布局
      calculateLayout: (images: GalleryImageItem[]) => {
        const { containerSize, columnCount, actualGap, layoutConfig } = get();
        
        if (containerSize.width <= 0 || columnCount <= 0) return;
        
        // 计算项目宽度
        const itemWidth = Math.floor(
          (containerSize.width - actualGap * (columnCount - 1)) / columnCount
        );
        
        // 初始化列
        const columns: ColumnInfo[] = Array.from({ length: columnCount }, (_, index) => ({
          index,
          height: 0,
          width: itemWidth,
          items: [],
        }));
        
        // 为每个图片计算位置
        images.forEach(image => {
          // 找到最短的列
          const shortestColumn = columns.reduce((prev, current) => 
            prev.height < current.height ? prev : current
          );
          
          // 计算显示尺寸
          const aspectRatio = image.width / image.height;
          const displayHeight = Math.min(
            Math.max(itemWidth / aspectRatio, layoutConfig.minItemHeight),
            layoutConfig.maxItemHeight
          );
          
          // 更新图片的显示信息
          const updatedImage: GalleryImageItem = {
            ...image,
            displayWidth: itemWidth,
            displayHeight: displayHeight,
            aspectRatio,
          };
          
          // 添加到列中
          shortestColumn.items.push(updatedImage);
          shortestColumn.height += displayHeight + actualGap;
        });
        
        // 计算总高度
        const totalHeight = Math.max(...columns.map(col => col.height));
        
        set({
          columns,
          itemWidth,
          totalHeight,
        });
        
        // 更新渲染范围
        get().updateRenderRange();
      },

      // 重新计算布局
      recalculateLayout: () => {
        const { columns } = get();
        const allImages = columns.flatMap(col => col.items);
        get().calculateLayout(allImages);
      },

      // 重置布局
      resetLayout: () => {
        set({
          columns: [],
          totalHeight: 0,
          renderRange: { startIndex: 0, endIndex: 0 },
        });
      },

      // 获取最短的列
      getShortestColumn: () => {
        const { columns } = get();
        return columns.reduce((prev, current) => 
          prev.height < current.height ? prev : current
        );
      },

      // 添加项目到列
      addItemToColumn: (item: GalleryImageItem, columnIndex: number) => {
        const { columns, layoutConfig, itemWidth } = get();
        
        if (columnIndex < 0 || columnIndex >= columns.length) return;
        
        const aspectRatio = item.width / item.height;
        const displayHeight = Math.min(
          Math.max(itemWidth / aspectRatio, layoutConfig.minItemHeight),
          layoutConfig.maxItemHeight
        );
        
        const updatedItem: GalleryImageItem = {
          ...item,
          displayWidth: itemWidth,
          displayHeight: displayHeight,
          aspectRatio,
        };
        
        const updatedColumns = [...columns];
        updatedColumns[columnIndex].items.push(updatedItem);
        updatedColumns[columnIndex].height += displayHeight + get().actualGap;
        
        const totalHeight = Math.max(...updatedColumns.map(col => col.height));
        
        set({
          columns: updatedColumns,
          totalHeight,
        });
      },

      // 从列中移除项目
      removeItemFromColumn: (itemId: number) => {
        const { columns, actualGap } = get();
        
        const updatedColumns = columns.map(column => {
          const itemIndex = column.items.findIndex(item => item.id === itemId);
          
          if (itemIndex >= 0) {
            const removedItem = column.items[itemIndex];
            const updatedItems = column.items.filter((_, index) => index !== itemIndex);
            const updatedHeight = column.height - removedItem.displayHeight - actualGap;
            
            return {
              ...column,
              items: updatedItems,
              height: Math.max(0, updatedHeight),
            };
          }
          
          return column;
        });
        
        const totalHeight = Math.max(...updatedColumns.map(col => col.height));
        
        set({
          columns: updatedColumns,
          totalHeight,
        });
      },

      // 更新渲染范围
      updateRenderRange: () => {
        const { 
          viewportInfo, 
          columns, 
          virtualScrollEnabled, 
          bufferSize 
        } = get();
        
        if (!virtualScrollEnabled || columns.length === 0) {
          const totalItems = columns.reduce((sum, col) => sum + col.items.length, 0);
          set({
            renderRange: { startIndex: 0, endIndex: totalItems },
          });
          return;
        }
        
        const { scrollTop, clientHeight } = viewportInfo;
        const bufferHeight = clientHeight * bufferSize;
        
        const visibleTop = Math.max(0, scrollTop - bufferHeight);
        const visibleBottom = scrollTop + clientHeight + bufferHeight;
        
        let startIndex = 0;
        let endIndex = 0;
        let currentIndex = 0;
        
        // 计算可见范围内的项目索引
        for (const column of columns) {
          let columnTop = 0;
          
          for (const item of column.items) {
            const itemBottom = columnTop + item.displayHeight;
            
            if (itemBottom >= visibleTop && startIndex === 0) {
              startIndex = currentIndex;
            }
            
            if (columnTop <= visibleBottom) {
              endIndex = currentIndex + 1;
            }
            
            columnTop = itemBottom + get().actualGap;
            currentIndex++;
          }
        }
        
        set({
          renderRange: { startIndex, endIndex },
          viewportInfo: {
            ...viewportInfo,
            visibleRange: { start: startIndex, end: endIndex },
          },
        });
      },

      // 设置虚拟滚动启用状态
      setVirtualScrollEnabled: (enabled: boolean) => {
        set({ virtualScrollEnabled: enabled });
        get().updateRenderRange();
      },

      // 更新缓冲区大小
      updateBufferSize: (size: number) => {
        set({ bufferSize: Math.max(0, size) });
        get().updateRenderRange();
      },

      // 更新响应式断点
      updateBreakpoint: (width: number) => {
        let breakpoint: 'mobile' | 'tablet' | 'desktop';
        let columnCount: number;
        
        if (width < 768) {
          breakpoint = 'mobile';
          columnCount = get().layoutConfig.columns.mobile;
        } else if (width < 1024) {
          breakpoint = 'tablet';
          columnCount = get().layoutConfig.columns.tablet;
        } else {
          breakpoint = 'desktop';
          columnCount = get().layoutConfig.columns.desktop;
        }
        
        const actualGap = get().layoutConfig.gap;
        
        set({
          breakpoint,
          columnCount,
          actualGap,
        });
      },

      // 获取断点对应的列数
      getColumnCountForBreakpoint: (breakpoint: 'mobile' | 'tablet' | 'desktop') => {
        const { layoutConfig } = get();
        return layoutConfig.columns[breakpoint];
      },

      // 获取可见项目
      getVisibleItems: () => {
        const { columns, renderRange, virtualScrollEnabled } = get();
        
        if (!virtualScrollEnabled) {
          return columns.flatMap(col => col.items);
        }
        
        const allItems = columns.flatMap(col => col.items);
        return allItems.slice(renderRange.startIndex, renderRange.endIndex);
      },

      // 获取项目位置
      getItemPosition: (itemId: number) => {
        const { columns } = get();
        
        for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
          const column = columns[columnIndex];
          const itemIndex = column.items.findIndex(item => item.id === itemId);
          
          if (itemIndex >= 0) {
            return { columnIndex, itemIndex };
          }
        }
        
        return null;
      },

      // 检查项目是否可见
      isItemVisible: (itemId: number) => {
        const visibleItems = get().getVisibleItems();
        return visibleItems.some(item => item.id === itemId);
      },

      // 初始化布局
      initialize: (config: WaterfallGalleryConfig, containerSize: ContainerSize) => {
        set({
          layoutConfig: config.layout,
          containerSize,
          virtualScrollEnabled: config.layout.virtualScrolling,
          isInitialized: true,
        });
        
        get().updateBreakpoint(containerSize.width);
      },
    }),
    {
      name: 'hue-gallery-layout',
      partialize: (state) => ({
        // 只持久化布局配置
        layoutConfig: state.layoutConfig,
        virtualScrollEnabled: state.virtualScrollEnabled,
        bufferSize: state.bufferSize,
      }),
    }
  )
);

/**
 * 画廊布局存储实例（用于外部访问）
 */
export const galleryLayoutStore = useGalleryLayoutStore;

/**
 * 布局相关的派生选择器
 */
export const galleryLayoutSelectors = {
  // 获取布局摘要
  getLayoutSummary: () => {
    const state = useGalleryLayoutStore.getState();
    return {
      isInitialized: state.isInitialized,
      breakpoint: state.breakpoint,
      columnCount: state.columnCount,
      itemWidth: state.itemWidth,
      totalHeight: state.totalHeight,
      totalItems: state.columns.reduce((sum, col) => sum + col.items.length, 0),
      visibleItems: state.renderRange.endIndex - state.renderRange.startIndex,
    };
  },
  
  // 获取列统计信息
  getColumnStats: () => {
    const { columns } = useGalleryLayoutStore.getState();
    return columns.map(column => ({
      index: column.index,
      itemCount: column.items.length,
      height: column.height,
      averageItemHeight: column.items.length > 0 
        ? column.height / column.items.length 
        : 0,
    }));
  },
  
  // 检查布局是否平衡
  isLayoutBalanced: (tolerance = 100) => {
    const { columns } = useGalleryLayoutStore.getState();
    
    if (columns.length <= 1) return true;
    
    const heights = columns.map(col => col.height);
    const maxHeight = Math.max(...heights);
    const minHeight = Math.min(...heights);
    
    return (maxHeight - minHeight) <= tolerance;
  },
  
  // 获取性能指标
  getPerformanceMetrics: () => {
    const state = useGalleryLayoutStore.getState();
    const totalItems = state.columns.reduce((sum, col) => sum + col.items.length, 0);
    const visibleItems = state.renderRange.endIndex - state.renderRange.startIndex;
    
    return {
      totalItems,
      visibleItems,
      renderRatio: totalItems > 0 ? visibleItems / totalItems : 0,
      virtualScrollEnabled: state.virtualScrollEnabled,
      bufferSize: state.bufferSize,
      memoryFootprint: visibleItems * 0.1, // 估算，单位MB
    };
  },
};