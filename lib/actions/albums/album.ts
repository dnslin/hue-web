"use server";

import { getAuthenticatedApiService, AuthenticationError } from "@/lib/api/api-service";
import type { 
  AlbumResponse, 
  CreateAlbumInput, 
  UpdateAlbumInput,
  AlbumQueryParams,
  AlbumImageQueryParams,
  BatchAlbumOperationParams,
  AlbumDetail
} from "@/lib/types/album";
import type { ImageResponse } from "@/lib/types/image";
import type { PaginatedApiResponse, ApiResponse, ErrorApiResponse } from "@/lib/types/common";

/**
 * 获取相册列表
 * @param params 查询参数
 * @returns 相册列表
 */
export async function getAlbumsList(params: AlbumQueryParams = {}): Promise<ApiResponse<AlbumResponse[]> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get('/albums', { params });
    return response.data;
  } catch (error: any) {
    console.error("getAlbumsList 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取相册列表失败",
      error,
    };
  }
}

/**
 * 获取分页相册列表
 * @param params 查询参数
 * @returns 分页的相册列表
 */
export async function getAlbumsListPaginated(params: AlbumQueryParams = {}): Promise<PaginatedApiResponse<AlbumResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get('/albums', { params });
    return response.data;
  } catch (error: any) {
    console.error("getAlbumsListPaginated 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取分页相册列表失败",
      error,
    };
  }
}

/**
 * 获取单个相册信息
 * @param id 相册ID
 * @returns 相册信息
 */
export async function getAlbum(id: number): Promise<ApiResponse<AlbumResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get(`/albums/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("getAlbum 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取相册信息失败",
      error,
    };
  }
}

/**
 * 获取相册详细信息（包含统计数据）
 * @param id 相册ID
 * @returns 相册详细信息
 */
export async function getAlbumDetail(id: number): Promise<AlbumDetail | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get(`/albums/${id}`, {
      params: { includeStats: true }
    });
    return response.data.data;
  } catch (error: any) {
    console.error("getAlbumDetail 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取相册详细信息失败",
      error,
    };
  }
}

/**
 * 创建新相册
 * @param data 相册创建数据
 * @returns 创建的相册信息
 */
export async function createAlbum(data: CreateAlbumInput): Promise<AlbumResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post('/albums', data);
    return response.data.data;
  } catch (error: any) {
    console.error("createAlbum 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "创建相册失败",
      error,
    };
  }
}

/**
 * 更新相册信息
 * @param id 相册ID
 * @param data 更新数据
 * @returns 更新后的相册信息
 */
export async function updateAlbum(id: number, data: UpdateAlbumInput): Promise<AlbumResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put(`/albums/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error("updateAlbum 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "更新相册信息失败",
      error,
    };
  }
}

/**
 * 删除相册
 * @param id 相册ID
 */
export async function deleteAlbum(id: number): Promise<void | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    await apiService.delete(`/albums/${id}`);
  } catch (error: any) {
    console.error("deleteAlbum 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "删除相册失败",
      error,
    };
  }
}

/**
 * 获取相册中的图片列表
 * @param id 相册ID
 * @param params 查询参数
 * @returns 分页的图片列表
 */
export async function getAlbumImages(id: number, params: AlbumImageQueryParams = {}): Promise<PaginatedApiResponse<ImageResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get(`/albums/${id}/images`, { params });
    return response.data;
  } catch (error: any) {
    console.error("getAlbumImages 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取相册图片列表失败",
      error,
    };
  }
}

/**
 * 批量操作相册
 * @param params 批量操作参数
 * @returns 操作结果
 */
export async function batchAlbumOperation(params: BatchAlbumOperationParams): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post('/albums/batch', params);
    return response.data;
  } catch (error: any) {
    console.error("batchAlbumOperation 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "批量操作相册失败",
      error,
    };
  }
}

/**
 * 向相册添加图片
 * @param albumId 相册ID
 * @param imageIds 图片ID列表
 * @returns 操作结果
 */
export async function addImagesToAlbum(albumId: number, imageIds: number[]): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post(`/albums/${albumId}/images`, { imageIds });
    return response.data;
  } catch (error: any) {
    console.error("addImagesToAlbum 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "向相册添加图片失败",
      error,
    };
  }
}

/**
 * 从相册移除图片
 * @param albumId 相册ID
 * @param imageIds 图片ID列表
 * @returns 操作结果
 */
export async function removeImagesFromAlbum(albumId: number, imageIds: number[]): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.delete(`/albums/${albumId}/images`, {
      data: { imageIds }
    });
    return response.data;
  } catch (error: any) {
    console.error("removeImagesFromAlbum 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "从相册移除图片失败",
      error,
    };
  }
}

/**
 * 设置相册封面
 * @param albumId 相册ID
 * @param imageId 封面图片ID
 * @returns 更新后的相册信息
 */
export async function setAlbumCover(albumId: number, imageId: number): Promise<AlbumResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put(`/albums/${albumId}`, { coverImageId: imageId });
    return response.data.data;
  } catch (error: any) {
    console.error("setAlbumCover 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "设置相册封面失败",
      error,
    };
  }
}

/**
 * 移除相册封面
 * @param albumId 相册ID
 * @returns 更新后的相册信息
 */
export async function removeAlbumCover(albumId: number): Promise<AlbumResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put(`/albums/${albumId}`, { coverImageId: null });
    return response.data.data;
  } catch (error: any) {
    console.error("removeAlbumCover 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "移除相册封面失败",
      error,
    };
  }
}

/**
 * 设置相册可见性
 * @param albumId 相册ID
 * @param isPublic 是否公开
 * @returns 更新后的相册信息
 */
export async function setAlbumVisibility(albumId: number, isPublic: boolean): Promise<AlbumResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put(`/albums/${albumId}`, { isPublic });
    return response.data.data;
  } catch (error: any) {
    console.error("setAlbumVisibility 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "设置相册可见性失败",
      error,
    };
  }
}

/**
 * 复制相册
 * @param albumId 源相册ID
 * @param newName 新相册名称
 * @param copyImages 是否复制图片（默认true）
 * @returns 新创建的相册信息
 */
export async function duplicateAlbum(albumId: number, newName: string, copyImages: boolean = true): Promise<AlbumResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post(`/albums/${albumId}/duplicate`, { 
      name: newName,
      copyImages 
    });
    return response.data.data;
  } catch (error: any) {
    console.error("duplicateAlbum 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "复制相册失败",
      error,
    };
  }
}

/**
 * 合并相册
 * @param sourceAlbumIds 源相册ID列表
 * @param targetAlbumId 目标相册ID
 * @param deleteSource 是否删除源相册（默认false）
 * @returns 操作结果
 */
export async function mergeAlbums(sourceAlbumIds: number[], targetAlbumId: number, deleteSource: boolean = false): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post('/albums/merge', {
      sourceAlbumIds,
      targetAlbumId,
      deleteSource
    });
    return response.data;
  } catch (error: any) {
    console.error("mergeAlbums 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "合并相册失败",
      error,
    };
  }
}