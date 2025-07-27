// lib/store/images/gallery.ts
// 瀑布流图片画廊状态管理

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  WaterfallState, 
  WaterfallLoadingState, 
  PreviewModalState, 
  EditorModalState,
  WaterfallAction,
  WaterfallConfig,
  LightGalleryConfig,
  FilerobotEditorConfig,
  GALLERY_CONSTANTS
} from '@/lib/types/gallery';
import { ImageItem, IMAGE_CONSTANTS } from '@/lib/types/image';

/**
 * 瀑布流状态管理接口
 */
interface GalleryStore {
  // 瀑布流状态
  waterfallState: WaterfallState;
  
  // 加载状态
  loadingState: WaterfallLoadingState;
  
  // 预览模态框状态
  previewState: PreviewModalState;
  
  // 编辑器模态框状态
  editorState: EditorModalState;
  
  // 响应式状态
  responsive: {
    screenWidth: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    optimalColumns: number;
  };
  
  // 性能监控状态
  performance: {
    renderStartTime: number;
    lastRenderTime: number;
    imageLoadTimes: Record<number, number>;
    layoutComputeTime: number;
  };
  
  // 状态更新方法
  actions: {
    // 瀑布流配置
    updateWaterfallConfig: (config: Partial<WaterfallConfig>) => void;
    updateColumns: (columns: number) => void;
    updateContainerWidth: (width: number) => void;
    resetLayout: () => void;
    
    // 加载状态管理
    setInitialLoading: (loading: boolean) => void;
    setLoadingMore: (loading: boolean) => void;
    setError: (error: string | null) => void;
    addPreloadingImage: (imageId: number) => void;
    removePreloadingImage: (imageId: number) => void;
    incrementRetryCount: () => void;
    resetRetryCount: () => void;
    
    // 预览管理
    openPreview: (images: ImageItem[], currentIndex: number) => void;
    closePreview: () => void;
    navigatePreview: (direction: 'prev' | 'next') => void;
    updatePreviewConfig: (config: Partial<LightGalleryConfig>) => void;
    
    // 编辑器管理
    openEditor: (image: ImageItem) => void;
    closeEditor: () => void;
    setEditorLoading: (loading: boolean) => void;
    setEditorError: (error: string | null) => void;
    updateEditorConfig: (config: Partial<FilerobotEditorConfig>) => void;
    
    // 响应式管理
    updateScreenWidth: (width: number) => void;
    calculateOptimalColumns: () => void;
    
    // 性能监控
    startRenderTimer: () => void;
    endRenderTimer: () => void;
    recordImageLoadTime: (imageId: number, loadTime: number) => void;
    recordLayoutComputeTime: (computeTime: number) => void;
    
    // 重置所有状态
    reset: () => void;
  };
}

/**
 * 计算响应式列数
 */
function calculateColumns(screenWidth: number, config: WaterfallConfig): number {
  if (screenWidth < GALLERY_CONSTANTS.RESPONSIVE_BREAKPOINTS.MOBILE) {
    return config.columns.mobile;
  } else if (screenWidth < GALLERY_CONSTANTS.RESPONSIVE_BREAKPOINTS.TABLET) {
    return config.columns.tablet;
  } else {
    return config.columns.desktop;
  }
}

/**
 * 响应式状态计算
 */
function calculateResponsiveState(screenWidth: number, config: WaterfallConfig) {
  const isMobile = screenWidth < GALLERY_CONSTANTS.RESPONSIVE_BREAKPOINTS.MOBILE;
  const isTablet = screenWidth >= GALLERY_CONSTANTS.RESPONSIVE_BREAKPOINTS.MOBILE && 
                   screenWidth < GALLERY_CONSTANTS.RESPONSIVE_BREAKPOINTS.TABLET;
  const isDesktop = screenWidth >= GALLERY_CONSTANTS.RESPONSIVE_BREAKPOINTS.TABLET;
  const optimalColumns = calculateColumns(screenWidth, config);
  
  return {
    screenWidth,
    isMobile,
    isTablet,
    isDesktop,
    optimalColumns,
  };
}

/**
 * 初始状态
 */
const initialWaterfallState: WaterfallState = {
  config: IMAGE_CONSTANTS.DEFAULT_WATERFALL_CONFIG,
  columns: IMAGE_CONSTANTS.DEFAULT_WATERFALL_CONFIG.columns.desktop,
  columnHeights: new Array(IMAGE_CONSTANTS.DEFAULT_WATERFALL_CONFIG.columns.desktop).fill(0),
  containerWidth: 0,
  itemWidth: 0,
  layoutReady: false,
};

const initialLoadingState: WaterfallLoadingState = {
  initialLoading: false,
  loadingMore: false,
  preloadingImages: new Set(),
  error: null,
  retryCount: 0,
};

const initialPreviewState: PreviewModalState = {
  isOpen: false,
  currentIndex: 0,
  images: [],
  config: GALLERY_CONSTANTS.DEFAULT_LIGHTGALLERY_CONFIG,
};

