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
import { uploadProgressSimulator } from "@/lib/utils/upload-progress-simulator";

/**
 * 单个上传文件的状态接口
 */
export interface UploadFileState {
  id: string;
  file: File;
  progress: number;
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
  overallProgress: number;

  // 错误信息
  globalError: string | null;

  // 设置状态
  settingsLoaded: boolean;

  // 新增：上传队列管理
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
  updateFileProgress: (fileId: string, progress: number) => void;
  updateFileStatus: (
    fileId: string,
    status: UploadFileState["status"],
    error?: string,
    result?: UploadResponse
  ) => void;
  clearError: () => void;

  // 重置
  reset: () => void;

  // 新增：内存管理
  getMemoryUsage: () => { fileCount: number; simulatorCount: number };

  // 新增：上传队列处理
  processUploadQueue: (concurrencyLimit: number) => Promise<void>;
  processIndividualUpload: (fileId: string) => Promise<void>;

  // 新增：资源清理和检查
  performResourceCleanup: () => {
    cleanupCount: number;
    simulatorCount: number;
  };
  checkMemoryUsage: () => {
    fileCount: number;
    simulatorCount: number;
    previewCount: number;
    activeUploads: number;
    queueLength: number;
  };
  emergencyCleanup: () => void;
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
  batchLimit: 15, // 降低批量限制，保护内存
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
      batchLimit: Math.min(config.batchLimit, 15), // 限制最大批量数
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
  overallProgress: 0,
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

    // 清理所有进度模拟器资源
    uploadProgressSimulator.cleanup();

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
          progress: 0,
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
    // 停止该文件的进度模拟
    uploadProgressSimulator.stopSimulation(fileId);

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

    // 清理所有预览URL和进度模拟
    state.files.forEach((file) => {
      if (file.preview) {
        revokeFilePreview(file.preview);
      }
      // 停止每个文件的进度模拟
      uploadProgressSimulator.stopSimulation(file.id);
    });

    // 清理所有进度模拟器资源
    uploadProgressSimulator.cleanup();

