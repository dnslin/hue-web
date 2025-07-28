// lib/actions/albums/album.ts
"use server";

import {
  getAuthenticatedApiService,
  AuthenticationError,
} from "@/lib/api/api-service";
import {
  AlbumResponse,
  CreateAlbumInput,
  UpdateAlbumInput,
} from "@/lib/types/album";
import { ImageResponse } from "@/lib/types/image";
import type {
  ApiResponse,
  ErrorApiResponse,
  PaginatedApiResponse,
} from "@/lib/types/common";

const ALBUM_API_BASE = "/albums";

/**
 * 获取相册列表
 */
export async function getAlbumsAction(): Promise<
  ApiResponse<AlbumResponse[]> | ErrorApiResponse
> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<ApiResponse<AlbumResponse[]>>(
      ALBUM_API_BASE
    );
    return response.data;
  } catch (error: any) {
    console.error("getAlbumsAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 获取相册详情
 */
export async function getAlbumDetailAction(
  id: number
): Promise<ApiResponse<AlbumResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<ApiResponse<AlbumResponse>>(
      `${ALBUM_API_BASE}/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("getAlbumDetailAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 获取相册中的图片列表
 */
export async function getAlbumImagesAction(
  id: number,
  params: { page?: number; pageSize?: number } = {}
): Promise<PaginatedApiResponse<ImageResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<PaginatedApiResponse<ImageResponse>>(
      `${ALBUM_API_BASE}/${id}/images`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error("getAlbumImagesAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 创建相册
 */
export async function createAlbumAction(
  albumData: CreateAlbumInput
): Promise<ApiResponse<AlbumResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<AlbumResponse>>(
      ALBUM_API_BASE,
      albumData
    );
    return response.data;
  } catch (error: any) {
    console.error("createAlbumAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 更新相册信息
 */
export async function updateAlbumAction(
  id: number,
  albumData: UpdateAlbumInput
): Promise<ApiResponse<AlbumResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<ApiResponse<AlbumResponse>>(
      `${ALBUM_API_BASE}/${id}`,
      albumData
    );
    return response.data;
  } catch (error: any) {
    console.error("updateAlbumAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 删除相册
 */
export async function deleteAlbumAction(id: number): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.delete<ApiResponse<any>>(
      `${ALBUM_API_BASE}/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error("deleteAlbumAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 获取所有相册数据以供导出
 */
export async function getAllAlbumsForExportAction(): Promise<
  AlbumResponse[] | ErrorApiResponse
> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<ApiResponse<AlbumResponse[]>>(
      ALBUM_API_BASE
    );

    if (response.data && response.data.code === 0 && response.data.data) {
      return response.data.data;
    }

    return {
      code: response.data?.code || 1,
      msg: response.data?.msg || "获取相册列表失败",
      error: response.data,
    };
  } catch (error: any) {
    console.error("getAllAlbumsForExportAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取导出相册数据时发生未知错误",
      error,
    };
  }
}
