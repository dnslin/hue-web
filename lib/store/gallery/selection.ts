// lib/store/gallery/selection.ts
// 瀑布流画廊选择状态管理

import { create } from 'zustand';

/**
 * 画廊选择状态接口
 */
export interface GallerySelectionState {
  // 选择状态
  selectedImageIds: Set<number>;
  isSelectionMode: boolean;
  lastSelectedId: number | null;
  
  // 选择操作方法
  toggleImageSelection: (id: number) => void;
  selectImage: (id: number) => void;
  deselectImage: (id: number) => void;
  selectImages: (ids: number[]) => void;
  deselectImages: (ids: number[]) => void;
  selectAll: (allImageIds: number[]) => void;
  clearSelection: () => void;
  
  // 选择模式控制
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  toggleSelectionMode: () => void;
  
  // 范围选择（Shift+点击）
  rangeSelect: (targetId: number, allImageIds: number[]) => void;
  
  // 查询方法
  isImageSelected: (id: number) => boolean;
  isAllSelected: (imageIds: number[]) => boolean;
  isPartiallySelected: (imageIds: number[]) => boolean;
  getSelectedCount: () => number;
  getSelectedIds: () => number[];
  
  // 批量操作准备
  prepareForBatchOperation: () => number[];
}

/**
 * 初始状态
 */
const initialState = {
  selectedImageIds: new Set<number>(),
  isSelectionMode: false,
  lastSelectedId: null,
};

/**
 * 瀑布流画廊选择 Store
 */
export const useGallerySelectionStore = create<GallerySelectionState>((set, get) => ({
  ...initialState,

  // 切换单个图片的选择状态
  toggleImageSelection: (id: number) => {
    const { selectedImageIds, isSelectionMode } = get();
    const newSelectedIds = new Set(selectedImageIds);
    
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
      // 如果不在选择模式，自动进入选择模式
      if (!isSelectionMode) {
        set({ isSelectionMode: true });
      }
    }
    
    set({ 
      selectedImageIds: newSelectedIds,
      lastSelectedId: id,
    });
  },

  // 选择单个图片
  selectImage: (id: number) => {
    const { selectedImageIds } = get();
    const newSelectedIds = new Set(selectedImageIds);
    newSelectedIds.add(id);
    
    set({ 
      selectedImageIds: newSelectedIds,
      lastSelectedId: id,
    });
  },

  // 取消选择单个图片
  deselectImage: (id: number) => {
    const { selectedImageIds } = get();
    const newSelectedIds = new Set(selectedImageIds);
    newSelectedIds.delete(id);
    
    set({ selectedImageIds: newSelectedIds });
  },

  // 批量选择图片
  selectImages: (ids: number[]) => {
    const { selectedImageIds } = get();
    const newSelectedIds = new Set(selectedImageIds);
    ids.forEach(id => newSelectedIds.add(id));
    
    set({ selectedImageIds: newSelectedIds });
  },

  // 批量取消选择图片
  deselectImages: (ids: number[]) => {
    const { selectedImageIds } = get();
    const newSelectedIds = new Set(selectedImageIds);
    ids.forEach(id => newSelectedIds.delete(id));
    
    set({ selectedImageIds: newSelectedIds });
  },

  // 全选
  selectAll: (allImageIds: number[]) => {
    set({ 
      selectedImageIds: new Set(allImageIds),
      isSelectionMode: true,
    });
  },

  // 清空选择
  clearSelection: () => {
    set({ 
      selectedImageIds: new Set(),
      lastSelectedId: null,
    });
  },

  // 进入选择模式
  enterSelectionMode: () => {
    set({ isSelectionMode: true });
  },

  // 退出选择模式
  exitSelectionMode: () => {
    set({ 
      isSelectionMode: false,
      selectedImageIds: new Set(),
      lastSelectedId: null,
    });
  },

  // 切换选择模式
  toggleSelectionMode: () => {
    const { isSelectionMode } = get();
    if (isSelectionMode) {
      // 退出选择模式时清空选择
      set({ 
        isSelectionMode: false,
        selectedImageIds: new Set(),
        lastSelectedId: null,
      });
    } else {
      set({ isSelectionMode: true });
    }
  },

  // 范围选择（Shift+点击）
  rangeSelect: (targetId: number, allImageIds: number[]) => {
    const { lastSelectedId, selectedImageIds } = get();
    
    if (!lastSelectedId) {
      // 如果没有上次选择的项目，就单独选择这个
      get().selectImage(targetId);
      return;
    }
    
    const lastIndex = allImageIds.indexOf(lastSelectedId);
    const targetIndex = allImageIds.indexOf(targetId);
    
    if (lastIndex === -1 || targetIndex === -1) {
      // 如果找不到索引，就单独选择
      get().selectImage(targetId);
      return;
    }
    
    // 确定范围
    const startIndex = Math.min(lastIndex, targetIndex);
    const endIndex = Math.max(lastIndex, targetIndex);
    const rangeIds = allImageIds.slice(startIndex, endIndex + 1);
    
    // 添加范围内的所有图片到选择
    const newSelectedIds = new Set(selectedImageIds);
    rangeIds.forEach(id => newSelectedIds.add(id));
    
    set({ 
      selectedImageIds: newSelectedIds,
      lastSelectedId: targetId,
      isSelectionMode: true,
    });
  },

  // 判断图片是否被选择
  isImageSelected: (id: number) => {
    return get().selectedImageIds.has(id);
  },

  // 判断是否全选
  isAllSelected: (imageIds: number[]) => {
    const { selectedImageIds } = get();
    if (imageIds.length === 0 || selectedImageIds.size === 0) return false;
    return imageIds.every(id => selectedImageIds.has(id));
  },

  // 判断是否部分选择
  isPartiallySelected: (imageIds: number[]) => {
    const { selectedImageIds } = get();
    if (selectedImageIds.size === 0) return false;
    const selectedCount = imageIds.filter(id => selectedImageIds.has(id)).length;
    return selectedCount > 0 && selectedCount < imageIds.length;
  },

  // 获取选择数量
  getSelectedCount: () => {
    return get().selectedImageIds.size;
  },

  // 获取选择的 ID 数组
  getSelectedIds: () => {
    return Array.from(get().selectedImageIds);
  },

  // 为批量操作准备数据
  prepareForBatchOperation: () => {
    const selectedIds = get().getSelectedIds();
    if (selectedIds.length === 0) {
      throw new Error('没有选择任何图片');
    }
    return selectedIds;
  },
}));

