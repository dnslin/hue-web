"use server";

import {
  getAuthenticatedApiService,
  AuthenticationError,
} from "@/lib/api/api-service";
import {
  DashboardData,
  DashboardMetrics,
  SystemStatusData,
  ActivityItem,
  QuickAction,
  SystemStatus as SystemStatusEnum,
  SystemStatsData,
  GlobalStatsData,
  AccessStatsData,
  UploadStatsData,
  GeoDistributionData,
  ReferrerDistributionData,
  TopImagesData,
  TopUsersData,
  StatsApiParams,
  StatsData,
  DailyAccessStatDTO,
  DailyUploadStatDTO,
} from "@/lib/types/dashboard";
import type { ApiResponse, ErrorApiResponse } from "@/lib/types/common";
import { Upload, Users, Settings, BarChart3 } from "lucide-react";

// API 基础路径
const DASHBOARD_API_BASE = "/admin/dashboard";

/**
 * 获取系统级统计数据
 * 获取总用户数,总图片数,存储使用总数,总访问量,总上传数,月活用户数,日活用户数,平均文件大小
 */
export async function getSystemStatsAction(): Promise<
  ApiResponse<SystemStatsData> | ErrorApiResponse
> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<ApiResponse<SystemStatsData>>(
      `${DASHBOARD_API_BASE}/system-stats`
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        msg: apiResponse.msg || "获取系统统计数据成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "获取系统统计数据失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getSystemStatsAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取系统统计数据失败",
      error,
    };
  }
}

/**
 * 获取全局统计数据
 */
export async function getGlobalStatsAction(): Promise<
  ApiResponse<GlobalStatsData> | ErrorApiResponse
> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<ApiResponse<GlobalStatsData>>(
      `${DASHBOARD_API_BASE}/global-stats`
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        msg: apiResponse.msg || "获取全局统计数据成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "获取全局统计数据失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getGlobalStatsAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取全局统计数据失败",
      error,
    };
  }
}

/**
 * 获取访问统计数据
 */
export async function getAccessStatsAction(
  params: StatsApiParams = {}
): Promise<ApiResponse<AccessStatsData> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    // 优先使用新的range参数，如果没有则回退到days参数保持兼容性
    const range = params.range || params.days || 7;
    const response = await apiService.get<ApiResponse<DailyAccessStatDTO[]>>(
      `${DASHBOARD_API_BASE}/access-stats`,
      { params: { range } }
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      // 将后端返回的数组包装成 AccessStatsData 格式
      const accessStatsData: AccessStatsData = {
        data: apiResponse.data || [],
        period: "daily", // 根据range参数可以调整period
      };

      return {
        code: 0,
        msg: apiResponse.msg || "获取访问统计数据成功",
        data: accessStatsData,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "获取访问统计数据失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getAccessStatsAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取访问统计数据失败",
      error,
    };
  }
}

/**
 * 获取上传统计数据
 */
export async function getUploadStatsAction(
  params: StatsApiParams = {}
): Promise<ApiResponse<UploadStatsData> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    // 优先使用新的range参数，如果没有则回退到days参数保持兼容性
    const range = params.range || params.days || 7;
    const response = await apiService.get<ApiResponse<DailyUploadStatDTO[]>>(
      `${DASHBOARD_API_BASE}/upload-stats`,
      { params: { range } }
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      // 将后端返回的数组包装成 UploadStatsData 格式
      const uploadStatsData: UploadStatsData = {
        data: apiResponse.data || [],
        period: "daily", // 根据range参数可以调整period
      };

      return {
        code: 0,
        msg: apiResponse.msg || "获取上传统计数据成功",
        data: uploadStatsData,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "获取上传统计数据失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getUploadStatsAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取上传统计数据失败",
      error,
    };
  }
}

/**
 * 获取地理分布数据
 */
export async function getGeoDistributionAction(
  params: StatsApiParams = {}
): Promise<ApiResponse<GeoDistributionData> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const { limit = 10 } = params;
    const response = await apiService.get<ApiResponse<GeoDistributionData>>(
      `${DASHBOARD_API_BASE}/distribution/geo`,
      { params: { limit } }
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        msg: apiResponse.msg || "获取地理分布数据成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "获取地理分布数据失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getGeoDistributionAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取地理分布数据失败",
      error,
    };
  }
}

/**
 * 获取来源分布数据
 */
