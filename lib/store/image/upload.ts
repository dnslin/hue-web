// @/lib/store/image/upload.ts

import { StateCreator } from "zustand";
import { createStore, useStore } from "zustand";
import { v4 as uuidv4 } from 'uuid';
import { UploadResponse } from "@/lib/types/image";
import { ImageProcessingSetting } from "@/lib/types/settings";
import { useSettingsStore } from "@/lib/store/settings";
import { imageDataStore } from "./data";
import { uploadSingleImageWithProgress } from "@/lib/actions/images/image";

/**
 * 单个上传文件的状态接口
 */
export interface UploadFileState {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';
  error?: string;
  result?: UploadResponse;
  preview?: string; // 预览URL
}

/**
 * 上传配置接口
 */
export interface UploadConfig {
  albumId?: number;
  isPublic?: boolean;
  storageStrategyId?: number;
  maxSizeMB: number;
  allowedFormats: string[];
  batchLimit: number;
  compressionQuality?: number;
}

/**
 * 上传状态接口
 */
export interface ImageUploadState {
  // 核心状态
  files: UploadFileState[];
  isUploading: boolean;
  uploadConfig: UploadConfig;
  
  // 对话框状态
  isDialogOpen: boolean;
  
  // 统计信息
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  overallProgress: number;
  
  // 错误信息
  globalError: string | null;
  
  // 设置状态
  settingsLoaded: boolean;
}

/**
 * 上传操作接口
 */
export interface ImageUploadActions {
  // 对话框管理
  openDialog: () => void;
  closeDialog: () => void;
  
  // 文件管理
  addFiles: (files: File[]) => void;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  retryFile: (fileId: string) => void;
  cancelFile: (fileId: string) => void;
  
  // 配置管理
  updateConfig: (config: Partial<UploadConfig>) => void;
  loadSettingsConfig: () => void;
  
  // 上传控制
  startUpload: () => Promise<void>;
  pauseUpload: () => void;
  resumeUpload: () => void;
  cancelAllUploads: () => void;
  
  // 状态管理
  updateFileProgress: (fileId: string, progress: number) => void;
  updateFileStatus: (fileId: string, status: UploadFileState['status'], error?: string, result?: UploadResponse) => void;
  clearError: () => void;
  
  // 重置
  reset: () => void;
}

// 默认上传配置
const getDefaultConfig = (): UploadConfig => ({
  albumId: undefined,
  isPublic: false,
  storageStrategyId: undefined,
  maxSizeMB: 10,
  allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  batchLimit: 20,
  compressionQuality: 85,
});

/**
 * 从文件创建预览URL
 */
const createFilePreview = (file: File): string => {
  try {
    return URL.createObjectURL(file);
  } catch (error) {
    console.warn('无法创建文件预览:', error);
    return '';
  }
};

/**
 * 验证文件格式和大小
 */
const validateFile = (file: File, config: UploadConfig): { valid: boolean; error?: string } => {
  // 检查文件大小
  const maxSizeBytes = config.maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `文件大小 ${(file.size / 1024 / 1024).toFixed(1)}MB 超过限制 ${config.maxSizeMB}MB`
    };
  }
  
  // 检查文件格式
  if (!config.allowedFormats.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `不支持的文件格式 ${file.type}。支持格式：${config.allowedFormats.join(', ')}`
    };
  }
  
  return { valid: true };
};

/**
 * 从设置中获取上传配置
 */
const getConfigFromSettings = (imageSettings: ImageProcessingSetting | null): Partial<UploadConfig> => {
  if (!imageSettings) return {};
  
  return {
    maxSizeMB: imageSettings.uploadMaxSizeMB,
    allowedFormats: imageSettings.allowedImageFormats
      .split(',')
      .map(format => {
        const trimmed = format.trim().toLowerCase();
        return trimmed.startsWith('image/') ? trimmed : `image/${trimmed}`;
      }),
    batchLimit: imageSettings.batchUploadLimit,
    compressionQuality: imageSettings.compressionQuality,
  };
};

/**
 * Zustand Store Slice: ImageUpload
 */
export const createImageUploadSlice: StateCreator<
  ImageUploadState & ImageUploadActions,
  [],
  [],
  ImageUploadState & ImageUploadActions
