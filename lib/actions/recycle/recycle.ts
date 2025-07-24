"use server";

import { getAuthenticatedApiService, AuthenticationError } from "@/lib/api/api-service";
import type { ImageResponse } from "@/lib/types/image";
import type { PaginatedApiResponse, ApiResponse, BaseQueryParams, ErrorApiResponse } from "@/lib/types/common";

/**
 * 回收站项目接口
 */
export interface RecycleBinItem extends ImageResponse {
  /** 删除时间 */
  deletedAt: string;
  /** 删除者ID */
  deletedBy: number;
  /** 自动清理时间（可选） */
  autoDeleteAt?: string;
}

/**
 * 回收站查询参数
 */
export interface RecycleBinQueryParams extends BaseQueryParams {
  /** 搜索关键词 */
  search?: string;
  /** 删除日期范围开始 */
  deletedFrom?: string;
  /** 删除日期范围结束 */
  deletedTo?: string;
  /** 原始相册ID */
  originalAlbumId?: number;
}

/**
 * 批量回收站操作参数
 */
export interface BatchRecycleOperationParams {
  /** 操作类型 */
  operation: 'restore' | 'purge' | 'restore_to_album';
  /** 图片ID列表 */
  imageIds: number[];
  /** 操作参数 */
  params?: {
    /** 目标相册ID（用于恢复到指定相册） */
    albumId?: number;
  };
}

/**
 * 获取回收站中的项目列表
 * @param params 查询参数
 * @returns 分页的回收站项目列表
 */
export async function getRecycleBinItems(params: RecycleBinQueryParams = {}): Promise<PaginatedApiResponse<RecycleBinItem> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get('/recycle-bin', { params });
    return response.data;
  } catch (error: any) {
    console.error("getRecycleBinItems 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取回收站项目列表失败",
      error,
    };
  }
}

/**
 * 获取回收站统计信息
 * @returns 回收站统计数据
 */
export async function getRecycleBinStats(): Promise<any | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get('/recycle-bin/stats');
    return response.data.data;
  } catch (error: any) {
    console.error("getRecycleBinStats 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取回收站统计信息失败",
      error,
    };
  }
}

/**
 * 从回收站恢复图片
 * @param id 图片ID
 * @returns 恢复后的图片信息
 */
export async function restoreImage(id: number): Promise<ImageResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post(`/recycle-bin/restore/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error("restoreImage 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "恢复图片失败",
      error,
    };
  }
}

/**
 * 从回收站恢复图片到指定相册
 * @param id 图片ID
 * @param albumId 目标相册ID
 * @returns 恢复后的图片信息
 */
export async function restoreImageToAlbum(id: number, albumId: number): Promise<ImageResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post(`/recycle-bin/restore/${id}`, { albumId });
    return response.data.data;
  } catch (error: any) {
    console.error("restoreImageToAlbum 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "恢复图片到相册失败",
      error,
    };
  }
}

/**
 * 永久删除图片（从回收站彻底删除）
 * @param id 图片ID
 */
export async function purgeImage(id: number): Promise<void | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    await apiService.delete(`/recycle-bin/purge/${id}`);
  } catch (error: any) {
    console.error("purgeImage 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "永久删除图片失败",
      error,
    };
  }
}

/**
 * 批量恢复图片
 * @param imageIds 图片ID列表
 * @param albumId 目标相册ID（可选）
 * @returns 操作结果
 */
export async function batchRestoreImages(imageIds: number[], albumId?: number): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const params: BatchRecycleOperationParams = {
      operation: albumId ? 'restore_to_album' : 'restore',
      imageIds,
      params: albumId ? { albumId } : undefined
    };
    const response = await apiService.post('/recycle-bin/batch', params);
    return response.data;
  } catch (error: any) {
    console.error("batchRestoreImages 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "批量恢复图片失败",
      error,
    };
  }
}

/**
 * 批量永久删除图片
 * @param imageIds 图片ID列表
 * @returns 操作结果
 */
export async function batchPurgeImages(imageIds: number[]): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const params: BatchRecycleOperationParams = {
      operation: 'purge',
      imageIds
    };
    const response = await apiService.post('/recycle-bin/batch', params);
    return response.data;
  } catch (error: any) {
    console.error("batchPurgeImages 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "批量永久删除图片失败",
      error,
    };
  }
}

/**
 * 清空回收站（永久删除所有项目）
 * @returns 操作结果
 */
export async function emptyRecycleBin(): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.delete('/recycle-bin/empty');
    return response.data;
  } catch (error: any) {
    console.error("emptyRecycleBin 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "清空回收站失败",
      error,
    };
  }
}

/**
 * 获取回收站中的单个项目详情
 * @param id 图片ID
 * @returns 回收站项目详情
 */
export async function getRecycleBinItem(id: number): Promise<RecycleBinItem | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get(`/recycle-bin/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error("getRecycleBinItem 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取回收站项目详情失败",
      error,
    };
  }
}

/**
 * 设置自动清理规则
 * @param days 自动清理天数（0表示禁用自动清理）
 * @returns 操作结果
 */
export async function setAutoCleanupRule(days: number): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put('/recycle-bin/auto-cleanup', { days });
    return response.data;
  } catch (error: any) {
    console.error("setAutoCleanupRule 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "设置自动清理规则失败",
      error,
    };
  }
}

/**
 * 获取自动清理规则
 * @returns 自动清理规则
 */
export async function getAutoCleanupRule(): Promise<{ days: number; enabled: boolean } | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get('/recycle-bin/auto-cleanup');
    return response.data.data;
  } catch (error: any) {
    console.error("getAutoCleanupRule 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取自动清理规则失败",
      error,
    };
  }
}

/**
 * 手动触发自动清理
 * @returns 清理结果
 */
export async function triggerAutoCleanup(): Promise<ApiResponse<{ cleanedCount: number }> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post('/recycle-bin/auto-cleanup/trigger');
    return response.data;
  } catch (error: any) {
    console.error("triggerAutoCleanup 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "触发自动清理失败",
      error,
    };
  }
}