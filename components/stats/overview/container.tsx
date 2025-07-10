"use client";

import React, { useEffect } from "react";
import { useStatsLoading, useStatsError, useStatsLastUpdated, useStatsActions } from "@/lib/store/stats";
import { KeyMetrics } from "./key-metrics";
import { QuickTrends } from "./quick-trends";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OverviewContainer() {
  const isLoading = useStatsLoading();
  const error = useStatsError();
  const lastUpdated = useStatsLastUpdated();
  const { fetchAllStats, refreshStats } = useStatsActions();

  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);

  const handleRefresh = () => {
    refreshStats();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Activity className="h-5 w-5" />
              <span>加载统计数据时出错</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重试
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 状态栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-green-600" />
          <span className="text-sm text-muted-foreground">
            {lastUpdated ? (
              <>
                上次更新: {new Date(lastUpdated).toLocaleString("zh-CN")}
              </>
            ) : (
              "正在加载..."
            )}
          </span>
          <Badge variant="outline" className="text-green-600 border-green-600">
            实时
          </Badge>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          刷新
        </Button>
      </div>

      {/* 关键指标 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">关键指标</h2>
          <Badge variant="secondary">8 项指标</Badge>
        </div>
        <KeyMetrics />
      </div>

      {/* 快速趋势 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">快速趋势</h2>
          <Badge variant="secondary">过去 7 天</Badge>
        </div>
        <QuickTrends />
      </div>
    </div>
  );
}