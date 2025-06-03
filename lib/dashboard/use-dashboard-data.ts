import { useState, useEffect, useCallback } from "react";
import { Upload, Users, Settings, BarChart3 } from "lucide-react";
import { DashboardData, DashboardError } from "@/lib/types/dashboard";

// 模拟 API 数据 - 实际项目中应该从真实 API 获取
const mockDashboardData: DashboardData = {
  metrics: {
    users: {
      value: 1234,
      change: 12.5,
      trend: "up",
      label: "总用户数",
    },
    images: {
      value: 45678,
      change: 8.3,
      trend: "up",
      label: "图片总数",
    },
    storage: {
      value: "2.4 GB",
      change: 15.2,
      trend: "up",
      label: "存储使用",
    },
    activity: {
      value: 892,
      change: 23.1,
      trend: "up",
      label: "今日访问",
    },
  },
  systemStatus: {
    cpu: 45,
    memory: 62,
    disk: 28,
    status: "healthy",
    uptime: "7天 12小时",
    lastUpdate: new Date(),
  },
  recentActivity: [
    {
      id: "1",
      type: "upload",
      title: "用户上传了新图片",
      description: "screenshot-2024.png",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      user: {
        name: "张三",
        avatar: "/avatars/user1.jpg",
      },
    },
    {
      id: "2",
      type: "user_register",
      title: "新用户注册",
      description: "user@example.com",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      user: {
        name: "李四",
      },
    },
    {
      id: "3",
      type: "system",
      title: "系统备份完成",
      description: "数据库备份成功",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
    },
  ],
  quickActions: [
    {
      id: "upload",
      title: "批量上传",
      description: "上传多个图片文件",
      icon: Upload,
      href: "/admin/images/upload",
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
      href: "/admin/settings",
      variant: "default",
    },
    {
      id: "analytics",
      title: "数据统计",
      description: "查看详细统计",
      icon: BarChart3,
      href: "/admin/analytics",
      variant: "default",
    },
  ],
};

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: DashboardError | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

// 模拟 API 请求函数
const fetchDashboardData = async (): Promise<DashboardData> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 模拟随机错误（5% 概率）
  if (Math.random() < 0.05) {
    throw new Error("网络请求失败");
  }

  // 模拟数据变化
  const data = { ...mockDashboardData };

  // 随机更新一些数值
  data.metrics.users.value =
    (data.metrics.users.value as number) + Math.floor(Math.random() * 10);
  data.metrics.images.value =
    (data.metrics.images.value as number) + Math.floor(Math.random() * 50);
  data.systemStatus.cpu = Math.floor(Math.random() * 100);
  data.systemStatus.memory = Math.floor(Math.random() * 100);
  data.systemStatus.disk = Math.floor(Math.random() * 100);
  data.systemStatus.lastUpdate = new Date();

  return data;
};

export const useDashboardData = (
  autoRefresh: boolean = true,
  refreshInterval: number = 30000 // 30秒
): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DashboardError | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const result = await fetchDashboardData();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      const dashboardError: DashboardError = {
        code: "FETCH_ERROR",
        message: err instanceof Error ? err.message : "获取数据失败",
        details: err,
      };
      setError(dashboardError);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchData();
  }, [fetchData]);

  // 初始数据加载
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh || loading) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    lastUpdated,
  };
};

// 单独的指标数据 Hook
export const useMetrics = () => {
  const { data, loading, error } = useDashboardData(false);

  return {
    metrics: data?.metrics || null,
    loading,
    error,
  };
};

// 单独的系统状态 Hook
export const useSystemStatus = () => {
  const { data, loading, error } = useDashboardData(true, 10000); // 10秒刷新

  return {
    systemStatus: data?.systemStatus || null,
    loading,
    error,
  };
};

// 单独的活动数据 Hook
export const useRecentActivity = () => {
  const { data, loading, error } = useDashboardData(true, 60000); // 1分钟刷新

  return {
    activities: data?.recentActivity || [],
    loading,
    error,
  };
};
