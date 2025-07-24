// lib/store/gallery/index.ts
// 瀑布流画廊状态管理模块入口

// 导出所有状态管理模块
export * from './data';
export * from './filter';
export * from './selection';
export * from './editor';
export * from './preview';
export * from './layout';

// 导入所有 stores 用于组合
import { useGalleryDataStore, galleryDataSelectors } from './data';
import { useGalleryFilterStore, galleryFilterSelectors } from './filter';
import { useGallerySelectionStore, gallerySelectionSelectors } from './selection';
import { useGalleryEditorStore, galleryEditorSelectors } from './editor';
import { useGalleryPreviewStore, galleryPreviewSelectors } from './preview';
import { useGalleryLayoutStore, galleryLayoutSelectors } from './layout';

/**
 * 整合的画廊状态 Hook
 * 提供所有画廊状态的便捷访问
 */
export const useGalleryStore = () => {
  const data = useGalleryDataStore();
  const filter = useGalleryFilterStore();
  const selection = useGallerySelectionStore();
  const editor = useGalleryEditorStore();
  const preview = useGalleryPreviewStore();
  const layout = useGalleryLayoutStore();

  return {
    data,
    filter,
    selection,
    editor,
    preview,
    layout,
  };
};

/**
 * 画廊状态选择器集合
 */
export const gallerySelectors = {
  data: galleryDataSelectors,
  filter: galleryFilterSelectors,
  selection: gallerySelectionSelectors,
  editor: galleryEditorSelectors,
  preview: galleryPreviewSelectors,
  layout: galleryLayoutSelectors,
};

/**
 * 画廊状态实例集合（用于外部访问）
 */
export const galleryStores = {
  data: useGalleryDataStore,
  filter: useGalleryFilterStore,
  selection: useGallerySelectionStore,
  editor: useGalleryEditorStore,
  preview: useGalleryPreviewStore,
  layout: useGalleryLayoutStore,
};

/**
 * 画廊操作 Hook
 * 提供常用的组合操作
 */
export const useGalleryOperations = () => {
  const data = useGalleryDataStore();
  const filter = useGalleryFilterStore();
  const selection = useGallerySelectionStore();
  const editor = useGalleryEditorStore();
  const preview = useGalleryPreviewStore();
  const layout = useGalleryLayoutStore();

  return {
    // 数据操作
    loadImages: (images: Parameters<typeof data.setImages>[0], totalCount?: number) => {
      data.setImages(images, totalCount);
      layout.calculateLayout(images);
    },

    loadMoreImages: (images: Parameters<typeof data.addImages>[0], hasMore?: boolean) => {
      data.addImages(images, hasMore);
      const allImages = data.images;
      layout.calculateLayout(allImages);
    },

    // 筛选操作
    applyFilter: (filters: Parameters<typeof filter.applyFilters>[0]) => {
      filter.applyFilters(filters);
      data.clearImages(); // 清空当前数据，准备重新加载
      selection.clearSelection(); // 清空选择状态
    },

    changeSorting: (
      sortBy: Parameters<typeof filter.setSorting>[0],
      order: Parameters<typeof filter.setSorting>[1]
    ) => {
      filter.setSorting(sortBy, order);
      data.clearImages(); // 清空当前数据，准备重新加载
      selection.clearSelection(); // 清空选择状态
    },

    // 选择操作
    toggleSelection: (imageId: number, isRangeSelect = false, allImageIds?: number[]) => {
      if (isRangeSelect && allImageIds) {
        selection.rangeSelect(imageId, allImageIds);
      } else {
        selection.toggleImageSelection(imageId);
      }
    },

    enterSelectionMode: () => {
      selection.enterSelectionMode();
    },

    exitSelectionMode: () => {
      selection.exitSelectionMode();
    },

    selectAll: () => {
      const allImageIds = data.images.map(img => img.id);
      selection.selectAll(allImageIds);
    },

    // 预览操作
    openPreview: (imageId: number) => {
      const currentIndex = data.images.findIndex(img => img.id === imageId);
      if (currentIndex >= 0) {
        preview.openPreview(data.images, currentIndex);
      }
    },

    openPreviewAtIndex: (index: number) => {
      if (index >= 0 && index < data.images.length) {
        preview.openPreview(data.images, index);
      }
    },

    // 编辑操作
    openEditor: (imageId: number) => {
      const image = data.images.find(img => img.id === imageId);
      if (image) {
        editor.openEditor(image);
      }
    },

    // 布局操作
    updateLayout: (containerSize: Parameters<typeof layout.updateContainerSize>[0]) => {
      layout.updateContainerSize(containerSize);
    },

    handleScroll: (scrollInfo: Parameters<typeof layout.updateViewportInfo>[0]) => {
      layout.updateViewportInfo(scrollInfo);
    },

    // 批量操作
    batchDelete: () => {
      const selectedIds = selection.getSelectedIds();
      if (selectedIds.length > 0) {
        data.removeImages(selectedIds);
        selection.clearSelection();
        layout.recalculateLayout();
      }
    },

    // 重置所有状态
    resetAll: () => {
      data.resetData();
      filter.resetFilters();
      selection.clearSelection();
      selection.exitSelectionMode();
      editor.resetEditor();
      preview.closePreview();
      layout.resetLayout();
    },

    // 刷新数据
    refresh: () => {
      const queryParams = filter.getQueryParams();
      data.clearImages();
      selection.clearSelection();
      // 这里可以触发重新获取数据的逻辑
      return queryParams;
    },
  };
};