export async function getReferrerDistributionAction(
  params: StatsApiParams = {}
): Promise<ApiResponse<ReferrerDistributionData> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const { limit = 10 } = params;
    const response = await apiService.get<
      ApiResponse<ReferrerDistributionData>
    >(`${DASHBOARD_API_BASE}/distribution/referrer`, { params: { limit } });

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        msg: apiResponse.msg || "获取来源分布数据成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "获取来源分布数据失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getReferrerDistributionAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取来源分布数据失败",
      error,
    };
  }
}

/**
 * 获取热门图片数据
 */
export async function getTopImagesAction(
  params: StatsApiParams = {}
): Promise<ApiResponse<TopImagesData> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const { limit = 10, sortBy = "views_total" } = params;
    const response = await apiService.get<ApiResponse<TopImagesData>>(
      `${DASHBOARD_API_BASE}/top-images`,
      { params: { limit, sort_by: sortBy } }
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        msg: apiResponse.msg || "获取热门图片数据成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "获取热门图片数据失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getTopImagesAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取热门图片数据失败",
      error,
    };
  }
}

/**
 * 获取热门用户数据
 */
export async function getTopUsersAction(
  params: StatsApiParams = {}
): Promise<ApiResponse<TopUsersData> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const { limit = 10, sortBy = "uploads_total" } = params;
    const response = await apiService.get<ApiResponse<TopUsersData>>(
      `${DASHBOARD_API_BASE}/top-users`,
      { params: { limit, sort_by: sortBy } }
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        msg: apiResponse.msg || "获取热门用户数据成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      msg: apiResponse.msg || "获取热门用户数据失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("getTopUsersAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取热门用户数据失败",
      error,
    };
  }
}

/**
 * 批量获取所有统计数据
 * 用于统计页面的初始数据加载
 */
export async function getAllStatsAction(
  params: StatsApiParams = {}
): Promise<ApiResponse<StatsData> | ErrorApiResponse> {
  try {
    // 并行获取所有统计数据
    const [
      systemStatsResponse,
      globalStatsResponse,
      accessStatsResponse,
      uploadStatsResponse,
      geoDistributionResponse,
      referrerDistributionResponse,
      topImagesResponse,
      topUsersResponse,
    ] = await Promise.all([
      getSystemStatsAction(),
      getGlobalStatsAction(),
      getAccessStatsAction(params),
      getUploadStatsAction(params),
      getGeoDistributionAction(params),
      getReferrerDistributionAction(params),
      getTopImagesAction(params),
      getTopUsersAction(params),
    ]);

    // 检查是否所有请求都成功
    const responses = [
      systemStatsResponse,
      globalStatsResponse,
      accessStatsResponse,
      uploadStatsResponse,
      geoDistributionResponse,
      referrerDistributionResponse,
      topImagesResponse,
      topUsersResponse,
    ];

    const failedResponse = responses.find((response) => response.code !== 0);
    if (failedResponse) {
      return failedResponse as ErrorApiResponse;
    }

    const data: StatsData = {
      systemStats: (systemStatsResponse as ApiResponse<SystemStatsData>).data!,
      globalStats: (globalStatsResponse as ApiResponse<GlobalStatsData>).data!,
      accessStats: (accessStatsResponse as ApiResponse<AccessStatsData>).data!,
      uploadStats: (uploadStatsResponse as ApiResponse<UploadStatsData>).data!,
      geoDistribution: (
        geoDistributionResponse as ApiResponse<GeoDistributionData>
      ).data!,
      referrerDistribution: (
        referrerDistributionResponse as ApiResponse<ReferrerDistributionData>
      ).data!,
      topImages: (topImagesResponse as ApiResponse<TopImagesData>).data!,
      topUsers: (topUsersResponse as ApiResponse<TopUsersData>).data!,
    };

    return {
      code: 0,
      msg: "获取所有统计数据成功",
      data,
    };
  } catch (error: any) {
    console.error("getAllStatsAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取统计数据失败",
      error,
    };
  }
}

/**
 * 安全的数值转换函数
 */
function safeNumber(value: unknown, defaultValue: number = 0): number {
  if (typeof value === "number" && !isNaN(value) && isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && isFinite(parsed)) {
      return parsed;
    }
  }
  console.warn(
    `Invalid number value: ${value}, using default: ${defaultValue}`
  );
  return defaultValue;
}

/**
 * 将系统统计数据转换为仪表盘指标数据
 */
