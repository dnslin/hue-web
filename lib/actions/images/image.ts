"use server";

import { getAuthenticatedApiService, AuthenticationError } from "@/lib/api/api-service";
import { redirect } from "next/navigation";
import type { 
  ImageResponse, 
  ImageDetail, 
  BatchUploadResponse, 
  ImageQueryParams,
  ImageUpdateParams,
  BatchImageOperationParams
} from "@/lib/types/image";
import type { PaginatedApiResponse, ApiResponse, ErrorApiResponse } from "@/lib/types/common";

/**
 * 获取图片数据（支持缩略图）
 * @param imageId 图片ID
 * @param thumb 是否获取缩略图
 * @returns 图片的Base64数据URL
 */
export async function getImageData(imageId: string, thumb: boolean = false): Promise<string | null> {
  try {
    const apiService = await getAuthenticatedApiService();
    const url = `/images/${imageId}/view`;
    
    const response = await apiService.get(url, {
      params: { thumb },
      responseType: 'arraybuffer'
    });

    // 获取响应头中的Content-Type
    const contentType = response.headers['content-type'] || 'image/jpeg';
    
    // 检查响应数据
    if (!response.data || response.data.byteLength === 0) {
      return null;
    }
    
    // 将ArrayBuffer转换为Base64
    const buffer = Buffer.from(response.data);
    const base64 = buffer.toString('base64');
    
    // 返回Data URL格式
    return `data:${contentType};base64,${base64}`;
  } catch (error: any) {
    // 如果是认证错误，重定向到登录页
    if (error?.code === 401) {
      redirect('/login');
    }
    
    return null;
  }
}

/**
 * 获取图片列表（分页）
 * @param params 查询参数
 * @returns 分页的图片列表
 */
export async function getImagesList(params: ImageQueryParams = {}): Promise<PaginatedApiResponse<ImageResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get('/images', { params });
    return response.data;
  } catch (error: any) {
    console.error("getImagesList 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取图片列表失败",
      error,
    };
  }
}

/**
 * 获取单个图片基础信息
 * @param id 图片ID
 * @returns 图片基础信息
 */
export async function getImage(id: number): Promise<ApiResponse<ImageResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get(`/images/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("getImage 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取图片信息失败",
      error,
    };
  }
}

/**
 * 获取图片详细信息（包含EXIF）
 * @param id 图片ID
 * @returns 图片详细信息
 */
export async function getImageDetail(id: number): Promise<ApiResponse<ImageDetail> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get(`/images/${id}/detail`);
    return response.data;
  } catch (error: any) {
    console.error("getImageDetail 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取图片详细信息失败",
      error,
    };
  }
}

/**
 * 批量上传图片
 * @param formData 包含文件和其他参数的FormData
 * @returns 批量上传结果
 */
export async function uploadImages(formData: FormData): Promise<ApiResponse<BatchUploadResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post('/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error: any) {
    console.error("uploadImages 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "上传图片失败",
      error,
    };
  }
}

/**
 * 更新图片信息
 * @param id 图片ID
 * @param data 更新数据
 * @returns 更新后的图片信息
 */
export async function updateImage(id: number, data: ImageUpdateParams): Promise<ApiResponse<ImageResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put(`/images/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("updateImage 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "更新图片信息失败",
      error,
    };
  }
}

/**
 * 删除图片（软删除到回收站）
 * @param id 图片ID
 */
export async function deleteImage(id: number): Promise<ApiResponse<void> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    await apiService.delete(`/images/${id}`);
    return {
      code: 0,
      msg: "删除图片成功",
    };
  } catch (error: any) {
    console.error("deleteImage 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "删除图片失败",
      error,
    };
  }
}

/**
 * 批量操作图片
 * @param params 批量操作参数
 * @returns 操作结果
 */
export async function batchImageOperation(params: BatchImageOperationParams): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post('/images/batch', params);
    return response.data;
  } catch (error: any) {
    console.error("batchImageOperation 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "批量操作图片失败",
      error,
    };
  }
}

/**
 * 移动图片到相册
 * @param imageId 图片ID
 * @param albumId 目标相册ID（null表示从相册中移除）
 * @returns 更新后的图片信息
 */
export async function moveImageToAlbum(imageId: number, albumId: number | null): Promise<ApiResponse<ImageResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put(`/images/${imageId}`, { albumId });
    return response.data;
  } catch (error: any) {
    console.error("moveImageToAlbum 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "移动图片到相册失败",
      error,
    };
  }
}

/**
 * 设置图片可见性
 * @param imageId 图片ID
 * @param isPublic 是否公开
 * @returns 更新后的图片信息
 */
export async function setImageVisibility(imageId: number, isPublic: boolean): Promise<ApiResponse<ImageResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put(`/images/${imageId}`, { isPublic });
    return response.data;
  } catch (error: any) {
    console.error("setImageVisibility 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "设置图片可见性失败",
      error,
    };
  }
}

/**
 * 获取图片文件（用于下载）
 * @param imageId 图片ID
 * @param thumb 是否获取缩略图
 * @returns 图片文件的ArrayBuffer和Content-Type
 */
export async function downloadImage(imageId: number, thumb: boolean = false): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get(`/images/${imageId}/view`, {
      params: { thumb },
      responseType: 'arraybuffer'
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    
    return {
      data: response.data,
      contentType
    };
  } catch (error: any) {
    console.error("downloadImage 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      // 对于下载操作，认证失败时重定向到登录页
      redirect('/login');
    }
    
    return null;
  }
}