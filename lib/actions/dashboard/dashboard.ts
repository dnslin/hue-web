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
  DashboardError,
  MetricData,
  TrendDirection,
  SystemStatus as SystemStatusEnum,
  GlobalStatsData,
  AccessStatsData,
  UploadStatsData,
  GeoDistributionData,
  ReferrerDistributionData,
  TopImagesData,
  TopUsersData,
  StatsApiParams,
  StatsData,
} from "@/lib/types/dashboard";
import { getUsersAction } from "@/lib/actions/users/user";
import { Upload, Users, Settings, BarChart3 } from "lucide-react";

async function getImagesCount(apiService: any): Promise<number> {
  try {
    // Placeholder for actual API call
    return Math.floor(Math.random() * 50000) + 10000;
  } catch (error) {
    console.error("Error fetching images count:", error);
    return 0;
  }
} // 正确闭合 getImagesCount 函数
// 已更正 getStorageUsage 的返回类型以匹配 MetricData 要求
async function getStorageUsage(apiService: any): Promise<MetricData> {
  try {
    // Placeholder for actual API call
    const usedGB = (Math.random() * 10 + 1).toFixed(1);
    return {
      value: `${usedGB} GB`,
      change: parseFloat((Math.random() * 5).toFixed(2)), // 确保“change”是一个数字。
      trend: "up",
    };
  } catch (error) {
    console.error("Error fetching storage usage:", error);
    return { value: "0 GB", change: 0, trend: "stable" }; // 确保“change”和“trend”具有默认有效值
  }
}

async function getTodayActivity(apiService: any): Promise<number> {
  try {
    // Placeholder for actual API call
    return Math.floor(Math.random() * 1000) + 500;
  } catch (error) {
    console.error("Error fetching today's activity:", error);
    return 0;
  }
}

export async function getDashboardDataAction(): Promise<
  | { data: DashboardData; success: true }
  | { error: DashboardError; success: false }
> {
  try {
    const apiService = await getAuthenticatedApiService();

    const usersResponse = await getUsersAction({});
    let totalUsers = 0;
    // Corrected type guard for usersResponse
    if (
      "meta" in usersResponse &&
      usersResponse.meta &&
      typeof usersResponse.meta.total === "number"
    ) {
      totalUsers = usersResponse.meta.total;
    }

    const imagesCount = await getImagesCount(apiService);
    const storageUsageData = await getStorageUsage(apiService); // Matches corrected return type
    const todayActivity = await getTodayActivity(apiService);

    const metrics: DashboardMetrics = {
      users: {
        value: totalUsers,
        change: parseFloat((Math.random() * 10).toFixed(2)), // Ensure change is number
        trend: "up",
        label: "总用户数",
      },
      images: {
        value: imagesCount,
        change: parseFloat((Math.random() * 10).toFixed(2)), // Ensure change is number
        trend: "up",
        label: "图片总数",
      },
      storage: {
        // Directly use storageUsageData which now matches MetricData
        value: storageUsageData.value,
        change: storageUsageData.change,
        trend: storageUsageData.trend,
        label: "存储使用",
      },
      activity: {
        value: todayActivity,
        change: parseFloat((Math.random() * 20).toFixed(2)), // Ensure change is number
        trend: "up",
        label: "今日访问",
      },
    };

    const systemStatus: SystemStatusData = {
      // Use SystemStatusData type
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      disk: Math.floor(Math.random() * 60) + 20,
      status: "healthy" as SystemStatusEnum, // Ensure status matches the enum
      uptime: `${Math.floor(Math.random() * 30) + 1}天 ${Math.floor(
        Math.random() * 24
      )}小时`,
      lastUpdate: new Date(),
    };

    const recentActivity: ActivityItem[] = [
      // Use ActivityItem type
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
      systemStatus, // This is now SystemStatusData
      recentActivity,
      quickActions,
    };

    return { data: dashboardData, success: true };
  } catch (error: any) {
    console.error("[Action Error] getDashboardDataAction:", error);
    const dashboardError: DashboardError = {
      code: error instanceof AuthenticationError ? "AUTH_ERROR" : "FETCH_ERROR",
      msg: error.msg || "获取仪表盘数据失败",
      details: error instanceof AuthenticationError ? undefined : error,
    };
    // No redirect from server action for auth errors, client should handle
    return { error: dashboardError, success: false };
  }
}