/**
 * 画廊选择存储实例（用于外部访问）
 */
export const gallerySelectionStore = useGallerySelectionStore;

/**
 * 选择相关的派生选择器
 */
export const gallerySelectionSelectors = {
  // 获取选择状态摘要
  getSelectionSummary: (totalCount: number) => {
    const { selectedImageIds, isSelectionMode } = useGallerySelectionStore.getState();
    const selectedCount = selectedImageIds.size;
    
    return {
      isSelectionMode,
      selectedCount,
      totalCount,
      hasSelection: selectedCount > 0,
      isAllSelected: selectedCount === totalCount && totalCount > 0,
      isPartiallySelected: selectedCount > 0 && selectedCount < totalCount,
      selectionRatio: totalCount > 0 ? selectedCount / totalCount : 0,
    };
  },
  
  // 检查是否可以执行批量操作
  canPerformBatchOperation: () => {
    const { selectedImageIds, isSelectionMode } = useGallerySelectionStore.getState();
    return isSelectionMode && selectedImageIds.size > 0;
  },
  
  // 获取选择模式的显示文本
  getSelectionText: (totalCount: number) => {
    const { selectedImageIds } = useGallerySelectionStore.getState();
    const selectedCount = selectedImageIds.size;
    
    if (selectedCount === 0) {
      return '未选择任何项目';
    } else if (selectedCount === 1) {
      return '已选择 1 项';
    } else if (selectedCount === totalCount) {
      return `全部 ${totalCount} 项已选择`;
    } else {
      return `已选择 ${selectedCount} / ${totalCount} 项`;
    }
  },
};