function transformSystemStatsToMetrics(
  systemStats: SystemStatsData
): DashboardMetrics {
  console.log("transformSystemStatsToMetrics 输入数据:", systemStats);

  // 安全的字节格式化函数
  const formatBytes = (bytes: unknown): string => {
    const numBytes = safeNumber(bytes, 0);
    if (numBytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    const formattedValue = parseFloat((numBytes / Math.pow(k, i)).toFixed(1));

    if (isNaN(formattedValue)) {
      console.warn(
        `formatBytes 产生 NaN: bytes=${bytes}, numBytes=${numBytes}`
      );
      return "0 B";
    }

    return formattedValue + " " + sizes[i];
  };

  // 计算简单的变化率（这里使用固定值，实际应该基于历史数据计算）
  const calculateChange = (): number => {
    // 这里应该基于历史数据计算真实的变化率
    // 现在返回一个基于当前值的简单计算
    return Math.round((Math.random() * 20 - 10) * 100) / 100;
  };

  const calculateTrend = (change: number): "up" | "down" | "stable" => {
    if (change > 2) return "up";
    if (change < -2) return "down";
    return "stable";
  };

  // 安全转换所有数值
  const totalUsers = safeNumber(systemStats.totalUsers, 0);
  const totalImages = safeNumber(systemStats.totalImages, 0);
  const totalStorage = safeNumber(systemStats.totalStorage, 0);
  const totalAccesses = safeNumber(systemStats.totalAccesses, 0);

  console.log("转换后的安全数值:", {
    totalUsers,
    totalImages,
    totalStorage,
    totalAccesses,
  });

  const userChange = calculateChange();
  const imageChange = calculateChange();
  const storageChange = calculateChange();
  const accessChange = calculateChange();

  const result = {
    users: {
      value: totalUsers,
      change: userChange,
      trend: calculateTrend(userChange),
      label: "总用户数",
    },
    images: {
      value: totalImages,
      change: imageChange,
      trend: calculateTrend(imageChange),
      label: "图片总数",
    },
    storage: {
      value: formatBytes(totalStorage),
      change: storageChange,
      trend: calculateTrend(storageChange),
      label: "存储使用",
    },
    activity: {
      value: totalAccesses,
      change: accessChange,
      trend: calculateTrend(accessChange),
      label: "总访问量",
    },
  };

  console.log("transformSystemStatsToMetrics 结果:", result);
  return result;
}

/**
 * 获取仪表盘数据
 */
export async function getDashboardDataAction(): Promise<
  ApiResponse<DashboardData> | ErrorApiResponse
> {
  try {
    // 获取系统统计数据
    const systemStatsResponse = await getSystemStatsAction();

    if (systemStatsResponse.code !== 0) {
      return systemStatsResponse as ErrorApiResponse;
    }

    const systemStats = (systemStatsResponse as ApiResponse<SystemStatsData>)
      .data!;

    // 转换为仪表盘指标数据
    const metrics = transformSystemStatsToMetrics(systemStats);

    // 模拟系统状态数据（这部分可能需要独立的API端点）
    const systemStatus: SystemStatusData = {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      disk: Math.floor(Math.random() * 60) + 20,
      status: "healthy" as SystemStatusEnum,
      uptime: `${Math.floor(Math.random() * 30) + 1}天 ${Math.floor(
        Math.random() * 24
      )}小时`,
      lastUpdate: new Date(),
    };

    // 模拟最近活动数据（这部分可能需要独立的API端点）
    const recentActivity: ActivityItem[] = [
      {
        id: "1",
        type: "upload",
        title: "用户上传了新图片",
        description: "风景照.jpg",
        timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60),
        user: { name: "用户A" },
      },
      {
        id: "2",
        type: "user_register",
        title: "新用户注册",
        description: "newuser@example.com",
        timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 120),
        user: { name: "新用户" },
      },
    ];

    // 快捷操作数据
    const quickActions: QuickAction[] = [
      {
        id: "upload",
        title: "批量上传",
        description: "上传多个图片文件",
        icon: Upload,
        href: "/images/upload",
        variant: "primary",
      },
      {
        id: "users",
        title: "用户管理",
        description: "管理系统用户",
        icon: Users,
        href: "/users",
        variant: "default",
      },
      {
        id: "settings",
        title: "系统设置",
        description: "配置系统参数",
        icon: Settings,
        href: "/settings",
        variant: "default",
      },
      {
        id: "analytics",
        title: "数据统计",
        description: "查看详细统计",
        icon: BarChart3,
        href: "/analytics",
        variant: "default",
      },
    ];

    const dashboardData: DashboardData = {
      metrics,
      systemStatus,
      recentActivity,
      quickActions,
    };

    return {
      code: 0,
      msg: "获取仪表盘数据成功",
      data: dashboardData,
    };
  } catch (error: any) {
    console.error("getDashboardDataAction 错误:", error.msg);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        msg: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      msg: error.msg || "获取仪表盘数据失败",
      error,
    };
  }
}

