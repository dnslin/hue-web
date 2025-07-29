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
}

export class UploadProgressSimulator {
  private globalTimer: number | null = null; // 用 number 类型，兼容浏览器
  private fileStates = new Map<string, FileProgressState>();
  private readonly updateInterval = 100; // 100ms
  private readonly MAX_SIMULATE = 50; // 最大允许模拟上传数（保护内存）

  /**
   * 启动单个文件上传进度模拟
   */
  startSimulation(fileId: string, options: ProgressSimulatorOptions): void {
    // 并发保护
    if (this.fileStates.size >= this.MAX_SIMULATE) {
      throw new Error("并发模拟上传数超限！");
    }

    // 停止旧状态
    this.stopSimulation(fileId);

    this.fileStates.set(fileId, {
      fileSize: options.fileSize,
      startTime: Date.now(),
      currentProgress: 0,
      isPaused: false,
      totalPausedTime: 0,
      onProgress: options.onProgress,
      onComplete: options.onComplete,
    });

    this.ensureGlobalTimer();
    this.updateFileProgress(fileId); // 立即更新一次
  }

  pauseSimulation(fileId: string): void {
    const state = this.fileStates.get(fileId);
    if (state && !state.isPaused) {
      state.isPaused = true;
      state.pausedAt = Date.now();
      state.pausedProgress = state.currentProgress;
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
      this.ensureGlobalTimer();
    }
  }

  stopSimulation(fileId: string): void {
    this.fileStates.delete(fileId);
    if (this.fileStates.size === 0) {
      this.stopGlobalTimer();
    }
  }

  cleanup(): void {
    this.fileStates.clear();
    this.stopGlobalTimer();
  }

  getProgressState(fileId: string) {
    return this.fileStates.get(fileId);
  }

  isSimulating(fileId: string): boolean {
    return this.fileStates.has(fileId);
  }

  private ensureGlobalTimer(): void {
    if (this.globalTimer === null && this.fileStates.size > 0) {
      this.globalTimer = window.setInterval(() => {
        this.updateAllProgress();
      }, this.updateInterval);
    }
  }

  private stopGlobalTimer(): void {
    if (this.globalTimer !== null) {
      clearInterval(this.globalTimer);
      this.globalTimer = null;
    }
  }

  private updateAllProgress(): void {
    const filesToComplete: string[] = [];
    this.fileStates.forEach((state, fileId) => {
      if (!state.isPaused) {
        const newProgress = this.calculateProgress(state);
        if (newProgress !== state.currentProgress) {
          state.currentProgress = newProgress;
          try {
            state.onProgress(newProgress);
          } catch (e) {
            // 回调异常不影响主流程
            console.error("onProgress error", e);
          }
        }
        if (newProgress >= 100) filesToComplete.push(fileId);
      }
    });

    // 完成回调和清理
    filesToComplete.forEach((fileId) => {
      const state = this.fileStates.get(fileId);
      if (state?.onComplete) {
        try {
          state.onComplete();
        } catch (e) {
          // 回调异常忽略
        }
      }
      this.stopSimulation(fileId);
    });

    // 自动停表
    if (this.fileStates.size === 0) this.stopGlobalTimer();
  }

  private updateFileProgress(fileId: string): void {
    const state = this.fileStates.get(fileId);
    if (!state || state.isPaused) return;

    const newProgress = this.calculateProgress(state);
    if (newProgress !== state.currentProgress) {
      state.currentProgress = newProgress;
      try {
        state.onProgress(newProgress);
      } catch (e) {
        // 回调异常不影响主流程
        console.error("onProgress error", e);
      }
    }
    if (newProgress >= 100) {
      if (state.onComplete) {
        try {
          state.onComplete();
        } catch (e) {}
      }
      this.stopSimulation(fileId);
    }
  }

  private calculateProgress(state: FileProgressState): number {
    const now = Date.now();
    const elapsed = Math.max(0, now - state.startTime - state.totalPausedTime);

    // 配置参数
    const prepareTime = 300; // ms
    const fileSizeMB = state.fileSize / (1024 * 1024);
    const uploadTime = Math.max(1000, Math.min(fileSizeMB * 4000, 15000)); // ms
    const processTime = 600; // ms

    const totalTime = prepareTime + uploadTime + processTime;

    if (elapsed <= prepareTime) {
      // 0~15%
      return this.formatProgress((elapsed / prepareTime) * 15);
    } else if (elapsed <= prepareTime + uploadTime) {
      // 15%~85%
      const uploadElapsed = elapsed - prepareTime;
      const uploadProgress = this.easeInOutQuad(uploadElapsed / uploadTime);
      return this.formatProgress(15 + uploadProgress * 70);
    } else if (elapsed <= totalTime) {
      // 85%~100%
      const processElapsed = elapsed - prepareTime - uploadTime;
      return this.formatProgress(85 + (processElapsed / processTime) * 15);
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
