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
  UploadResponse,
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
  id: string,
  thumb: boolean = false
): Promise<string | null | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get(`${IMAGE_API_BASE}/${id}/view`, {
      params: { thumb },
      responseType: "arraybuffer",
    });

    // 获取响应头中的Content-Type
    const contentType = response.headers["content-type"] || "image/jpeg";

    // 检查响应数据
    if (!response.data || response.data.byteLength === 0) {
      return null;
    }

    // 将ArrayBuffer转换为Base64
    const buffer = Buffer.from(response.data);
    const base64 = buffer.toString("base64");

    // 返回Data URL格式
    return `data:${contentType};base64,${base64}`;
  } catch (error: any) {
    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取图片失败",
      error,
    };
  }
}

/**
 * 上传图片（支持单个或批量），带进度回调
 */
export async function uploadImagesAction(
  formData: FormData,
  onProgress?: (progress: number) => void
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
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
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
 * 上传单个文件的高级函数，支持更详细的进度跟踪
 */
export async function uploadSingleImageWithProgress(
  file: File,
  options?: {
    albumId?: number;
    isPublic?: boolean;
    storageStrategyId?: number;
    onProgress?: (progress: number) => void;
    onStart?: () => void;
    onComplete?: (result: UploadResponse) => void;
    onError?: (error: string) => void;
  }
): Promise<UploadResponse | null> {
  try {
    const formData = new FormData();
    formData.append('files', file);
    
    if (options?.albumId !== undefined) {
      formData.append('album_id', options.albumId.toString());
    }
    
    if (options?.isPublic !== undefined) {
      formData.append('is_public', options.isPublic.toString());
    }

    if (options?.storageStrategyId !== undefined) {
      formData.append('storage_strategy_id', options.storageStrategyId.toString());
    }

    options?.onStart?.();

    const result = await uploadImagesAction(formData, options?.onProgress);

    if ('code' in result && result.code !== 0) {
      // 错误响应
      const errorMsg = result.msg || '上传失败';
      options?.onError?.(errorMsg);
      return null;
    }

    // 成功响应
    const batchResponse = (result as ApiResponse<BatchUploadResponse>).data;
    
    if (!batchResponse) {
      options?.onError?.('响应数据为空');
      return null;
    }
    
    if (batchResponse.successCount > 0 && batchResponse.successFiles.length > 0) {
      const uploadedFile = batchResponse.successFiles[0];
      options?.onComplete?.(uploadedFile);
      return uploadedFile;
    } else if (batchResponse.failureCount > 0 && batchResponse.failureFiles.length > 0) {
      const errorMsg = batchResponse.failureFiles[0].error || '上传失败';
      options?.onError?.(errorMsg);
      return null;
    }

    options?.onError?.('未知上传错误');
    return null;
    
  } catch (error: any) {
    const errorMsg = error.msg || error.message || '上传时发生未知错误';
    options?.onError?.(errorMsg);
    return null;
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
  // 复用批量删除接口，将单个ID包装成数组
  return await batchDeleteImagesAction([id]);
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
