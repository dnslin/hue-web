/**
 * 缓存管理器
 * 提供统一的缓存接口，支持内存缓存、sessionStorage和localStorage
 */

export interface CacheItem<T = unknown> {
  data: T;
  timestamp: number;
  version: string;
  ttl?: number; // 生存时间（毫秒）
}

export interface CacheOptions {
  ttl?: number; // 默认5分钟
  storage?: "memory" | "session" | "local";
  version?: string;
}

export class CacheManager {
  private memoryCache = new Map<string, CacheItem>();
  private defaultTTL = 5 * 60 * 1000; // 5分钟
  private defaultVersion = "1.0.0";

  /**
   * 设置缓存项
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const {
      ttl = this.defaultTTL,
      storage = "memory",
      version = this.defaultVersion,
    } = options;

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      version,
      ttl,
    };

    try {
      switch (storage) {
        case "memory":
          this.memoryCache.set(key, cacheItem);
          break;
        case "session":
          sessionStorage.setItem(key, JSON.stringify(cacheItem));
          break;
        case "local":
          localStorage.setItem(key, JSON.stringify(cacheItem));
          break;
      }
    } catch (error) {
      console.warn(`缓存设置失败 [${key}]:`, error);
      // 降级到内存缓存
      if (storage !== "memory") {
        this.memoryCache.set(key, cacheItem);
      }
    }
  }

  /**
   * 获取缓存项
   */
  get<T>(
    key: string,
    options: Pick<CacheOptions, "storage" | "version"> = {}
  ): T | null {
    const { storage = "memory", version = this.defaultVersion } = options;

    try {
      let cacheItem: CacheItem<T> | null = null;

      switch (storage) {
        case "memory":
          cacheItem = (this.memoryCache.get(key) as CacheItem<T>) || null;
          break;
        case "session":
          const sessionData = sessionStorage.getItem(key);
          cacheItem = sessionData ? JSON.parse(sessionData) : null;
          break;
        case "local":
          const localData = localStorage.getItem(key);
          cacheItem = localData ? JSON.parse(localData) : null;
          break;
      }

      if (!cacheItem) {
        return null;
      }

      // 检查版本
      if (cacheItem.version !== version) {
        this.delete(key, { storage });
        return null;
      }

      // 检查过期时间
      const now = Date.now();
      const isExpired =
        cacheItem.ttl && now - cacheItem.timestamp > cacheItem.ttl;

      if (isExpired) {
        this.delete(key, { storage });
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn(`缓存获取失败 [${key}]:`, error);
      return null;
    }
  }

  /**
   * 删除缓存项
   */
  delete(key: string, options: Pick<CacheOptions, "storage"> = {}): void {
    const { storage = "memory" } = options;

    try {
      switch (storage) {
        case "memory":
          this.memoryCache.delete(key);
          break;
        case "session":
          sessionStorage.removeItem(key);
          break;
        case "local":
          localStorage.removeItem(key);
          break;
      }
    } catch (error) {
      console.warn(`缓存删除失败 [${key}]:`, error);
    }
  }

  /**
   * 清空指定存储的所有缓存
   */
  clear(storage: "memory" | "session" | "local" = "memory"): void {
    try {
      switch (storage) {
        case "memory":
          this.memoryCache.clear();
          break;
        case "session":
          sessionStorage.clear();
          break;
        case "local":
          localStorage.clear();
          break;
      }
    } catch (error) {
      console.warn(`缓存清空失败 [${storage}]:`, error);
    }
  }

  /**
   * 清空所有缓存
   */
  clearAll(): void {
    this.clear("memory");
    this.clear("session");
    this.clear("local");
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    memory: number;
    session: number;
    local: number;
  } {
    const stats = {
      memory: this.memoryCache.size,
      session: 0,
      local: 0,
    };

    try {
      stats.session = Object.keys(sessionStorage).length;
      stats.local = Object.keys(localStorage).length;
    } catch (error) {
      console.warn("获取存储统计失败:", error);
    }

    return stats;
  }

  /**
   * 检查缓存是否存在且有效
   */
  has(
    key: string,
    options: Pick<CacheOptions, "storage" | "version"> = {}
  ): boolean {
    return this.get(key, options) !== null;
  }

  /**
   * 获取或设置缓存（如果不存在则执行获取函数）
   */
  async getOrSet<T>(
    key: string,
    getter: () => Promise<T> | T,
    options: CacheOptions = {}
  ): Promise<T> {
    // 先尝试从缓存获取
    const cached = this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // 缓存不存在，执行获取函数
    try {
      const data = await getter();
      this.set(key, data, options);
      return data;
    } catch (error) {
      console.error(`缓存获取或设置失败 [${key}]:`, error);
      throw error;
    }
  }

  /**
   * 批量设置缓存
   */
  setMultiple<T>(
    items: Array<{ key: string; data: T }>,
    options: CacheOptions = {}
  ): void {
    items.forEach(({ key, data }) => {
      this.set(key, data, options);
    });
  }

  /**
   * 批量获取缓存
   */
  getMultiple<T>(
    keys: string[],
    options: Pick<CacheOptions, "storage" | "version"> = {}
  ): Record<string, T | null> {
    const result: Record<string, T | null> = {};
    keys.forEach((key) => {
      result[key] = this.get<T>(key, options);
    });
    return result;
  }

  /**
   * 使缓存失效（通过更新版本）
   */
  invalidate(pattern?: string): void {
    if (!pattern) {
      // 清空所有缓存
      this.clearAll();
      return;
    }

    // 清空匹配模式的缓存
    const regex = new RegExp(pattern);

    // 清理内存缓存
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // 清理sessionStorage
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && regex.test(key)) {
          sessionStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn("清理sessionStorage失败:", error);
    }

    // 清理localStorage
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && regex.test(key)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn("清理localStorage失败:", error);
    }
  }
}

