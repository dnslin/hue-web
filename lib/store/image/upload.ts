// @/lib/store/image/upload.ts

import { StateCreator } from "zustand";
import { createStore, useStore } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { UploadResponse } from "@/lib/types/image";
import { ImageProcessingSetting } from "@/lib/types/settings";
import { useSettingsStore } from "@/lib/store/settings";
import { getCurrentUploadConfig } from "@/lib/schema/image";
import { imageDataStore } from "./data";
import { uploadSingleImageWithProgress } from "@/lib/actions/images/image";

/**
 * 单个上传文件的状态接口
 */
export interface UploadFileState {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error" | "cancelled";
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

  // 错误信息
  globalError: string | null;

  // 设置状态
  settingsLoaded: boolean;

  // 上传队列管理
  uploadQueue: string[]; // 待上传的文件ID队列
  activeUploads: Set<string>; // 正在上传的文件ID集合
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
  updateFileStatus: (
    fileId: string,
    status: UploadFileState["status"],
    error?: string,
    result?: UploadResponse
  ) => void;
  clearError: () => void;

  // 重置
  reset: () => void;

  // 上传队列处理
  processUploadQueue: (concurrencyLimit: number) => Promise<void>;
  processIndividualUpload: (fileId: string) => Promise<void>;
}

// 默认上传配置
const getDefaultConfig = (): UploadConfig => ({
  albumId: undefined,
  isPublic: false,
  storageStrategyId: undefined,
  maxSizeMB: 10,
  allowedFormats: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
  batchLimit: 15,
  compressionQuality: 85,
});

/**
 * 从文件创建预览URL - 优化版本
 */
const createFilePreview = (file: File): string => {
  try {
    // 检查文件大小，超过5MB的文件不创建预览
    if (file.size > 5 * 1024 * 1024) {
      console.log(`文件 ${file.name} 过大，跳过预览创建`);
      return "";
    }
    return URL.createObjectURL(file);
  } catch (error) {
    console.warn("无法创建文件预览:", error);
    return "";
  }
};

/**
 * 安全清理预览URL
 */
const revokeFilePreview = (preview: string) => {
  if (preview && preview.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(preview);
    } catch (error) {
      console.warn("清理预览URL失败:", error);
    }
  }
};

/**
 * 验证文件格式和大小
 */
const validateFile = (
  file: File,
  config: UploadConfig
): { valid: boolean; error?: string } => {
  // 检查文件大小
  const maxSizeBytes = config.maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `文件大小 ${(file.size / 1024 / 1024).toFixed(1)}MB 超过限制 ${
        config.maxSizeMB
      }MB`,
    };
  }

  // 检查文件格式
  if (!config.allowedFormats.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `不支持的文件格式 ${
        file.type
      }。支持格式：${config.allowedFormats.join(", ")}`,
    };
  }

  return { valid: true };
};

/**
 * 从设置中获取上传配置 - 使用统一的配置获取逻辑
 */
