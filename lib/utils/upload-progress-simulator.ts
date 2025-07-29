/**
 * 优化的上传进度模拟器
 * 使用单一全局定时器替代多定时器方案，解决批量上传内存溢出问题
 */

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
  pausedAt?: number; // 暂停时的时间戳
  pausedProgress?: number; // 暂停时的进度
  totalPausedTime: number; // 累计暂停时间
  onProgress: (progress: number) => void;
  onComplete?: () => void;
}

export class UploadProgressSimulator {
  private globalTimer: NodeJS.Timeout | null = null;
  private fileStates = new Map<string, FileProgressState>();
  private readonly updateInterval = 100; // 100ms 更新间隔

  /**
   * 开始模拟上传进度
   */
  startSimulation(fileId: string, options: ProgressSimulatorOptions): void {
    // 停止该文件可能存在的旧状态
    this.stopSimulation(fileId);

    // 初始化文件状态
    this.fileStates.set(fileId, {
      fileSize: options.fileSize,
      startTime: Date.now(),
      currentProgress: 0,
      isPaused: false,
      totalPausedTime: 0,
      onProgress: options.onProgress,
      onComplete: options.onComplete,
    });

    // 启动全局定时器（如果尚未启动）
    this.ensureGlobalTimer();

    // 立即执行一次更新
    this.updateFileProgress(fileId);
  }

  /**
   * 暂停进度模拟
   */
  pauseSimulation(fileId: string): void {
    const state = this.fileStates.get(fileId);
    if (state && !state.isPaused) {
      state.isPaused = true;
      state.pausedAt = Date.now();
      state.pausedProgress = state.currentProgress;
    }
  }

  /**
   * 恢复进度模拟
   */
  resumeSimulation(fileId: string, options: ProgressSimulatorOptions): void {
    const state = this.fileStates.get(fileId);
    if (state && state.isPaused && state.pausedAt) {
      // 计算暂停时长并累加
      state.totalPausedTime += Date.now() - state.pausedAt;
      state.isPaused = false;
      state.pausedAt = undefined;
      state.pausedProgress = undefined;

      // 更新回调函数（可能在重新启动时有变化）
      state.onProgress = options.onProgress;
      state.onComplete = options.onComplete;

      // 确保全局定时器正在运行
      this.ensureGlobalTimer();
    }
  }

  /**
   * 停止进度模拟
   */
  stopSimulation(fileId: string): void {
    this.fileStates.delete(fileId);

    // 如果没有更多文件在模拟，停止全局定时器
    if (this.fileStates.size === 0) {
      this.stopGlobalTimer();
    }
  }

  /**
   * 清理所有进度模拟
   */
  cleanup(): void {
    this.fileStates.clear();
    this.stopGlobalTimer();
  }

  /**
   * 获取文件当前进度状态
   */
  getProgressState(fileId: string) {
    return this.fileStates.get(fileId);
  }

  /**
   * 检查文件是否正在模拟中
   */
  isSimulating(fileId: string): boolean {
    return this.fileStates.has(fileId);
  }

  /**
   * 确保全局定时器正在运行
   */
  private ensureGlobalTimer(): void {
    if (!this.globalTimer && this.fileStates.size > 0) {
      this.globalTimer = setInterval(() => {
        this.updateAllProgress();
      }, this.updateInterval);
    }
  }

  /**
   * 停止全局定时器
   */
  private stopGlobalTimer(): void {
    if (this.globalTimer) {
      clearInterval(this.globalTimer);
      this.globalTimer = null;
    }
  }

  /**
   * 更新所有文件的进度
   */
  private updateAllProgress(): void {
    const filesToComplete: string[] = [];

    this.fileStates.forEach((state, fileId) => {
      if (!state.isPaused) {
        const newProgress = this.calculateProgress(state);

        if (newProgress !== state.currentProgress) {
          state.currentProgress = newProgress;
          state.onProgress(newProgress);
        }

        // 检查是否完成
        if (newProgress >= 100) {
          filesToComplete.push(fileId);
        }
      }
    });

    // 处理完成的文件
    filesToComplete.forEach((fileId) => {
      const state = this.fileStates.get(fileId);
      if (state?.onComplete) {
        state.onComplete();
      }
      this.stopSimulation(fileId);
    });
  }

  /**
   * 更新单个文件的进度
   */
  private updateFileProgress(fileId: string): void {
    const state = this.fileStates.get(fileId);
    if (!state || state.isPaused) return;

    const newProgress = this.calculateProgress(state);

    if (newProgress !== state.currentProgress) {
      state.currentProgress = newProgress;
      state.onProgress(newProgress);
    }

    // 检查是否完成
    if (newProgress >= 100) {
      if (state.onComplete) {
        state.onComplete();
      }
      this.stopSimulation(fileId);
    }
  }

  /**
   * 计算文件当前应该显示的进度
   */
  private calculateProgress(state: FileProgressState): number {
    const now = Date.now();
    const elapsed = now - state.startTime - state.totalPausedTime;

    // 计算各阶段的时间分配
    const prepareTime = 300; // 300ms 准备阶段
    const fileSizeMB = state.fileSize / (1024 * 1024);
    const uploadTime = Math.max(1000, Math.min(fileSizeMB * 4000, 15000)); // 1-15秒上传阶段
    const processTime = 600; // 600ms 处理阶段

    const totalTime = prepareTime + uploadTime + processTime;

    // 根据经过的时间确定当前阶段和进度
    if (elapsed <= prepareTime) {
      // 准备阶段 (0-15%)
      const progress = (elapsed / prepareTime) * 15;
      return this.formatProgress(Math.min(progress, 15));
    } else if (elapsed <= prepareTime + uploadTime) {
      // 上传阶段 (15-85%)
      const uploadElapsed = elapsed - prepareTime;
      const uploadProgress = this.easeInOutQuad(uploadElapsed / uploadTime);
      return this.formatProgress(Math.min(15 + uploadProgress * 70, 85));
    } else if (elapsed <= totalTime) {
      // 处理阶段 (85-100%)
      const processElapsed = elapsed - prepareTime - uploadTime;
      const processProgress = (processElapsed / processTime) * 15;
      return this.formatProgress(Math.min(85 + processProgress, 100));
    } else {
      // 完成
      return this.formatProgress(100);
    }
  }

  /**
   * 缓动函数：easeInOutQuad
   * 实现平滑的加速-减速曲线
   */
  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * 格式化进度值，保留两位小数
   */
  private formatProgress(progress: number): number {
    return Math.round(progress * 100) / 100;
  }
}

// 导出单例实例
export const uploadProgressSimulator = new UploadProgressSimulator();
