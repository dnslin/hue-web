// lib/actions/images/image.ts
"use server";

import {
  getAuthenticatedApiService,
  AuthenticationError,
} from "@/lib/api/api-service";
import {
  ImageResponse,
  ImageListParams,
  ImageUpdateParams,
  BatchUploadResponse,
  ImageDetail,
} from "@/lib/types/image";
import type {
  ApiResponse,
  ErrorApiResponse,
  PaginatedApiResponse,
} from "@/lib/types/common";

const IMAGE_API_BASE = "/images";

/**
 * 获取图片列表
 */
export async function getImagesAction(
  params: ImageListParams = {}
): Promise<PaginatedApiResponse<ImageResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<PaginatedApiResponse<ImageResponse>>(
      IMAGE_API_BASE,
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error("getImagesAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 获取图片详情
 */
export async function getImageDetailAction(
  id: number
): Promise<ApiResponse<ImageDetail> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<ApiResponse<ImageDetail>>(
      `${IMAGE_API_BASE}/${id}/detail`
    );
    return response.data;
  } catch (error: any) {
    console.error("getImageDetailAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 获取图片文件（可选缩略图）
 * 注意：这个API返回图片文件或重定向到S3预签名URL
 */
export async function getImageViewAction(
  id: number,
  thumb?: boolean
): Promise<Blob | string | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const params = thumb ? { thumb } : {};

    const response = await apiService.get(`${IMAGE_API_BASE}/${id}/view`, {
      params,
      responseType: "blob", // 期望接收二进制数据
    });

    return response.data;
  } catch (error: any) {
    console.error("getImageViewAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 上传图片（支持单个或批量）
 */
export async function uploadImagesAction(
  formData: FormData
): Promise<ApiResponse<BatchUploadResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<BatchUploadResponse>>(
      IMAGE_API_BASE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("uploadImagesAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 更新图片信息
 */
export async function updateImageAction(
  id: number,
  imageData: ImageUpdateParams
): Promise<ApiResponse<ImageResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<ApiResponse<ImageResponse>>(
      `${IMAGE_API_BASE}/${id}`,
      imageData
    );
    return response.data;
  } catch (error: any) {
    console.error("updateImageAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 删除图片（移动到回收站）
 */
export async function deleteImageAction(
  id: number
): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.delete<ApiResponse<any>>(
      `${IMAGE_API_BASE}/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("deleteImageAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 批量删除图片
 */
export async function batchDeleteImagesAction(
  imageIds: number[]
): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestData = { image_ids: imageIds };
    const response = await apiService.delete<ApiResponse<any>>(IMAGE_API_BASE, {
      data: requestData,
    });
    return response.data;
  } catch (error: any) {
    console.error("batchDeleteImagesAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 批量移动图片到相册
 */
export async function batchMoveImagesToAlbumAction(
  imageIds: number[],
  albumId: number | null
): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestData = {
      image_ids: imageIds,
      album_id: albumId,
    };
    const response = await apiService.put<ApiResponse<any>>(
      `${IMAGE_API_BASE}/batch/move-to-album`,
      requestData
    );
    return response.data;
  } catch (error: any) {
    console.error("batchMoveImagesToAlbumAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 批量修改图片公开属性
 */
export async function batchUpdateImagePublicAction(
  imageIds: number[],
  isPublic: boolean
): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const requestData = {
      image_ids: imageIds,
      is_public: isPublic,
    };
    const response = await apiService.put<ApiResponse<any>>(
      `${IMAGE_API_BASE}/batch/public`,
      requestData
    );
    return response.data;
  } catch (error: any) {
    console.error("batchUpdateImagePublicAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 获取所有符合条件的图片数据以供导出（处理分页）
 */
export async function getAllImagesForExportAction(
  params: ImageListParams
): Promise<ImageResponse[] | ErrorApiResponse> {
  let allImages: ImageResponse[] = [];
  let currentPage = 1;
  const pageSize = 100;

  try {
    const apiService = await getAuthenticatedApiService();

    while (true) {
      const currentParams: ImageListParams = {
        ...params,
        page: currentPage,
        pageSize,
      };
      const response = await apiService.get<
        PaginatedApiResponse<ImageResponse>
      >(IMAGE_API_BASE, { params: currentParams });
      const pageData = response.data;

      if (
        pageData &&
        pageData.code === 0 &&
        pageData.data &&
        Array.isArray(pageData.data) &&
        pageData.meta
      ) {
        allImages = allImages.concat(pageData.data);
        if (
          pageData.data.length < pageSize ||
          pageData.meta.page * pageData.meta.pageSize >= pageData.meta.total
        ) {
          break;
        }
        currentPage++;
      } else {
        console.warn(
          "getAllImagesForExportAction: 响应结构异常或无更多数据",
          pageData
        );
        break;
      }
    }
    return allImages;
  } catch (error: any) {
    console.error("getAllImagesForExportAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取导出图片数据时发生未知错误",
      error,
    };
  }
}

