import { useState, useEffect, useCallback } from "react";
import { DashboardData } from "@/lib/types/dashboard";
import { getDashboardDataAction } from "@/lib/actions/dashboard/dashboard";
import type { ApiResponse, ErrorApiResponse } from "@/lib/types/common";

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export const useDashboardData = (
  autoRefresh: boolean = true,
  refreshInterval: number = 30000 // 30秒
): UseDashboardDataReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const result = await getDashboardDataAction();
      
      if (result.code === 0) {
        setData((result as ApiResponse<DashboardData>).data!);
        setLastUpdated(new Date());
      } else {
        const errorResponse = result as ErrorApiResponse;
        setError(errorResponse.msg || "获取仪表盘数据失败");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "获取数据失败";
      setError(errorMsg);
      console.error("useDashboardData fetchData error:", err);
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