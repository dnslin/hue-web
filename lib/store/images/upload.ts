// lib/store/images/upload.ts
// 图片上传状态管理

import { create } from 'zustand';
import type { UploadTask, UploadTaskStatus, BatchUploadResponse } from '@/lib/types/image';
import { uploadImages as uploadImagesAction } from '@/lib/actions/images/image';

/**
 * 图片上传状态接口
 */
export interface ImageUploadState {
  // 上传队列和状态
  uploadQueue: UploadTask[];
  isUploading: boolean;
  totalProgress: number;
  completedUploads: number;
  failedUploads: number;
  
  // 上传配置
  maxConcurrentUploads: number;
  chunkSize: number;
  retryAttempts: number;
  
  // 上传操作方法
  addToQueue: (files: File[], albumId?: number) => void;
  removeFromQueue: (taskId: string) => void;
  clearQueue: () => void;
  clearCompleted: () => void;
  
  // 上传控制
  startUpload: () => Promise<void>;
  pauseUpload: () => void;
  resumeUpload: () => void;
  cancelUpload: (taskId?: string) => void;
  retryFailedUpload: (taskId: string) => Promise<void>;
  retryAllFailed: () => Promise<void>;
  
  // 任务状态更新
  updateTaskStatus: (taskId: string, status: UploadTaskStatus, progress?: number, error?: string) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  setTaskResult: (taskId: string, result: any) => void;
  
  // 计算方法
  calculateTotalProgress: () => void;
  getQueueStats: () => {
    total: number;
    pending: number;
    uploading: number;
    completed: number;
    failed: number;
    paused: number;
  };
}

/**
 * 生成唯一任务ID
 */
