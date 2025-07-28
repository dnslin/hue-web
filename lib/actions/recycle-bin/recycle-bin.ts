// lib/actions/recycle-bin/recycle-bin.ts
"use server";

import {
  getAuthenticatedApiService,
  AuthenticationError,
} from "@/lib/api/api-service";
import {
  RecycleBinImage,
  RecycleBinListParams,
  BatchRecycleBinParams,
  RecycleBinStats,
} from "@/lib/types/recycle-bin";
import type {
  ApiResponse,
  ErrorApiResponse,
  PaginatedApiResponse,
} from "@/lib/types/common";

const RECYCLE_BIN_API_BASE = "/recycle-bin";

/**
 * 获取回收站列表
 */
export async function getRecycleBinAction(
  params: RecycleBinListParams = {}
): Promise<PaginatedApiResponse<RecycleBinImage> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<
      PaginatedApiResponse<RecycleBinImage>
    >(RECYCLE_BIN_API_BASE, { params });
    return response.data;
  } catch (error: any) {
    console.error("getRecycleBinAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 恢复回收站中的图片
 */
export async function restoreImageAction(
  id: number,
  params?: { albumId?: number }
): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<any>>(
      `${RECYCLE_BIN_API_BASE}/restore/${id}`,
      params || {}
    );
    return response.data;
  } catch (error: any) {
    console.error("restoreImageAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 永久删除回收站中的图片
 */
export async function purgeImageAction(
  id: number
): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.delete<ApiResponse<any>>(
      `${RECYCLE_BIN_API_BASE}/purge/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("purgeImageAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 批量操作回收站项目
 */
export async function batchRecycleBinOperationAction(
  params: BatchRecycleBinParams
): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const endpoint =
      params.action === "restore"
        ? `${RECYCLE_BIN_API_BASE}/batch-restore`
        : `${RECYCLE_BIN_API_BASE}/batch-purge`;

    const requestData = {
      imageIds: params.imageIds,
      ...(params.action === "restore" &&
        params.albumId && { albumId: params.albumId }),
    };

    const response = await apiService.post<ApiResponse<any>>(
      endpoint,
      requestData
    );
    return response.data;
  } catch (error: any) {
    console.error("batchRecycleBinOperationAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 清空回收站
 */
export async function clearRecycleBinAction(params: {
  olderThanDays?: number;
  confirmMessage: string;
}): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<any>>(
      `${RECYCLE_BIN_API_BASE}/clear`,
      params
    );
    return response.data;
  } catch (error: any) {
    console.error("clearRecycleBinAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 获取回收站统计信息
 */
export async function getRecycleBinStatsAction(): Promise<
  ApiResponse<RecycleBinStats> | ErrorApiResponse
> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<ApiResponse<RecycleBinStats>>(
      `${RECYCLE_BIN_API_BASE}/stats`
    );
    return response.data;
  } catch (error: any) {
    console.error("getRecycleBinStatsAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 获取所有回收站数据以供导出
 */
export async function getAllRecycleBinForExportAction(
  params: RecycleBinListParams
): Promise<RecycleBinImage[] | ErrorApiResponse> {
  let allItems: RecycleBinImage[] = [];
  let currentPage = 1;
  const pageSize = 100;

  try {
    const apiService = await getAuthenticatedApiService();

    while (true) {
      const currentParams: RecycleBinListParams = {
        ...params,
        page: currentPage,
        pageSize,
      };
      const response = await apiService.get<
        PaginatedApiResponse<RecycleBinImage>
      >(RECYCLE_BIN_API_BASE, { params: currentParams });
      const pageData = response.data;

      if (
        pageData &&
        pageData.code === 0 &&
        pageData.data &&
        Array.isArray(pageData.data) &&
        pageData.meta
      ) {
        allItems = allItems.concat(pageData.data);
        if (
          pageData.data.length < pageSize ||
          pageData.meta.page * pageData.meta.pageSize >= pageData.meta.total
        ) {
          break;
        }
        currentPage++;
      } else {
        console.warn(
          "getAllRecycleBinForExportAction: 响应结构异常或无更多数据",
          pageData
        );
        break;
      }
    }
    return allItems;
  } catch (error: any) {
    console.error("getAllRecycleBinForExportAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取导出回收站数据时发生未知错误",
      error,
    };
  }
}
