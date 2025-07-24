// lib/store/gallery/editor.ts
// 瀑布流画廊编辑器状态管理

import { create } from 'zustand';
import type { GalleryImageItem } from '@/lib/types/gallery';

/**
 * 编辑历史记录
 */
interface EditHistory {
  id: string;
  imageId: number;
  originalUrl: string;
  editedUrl: string;
  operations: unknown[];
  timestamp: number;
}

/**
 * 编辑器状态接口
 */
export interface GalleryEditorState {
  // 编辑器状态
  isEditorOpen: boolean;
  currentEditingImage: GalleryImageItem | null;
  isEditorLoading: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  
  // 编辑历史
  editHistory: EditHistory[];
  maxHistoryCount: number;
  
  // 编辑器配置
  editorConfig: {
    enabled: boolean;
    tools: string[];
    maxFileSize: number;
    quality: number;
  };
  
  // 操作方法
  openEditor: (image: GalleryImageItem) => void;
  closeEditor: () => void;
  setEditorLoading: (loading: boolean) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setSaving: (saving: boolean) => void;
  
  // 编辑历史管理
  addToHistory: (history: Omit<EditHistory, 'id' | 'timestamp'>) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  getHistoryForImage: (imageId: number) => EditHistory[];
  
  // 配置管理
  updateEditorConfig: (config: Partial<GalleryEditorState['editorConfig']>) => void;
  resetEditorConfig: () => void;
  
  // 编辑完成处理
  handleEditComplete: (editedData: {
    originalId: number;
    editedBlob: Blob;
    editedDataURL: string;
    operations: unknown[];
  }) => Promise<void>;
  
  // 重置编辑器状态
  resetEditor: () => void;
}

/**
 * 默认编辑器配置
 */
const defaultEditorConfig = {
  enabled: true,
  tools: ['crop', 'rotate', 'flip', 'filters', 'adjust', 'resize', 'text'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  quality: 0.9,
};

/**
 * 初始状态
 */
const initialState = {
  isEditorOpen: false,
  currentEditingImage: null,
  isEditorLoading: false,
  hasUnsavedChanges: false,
  isSaving: false,
  editHistory: [],
  maxHistoryCount: 10,
  editorConfig: defaultEditorConfig,
};

/**
 * 瀑布流画廊编辑器 Store
 */
export const useGalleryEditorStore = create<GalleryEditorState>((set, get) => ({
  ...initialState,

  // 打开编辑器
  openEditor: (image: GalleryImageItem) => {
    set({
      isEditorOpen: true,
      currentEditingImage: image,
      hasUnsavedChanges: false,
      isEditorLoading: true,
    });
  },

  // 关闭编辑器
  closeEditor: () => {
    const { hasUnsavedChanges } = get();
    
    // 如果有未保存的更改，询问用户
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('您有未保存的更改，确定要关闭编辑器吗？');
      if (!confirmed) return;
    }
    
    set({
      isEditorOpen: false,
      currentEditingImage: null,
      hasUnsavedChanges: false,
      isEditorLoading: false,
      isSaving: false,
    });
  },

  // 设置编辑器加载状态
  setEditorLoading: (loading: boolean) => {
    set({ isEditorLoading: loading });
  },

  // 设置未保存更改状态
  setHasUnsavedChanges: (hasChanges: boolean) => {
    set({ hasUnsavedChanges: hasChanges });
  },

  // 设置保存状态
  setSaving: (saving: boolean) => {
    set({ isSaving: saving });
  },

  // 添加到编辑历史
  addToHistory: (historyItem: Omit<EditHistory, 'id' | 'timestamp'>) => {
    const { editHistory, maxHistoryCount } = get();
    
    const newHistory: EditHistory = {
      ...historyItem,
      id: `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    // 保持历史记录在最大数量内
    const updatedHistory = [newHistory, ...editHistory].slice(0, maxHistoryCount);
    
    set({ editHistory: updatedHistory });
  },

  // 从历史中移除
  removeFromHistory: (id: string) => {
    const { editHistory } = get();
    set({
      editHistory: editHistory.filter(item => item.id !== id),
    });
  },

  // 清空历史
  clearHistory: () => {
    set({ editHistory: [] });
  },

  // 获取指定图片的编辑历史
  getHistoryForImage: (imageId: number) => {
    const { editHistory } = get();
    return editHistory.filter(item => item.imageId === imageId);
  },

  // 更新编辑器配置
  updateEditorConfig: (configUpdates: Partial<GalleryEditorState['editorConfig']>) => {
    const { editorConfig } = get();
    set({
      editorConfig: { ...editorConfig, ...configUpdates },
    });
  },

  // 重置编辑器配置
  resetEditorConfig: () => {
    set({ editorConfig: defaultEditorConfig });
  },

  // 处理编辑完成
  handleEditComplete: async (editedData: {
    originalId: number;
    editedBlob: Blob;
    editedDataURL: string;
    operations: unknown[];
  }) => {
    const { currentEditingImage } = get();
    
    if (!currentEditingImage) {
      throw new Error('没有正在编辑的图片');
    }
    
    set({ isSaving: true });
    
    try {
      // 添加到编辑历史
      get().addToHistory({
        imageId: editedData.originalId,
        originalUrl: currentEditingImage.url,
        editedUrl: editedData.editedDataURL,
        operations: editedData.operations,
      });
      
      // 这里可以调用 API 保存编辑后的图片
      // await saveEditedImage(editedData);
      
      set({
        hasUnsavedChanges: false,
        isSaving: false,
      });
      
      // 编辑完成后可以选择关闭编辑器
      // get().closeEditor();
      
    } catch (error) {
      console.error('保存编辑失败:', error);
      set({ isSaving: false });
      throw error;
    }
  },

  // 重置编辑器状态
  resetEditor: () => {
    set(initialState);
  },
}));

/**
 * 画廊编辑器存储实例（用于外部访问）
 */
export const galleryEditorStore = useGalleryEditorStore;

/**
 * 编辑器相关的派生选择器
 */
export const galleryEditorSelectors = {
  // 判断是否可以打开编辑器
  canOpenEditor: () => {
    const { editorConfig, isEditorOpen } = useGalleryEditorStore.getState();
    return editorConfig.enabled && !isEditorOpen;
  },
  
  // 判断是否可以关闭编辑器
  canCloseEditor: () => {
    const { isEditorOpen, isSaving } = useGalleryEditorStore.getState();
    return isEditorOpen && !isSaving;
  },
  
  // 获取编辑器状态摘要
  getEditorSummary: () => {
    const state = useGalleryEditorStore.getState();
    return {
      isOpen: state.isEditorOpen,
      isLoading: state.isEditorLoading,
      isSaving: state.isSaving,
      hasChanges: state.hasUnsavedChanges,
      currentImage: state.currentEditingImage,
      historyCount: state.editHistory.length,
    };
  },
  
  // 获取编辑器提示文本
  getEditorStatusText: () => {
    const { isEditorLoading, isSaving, hasUnsavedChanges } = useGalleryEditorStore.getState();
    
    if (isSaving) return '正在保存...';
    if (isEditorLoading) return '编辑器加载中...';
    if (hasUnsavedChanges) return '有未保存的更改';
    return '编辑器就绪';
  },
  
  // 检查文件大小是否合法
  isFileSizeValid: (fileSize: number) => {
    const { editorConfig } = useGalleryEditorStore.getState();
    return fileSize <= editorConfig.maxFileSize;
  },
  
  // 获取支持的工具列表
  getAvailableTools: () => {
    const { editorConfig } = useGalleryEditorStore.getState();
    return editorConfig.tools;
  },
};