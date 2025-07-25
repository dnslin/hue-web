// lib/store/images/selection.ts
// 图片选择状态管理

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface ImageSelectionState {
  selectedImageIds: Set<number>;
  lastSelectedId: number | null;
}

interface ImageSelectionActions {
  selectImage: (id: number) => void;
  deselectImage: (id: number) => void;
  toggleImage: (id: number) => void;
  selectAll: (imageIds: number[]) => void;
  selectRange: (startId: number, endId: number, allIds: number[]) => void;
  clearSelection: () => void;
  isImageSelected: (id: number) => boolean;
  getSelectedCount: () => number;
  getSelectedIds: () => number[];
}

type ImageSelectionStore = ImageSelectionState & ImageSelectionActions;

export const useImageSelectionStore = create<ImageSelectionStore>()(
  subscribeWithSelector((set, get) => ({
    // 状态
    selectedImageIds: new Set<number>(),
    lastSelectedId: null,

    // 操作
    selectImage: (id: number) => {
      set((state) => ({
        selectedImageIds: new Set([...state.selectedImageIds, id]),
        lastSelectedId: id,
      }));
    },

    deselectImage: (id: number) => {
      set((state) => {
        const newSelected = new Set(state.selectedImageIds);
        newSelected.delete(id);
        return {
          selectedImageIds: newSelected,
          lastSelectedId: newSelected.size > 0 ? state.lastSelectedId : null,
        };
      });
    },

    toggleImage: (id: number) => {
      const { selectedImageIds } = get();
      if (selectedImageIds.has(id)) {
        get().deselectImage(id);
      } else {
        get().selectImage(id);
      }
    },

    selectAll: (imageIds: number[]) => {
      set({
        selectedImageIds: new Set(imageIds),
        lastSelectedId: imageIds.length > 0 ? imageIds[imageIds.length - 1] : null,
      });
    },

    selectRange: (startId: number, endId: number, allIds: number[]) => {
      const startIndex = allIds.indexOf(startId);
      const endIndex = allIds.indexOf(endId);
      
      if (startIndex === -1 || endIndex === -1) return;
      
      const minIndex = Math.min(startIndex, endIndex);
      const maxIndex = Math.max(startIndex, endIndex);
      const rangeIds = allIds.slice(minIndex, maxIndex + 1);
      
      set((state) => ({
        selectedImageIds: new Set([...state.selectedImageIds, ...rangeIds]),
        lastSelectedId: endId,
      }));
    },

    clearSelection: () => {
      set({
        selectedImageIds: new Set<number>(),
        lastSelectedId: null,
      });
    },

    isImageSelected: (id: number) => {
      return get().selectedImageIds.has(id);
    },

    getSelectedCount: () => {
      return get().selectedImageIds.size;
    },

    getSelectedIds: () => {
      return Array.from(get().selectedImageIds);
    },
  }))
);

// 便捷的hooks
export const useImageSelection = () => {
  const store = useImageSelectionStore();
  return {
    selectedImageIds: store.selectedImageIds,
    selectedCount: store.selectedImageIds.size,
    lastSelectedId: store.lastSelectedId,
    selectImage: store.selectImage,
    deselectImage: store.deselectImage,
    toggleImage: store.toggleImage,
    selectAll: store.selectAll,
    selectRange: store.selectRange,
    clearSelection: store.clearSelection,
    isImageSelected: store.isImageSelected,
    getSelectedIds: store.getSelectedIds,
  };
};