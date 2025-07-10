"use client";

import React, { useEffect } from "react";
import { useStatsLoading, useStatsError, useStatsLastUpdated, useStatsActions } from "@/lib/store/stats";
import { GeoAnalysis } from "./geo-analysis";
import { SourceAnalysis } from "./source-analysis";
import { RankingAnalysis } from "./ranking-analysis";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, RefreshCw, PieChart as PieChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalyticsContainer() {
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
              <span>加载分析数据时出错</span>
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
    <div className="space-y-8">
      {/* 状态栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PieChartIcon className="h-5 w-5 text-purple-600" />
          <span className="text-sm text-muted-foreground">
            {lastUpdated ? (
              <>
                数据更新: {new Date(lastUpdated).toLocaleString("zh-CN")}
              </>
            ) : (
              "正在加载..."
            )}
          </span>
          <Badge variant="outline" className="text-purple-600 border-purple-600">
            分布分析
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

      {/* 地理分布分析 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">地理分布</h2>
          <Badge variant="secondary">全球访问分布</Badge>
        </div>
        <GeoAnalysis />
      </div>

      {/* 来源分析 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">来源分析</h2>
          <Badge variant="secondary">流量来源追踪</Badge>
        </div>
        <SourceAnalysis />
      </div>

      {/* 排行榜分析 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">热门排行</h2>
          <Badge variant="secondary">内容与用户排行</Badge>
        </div>
        <RankingAnalysis />
      </div>

      {/* 数据洞察 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">分析亮点</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>地理分布显示主要访问来源的区域集中度</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>来源分析帮助优化流量获取策略</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>热门内容反映用户偏好和内容质量</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>活跃用户数据指导社区运营方向</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">优化建议</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span>针对主要访问地区优化服务器部署</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-600 font-bold">2.</span>
                  <span>加强在主要流量来源的推广投入</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">3.</span>
                  <span>分析热门内容特征以指导内容策略</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-600 font-bold">4.</span>
                  <span>激励活跃用户提升整体社区活跃度</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}