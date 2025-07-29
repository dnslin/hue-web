export interface ProgressSimulatorOptions {
  fileSize: number; // 文件大小（字节）
  onProgress: (progress: number) => void; // 进度回调
  onComplete?: () => void; // 完成回调
}

interface FileProgressState {
  fileSize: number;
  startTime: number;
  currentProgress: number;
  isPaused: boolean;
  pausedAt?: number;
  pausedProgress?: number;
  totalPausedTime: number;
  onProgress: (progress: number) => void;
  onComplete?: () => void;
  // 新增：独立定时器ID
  timerId?: number;
}

export class UploadProgressSimulator {
  private fileStates = new Map<string, FileProgressState>();
  private readonly updateInterval = 100; // 100ms
  private readonly MAX_SIMULATE = 20; // 降低最大并发数，保护内存

  /**
   * 启动单个文件上传进度模拟
   */
  startSimulation(fileId: string, options: ProgressSimulatorOptions): void {
    // 并发保护
    if (this.fileStates.size >= this.MAX_SIMULATE) {
      console.warn(`达到最大并发模拟数限制: ${this.MAX_SIMULATE}`);
      throw new Error("并发模拟上传数超限！");
    }

    // 停止旧状态和定时器
    this.stopSimulation(fileId);

    const state: FileProgressState = {
      fileSize: options.fileSize,
      startTime: Date.now(),
      currentProgress: 0,
      isPaused: false,
      totalPausedTime: 0,
      onProgress: options.onProgress,
      onComplete: options.onComplete,
    };

    this.fileStates.set(fileId, state);
    this.startIndividualTimer(fileId);
  }

  pauseSimulation(fileId: string): void {
    const state = this.fileStates.get(fileId);
    if (state && !state.isPaused) {
      state.isPaused = true;
      state.pausedAt = Date.now();
      state.pausedProgress = state.currentProgress;
      // 暂停时清除定时器
      this.clearIndividualTimer(fileId);
    }
  }

  resumeSimulation(fileId: string, options: ProgressSimulatorOptions): void {
    const state = this.fileStates.get(fileId);
    if (state && state.isPaused && state.pausedAt) {
      state.totalPausedTime += Date.now() - state.pausedAt;
      state.isPaused = false;
      state.pausedAt = undefined;
      state.pausedProgress = undefined;
      // 支持动态修改回调
      state.onProgress = options.onProgress;
      state.onComplete = options.onComplete;
      // 恢复时重新启动定时器
      this.startIndividualTimer(fileId);
    }
  }

  stopSimulation(fileId: string): void {
    this.clearIndividualTimer(fileId);
    this.fileStates.delete(fileId);
  }

  cleanup(): void {
    // 清理所有定时器
    this.fileStates.forEach((_, fileId) => {
      this.clearIndividualTimer(fileId);
    });
    this.fileStates.clear();
    console.log("🧹 进度模拟器已清理所有资源");
  }

  getProgressState(fileId: string) {
    return this.fileStates.get(fileId);
  }

  isSimulating(fileId: string): boolean {
    return this.fileStates.has(fileId);
  }

  // 获取当前活跃的模拟数量，用于内存监控
  getActiveSimulationCount(): number {
    return this.fileStates.size;
  }

  /**
   * 为单个文件启动独立定时器
   */
  private startIndividualTimer(fileId: string): void {
    const state = this.fileStates.get(fileId);
    if (!state || state.isPaused) return;

    // 清除可能存在的旧定时器
    this.clearIndividualTimer(fileId);

    state.timerId = window.setInterval(() => {
      this.updateIndividualProgress(fileId);
    }, this.updateInterval);
  }

  /**
   * 清除单个文件的定时器
   */
  private clearIndividualTimer(fileId: string): void {
    const state = this.fileStates.get(fileId);
    if (state?.timerId) {
      clearInterval(state.timerId);
      state.timerId = undefined;
    }
  }

  /**
   * 更新单个文件的进度
   */
  private updateIndividualProgress(fileId: string): void {
    const state = this.fileStates.get(fileId);
    if (!state || state.isPaused) {
      this.clearIndividualTimer(fileId);
      return;
    }

    const newProgress = this.calculateProgress(state);
    if (newProgress !== state.currentProgress) {
      state.currentProgress = newProgress;

      // 安全调用进度回调
      try {
        state.onProgress(newProgress);
      } catch (e) {
        console.error(`进度回调错误 [${fileId}]:`, e);
        // 回调错误时停止该文件的模拟
        this.stopSimulation(fileId);
        return;
      }
    }

    // 检查是否完成
    if (newProgress >= 100) {
      // 完成回调
      if (state.onComplete) {
        try {
          state.onComplete();
        } catch (e) {
          console.error(`完成回调错误 [${fileId}]:`, e);
        }
      }
      // 清理该文件的模拟
      this.stopSimulation(fileId);
    }
  }

  private calculateProgress(state: FileProgressState): number {
    const now = Date.now();
    const elapsed = Math.max(0, now - state.startTime - state.totalPausedTime);

    // 根据文件大小调整时间参数
    const fileSizeMB = state.fileSize / (1024 * 1024);

    // 优化时间配置，减少计算复杂度
    const prepareTime = 200; // 减少准备时间
    const uploadTime = Math.max(800, Math.min(fileSizeMB * 3000, 12000)); // 优化上传时间计算
    const processTime = 400; // 减少处理时间

    const totalTime = prepareTime + uploadTime + processTime;

    if (elapsed <= prepareTime) {
      // 0~10%
      return this.formatProgress((elapsed / prepareTime) * 10);
    } else if (elapsed <= prepareTime + uploadTime) {
      // 10%~90%
      const uploadElapsed = elapsed - prepareTime;
      const uploadProgress = this.easeInOutQuad(uploadElapsed / uploadTime);
      return this.formatProgress(10 + uploadProgress * 80);
    } else if (elapsed <= totalTime) {
      // 90%~100%
      const processElapsed = elapsed - prepareTime - uploadTime;
      return this.formatProgress(90 + (processElapsed / processTime) * 10);
    } else {
      return 100;
    }
  }

  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  private formatProgress(progress: number): number {
    return Math.round(Math.min(progress, 100) * 100) / 100;
  }
}

// 单例
export const uploadProgressSimulator = new UploadProgressSimulator();
