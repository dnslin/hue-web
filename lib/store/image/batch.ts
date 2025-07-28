// @/lib/store/image/image-batch.store.ts

import { StateCreator } from "zustand";
import { 
  batchDeleteImagesAction, 
  batchMoveImagesToAlbumAction, 
  batchUpdateImagePublicAction 
} from "@/lib/actions/images/image";
import { isSuccessApiResponse } from "@/lib/types/common";
import { handleStoreError } from "@/lib/utils/error-handler";

/**
 * 批量操作状态
 * @description 管理图片的批量操作状态，包括选择、操作进度等。
 */
export interface ImageBatchState {
  /**
   * 当前选中的图片ID列表
   */
  selectedImageIds: Set<number>;
  /**
   * 是否处于批量选择模式
   */
  isSelectionMode: boolean;
  /**
   * 正在进行的批量操作
   */
  batchOperations: {
    deleting: boolean;
    moving: boolean;
    updatingPublic: boolean;
  };
  /**
   * 批量操作的错误信息
   */
  batchError: string | null;
}

/**
 * 批量操作行为
 * @description 定义了所有与图片批量操作相关的操作。
 */
export interface ImageBatchActions {
  /**
   * 切换图片选择状态
   * @param imageId 图片ID
   */
  toggleImageSelection: (imageId: number) => void;
  /**
   * 选择所有图片
   * @param imageIds 图片ID列表
   */
  selectAllImages: (imageIds: number[]) => void;
  /**
   * 取消选择所有图片
   */
  clearSelection: () => void;
  /**
   * 切换选择模式
   * @param enabled 是否启用选择模式
   */
  setSelectionMode: (enabled: boolean) => void;
  /**
   * 批量删除选中的图片
   */
  batchDeleteSelected: () => Promise<boolean>;
  /**
   * 批量移动选中的图片到相册
   * @param albumId 相册ID，null表示移出相册
   */
  batchMoveToAlbum: (albumId: number | null) => Promise<boolean>;
  /**
   * 批量更新选中图片的公开状态
   * @param isPublic 是否公开
   */
  batchUpdatePublicStatus: (isPublic: boolean) => Promise<boolean>;
  /**
   * 检查图片是否被选中
   * @param imageId 图片ID
   */
  isImageSelected: (imageId: number) => boolean;
  /**
   * 获取选中图片的数量
   */
  getSelectedCount: () => number;
}

/**
 * Zustand Store Slice: ImageBatch
 * @description 这个 Slice 包含了图片批量操作的状态和所有相关操作的实现。
 */
export const createImageBatchSlice: StateCreator<
  ImageBatchState & ImageBatchActions,
  [],
  [],
  ImageBatchState & ImageBatchActions