    set({
      files: [],
      totalFiles: 0,
      completedFiles: 0,
      failedFiles: 0,
      overallProgress: 0,
      globalError: null,
      uploadQueue: [],
      activeUploads: new Set(),
    });
  },

  retryFile: (fileId: string) => {
    set((state) => ({
      files: state.files.map((file) =>
        file.id === fileId
          ? { ...file, status: "pending", error: undefined, progress: 0 }
          : file
      ),
    }));
  },

  cancelFile: (fileId: string) => {
    // 停止进度模拟
    uploadProgressSimulator.stopSimulation(fileId);

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

  // 上传控制 - 重构版本
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

  // 新增：处理单个文件上传
  processIndividualUpload: async (fileId: string) => {
    const { updateFileProgress, updateFileStatus, uploadConfig } = get();
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

    let simulationStarted = false;

    try {
      updateFileStatus(fileId, "uploading");
      console.log(`📤 开始上传: ${fileState.file.name}`);

      // 启动进度模拟 - 增加错误处理
      try {
        uploadProgressSimulator.startSimulation(fileId, {
          fileSize: fileState.file.size,
          onProgress: (progress) => {
            // 安全的进度更新
            try {
              updateFileProgress(fileId, progress);
            } catch (error) {
              console.error(`进度更新失败 [${fileId}]:`, error);
            }
          },
          onComplete: () => {
            console.log(`🎯 进度模拟完成: ${fileState.file.name}`);
          },
        });
        simulationStarted = true;
      } catch (error) {
        console.error(`启动进度模拟失败 [${fileId}]:`, error);
        // 进度模拟失败不影响实际上传
      }

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

      // 停止进度模拟
      if (simulationStarted) {
        uploadProgressSimulator.stopSimulation(fileId);
      }

      if (result.success && result.data) {
        console.log(`✅ 上传成功: ${fileState.file.name}`);
        updateFileProgress(fileId, 100);
        updateFileStatus(fileId, "success", undefined, result.data);
      } else {
        console.error(`❌ 上传失败: ${fileState.file.name} - ${result.error}`);
        updateFileStatus(fileId, "error", result.error || "上传失败");
      }
    } catch (error: any) {
      console.error(`❌ 上传异常: ${fileState.file.name}`, error);

      // 停止进度模拟
      if (simulationStarted) {
        uploadProgressSimulator.stopSimulation(fileId);
      }

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

  // 新增：资源清理检查
  performResourceCleanup: () => {
    const state = get();
    let cleanupCount = 0;

    // 清理已完成或失败文件的预览URL
    state.files.forEach((file) => {
      if (
        (file.status === "success" || file.status === "error") &&
        file.preview
      ) {
        revokeFilePreview(file.preview);
        cleanupCount++;
      }
    });

    // 检查进度模拟器状态
    const simulatorCount = uploadProgressSimulator.getActiveSimulationCount();
    if (
      simulatorCount >
      state.files.filter((f) => f.status === "uploading").length
    ) {
      console.warn("检测到进度模拟器泄漏，执行清理");
      uploadProgressSimulator.cleanup();
    }

    if (cleanupCount > 0) {
      console.log(`🧹 清理了 ${cleanupCount} 个预览URL`);
    }

    return { cleanupCount, simulatorCount };
  },

  // 新增：内存使用检查
  checkMemoryUsage: () => {
    const state = get();
    const memoryInfo = {
      fileCount: state.files.length,
      simulatorCount: uploadProgressSimulator.getActiveSimulationCount(),
      previewCount: state.files.filter((f) => f.preview).length,
      activeUploads: state.activeUploads.size,
      queueLength: state.uploadQueue.length,
    };

    // 内存使用警告
    if (memoryInfo.fileCount > 20) {
      console.warn("⚠️ 文件数量过多，建议清理");
      set({ globalError: "文件数量过多，建议清理不需要的文件以优化性能" });
    }

    if (memoryInfo.simulatorCount > memoryInfo.fileCount) {
      console.warn("⚠️ 检测到进度模拟器泄漏");
    }

    return memoryInfo;
  },

  // 新增：紧急清理
  emergencyCleanup: () => {
    console.log("🚨 执行紧急清理...");

    const state = get();

    // 停止所有上传
    if (state.isUploading) {
      get().cancelAllUploads();
    }

    // 清理所有预览URL
    state.files.forEach((file) => {
      if (file.preview) {
        revokeFilePreview(file.preview);
      }
    });

    // 清理进度模拟器
    uploadProgressSimulator.cleanup();

    // 重置状态
    set({
      files: [],
      isUploading: false,
      totalFiles: 0,
      completedFiles: 0,
      failedFiles: 0,
      overallProgress: 0,
      globalError: null,
      uploadQueue: [],
      activeUploads: new Set(),
    });

    console.log("🧹 紧急清理完成");
  },

  pauseUpload: () => {
    const state = get();

    // 暂停所有正在上传的文件的进度模拟
    state.files.forEach((file) => {
      if (file.status === "uploading") {
        uploadProgressSimulator.pauseSimulation(file.id);
      }
    });

    set({ isUploading: false });
    console.log("⏸️ 上传已暂停，进度模拟已暂停");
  },

  resumeUpload: () => {
    const state = get();

    // 恢复所有暂停的文件的进度模拟
    state.files.forEach((file) => {
      if (file.status === "uploading") {
        uploadProgressSimulator.resumeSimulation(file.id, {
          fileSize: file.file.size,
          onProgress: (progress) => {
            get().updateFileProgress(file.id, progress);
          },
          onComplete: () => {
            console.log(`🎯 进度模拟完成: ${file.file.name}`);
          },
        });
      }
    });

    get().startUpload();
  },

  cancelAllUploads: () => {
    const state = get();

    // 停止所有文件的进度模拟
    state.files.forEach((file) => {
      if (file.status === "uploading") {
        uploadProgressSimulator.stopSimulation(file.id);
      }
    });

    set((prevState) => ({
      isUploading: false,
      uploadQueue: [],
      activeUploads: new Set(),
      files: prevState.files.map((file) =>
        file.status === "uploading" ? { ...file, status: "cancelled" } : file
      ),
    }));
    console.log("🛑 所有上传已取消，进度模拟已停止");
  },

  // 状态管理
  updateFileProgress: (fileId: string, progress: number) => {
    set((state) => {
      const newFiles = state.files.map((file) =>
        file.id === fileId ? { ...file, progress } : file
      );

      // 计算整体进度
      const totalProgress = newFiles.reduce(
        (sum, file) => sum + file.progress,
        0
      );
      const overallProgress =
        newFiles.length > 0 ? Math.round(totalProgress / newFiles.length) : 0;

      return {
        files: newFiles,
        overallProgress,
      };
    });
  },

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
              progress: status === "success" ? 100 : file.progress,
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

    // 清理预览URL和进度模拟
    state.files.forEach((file) => {
      if (file.preview) {
        revokeFilePreview(file.preview);
      }
      // 停止每个文件的进度模拟
      uploadProgressSimulator.stopSimulation(file.id);
    });

    // 清理所有进度模拟器资源
    uploadProgressSimulator.cleanup();

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
      uploadQueue: [],
      activeUploads: new Set(),
    });

    console.log("🔄 上传状态已重置，进度模拟器已清理");
  },

  // 新增：内存使用监控
  getMemoryUsage: () => {
    const state = get();
    return {
      fileCount: state.files.length,
      simulatorCount: uploadProgressSimulator.getActiveSimulationCount(),
    };
  },
});

// 创建store实例
export const imageUploadStore = createStore(createImageUploadSlice);

// 便捷hook
export const useImageUploadStore = () => useStore(imageUploadStore);