const generateTaskId = (): string => {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 创建上传任务
 */
const createUploadTask = (file: File, albumId?: number): UploadTask => ({
  id: generateTaskId(),
  file,
  albumId,
  progress: 0,
  status: 'pending',
  error: undefined,
  result: undefined,
});

/**
 * 图片上传 Store
 */
export const useImageUploadStore = create<ImageUploadState>((set, get) => ({
  // 初始状态
  uploadQueue: [],
  isUploading: false,
  totalProgress: 0,
  completedUploads: 0,
  failedUploads: 0,
  
  // 上传配置
  maxConcurrentUploads: 3,
  chunkSize: 1024 * 1024, // 1MB chunks
  retryAttempts: 3,

  // 添加文件到上传队列
  addToQueue: (files: File[], albumId?: number) => {
    const { uploadQueue } = get();
    const newTasks = files.map(file => createUploadTask(file, albumId));
    
    set({
      uploadQueue: [...uploadQueue, ...newTasks],
    });
  },

  // 从队列中移除任务
  removeFromQueue: (taskId: string) => {
    const { uploadQueue } = get();
    set({
      uploadQueue: uploadQueue.filter(task => task.id !== taskId),
    });
    get().calculateTotalProgress();
  },

  // 清空队列
  clearQueue: () => {
    set({
      uploadQueue: [],
      totalProgress: 0,
      completedUploads: 0,
      failedUploads: 0,
    });
  },

  // 清理已完成的任务
  clearCompleted: () => {
    const { uploadQueue } = get();
    set({
      uploadQueue: uploadQueue.filter(task => 
        task.status !== 'completed' && task.status !== 'error'
      ),
    });
    get().calculateTotalProgress();
  },

  // 开始上传
  startUpload: async () => {
    const { 
      uploadQueue, 
      isUploading, 
      maxConcurrentUploads,
      updateTaskStatus,
      setTaskResult,
      calculateTotalProgress 
    } = get();
    
    if (isUploading) return;
    
    set({ isUploading: true });
    
    const pendingTasks = uploadQueue.filter(task => 
      task.status === 'pending' || task.status === 'paused'
    );
    
    // 创建并发上传池
    const uploadPromises: Promise<void>[] = [];
    const activeUploads = new Set<string>();
    
    const processNextTask = async (): Promise<void> => {
      const task = pendingTasks.find(t => 
        !activeUploads.has(t.id) && 
        (t.status === 'pending' || t.status === 'paused')
      );
      
      if (!task) return;
      
      activeUploads.add(task.id);
      updateTaskStatus(task.id, 'uploading', 0);
      
      try {
        // 创建FormData
        const formData = new FormData();
        formData.append('files', task.file);
        if (task.albumId) {
          formData.append('albumId', task.albumId.toString());
        }
        
        // 上传文件
        const result = await uploadImagesAction(formData);
        
        updateTaskStatus(task.id, 'completed', 100);
        setTaskResult(task.id, result);
        
        set(state => ({
          completedUploads: state.completedUploads + 1
        }));
        
      } catch (error: any) {
        updateTaskStatus(task.id, 'error', 0, error.message || '上传失败');
        
        set(state => ({
          failedUploads: state.failedUploads + 1
        }));
      } finally {
        activeUploads.delete(task.id);
        calculateTotalProgress();
      }
    };
    
    // 启动并发上传
    for (let i = 0; i < Math.min(maxConcurrentUploads, pendingTasks.length); i++) {
      uploadPromises.push(processNextTask());
    }
    
    // 等待所有上传完成
    await Promise.allSettled(uploadPromises);
    
    set({ isUploading: false });
  },

  // 暂停上传
  pauseUpload: () => {
    const { uploadQueue } = get();
    set({
      isUploading: false,
      uploadQueue: uploadQueue.map(task => 
        task.status === 'uploading' 
          ? { ...task, status: 'paused' as UploadTaskStatus }
          : task
      ),
    });
  },

  // 恢复上传
  resumeUpload: async () => {
    await get().startUpload();
  },

  // 取消上传
  cancelUpload: (taskId?: string) => {
    const { uploadQueue } = get();
    
    if (taskId) {
      // 取消特定任务
      set({
        uploadQueue: uploadQueue.map(task => 
          task.id === taskId 
            ? { ...task, status: 'error' as UploadTaskStatus, error: '用户取消' }
            : task
        ),
      });
    } else {
      // 取消所有进行中的任务
      set({
        isUploading: false,
        uploadQueue: uploadQueue.map(task => 
          task.status === 'uploading' || task.status === 'pending'
            ? { ...task, status: 'error' as UploadTaskStatus, error: '用户取消' }
            : task
        ),
      });
    }
    
    get().calculateTotalProgress();
  },

  // 重试失败的上传
  retryFailedUpload: async (taskId: string) => {
    const { uploadQueue, updateTaskStatus } = get();
    const task = uploadQueue.find(t => t.id === taskId);
    
    if (!task || task.status !== 'error') return;
    
    updateTaskStatus(taskId, 'pending', 0);
    await get().startUpload();
  },

  // 重试所有失败的上传
  retryAllFailed: async () => {
    const { uploadQueue } = get();
    
    set({
      uploadQueue: uploadQueue.map(task => 
        task.status === 'error' 
          ? { ...task, status: 'pending' as UploadTaskStatus, progress: 0, error: undefined }
          : task
      ),
      failedUploads: 0,
    });
    
    await get().startUpload();
  },

  // 更新任务状态
  updateTaskStatus: (taskId: string, status: UploadTaskStatus, progress?: number, error?: string) => {
    const { uploadQueue } = get();
    
    set({
      uploadQueue: uploadQueue.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status, 
              progress: progress !== undefined ? progress : task.progress,
              error: error !== undefined ? error : task.error 
            }
          : task
      ),
    });
  },

  // 更新任务进度
  updateTaskProgress: (taskId: string, progress: number) => {
    const { uploadQueue } = get();
    
    set({
      uploadQueue: uploadQueue.map(task => 
        task.id === taskId ? { ...task, progress } : task
      ),
    });
    
    get().calculateTotalProgress();
  },

  // 设置任务结果
  setTaskResult: (taskId: string, result: any) => {
    const { uploadQueue } = get();
    
    set({
      uploadQueue: uploadQueue.map(task => 
        task.id === taskId ? { ...task, result } : task
      ),
    });
  },

  // 计算总进度
  calculateTotalProgress: () => {
    const { uploadQueue } = get();
    
    if (uploadQueue.length === 0) {
      set({ totalProgress: 0 });
      return;
    }
    
    const totalProgress = uploadQueue.reduce((sum, task) => sum + task.progress, 0);
    const averageProgress = totalProgress / uploadQueue.length;
    
    set({ totalProgress: Math.round(averageProgress) });
  },

  // 获取队列统计
  getQueueStats: () => {
    const { uploadQueue } = get();
    
    return {
      total: uploadQueue.length,
      pending: uploadQueue.filter(task => task.status === 'pending').length,
      uploading: uploadQueue.filter(task => task.status === 'uploading').length,
      completed: uploadQueue.filter(task => task.status === 'completed').length,
      failed: uploadQueue.filter(task => task.status === 'error').length,
      paused: uploadQueue.filter(task => task.status === 'paused').length,
    };
  },
}));

/**
 * 图片上传存储实例（用于外部访问）
 */
export const imageUploadStore = useImageUploadStore;