/**
 * 画廊状态统计 Hook
 * 提供跨模块的状态统计信息
 */
export const useGalleryStats = () => {
  const data = useGalleryDataStore(state => ({
    totalImages: state.images.length,
    hasMore: state.hasMore,
    loading: state.loading,
    error: state.error,
  }));

  const selection = useGallerySelectionStore(state => ({
    selectedCount: state.getSelectedCount(),
    isSelectionMode: state.isSelectionMode,
  }));

  const filter = useGalleryFilterStore(state => ({
    hasActiveFilters: galleryFilterSelectors.hasActiveFilters(),
    activeFiltersCount: galleryFilterSelectors.getActiveFiltersCount(),
    currentPage: state.page,
  }));

  const layout = useGalleryLayoutStore(state => ({
    columnCount: state.columnCount,
    breakpoint: state.breakpoint,
    isInitialized: state.isInitialized,
  }));

  const editor = useGalleryEditorStore(state => ({
    isEditorOpen: state.isEditorOpen,
    hasUnsavedChanges: state.hasUnsavedChanges,
  }));

  const preview = useGalleryPreviewStore(state => ({
    isPreviewOpen: state.isPreviewOpen,
    currentPreviewIndex: state.currentIndex,
  }));

  return {
    // 数据统计
    totalImages: data.totalImages,
    selectedCount: selection.selectedCount,
    displayedImages: data.totalImages,
    
    // 状态统计
    isLoading: data.loading,
    hasError: !!data.error,
    hasMore: data.hasMore,
    hasActiveFilters: filter.hasActiveFilters,
    activeFiltersCount: filter.activeFiltersCount,
    
    // 模式状态
    isSelectionMode: selection.isSelectionMode,
    isEditorOpen: editor.isEditorOpen,
    isPreviewOpen: preview.isPreviewOpen,
    hasUnsavedChanges: editor.hasUnsavedChanges,
    
    // 布局状态
    columnCount: layout.columnCount,
    breakpoint: layout.breakpoint,
    isLayoutInitialized: layout.isInitialized,
    
    // 当前页面
    currentPage: filter.currentPage,
    currentPreviewIndex: preview.currentPreviewIndex,
    
    // 计算属性
    selectionRatio: data.totalImages > 0 ? selection.selectedCount / data.totalImages : 0,
    isAllSelected: selection.selectedCount === data.totalImages && data.totalImages > 0,
    isEmpty: data.totalImages === 0 && !data.loading,
    canLoadMore: data.hasMore && !data.loading,
  };
};

/**
 * 主画廊组合 Hook
 * 这是推荐的主要使用方式，集成了所有必要的状态和操作
 */
export const useWaterfallGallery = () => {
  const stores = useGalleryStore();
  const operations = useGalleryOperations();
  const stats = useGalleryStats();

  return {
    // 状态
    ...stores,
    
    // 操作
    operations,
    
    // 统计
    stats,
    
    // 选择器
    selectors: gallerySelectors,
  };
};