const initialEditorState: EditorModalState = {
  isOpen: false,
  image: null,
  config: GALLERY_CONSTANTS.DEFAULT_EDITOR_CONFIG,
  loading: false,
  error: null,
};

const initialResponsiveState = {
  screenWidth: 1024,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  optimalColumns: 4,
};

const initialPerformanceState = {
  renderStartTime: 0,
  lastRenderTime: 0,
  imageLoadTimes: {},
  layoutComputeTime: 0,
};

/**
 * 瀑布流画廊状态管理 Store
 */
export const useGalleryStore = create<GalleryStore>()(
  devtools(
    (set, get) => ({
      // 初始状态
      waterfallState: initialWaterfallState,
      loadingState: initialLoadingState,
      previewState: initialPreviewState,
      editorState: initialEditorState,
      responsive: initialResponsiveState,
      performance: initialPerformanceState,
      
      // 操作方法
      actions: {
        // 瀑布流配置管理
        updateWaterfallConfig: (config: Partial<WaterfallConfig>) =>
          set((state) => {
            const newConfig = { ...state.waterfallState.config, ...config };
            const newColumns = calculateColumns(state.responsive.screenWidth, newConfig);
            const newResponsive = calculateResponsiveState(state.responsive.screenWidth, newConfig);
            
            return {
              waterfallState: {
                ...state.waterfallState,
                config: newConfig,
                columns: newColumns,
                columnHeights: new Array(newColumns).fill(0),
                itemWidth: newColumns > 0 ? 
                  (state.waterfallState.containerWidth - (newColumns - 1) * newConfig.gap) / newColumns : 0,
                layoutReady: false,
              },
              responsive: newResponsive,
            };
          }, false, 'updateWaterfallConfig'),
        
        updateColumns: (columns: number) =>
          set((state) => ({
            waterfallState: {
              ...state.waterfallState,
              columns,
              columnHeights: new Array(columns).fill(0),
              itemWidth: columns > 0 ? 
                (state.waterfallState.containerWidth - (columns - 1) * state.waterfallState.config.gap) / columns : 0,
              layoutReady: false,
            },
          }), false, 'updateColumns'),
        
        updateContainerWidth: (width: number) =>
          set((state) => {
            const itemWidth = state.waterfallState.columns > 0 ? 
              (width - (state.waterfallState.columns - 1) * state.waterfallState.config.gap) / state.waterfallState.columns : 0;
            
            return {
              waterfallState: {
                ...state.waterfallState,
                containerWidth: width,
                itemWidth,
                layoutReady: width > 0,
              },
            };
          }, false, 'updateContainerWidth'),
        
        resetLayout: () =>
          set((state) => ({
            waterfallState: {
              ...state.waterfallState,
              columnHeights: new Array(state.waterfallState.columns).fill(0),
              layoutReady: false,
            },
          }), false, 'resetLayout'),
        
        // 加载状态管理
        setInitialLoading: (loading: boolean) =>
          set((state) => ({
            loadingState: {
              ...state.loadingState,
              initialLoading: loading,
            },
          }), false, 'setInitialLoading'),
        
        setLoadingMore: (loading: boolean) =>
          set((state) => ({
            loadingState: {
              ...state.loadingState,
              loadingMore: loading,
            },
          }), false, 'setLoadingMore'),
        
        setError: (error: string | null) =>
          set((state) => ({
            loadingState: {
              ...state.loadingState,
              error,
            },
          }), false, 'setError'),
        
        addPreloadingImage: (imageId: number) =>
          set((state) => ({
            loadingState: {
              ...state.loadingState,
              preloadingImages: new Set([...state.loadingState.preloadingImages, imageId]),
            },
          }), false, 'addPreloadingImage'),
        
        removePreloadingImage: (imageId: number) =>
          set((state) => {
            const newSet = new Set(state.loadingState.preloadingImages);
            newSet.delete(imageId);
            return {
              loadingState: {
                ...state.loadingState,
                preloadingImages: newSet,
              },
            };
          }, false, 'removePreloadingImage'),
        
        incrementRetryCount: () =>
          set((state) => ({
            loadingState: {
              ...state.loadingState,
              retryCount: state.loadingState.retryCount + 1,
            },
          }), false, 'incrementRetryCount'),
        
        resetRetryCount: () =>
          set((state) => ({
            loadingState: {
              ...state.loadingState,
              retryCount: 0,
            },
          }), false, 'resetRetryCount'),
        
        // 预览管理
        openPreview: (images: ImageItem[], currentIndex: number) =>
          set((state) => ({
            previewState: {
              ...state.previewState,
              isOpen: true,
              currentIndex: Math.max(0, Math.min(currentIndex, images.length - 1)),
              images,
            },
          }), false, 'openPreview'),
        
        closePreview: () =>
          set((state) => ({
            previewState: {
              ...state.previewState,
              isOpen: false,
              currentIndex: 0,
              images: [],
            },
          }), false, 'closePreview'),
        
        navigatePreview: (direction: 'prev' | 'next') =>
          set((state) => {
            const { currentIndex, images } = state.previewState;
            let newIndex = currentIndex;
            
            if (direction === 'prev') {
              newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
            } else {
              newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
            }
            
            return {
              previewState: {
                ...state.previewState,
                currentIndex: newIndex,
              },
            };
          }, false, 'navigatePreview'),
        
        updatePreviewConfig: (config: Partial<LightGalleryConfig>) =>
          set((state) => ({
            previewState: {
              ...state.previewState,
              config: { ...state.previewState.config, ...config },
            },
          }), false, 'updatePreviewConfig'),
        
        // 编辑器管理
        openEditor: (image: ImageItem) =>
          set((state) => ({
            editorState: {
              ...state.editorState,
              isOpen: true,
              image,
              loading: false,
              error: null,
            },
          }), false, 'openEditor'),
        
        closeEditor: () =>
          set((state) => ({
            editorState: {
              ...state.editorState,
              isOpen: false,
              image: null,
              loading: false,
              error: null,
            },
          }), false, 'closeEditor'),
        
        setEditorLoading: (loading: boolean) =>
          set((state) => ({
            editorState: {
              ...state.editorState,
              loading,
            },
          }), false, 'setEditorLoading'),
        
        setEditorError: (error: string | null) =>
          set((state) => ({
            editorState: {
              ...state.editorState,
              error,
            },
          }), false, 'setEditorError'),
        
        updateEditorConfig: (config: Partial<FilerobotEditorConfig>) =>
          set((state) => ({
            editorState: {
              ...state.editorState,
              config: { ...state.editorState.config, ...config },
            },
          }), false, 'updateEditorConfig'),
        
        // 响应式管理
        updateScreenWidth: (width: number) =>
          set((state) => {
            const newResponsive = calculateResponsiveState(width, state.waterfallState.config);
            const newColumns = newResponsive.optimalColumns;
            
            // 如果列数发生变化，需要重新计算布局
            const columnsChanged = newColumns !== state.waterfallState.columns;
            
            return {
              responsive: newResponsive,
              waterfallState: columnsChanged ? {
                ...state.waterfallState,
                columns: newColumns,
                columnHeights: new Array(newColumns).fill(0),
                itemWidth: newColumns > 0 ? 
                  (state.waterfallState.containerWidth - (newColumns - 1) * state.waterfallState.config.gap) / newColumns : 0,
                layoutReady: false,
              } : state.waterfallState,
            };
          }, false, 'updateScreenWidth'),
        
        calculateOptimalColumns: () =>
          set((state) => {
            const optimalColumns = calculateColumns(state.responsive.screenWidth, state.waterfallState.config);
            
            if (optimalColumns !== state.waterfallState.columns) {
              return {
                waterfallState: {
                  ...state.waterfallState,
                  columns: optimalColumns,
                  columnHeights: new Array(optimalColumns).fill(0),
                  itemWidth: optimalColumns > 0 ? 
                    (state.waterfallState.containerWidth - (optimalColumns - 1) * state.waterfallState.config.gap) / optimalColumns : 0,
                  layoutReady: false,
                },
                responsive: {
                  ...state.responsive,
                  optimalColumns,
                },
              };
            }
            
            return state;
          }, false, 'calculateOptimalColumns'),
        
        // 性能监控
        startRenderTimer: () =>
          set((state) => ({
            performance: {
              ...state.performance,
              renderStartTime: performance.now(),
            },
          }), false, 'startRenderTimer'),
        
        endRenderTimer: () =>
          set((state) => {
            const renderTime = performance.now() - state.performance.renderStartTime;
            return {
              performance: {
                ...state.performance,
                lastRenderTime: renderTime,
              },
            };
          }, false, 'endRenderTimer'),
        
        recordImageLoadTime: (imageId: number, loadTime: number) =>
          set((state) => ({
            performance: {
              ...state.performance,
              imageLoadTimes: {
                ...state.performance.imageLoadTimes,
                [imageId]: loadTime,
              },
            },
          }), false, 'recordImageLoadTime'),
        
        recordLayoutComputeTime: (computeTime: number) =>
          set((state) => ({
            performance: {
              ...state.performance,
              layoutComputeTime: computeTime,
            },
          }), false, 'recordLayoutComputeTime'),
        
        // 重置所有状态
        reset: () =>
          set({
            waterfallState: initialWaterfallState,
            loadingState: initialLoadingState,
            previewState: initialPreviewState,
            editorState: initialEditorState,
            responsive: initialResponsiveState,
            performance: initialPerformanceState,
          }, false, 'reset'),
      },
    }),
    {
      name: 'hue-gallery-store',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * 导出便捷 hooks
 */
export const useWaterfallState = () => useGalleryStore((state) => state.waterfallState);
export const useLoadingState = () => useGalleryStore((state) => state.loadingState);
export const usePreviewState = () => useGalleryStore((state) => state.previewState);
export const useEditorState = () => useGalleryStore((state) => state.editorState);
export const useResponsiveState = () => useGalleryStore((state) => state.responsive);
export const usePerformanceState = () => useGalleryStore((state) => state.performance);
export const useGalleryActions = () => useGalleryStore((state) => state.actions);