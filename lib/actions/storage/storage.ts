// lib/actions/storage/storage.actions.ts
"use server";

import {
  getAuthenticatedApiService,
  AuthenticationError,
} from "@/lib/api/api-service";
import {
  StorageStrategy,
  StorageStrategyCreateRequest,
  StorageStrategyUpdateRequest,
  StorageStrategyQueryParams,
  StorageStrategyTestRequest,
  BatchUpdateStorageStatusRequest,
} from "@/lib/types/storage";
import type {
  ApiResponse,
  SuccessApiResponse,
  ErrorApiResponse,
  PaginatedApiResponse,
} from "@/lib/types/common";
import { cacheManager, CACHE_KEYS } from "@/lib/utils/cache-manager";

// swagger 中定义的存储策略相关基础路径
const STORAGE_STRATEGIES_API_BASE = "/admin/storage";

/**
 * 获取存储策略列表
 */
export async function getStorageStrategiesAction(
  params?: StorageStrategyQueryParams
): Promise<PaginatedApiResponse<StorageStrategy> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<
      PaginatedApiResponse<StorageStrategy>
    >(STORAGE_STRATEGIES_API_BASE, { params });

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return apiResponse;
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "获取存储策略列表失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getStorageStrategiesAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取存储策略列表失败",
      error,
    };
  }
}

/**
 * 获取单个存储策略详情
 */
export async function getStorageStrategyByIdAction(
  id: number
): Promise<SuccessApiResponse<StorageStrategy> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<ApiResponse<StorageStrategy>>(
      `${STORAGE_STRATEGIES_API_BASE}/${id}`
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        msg: apiResponse.msg || "获取存储策略详情成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "获取存储策略详情失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getStorageStrategyByIdAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取存储策略详情失败",
      error,
    };
  }
}

/**
 * 创建新存储策略
 */
export async function createStorageStrategyAction(
  data: StorageStrategyCreateRequest
): Promise<SuccessApiResponse<StorageStrategy> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();

    // 根据存储类型构建请求数据，匹配 swagger 中的 StorageStrategyDTO 结构
    const requestData = {
      name: data.name,
      type: data.type,
      is_enabled: data.isEnabled,
      ...(data.type === "s3" &&
        data.s3Config && {
          s3_config: {
            access_key_id: data.s3Config.accessKeyId,
            secret_access_key: data.s3Config.secretAccessKey,
            bucket: data.s3Config.bucket,
            region: data.s3Config.region,
            endpoint: data.s3Config.endpoint,
            base_url: data.s3Config.baseUrl,
            force_path_style: data.s3Config.forcePathStyle,
          },
        }),
      ...(data.type === "local" &&
        data.localConfig && {
          local_config: {
            base_path: data.localConfig.basePath,
          },
        }),
    };

    const response = await apiService.post<ApiResponse<StorageStrategy>>(
      STORAGE_STRATEGIES_API_BASE,
      requestData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      // 清除相关缓存
      cacheManager.delete(CACHE_KEYS.STORAGE_STRATEGIES_LIST);

      return {
        code: 0,
        msg: apiResponse.msg || "存储策略创建成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "存储策略创建失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("createStorageStrategyAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "存储策略创建失败",
      error,
    };
  }
}

/**
 * 更新存储策略
 */
