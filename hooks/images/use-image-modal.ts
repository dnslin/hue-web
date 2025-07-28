import { create } from "zustand";
import { ImageResponse } from "@/lib/types/image";

/**
 * 图片预览和编辑状态管理
 */
interface ImageModalState {
  // 预览状态
  isPreviewOpen: boolean;
  previewImages: ImageResponse[];
  currentPreviewIndex: number;

  // 编辑状态
  isEditorOpen: boolean;
  editingImage: ImageResponse | null;

  // 操作方法
  openPreview: (images: ImageResponse[], index?: number) => void;
  closePreview: () => void;
  goToPreviewImage: (index: number) => void;

  openEditor: (image: ImageResponse) => void;
  closeEditor: () => void;
}

export const useImageModalStore = create<ImageModalState>((set, get) => ({
  // 初始状态
  isPreviewOpen: false,
  previewImages: [],
  currentPreviewIndex: 0,

  isEditorOpen: false,
  editingImage: null,

  // 预览相关操作
  openPreview: (images, index = 0) => {
    set({
      isPreviewOpen: true,
      previewImages: images,
      currentPreviewIndex: index,
    });
  },

  closePreview: () => {
    set({
      isPreviewOpen: false,
      previewImages: [],
      currentPreviewIndex: 0,
    });
  },

  goToPreviewImage: (index) => {
    const { previewImages } = get();
    if (index >= 0 && index < previewImages.length) {
      set({ currentPreviewIndex: index });
    }
  },

  // 编辑相关操作
  openEditor: (image) => {
    set({
      isEditorOpen: true,
      editingImage: image,
    });
  },

  closeEditor: () => {
    set({
      isEditorOpen: false,
      editingImage: null,
    });
  },
}));