const getConfigFromSettings = (): Partial<UploadConfig> => {
  try {
    const config = getCurrentUploadConfig();
    console.log("📋 从设置获取的配置:", config);

    return {
      maxSizeMB: config.maxSizeMB,
      allowedFormats: config.allowedFormats,
      batchLimit: Math.min(config.batchLimit, 15),
    };
  } catch (error) {
    console.error("❌ 获取上传配置失败:", error);
    return {};
  }
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
  globalError: null,
  settingsLoaded: false,
  uploadQueue: [],
  activeUploads: new Set(),

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
        globalError: `一次最多上传 ${uploadConfig.batchLimit} 个文件，当前已有 ${state.files.length} 个文件`,
      });
      return;
    }

    const validFiles: UploadFileState[] = [];
    const errors: string[] = [];

    newFiles.forEach((file) => {
      const validation = validateFile(file, uploadConfig);

      if (validation.valid) {
        validFiles.push({
          id: uuidv4(),
          file,
          status: "pending",
          preview: createFilePreview(file),
        });
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    set((state) => ({
      files: [...state.files, ...validFiles],
      totalFiles: state.files.length + validFiles.length,
      globalError: errors.length > 0 ? errors.join("; ") : null,
    }));
  },

  removeFile: (fileId: string) => {
    set((state) => {
      const fileToRemove = state.files.find((f) => f.id === fileId);

      // 清理预览URL
      if (fileToRemove?.preview) {
        revokeFilePreview(fileToRemove.preview);
      }

      const newFiles = state.files.filter((f) => f.id !== fileId);

      // 从队列中移除
      const newQueue = state.uploadQueue.filter((id) => id !== fileId);
      const newActiveUploads = new Set(state.activeUploads);
      newActiveUploads.delete(fileId);

      return {
        files: newFiles,
        totalFiles: newFiles.length,
        uploadQueue: newQueue,
        activeUploads: newActiveUploads,
        // 重新计算统计
        completedFiles: newFiles.filter((f) => f.status === "success").length,
        failedFiles: newFiles.filter((f) => f.status === "error").length,
      };
    });
  },

  clearFiles: () => {
    const state = get();

    // 清理所有预览URL
    state.files.forEach((file) => {
      if (file.preview) {
        revokeFilePreview(file.preview);
      }
    });

    set({
      files: [],
      totalFiles: 0,
      completedFiles: 0,
      failedFiles: 0,
      globalError: null,
      uploadQueue: [],
      activeUploads: new Set(),
    });
  },

  retryFile: (fileId: string) => {
    set((state) => ({
      files: state.files.map((file) =>
        file.id === fileId
          ? { ...file, status: "pending", error: undefined }
          : file
      ),
    }));
  },

  cancelFile: (fileId: string) => {
    set((state) => {
      const newActiveUploads = new Set(state.activeUploads);
      newActiveUploads.delete(fileId);

      return {
        files: state.files.map((file) =>
          file.id === fileId && file.status === "uploading"
            ? { ...file, status: "cancelled" }
            : file
        ),
        activeUploads: newActiveUploads,
      };
    });
  },

  // 配置管理
  updateConfig: (newConfig: Partial<UploadConfig>) => {
    set((state) => ({
      uploadConfig: { ...state.uploadConfig, ...newConfig },
    }));
  },

  loadSettingsConfig: () => {
    try {
      const configFromSettings = getConfigFromSettings();

      if (Object.keys(configFromSettings).length > 0) {
        set((state) => ({
          uploadConfig: { ...state.uploadConfig, ...configFromSettings },
          settingsLoaded: true,
        }));
      } else {
        console.warn("⚠️ 图片设置未加载，使用默认配置");
        set({ settingsLoaded: true });
      }
    } catch (error) {
      console.error("❌ 加载上传设置失败:", error);
      set({ settingsLoaded: true }); // 标记为已加载以避免重复尝试
    }
  },

  // 上传控制
  startUpload: async () => {
    const state = get();
    if (state.isUploading || state.files.length === 0) return;

    const pendingFiles = state.files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    // 初始化上传队列
    const queue = pendingFiles.map((f) => f.id);

    set({
      isUploading: true,
      globalError: null,
      uploadQueue: queue,
      activeUploads: new Set(),
    });

    console.log(`🚀 开始上传 ${pendingFiles.length} 个文件...`);

    // 简化的并发控制：同时最多上传2个文件
    const concurrencyLimit = 2;

    try {
      await get().processUploadQueue(concurrencyLimit);
    } catch (error) {
      console.error("上传过程中发生错误:", error);
      set({ globalError: "上传过程中发生错误" });
    } finally {
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
    }
  },

  // 新增：简化的队列处理方法
  processUploadQueue: async (concurrencyLimit: number) => {
    const state = get();

    while (state.uploadQueue.length > 0 && state.isUploading) {
      const currentState = get();

      // 启动新的上传任务直到达到并发限制
      while (
        currentState.uploadQueue.length > 0 &&
        currentState.activeUploads.size < concurrencyLimit &&
        currentState.isUploading
      ) {
        const fileId = currentState.uploadQueue.shift()!;
        const fileState = currentState.files.find((f) => f.id === fileId);

        if (!fileState || fileState.status !== "pending") {
          continue;
        }

        // 添加到活跃上传集合
        const newActiveUploads = new Set(currentState.activeUploads);
        newActiveUploads.add(fileId);

        set((prevState) => ({
          uploadQueue: prevState.uploadQueue.filter((id) => id !== fileId),
          activeUploads: newActiveUploads,
        }));

        // 异步处理单个文件上传
        get()
          .processIndividualUpload(fileId)
          .catch((error) => {
            console.error(`文件 ${fileId} 上传失败:`, error);
          });
      }

      // 等待一段时间再检查队列状态
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 等待所有活跃上传完成
    while (get().activeUploads.size > 0 && get().isUploading) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  },

  // 处理单个文件上传
  processIndividualUpload: async (fileId: string) => {
    const { updateFileStatus, uploadConfig } = get();
    const fileState = get().files.find((f) => f.id === fileId);

    if (!fileState) {
      console.warn(`文件 ${fileId} 不存在，跳过上传`);
      return;
    }

    // 检查文件状态
    if (fileState.status !== "pending") {
      console.warn(`文件 ${fileState.file.name} 状态不是pending，跳过上传`);
      return;
    }

    try {
      updateFileStatus(fileId, "uploading");
      console.log(`📤 开始上传: ${fileState.file.name}`);

      // 设置上传超时（30秒）
      const uploadTimeout = 30000;
      const uploadPromise = uploadSingleImageWithProgress(fileState.file, {
        albumId: uploadConfig.albumId,
        isPublic: uploadConfig.isPublic,
        storageStrategyId: uploadConfig.storageStrategyId,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("上传超时")), uploadTimeout);
      });

      const result = await Promise.race([uploadPromise, timeoutPromise]);

      if (result.success && result.data) {
        console.log(`✅ 上传成功: ${fileState.file.name}`);
        updateFileStatus(fileId, "success", undefined, result.data);
      } else {
        console.error(`❌ 上传失败: ${fileState.file.name} - ${result.error}`);
        updateFileStatus(fileId, "error", result.error || "上传失败");
      }
    } catch (error: any) {
      console.error(`❌ 上传异常: ${fileState.file.name}`, error);

      // 根据错误类型提供更具体的错误信息
      let errorMessage = "上传异常";
      if (error.message === "上传超时") {
        errorMessage = "上传超时，请检查网络连接";
      } else if (error.message?.includes("网络")) {
        errorMessage = "网络错误，请重试";
      } else if (error.message?.includes("文件")) {
        errorMessage = "文件处理错误";
      } else {
        errorMessage = error.message || "未知错误";
      }

      updateFileStatus(fileId, "error", errorMessage);
    } finally {
      // 从活跃上传集合中移除
      set((prevState) => {
        const newActiveUploads = new Set(prevState.activeUploads);
        newActiveUploads.delete(fileId);
        return { activeUploads: newActiveUploads };
      });
    }
  },

  pauseUpload: () => {
    set({ isUploading: false });
    console.log("⏸️ 上传已暂停");
  },

  resumeUpload: () => {
    get().startUpload();
  },

  cancelAllUploads: () => {
    set((prevState) => ({
      isUploading: false,
      uploadQueue: [],
      activeUploads: new Set(),
      files: prevState.files.map((file) =>
        file.status === "uploading" ? { ...file, status: "cancelled" } : file
      ),
    }));
    console.log("🛑 所有上传已取消");
  },

  // 状态管理
  updateFileStatus: (
    fileId: string,
    status: UploadFileState["status"],
    error?: string,
    result?: UploadResponse
  ) => {
    set((state) => {
      const newFiles = state.files.map((file) =>
        file.id === fileId
          ? {
              ...file,
              status,
              error,
              result,
            }
          : file
      );

      return {
        files: newFiles,
        completedFiles: newFiles.filter((f) => f.status === "success").length,
        failedFiles: newFiles.filter((f) => f.status === "error").length,
      };
    });

    // 如果上传成功，刷新图片列表
    if (status === "success") {
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
    state.files.forEach((file) => {
      if (file.preview) {
        revokeFilePreview(file.preview);
      }
    });

    set({
      files: [],
      isUploading: false,
      isDialogOpen: false,
      totalFiles: 0,
      completedFiles: 0,
      failedFiles: 0,
      globalError: null,
      uploadConfig: getDefaultConfig(),
      settingsLoaded: false,
      uploadQueue: [],
      activeUploads: new Set(),
    });

    console.log("🔄 上传状态已重置");
  },
});

// 创建store实例
export const imageUploadStore = createStore(createImageUploadSlice);

// 便捷hook
export const useImageUploadStore = () => useStore(imageUploadStore);
