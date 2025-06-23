"use server";

import {
  getAuthenticatedApiService,
  AuthenticationError,
} from "@/lib/api/apiService";
import {
  DashboardData,
  DashboardMetrics,
  SystemStatusData, // 更正：对象应为 SystemStatusData，之前为 SystemStatus
  ActivityItem, // 更正：之前为 RecentActivity，现为 ActivityItem
  QuickAction,
  DashboardError,
  MetricData, // 更正：之前为 MetricItem，现为 MetricData
  TrendDirection, // 导入 TrendDirection
  SystemStatus as SystemStatusEnum, // 导入 SystemStatus 枚举以用于状态字段
} from "@/lib/types/dashboard";
import { UserListResponse } from "@/lib/types/user";
import { getUsersAction } from "@/lib/actions/users/user.actions";
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
      message: error.message || "获取仪表盘数据失败",
      details: error instanceof AuthenticationError ? undefined : error,
    };
    // No redirect from server action for auth errors, client should handle
    return { error: dashboardError, success: false };
  }
}