> = (set, get) => ({
  // 初始状态
  files: [],
  isUploading: false,
  uploadConfig: getDefaultConfig(),
  isDialogOpen: false,
  totalFiles: 0,
  completedFiles: 0,
  failedFiles: 0,
  overallProgress: 0,
  globalError: null,
  settingsLoaded: false,

  // 对话框管理
  openDialog: () => {
    set({ isDialogOpen: true });
    // 打开对话框时加载设置
    if (!get().settingsLoaded) {
      get().loadSettingsConfig();
    }
  },

  closeDialog: () => {
    const state = get();
    // 如果正在上传，先暂停
    if (state.isUploading) {
      get().pauseUpload();
    }
    set({ isDialogOpen: false });
  },

  // 文件管理
  addFiles: (newFiles: File[]) => {
    const state = get();
    const { uploadConfig } = state;
    
    // 检查批量上传限制
    const totalCount = state.files.length + newFiles.length;
    if (totalCount > uploadConfig.batchLimit) {
      set({
        globalError: `一次最多上传 ${uploadConfig.batchLimit} 个文件，当前已有 ${state.files.length} 个文件`
      });
      return;
    }
    
    const validFiles: UploadFileState[] = [];
    const errors: string[] = [];
    
    newFiles.forEach(file => {
      const validation = validateFile(file, uploadConfig);
      
      if (validation.valid) {
        validFiles.push({
          id: uuidv4(),
          file,
          progress: 0,
          status: 'pending',
          preview: createFilePreview(file),
        });
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });
    
    set(state => ({
      files: [...state.files, ...validFiles],
      totalFiles: state.files.length + validFiles.length,
      globalError: errors.length > 0 ? errors.join('; ') : null,
    }));
  },

  removeFile: (fileId: string) => {
    set(state => {
      const fileToRemove = state.files.find(f => f.id === fileId);
      
      // 清理预览URL
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      
      const newFiles = state.files.filter(f => f.id !== fileId);
      
      return {
        files: newFiles,
        totalFiles: newFiles.length,
        // 重新计算统计
        completedFiles: newFiles.filter(f => f.status === 'success').length,
        failedFiles: newFiles.filter(f => f.status === 'error').length,
      };
    });
  },

  clearFiles: () => {
    const state = get();
    
    // 清理所有预览URL
    state.files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    
    set({
      files: [],
      totalFiles: 0,
      completedFiles: 0,
      failedFiles: 0,
      overallProgress: 0,
      globalError: null,
    });
  },

  retryFile: (fileId: string) => {
    set(state => ({
      files: state.files.map(file =>
        file.id === fileId
          ? { ...file, status: 'pending', error: undefined, progress: 0 }
          : file
      ),
    }));
  },

  cancelFile: (fileId: string) => {
    set(state => ({
      files: state.files.map(file =>
        file.id === fileId && file.status === 'uploading'
          ? { ...file, status: 'cancelled' }
          : file
      ),
    }));
  },

  // 配置管理
  updateConfig: (newConfig: Partial<UploadConfig>) => {
    set(state => ({
      uploadConfig: { ...state.uploadConfig, ...newConfig }
    }));
  },

  loadSettingsConfig: () => {
    try {
      const settingsState = useSettingsStore.getState();
      const imageSettings = settingsState.settings.image;
      
      if (imageSettings) {
        const configFromSettings = getConfigFromSettings(imageSettings);
        
        set(state => ({
          uploadConfig: { ...state.uploadConfig, ...configFromSettings },
          settingsLoaded: true,
        }));
        
        console.log('✅ 上传配置已从设置中加载');
      } else {
        console.warn('⚠️ 图片设置未加载，使用默认配置');
        set({ settingsLoaded: true });
      }
    } catch (error) {
      console.error('❌ 加载上传设置失败:', error);
      set({ settingsLoaded: true }); // 标记为已加载以避免重复尝试
    }
  },

  // 上传控制
  startUpload: async () => {
    const state = get();
    if (state.isUploading || state.files.length === 0) return;
    
    const pendingFiles = state.files.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    set({ isUploading: true, globalError: null });
    
    console.log(`🚀 开始上传 ${pendingFiles.length} 个文件...`);

    // 并发上传控制（同时最多上传3个文件）
    const concurrencyLimit = 3;
    const uploadQueue = [...pendingFiles];
    const activeUploads = new Set<string>();

    const processUpload = async (fileState: UploadFileState) => {
      const { updateFileProgress, updateFileStatus } = get();
      const { uploadConfig } = get();

      activeUploads.add(fileState.id);
      
      try {
        updateFileStatus(fileState.id, 'uploading');
        
        await uploadSingleImageWithProgress(fileState.file, {
          albumId: uploadConfig.albumId,
          isPublic: uploadConfig.isPublic,
          storageStrategyId: uploadConfig.storageStrategyId,
          onProgress: (progress) => {
            updateFileProgress(fileState.id, progress);
          },
          onStart: () => {
            console.log(`📤 开始上传: ${fileState.file.name}`);
          },
          onComplete: (result) => {
            console.log(`✅ 上传成功: ${fileState.file.name}`);
            updateFileStatus(fileState.id, 'success', undefined, result);
          },
          onError: (error) => {
            console.error(`❌ 上传失败: ${fileState.file.name} - ${error}`);
            updateFileStatus(fileState.id, 'error', error);
          },
        });

      } catch (error: any) {
        console.error(`❌ 上传异常: ${fileState.file.name}`, error);
        updateFileStatus(fileState.id, 'error', error.message || '上传异常');
      } finally {
        activeUploads.delete(fileState.id);
      }
    };

    // 启动并发上传
    const uploadPromises: Promise<void>[] = [];
    
    while (uploadQueue.length > 0 || activeUploads.size > 0) {
      // 检查是否被暂停或取消
      if (!get().isUploading) {
        console.log('⏸️ 上传被暂停');
        break;
      }

      // 启动新的上传（在并发限制内）
      while (uploadQueue.length > 0 && activeUploads.size < concurrencyLimit) {
        const fileState = uploadQueue.shift()!;
        
        // 检查文件是否被取消
        const currentFile = get().files.find(f => f.id === fileState.id);
        if (!currentFile || currentFile.status === 'cancelled') {
          continue;
        }

        uploadPromises.push(processUpload(fileState));
      }

      // 等待任意一个上传完成
      if (activeUploads.size > 0) {
        await Promise.race(uploadPromises);
      }
    }

    // 等待所有剩余上传完成
    await Promise.all(uploadPromises);

    set({ isUploading: false });
    
    const finalState = get();
    const completed = finalState.completedFiles;
    const failed = finalState.failedFiles;
    const total = finalState.totalFiles;
    
    console.log(`🎯 上传完成: ${completed}/${total} 成功, ${failed} 失败`);
    
    // 如果有成功上传的文件，刷新图片列表
    if (completed > 0) {
      const imageDataStoreState = imageDataStore.getState();
      imageDataStoreState.refreshImages?.();
    }
  },

  pauseUpload: () => {
    set({ isUploading: false });
    console.log('⏸️ 上传已暂停');
  },

  resumeUpload: () => {
    get().startUpload();
  },

  cancelAllUploads: () => {
    set(state => ({
      isUploading: false,
      files: state.files.map(file =>
        file.status === 'uploading' ? { ...file, status: 'cancelled' } : file
      ),
    }));
    console.log('🛑 所有上传已取消');
  },

  // 状态管理
  updateFileProgress: (fileId: string, progress: number) => {
    set(state => {
      const newFiles = state.files.map(file =>
        file.id === fileId ? { ...file, progress } : file
      );
      
      // 计算整体进度
      const totalProgress = newFiles.reduce((sum, file) => sum + file.progress, 0);
      const overallProgress = newFiles.length > 0 ? Math.round(totalProgress / newFiles.length) : 0;
      
      return {
        files: newFiles,
        overallProgress,
      };
    });
  },

  updateFileStatus: (fileId: string, status: UploadFileState['status'], error?: string, result?: UploadResponse) => {
    set(state => {
      const newFiles = state.files.map(file =>
        file.id === fileId
          ? { ...file, status, error, result, progress: status === 'success' ? 100 : file.progress }
          : file
      );
      
      return {
        files: newFiles,
        completedFiles: newFiles.filter(f => f.status === 'success').length,
        failedFiles: newFiles.filter(f => f.status === 'error').length,
      };
    });
    
    // 如果上传成功，刷新图片列表
    if (status === 'success') {
      const imageDataStoreState = imageDataStore.getState();
      imageDataStoreState.refreshImages?.();
    }
  },

  clearError: () => {
    set({ globalError: null });
  },

  // 重置
  reset: () => {
    const state = get();
    
    // 清理预览URL
    state.files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    
    set({
      files: [],
      isUploading: false,
      isDialogOpen: false,
      totalFiles: 0,
      completedFiles: 0,
      failedFiles: 0,
      overallProgress: 0,
      globalError: null,
      uploadConfig: getDefaultConfig(),
      settingsLoaded: false,
    });
    
    console.log('🔄 上传状态已重置');
  },
});

// 创建store实例
export const imageUploadStore = createStore(createImageUploadSlice);

// 便捷hook
export const useImageUploadStore = () => useStore(imageUploadStore);