// 创建全局缓存管理器实例
export const cacheManager = new CacheManager();

// 缓存键常量
export const CACHE_KEYS = {
  // 用户相关
  USERS_LIST: "users:list",
  USER_DETAIL: (id: number) => `users:detail:${id}`,
  USERS_PENDING: "users:pending",

  // 角色相关
  ROLES_LIST: "roles:list",
  ROLE_DETAIL: (id: number) => `roles:detail:${id}`,

  // 权限相关
  PERMISSIONS_LIST: "permissions:list",
  USER_PERMISSIONS: (id: number) => `users:permissions:${id}`,

  // 统计数据
  DASHBOARD_STATS: "dashboard:stats",
  USER_STATS: "users:stats",

  // 配置信息
  SYSTEM_CONFIG: "system:config",
  USER_PREFERENCES: (id: number) => `users:preferences:${id}`,
} as const;

// 缓存工具函数
export const cacheUtils = {
  /**
   * 为用户列表生成缓存键
   */
  getUsersListKey(filters?: Record<string, unknown>): string {
    if (!filters || Object.keys(filters).length === 0) {
      return CACHE_KEYS.USERS_LIST;
    }
    const filterStr = JSON.stringify(filters);
    return `${CACHE_KEYS.USERS_LIST}:${btoa(filterStr)}`;
  },

  /**
   * 清理用户相关缓存
   */
  clearUserCache(): void {
    cacheManager.invalidate("^users:");
  },

  /**
   * 清理角色相关缓存
   */
  clearRoleCache(): void {
    cacheManager.invalidate("^roles:");
  },

  /**
   * 清理所有业务缓存
   */
  clearBusinessCache(): void {
    cacheManager.invalidate("^(users|roles|permissions|dashboard):");
  },

  /**
   * 获取缓存大小信息
   */
  getCacheSize(): string {
    const stats = cacheManager.getStats();
    return `内存: ${stats.memory}, 会话: ${stats.session}, 本地: ${stats.local}`;
  },
};