export async function updateStorageStrategyAction(
  id: number,
  data: StorageStrategyUpdateRequest
): Promise<SuccessApiResponse<StorageStrategy> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();

    // 构建更新请求数据
    const requestData = {
      ...(data.name && { name: data.name }),
      ...(data.type && { type: data.type }),
      ...(data.isEnabled !== undefined && { is_enabled: data.isEnabled }),
      ...(data.type === "s3" &&
        data.s3Config && {
          s3_config: {
            access_key_id: data.s3Config.accessKeyId,
            secret_access_key: data.s3Config.secretAccessKey,
            bucket: data.s3Config.bucket,
            region: data.s3Config.region,
            endpoint: data.s3Config.endpoint,
            base_url: data.s3Config.baseUrl,
            force_path_style: data.s3Config.forcePathStyle,
          },
        }),
      ...(data.type === "local" &&
        data.localConfig && {
          local_config: {
            base_path: data.localConfig.basePath,
          },
        }),
    };

    const response = await apiService.put<ApiResponse<StorageStrategy>>(
      `${STORAGE_STRATEGIES_API_BASE}/${id}`,
      requestData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      // 清除相关缓存
      cacheManager.delete(CACHE_KEYS.STORAGE_STRATEGY_DETAIL(id));
      cacheManager.delete(CACHE_KEYS.STORAGE_STRATEGIES_LIST);

      return {
        code: 0,
        msg: apiResponse.msg || "存储策略更新成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "存储策略更新失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("updateStorageStrategyAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "存储策略更新失败",
      error,
    };
  }
}

/**
 * 删除存储策略
 */
export async function deleteStorageStrategyAction(
  id: number
): Promise<SuccessApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.delete<ApiResponse<any>>(
      `${STORAGE_STRATEGIES_API_BASE}/${id}`
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      // 清除相关缓存
      cacheManager.delete(CACHE_KEYS.STORAGE_STRATEGY_DETAIL(id));
      cacheManager.delete(CACHE_KEYS.STORAGE_STRATEGIES_LIST);

      return {
        code: 0,
        msg: apiResponse.msg || "存储策略删除成功",
        data: apiResponse.data,
      };
    }
    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "存储策略删除失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("deleteStorageStrategyAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "存储策略删除失败",
      error,
    };
  }
}

/**
 * 测试 S3 存储连接
 */
export async function testS3ConnectionAction(
  config: StorageStrategyTestRequest
): Promise<SuccessApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();

    // 构建测试请求数据，匹配 swagger 中的 S3ConfigDTO 结构
    const requestData = {
      access_key_id: config.accessKeyId,
      secret_access_key: config.secretAccessKey,
      bucket: config.bucket,
      region: config.region,
      endpoint: config.endpoint,
      base_url: config.baseUrl,
      force_path_style: config.forcePathStyle,
    };

    const response = await apiService.post<ApiResponse<any>>(
      `${STORAGE_STRATEGIES_API_BASE}/test`,
      requestData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        msg: apiResponse.msg || "S3 连接测试成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "S3 连接测试失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("testS3ConnectionAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "S3 连接测试失败",
      error,
    };
  }
}

/**
 * 获取用户可用的存储策略列表
 */
export async function getUserAvailableStorageStrategiesAction(): Promise<
  SuccessApiResponse<StorageStrategy[]> | ErrorApiResponse
> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<ApiResponse<StorageStrategy[]>>(
      "/user/storage"
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        msg: apiResponse.msg || "获取可用存储策略成功",
        data: apiResponse.data || [],
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "获取可用存储策略失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getUserAvailableStorageStrategiesAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取可用存储策略失败",
      error,
    };
  }
}

/**
 * 批量更新存储策略状态
 */
export async function batchUpdateStorageStatusAction(
  data: BatchUpdateStorageStatusRequest
): Promise<SuccessApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    console.log(data);
    const response = await apiService.post<ApiResponse<any>>(
      `${STORAGE_STRATEGIES_API_BASE}/status`,
      data
    );

    const apiResponse = response.data;
    if (apiResponse.code === 0) {
      // 清除相关缓存
      cacheManager.delete(CACHE_KEYS.STORAGE_STRATEGIES_LIST);
      // 清除具体策略的缓存
      data.ids.forEach((id) => {
        cacheManager.delete(CACHE_KEYS.STORAGE_STRATEGY_DETAIL(id));
      });

      return {
        code: 0,
        msg: apiResponse.msg || "批量更新存储策略状态成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "批量更新存储策略状态失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("batchUpdateStorageStatusAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "批量更新存储策略状态失败",
      error,
    };
  }
}