// ====== 统计页面相关 Server Actions ======

/**
 * 获取全局统计数据
 */
export async function getGlobalStatsAction(): Promise<
  | { data: GlobalStatsData; success: true }
  | { error: DashboardError; success: false }
> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.get<{ data: GlobalStatsData }>(
      "/admin/dashboard/global-stats"
    );
    return { data: response.data.data, success: true };
  } catch (error: any) {
    console.error("[Action Error] getGlobalStatsAction:", error);
    const dashboardError: DashboardError = {
      code: error instanceof AuthenticationError ? "AUTH_ERROR" : "FETCH_ERROR",
      msg: error.message || "获取全局统计数据失败",
      details: error instanceof AuthenticationError ? undefined : error,
    };
    return { error: dashboardError, success: false };
  }
}

/**
 * 获取访问统计数据
 */
export async function getAccessStatsAction(
  params: StatsApiParams = {}
): Promise<
  | { data: AccessStatsData; success: true }
  | { error: DashboardError; success: false }
> {
  try {
    const apiService = await getAuthenticatedApiService();
    const { period = "daily", days = 30 } = params;
    const response = await apiService.get<{ data: AccessStatsData }>(
      "/admin/dashboard/access-stats",
      { params: { period, days } }
    );
    return { data: response.data.data, success: true };
  } catch (error: any) {
    console.error("[Action Error] getAccessStatsAction:", error);
    const dashboardError: DashboardError = {
      code: error instanceof AuthenticationError ? "AUTH_ERROR" : "FETCH_ERROR",
      msg: error.message || "获取访问统计数据失败",
      details: error instanceof AuthenticationError ? undefined : error,
    };
    return { error: dashboardError, success: false };
  }
}

/**
 * 获取上传统计数据
 */
export async function getUploadStatsAction(
  params: StatsApiParams = {}
): Promise<
  | { data: UploadStatsData; success: true }
  | { error: DashboardError; success: false }
> {
  try {
    const apiService = await getAuthenticatedApiService();
    const { period = "daily", days = 30 } = params;
    const response = await apiService.get<{ data: UploadStatsData }>(
      "/admin/dashboard/upload-stats",
      { params: { period, days } }
    );
    return { data: response.data.data, success: true };
  } catch (error: any) {
    console.error("[Action Error] getUploadStatsAction:", error);
    const dashboardError: DashboardError = {
      code: error instanceof AuthenticationError ? "AUTH_ERROR" : "FETCH_ERROR",
      msg: error.message || "获取上传统计数据失败",
      details: error instanceof AuthenticationError ? undefined : error,
    };
    return { error: dashboardError, success: false };
  }
}

/**
 * 获取地理分布数据
 */
export async function getGeoDistributionAction(
  params: StatsApiParams = {}
): Promise<
  | { data: GeoDistributionData; success: true }
  | { error: DashboardError; success: false }
> {
  try {
    const apiService = await getAuthenticatedApiService();
    const { limit = 10 } = params;
    const response = await apiService.get<{ data: GeoDistributionData }>(
      "/admin/dashboard/distribution/geo",
      { params: { limit } }
    );
    return { data: response.data.data, success: true };
  } catch (error: any) {
    console.error("[Action Error] getGeoDistributionAction:", error);
    const dashboardError: DashboardError = {
      code: error instanceof AuthenticationError ? "AUTH_ERROR" : "FETCH_ERROR",
      msg: error.message || "获取地理分布数据失败",
      details: error instanceof AuthenticationError ? undefined : error,
    };
    return { error: dashboardError, success: false };
  }
}

/**
 * 获取来源分布数据
 */
export async function getReferrerDistributionAction(
  params: StatsApiParams = {}
): Promise<
  | { data: ReferrerDistributionData; success: true }
  | { error: DashboardError; success: false }