> = (set, get) => ({
  // 初始状态
  selectedImageIds: new Set(),
  isSelectionMode: false,
  batchOperations: {
    deleting: false,
    moving: false,
    updatingPublic: false,
  },
  batchError: null,

  toggleImageSelection: (imageId: number) => {
    set((state) => {
      const newSelectedIds = new Set(state.selectedImageIds);
      if (newSelectedIds.has(imageId)) {
        newSelectedIds.delete(imageId);
      } else {
        newSelectedIds.add(imageId);
      }
      return { selectedImageIds: newSelectedIds };
    });
  },

  selectAllImages: (imageIds: number[]) => {
    set({ selectedImageIds: new Set(imageIds) });
  },

  clearSelection: () => {
    set({ 
      selectedImageIds: new Set(),
      isSelectionMode: false 
    });
  },

  setSelectionMode: (enabled: boolean) => {
    set({ 
      isSelectionMode: enabled,
      // 如果禁用选择模式，清除所有选择
      ...(enabled ? {} : { selectedImageIds: new Set() })
    });
  },

  batchDeleteSelected: async () => {
    const { selectedImageIds } = get();
    const imageIds = Array.from(selectedImageIds);
    
    if (imageIds.length === 0) {
      return false;
    }

    set((state) => ({
      batchOperations: { ...state.batchOperations, deleting: true },
      batchError: null,
    }));

    try {
      const response = await batchDeleteImagesAction(imageIds);

      if (isSuccessApiResponse(response)) {
        // 删除成功，清除选择
        set({
          selectedImageIds: new Set(),
          isSelectionMode: false,
          batchOperations: { deleting: false, moving: false, updatingPublic: false },
        });
        return true;
      } else {
        console.error("❌ 批量删除图片失败:", response.msg);
        const errorResult = await handleStoreError(response, "批量删除图片");
        set((state) => ({
          batchOperations: { ...state.batchOperations, deleting: false },
          batchError: errorResult.error,
        }));
        return false;
      }
    } catch (error) {
      console.error("❌ 批量删除图片时发生未知错误:", error);
      const errorResult = await handleStoreError(error, "批量删除图片");
      set((state) => ({
        batchOperations: { ...state.batchOperations, deleting: false },
        batchError: errorResult.error,
      }));
      return false;
    }
  },

  batchMoveToAlbum: async (albumId: number | null) => {
    const { selectedImageIds } = get();
    const imageIds = Array.from(selectedImageIds);
    
    if (imageIds.length === 0) {
      return false;
    }

    set((state) => ({
      batchOperations: { ...state.batchOperations, moving: true },
      batchError: null,
    }));

    try {
      const response = await batchMoveImagesToAlbumAction(imageIds, albumId);

      if (isSuccessApiResponse(response)) {
        // 移动成功，清除选择
        set({
          selectedImageIds: new Set(),
          isSelectionMode: false,
          batchOperations: { deleting: false, moving: false, updatingPublic: false },
        });
        return true;
      } else {
        console.error("❌ 批量移动图片失败:", response.msg);
        const errorResult = await handleStoreError(response, "批量移动图片");
        set((state) => ({
          batchOperations: { ...state.batchOperations, moving: false },
          batchError: errorResult.error,
        }));
        return false;
      }
    } catch (error) {
      console.error("❌ 批量移动图片时发生未知错误:", error);
      const errorResult = await handleStoreError(error, "批量移动图片");
      set((state) => ({
        batchOperations: { ...state.batchOperations, moving: false },
        batchError: errorResult.error,
      }));
      return false;
    }
  },

  batchUpdatePublicStatus: async (isPublic: boolean) => {
    const { selectedImageIds } = get();
    const imageIds = Array.from(selectedImageIds);
    
    if (imageIds.length === 0) {
      return false;
    }

    set((state) => ({
      batchOperations: { ...state.batchOperations, updatingPublic: true },
      batchError: null,
    }));

    try {
      const response = await batchUpdateImagePublicAction(imageIds, isPublic);

      if (isSuccessApiResponse(response)) {
        // 更新成功，清除选择
        set({
          selectedImageIds: new Set(),
          isSelectionMode: false,
          batchOperations: { deleting: false, moving: false, updatingPublic: false },
        });
        return true;
      } else {
        console.error("❌ 批量更新图片公开状态失败:", response.msg);
        const errorResult = await handleStoreError(response, "批量更新图片公开状态");
        set((state) => ({
          batchOperations: { ...state.batchOperations, updatingPublic: false },
          batchError: errorResult.error,
        }));
        return false;
      }
    } catch (error) {
      console.error("❌ 批量更新图片公开状态时发生未知错误:", error);
      const errorResult = await handleStoreError(error, "批量更新图片公开状态");
      set((state) => ({
        batchOperations: { ...state.batchOperations, updatingPublic: false },
        batchError: errorResult.error,
      }));
      return false;
    }
  },

  isImageSelected: (imageId: number) => {
    return get().selectedImageIds.has(imageId);
  },

  getSelectedCount: () => {
    return get().selectedImageIds.size;
  },
});

import { createStore } from "zustand";

// 从 createImageBatchSlice 创建一个独立的 store 实例
export const imageBatchStore = createStore(createImageBatchSlice);