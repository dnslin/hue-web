// lib/actions/images/list.ts
// 图片列表相关的Server Actions

"use server";

import { getAuthenticatedApiService } from "@/lib/api/api-service";
import { redirect } from "next/navigation";
import {
  ImageQueryParams,
  ImageListResponse,
  ImageStatsResponse,
  BatchImageOperationResponse,
} from "@/lib/types/image";
import { isSuccessApiResponse } from "@/lib/types/common";

/**
 * 获取图片列表
 * @param params 查询参数
 * @returns 图片列表响应
 */
export async function getImageListAction(
  params: ImageQueryParams
): Promise<ImageListResponse> {
  try {
    const apiService = await getAuthenticatedApiService();

    // 构建查询参数，将嵌套的filters对象展平
    const {
      filters,
      viewMode,
      includeThumbnail,
      includeUploader,
      includeStats,
      ...baseParams
    } = params;

    const queryParams = {
      ...baseParams,
      // 展平filters对象
      ...(filters && {
        // 搜索参数
        ...(filters.search && { search: filters.search }),

        // 文件类型筛选
        ...(filters.mimeTypes &&
          filters.mimeTypes.length > 0 && {
            mimeTypes: filters.mimeTypes.join(","),
          }),

        // 文件大小筛选
        ...(filters.minSize !== undefined && { minSize: filters.minSize }),
        ...(filters.maxSize !== undefined && { maxSize: filters.maxSize }),

        // 尺寸筛选
        ...(filters.minWidth !== undefined && { minWidth: filters.minWidth }),
        ...(filters.maxWidth !== undefined && { maxWidth: filters.maxWidth }),
        ...(filters.minHeight !== undefined && {
          minHeight: filters.minHeight,
        }),
        ...(filters.maxHeight !== undefined && {
          maxHeight: filters.maxHeight,
        }),

        // 时间筛选
        ...(filters.uploadedAfter && { uploadedAfter: filters.uploadedAfter }),
        ...(filters.uploadedBefore && {
          uploadedBefore: filters.uploadedBefore,
        }),

        // 上传者筛选
        ...(filters.uploaderIds &&
          filters.uploaderIds.length > 0 && {
            uploaderIds: filters.uploaderIds.join(","),
          }),

        // 状态筛选
        ...(filters.processingStatuses &&
          filters.processingStatuses.length > 0 && {
            processingStatuses: filters.processingStatuses.join(","),
          }),
        ...(filters.moderationStatuses &&
          filters.moderationStatuses.length > 0 && {
            moderationStatuses: filters.moderationStatuses.join(","),
          }),

        // 可见性筛选
        ...(filters.isPublic !== undefined && { isPublic: filters.isPublic }),

        // 标签和专辑筛选
        ...(filters.tags &&
          filters.tags.length > 0 && {
            tags: filters.tags.join(","),
          }),
        ...(filters.albums &&
          filters.albums.length > 0 && {
            albums: filters.albums.join(","),
          }),
      }),

      // 视图和包含选项
      ...(viewMode && { viewMode }),
      ...(includeThumbnail !== undefined && { includeThumbnail }),
      ...(includeUploader !== undefined && { includeUploader }),
      ...(includeStats !== undefined && { includeStats }),
    };

    const response = await apiService.get("/images", {
      params: queryParams,
    });

    return response.data;
  } catch (error: any) {
    // 处理认证错误
    if (error?.response?.status === 401 || error?.code === 401) {
      redirect("/login");
    }

    // 返回错误响应
    return {
      code: error?.response?.status || 500,
      msg: error?.response?.data?.msg || error?.message || "获取图片列表失败",
      requestId: error?.response?.data?.requestId,
    };
  }
}

/**
 * 批量删除图片
 * @param imageIds 图片ID数组
 * @returns 批量操作响应
 */
export async function batchDeleteImagesAction(
  imageIds: number[]
): Promise<BatchImageOperationResponse> {
  try {
    const apiService = await getAuthenticatedApiService();

    const response = await apiService.delete("/images", {
      data: { image_ids: imageIds },
    });

    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401 || error?.code === 401) {
      redirect("/login");
    }

    return {
      code: error?.response?.status || 500,
      msg: error?.response?.data?.msg || error?.message || "批量删除图片失败",
      requestId: error?.response?.data?.requestId,
    };
  }
}

/**
 * 更新单个图片信息
 * @param imageId 图片ID
 * @param updates 更新数据
 * @returns 图片详情响应
 */
export async function updateImageAction(
  imageId: number,
  updates: {
    description?: string;
    tags?: string[];
    album?: string;
    isPublic?: boolean;
  }
) {
  try {
    const apiService = await getAuthenticatedApiService();

    const response = await apiService.patch(`/images/${imageId}`, updates);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401 || error?.code === 401) {
      redirect("/login");
    }

    return {
      code: error?.response?.status || 500,
      msg: error?.response?.data?.msg || error?.message || "更新图片信息失败",
      requestId: error?.response?.data?.requestId,
    };
  }
}

/**
 * 删除单个图片（使用批量删除接口）
 * @param imageId 图片ID
 * @returns API响应
 */
export async function deleteImageAction(imageId: number) {
  try {
    const apiService = await getAuthenticatedApiService();

    const response = await apiService.delete("/images", {
      data: { image_ids: [imageId] },
    });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401 || error?.code === 401) {
      redirect("/login");
    }

    return {
      code: error?.response?.status || 500,
      msg: error?.response?.data?.msg || error?.message || "删除图片失败",
      requestId: error?.response?.data?.requestId,
    };
  }
}

/**
 * 获取图片详情（包含完整元数据）
 * @param imageId 图片ID
 * @returns 图片详情响应
 */
export async function getImageDetailAction(imageId: number) {
  try {
    const apiService = await getAuthenticatedApiService();

    const response = await apiService.get(`/images/${imageId}`, {
      params: {
        includeMetadata: true,
        includeStats: true,
        includeUploader: true,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 401 || error?.code === 401) {
      redirect("/login");
    }

    return {
      code: error?.response?.status || 500,
      msg: error?.response?.data?.msg || error?.message || "获取图片详情失败",
      requestId: error?.response?.data?.requestId,
    };
  }
}

/**
 * 获取专辑列表
 * @returns 专辑名称数组
 */
export async function getImageAlbumsAction() {
  try {
    const apiService = await getAuthenticatedApiService();

    const response = await apiService.get("/images/albums");

    if (isSuccessApiResponse(response.data)) {
      return response.data.data || [];
    }
    return [];
  } catch (error: any) {
    console.warn("获取图片专辑列表失败:", error?.message);
    return [];
  }
}