> {
  try {
    const apiService = await getAuthenticatedApiService();
    const { limit = 10 } = params;
    const response = await apiService.get<{ data: ReferrerDistributionData }>(
      "/admin/dashboard/distribution/referrer",
      { params: { limit } }
    );
    return { data: response.data.data, success: true };
  } catch (error: any) {
    console.error("[Action Error] getReferrerDistributionAction:", error);
    const dashboardError: DashboardError = {
      code: error instanceof AuthenticationError ? "AUTH_ERROR" : "FETCH_ERROR",
      msg: error.message || "获取来源分布数据失败",
      details: error instanceof AuthenticationError ? undefined : error,
    };
    return { error: dashboardError, success: false };
  }
}

/**
 * 获取热门图片数据
 */
export async function getTopImagesAction(
  params: StatsApiParams = {}
): Promise<
  | { data: TopImagesData; success: true }
  | { error: DashboardError; success: false }
> {
  try {
    const apiService = await getAuthenticatedApiService();
    const { limit = 10, sortBy = "views_total" } = params;
    const response = await apiService.get<{ data: TopImagesData }>(
      "/admin/dashboard/top-images",
      { params: { limit, sort_by: sortBy } }
    );
    return { data: response.data.data, success: true };
  } catch (error: any) {
    console.error("[Action Error] getTopImagesAction:", error);
    const dashboardError: DashboardError = {
      code: error instanceof AuthenticationError ? "AUTH_ERROR" : "FETCH_ERROR",
      msg: error.message || "获取热门图片数据失败",
      details: error instanceof AuthenticationError ? undefined : error,
    };
    return { error: dashboardError, success: false };
  }
}

/**
 * 获取热门用户数据
 */
export async function getTopUsersAction(
  params: StatsApiParams = {}
): Promise<
  | { data: TopUsersData; success: true }
  | { error: DashboardError; success: false }
> {
  try {
    const apiService = await getAuthenticatedApiService();
    const { limit = 10, sortBy = "uploads_total" } = params;
    const response = await apiService.get<{ data: TopUsersData }>(
      "/admin/dashboard/top-users",
      { params: { limit, sort_by: sortBy } }
    );
    return { data: response.data.data, success: true };
  } catch (error: any) {
    console.error("[Action Error] getTopUsersAction:", error);
    const dashboardError: DashboardError = {
      code: error instanceof AuthenticationError ? "AUTH_ERROR" : "FETCH_ERROR",
      msg: error.message || "获取热门用户数据失败",
      details: error instanceof AuthenticationError ? undefined : error,
    };
    return { error: dashboardError, success: false };
  }
}

/**
 * 批量获取所有统计数据
 * 用于统计页面的初始数据加载
 */
export async function getAllStatsAction(
  params: StatsApiParams = {}
): Promise<
  { data: StatsData; success: true } | { error: DashboardError; success: false }
> {
  try {
    const apiService = await getAuthenticatedApiService();

    // 并行获取所有统计数据
    const [
      globalStats,
      accessStats,
      uploadStats,
      geoDistribution,
      referrerDistribution,
      topImages,
      topUsers,
    ] = await Promise.all([
      getGlobalStatsAction(),
      getAccessStatsAction(params),
      getUploadStatsAction(params),
      getGeoDistributionAction(params),
      getReferrerDistributionAction(params),
      getTopImagesAction(params),
      getTopUsersAction(params),
    ]);

    // 检查是否所有请求都成功
    if (
      !globalStats.success ||
      !accessStats.success ||
      !uploadStats.success ||
      !geoDistribution.success ||
      !referrerDistribution.success ||
      !topImages.success ||
      !topUsers.success
    ) {
      throw new Error("部分统计数据获取失败");
    }

    const data: StatsData = {
      globalStats: globalStats.data,
      accessStats: accessStats.data,
      uploadStats: uploadStats.data,
      geoDistribution: geoDistribution.data,
      referrerDistribution: referrerDistribution.data,
      topImages: topImages.data,
      topUsers: topUsers.data,
    };

    return { data, success: true };
  } catch (error: any) {
    console.error("[Action Error] getAllStatsAction:", error);
    const dashboardError: DashboardError = {
      code: error instanceof AuthenticationError ? "AUTH_ERROR" : "FETCH_ERROR",
      msg: error.message || "获取统计数据失败",
      details: error instanceof AuthenticationError ? undefined : error,
    };
    return { error: dashboardError, success: false };
  }
}

