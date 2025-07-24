"use server";

import { getAuthenticatedApiService, publicApiService, AuthenticationError } from "@/lib/api/api-service";
import type { 
  ShareResponse, 
  CreateShareLinkRequest,
  ShareContentData,
  ShareQueryParams,
  ShareValidationResult,
  ShareAccessRequest,
  BatchShareOperationParams
} from "@/lib/types/share";
import type { PaginatedApiResponse, ApiResponse, ErrorApiResponse } from "@/lib/types/common";

/**
 * 创建分享链接
 * @param data 分享创建数据
 * @returns 创建的分享信息
 */
export async function createShareLink(data: CreateShareLinkRequest): Promise<ShareResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post('/shares', data);
    return response.data.data;
  } catch (error: any) {
    console.error("createShareLink 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "创建分享链接失败",
      error,
    };
  }
}

/**
 * 获取用户的分享列表
 * @param params 查询参数
 * @returns 分页的分享列表
 */
export async function getSharesList(params: ShareQueryParams = {}): Promise<PaginatedApiResponse<ShareResponse> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get('/shares', { params });
    return response.data;
  } catch (error: any) {
    console.error("getSharesList 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取分享列表失败",
      error,
    };
  }
}

/**
 * 通过分享令牌获取分享内容（公开访问，无需认证）
 * @param token 分享令牌
 * @param password 分享密码（如果需要）
 * @returns 分享内容数据
 */
export async function getShareContent(token: string, password?: string): Promise<ShareContentData> {
  try {
    const params: any = {};
    if (password) {
      params.password = password;
    }
    
    const response = await publicApiService.get(`/shares/${token}`, { params });
    return response.data.data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * 验证分享链接是否有效（公开访问，无需认证）
 * @param token 分享令牌
 * @returns 验证结果
 */
export async function validateShareLink(token: string): Promise<ShareValidationResult> {
  try {
    const response = await publicApiService.get(`/shares/${token}/validate`);
    return response.data.data;
  } catch (error: any) {
    // 对于验证失败的情况，返回错误信息而不是抛出异常
    return {
      isValid: false,
      requiresPassword: false,
      isExpired: false,
      error: error?.msg || '分享链接无效'
    };
  }
}

/**
 * 访问分享内容（计入查看次数）
 * @param accessRequest 访问请求
 * @returns 分享内容数据
 */
export async function accessShareContent(accessRequest: ShareAccessRequest): Promise<ShareContentData> {
  try {
    const { token, password, countView = true } = accessRequest;
    const params: any = { countView };
    if (password) {
      params.password = password;
    }
    
    const response = await publicApiService.post(`/shares/${token}/access`, null, { params });
    return response.data.data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * 删除分享链接
 * @param token 分享令牌
 */
export async function deleteShareLink(token: string): Promise<void | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    await apiService.delete(`/shares/${token}`);
  } catch (error: any) {
    console.error("deleteShareLink 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "删除分享链接失败",
      error,
    };
  }
}

/**
 * 获取单个分享信息
 * @param token 分享令牌
 * @returns 分享信息
 */
export async function getShare(token: string): Promise<ShareResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get(`/shares/${token}/info`);
    return response.data.data;
  } catch (error: any) {
    console.error("getShare 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取分享信息失败",
      error,
    };
  }
}

/**
 * 更新分享设置
 * @param token 分享令牌
 * @param updates 更新数据
 * @returns 更新后的分享信息
 */
export async function updateShare(token: string, updates: Partial<CreateShareLinkRequest>): Promise<ShareResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put(`/shares/${token}`, updates);
    return response.data.data;
  } catch (error: any) {
    console.error("updateShare 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "更新分享设置失败",
      error,
    };
  }
}

/**
 * 批量操作分享
 * @param params 批量操作参数
 * @returns 操作结果
 */
export async function batchShareOperation(params: BatchShareOperationParams): Promise<ApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post('/shares/batch', params);
    return response.data;
  } catch (error: any) {
    console.error("batchShareOperation 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "批量操作分享失败",
      error,
    };
  }
}

/**
 * 延长分享链接有效期
 * @param token 分享令牌
 * @param expireDays 新的过期天数
 * @returns 更新后的分享信息
 */
export async function extendShareExpiry(token: string, expireDays: number): Promise<ShareResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put(`/shares/${token}/extend`, { expireDays });
    return response.data.data;
  } catch (error: any) {
    console.error("extendShareExpiry 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "延长分享有效期失败",
      error,
    };
  }
}

/**
 * 重置分享查看次数
 * @param token 分享令牌
 * @returns 更新后的分享信息
 */
export async function resetShareViewCount(token: string): Promise<ShareResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put(`/shares/${token}/reset-views`);
    return response.data.data;
  } catch (error: any) {
    console.error("resetShareViewCount 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "重置查看次数失败",
      error,
    };
  }
}

/**
 * 禁用分享链接
 * @param token 分享令牌
 * @returns 更新后的分享信息
 */
export async function disableShare(token: string): Promise<ShareResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put(`/shares/${token}/disable`);
    return response.data.data;
  } catch (error: any) {
    console.error("disableShare 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "禁用分享链接失败",
      error,
    };
  }
}

/**
 * 启用分享链接
 * @param token 分享令牌
 * @returns 更新后的分享信息
 */
export async function enableShare(token: string): Promise<ShareResponse | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put(`/shares/${token}/enable`);
    return response.data.data;
  } catch (error: any) {
    console.error("enableShare 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "启用分享链接失败",
      error,
    };
  }
}

/**
 * 获取分享统计信息
 * @returns 分享统计数据
 */
export async function getShareStats(): Promise<any | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get('/shares/stats');
    return response.data.data;
  } catch (error: any) {
    console.error("getShareStats 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取分享统计失败",
      error,
    };
  }
}

/**
 * 生成分享二维码
 * @param token 分享令牌
 * @param size 二维码大小（默认200）
 * @returns 二维码图片的Base64数据URL
 */
export async function generateShareQRCode(token: string, size: number = 200): Promise<string | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get(`/shares/${token}/qrcode`, {
      params: { size },
      responseType: 'arraybuffer'
    });

    const buffer = Buffer.from(response.data);
    const base64 = buffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error: any) {
    console.error("generateShareQRCode 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "生成分享二维码失败",
      error,
    };
  }
}