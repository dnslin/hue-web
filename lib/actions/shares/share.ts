// lib/actions/shares/share.ts
"use server";

import {
  getAuthenticatedApiService,
  AuthenticationError,
} from "@/lib/api/api-service";
import {
  ShareResponse,
  CreateShareLinkRequest,
  ShareListParams,
  PublicShareContent,
} from "@/lib/types/share";
import type {
  ApiResponse,
  ErrorApiResponse,
} from "@/lib/types/common";

const SHARE_API_BASE = "/shares";

/**
 * 创建分享链接
 */
export async function createShareLinkAction(
  shareData: CreateShareLinkRequest
): Promise<ApiResponse<ShareResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<ShareResponse>>(
      SHARE_API_BASE,
      shareData
    );
    return response.data;
  } catch (error: any) {
    console.error("createShareLinkAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 获取分享内容（公开访问，无需认证）
 */
export async function getShareContentAction(
  token: string
): Promise<ApiResponse<PublicShareContent> | ErrorApiResponse> {
  try {
    // 注意：这个API不需要认证，所以不使用 getAuthenticatedApiService
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<ApiResponse<PublicShareContent>>(
      `${SHARE_API_BASE}/${token}`
    );
    return response.data;
  } catch (error: any) {
    console.error("getShareContentAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 删除分享链接
 */
export async function deleteShareLinkAction(
  token: string
): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.delete<ApiResponse<any>>(
      `${SHARE_API_BASE}/${token}`
    );
    return response.data;
  } catch (error: any) {
    console.error("deleteShareLinkAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 获取当前用户的分享列表
 */
export async function getUserSharesAction(
  params: ShareListParams = {}
): Promise<ApiResponse<ShareResponse[]> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    // 注意：根据swagger.yaml，分享列表API可能需要查看具体实现
    // 这里假设有一个获取用户分享列表的端点
    const response = await apiService.get<ApiResponse<ShareResponse[]>>(
      `${SHARE_API_BASE}/my-shares`,
      { params }
    );
    return response.data;
  } catch (error: any) {
    console.error("getUserSharesAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}

/**
 * 获取分享统计信息
 */
export async function getShareStatsAction(): Promise<
  ApiResponse<{
    totalShares: number;
    activeShares: number;
    expiredShares: number;
    totalViews: number;
    imageShares: number;
    albumShares: number;
  }> | ErrorApiResponse
> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<ApiResponse<{
      totalShares: number;
      activeShares: number;
      expiredShares: number;
      totalViews: number;
      imageShares: number;
      albumShares: number;
    }>>(`${SHARE_API_BASE}/stats`);
    return response.data;
  } catch (error: any) {
    console.error("getShareStatsAction 错误:", error.msg);
    return error as ErrorApiResponse;
  }
}