"use client";

import React, { useState, useEffect } from "react";
import { useStatsLoading, useStatsError, useStatsLastUpdated, useStatsActions } from "@/lib/store/stats";
import { TimeSelector } from "./time-selector";
import { TrendAnalysis } from "./trend-analysis";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrendsContainer() {
  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 365>(7);
  
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

  const handlePeriodChange = (period: 7 | 30 | 365) => {
    setSelectedPeriod(period);
    // 根据选择的时间范围重新获取数据，使用新的range参数
    fetchAllStats({ range: period });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Activity className="h-5 w-5" />
              <span>加载趋势数据时出错</span>
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
          <Clock className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-muted-foreground">
            {lastUpdated ? (
              <>
                数据更新: {new Date(lastUpdated).toLocaleString("zh-CN")}
              </>
            ) : (
              "正在加载..."
            )}
          </span>
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            趋势分析
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

      {/* 时间范围选择器 */}
      <TimeSelector 
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
      />

      {/* 趋势分析图表 */}
      <TrendAnalysis period={selectedPeriod} />

      {/* 数据说明 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">数据说明</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 访问量包含所有页面访问和图片查看</li>
                <li>• 上传量统计成功上传的文件数量</li>
                <li>• 文件大小显示上传文件的总大小</li>
                <li>• 趋势计算基于前一天的数据对比</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">图表功能</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 悬停查看详细数据点</li>
                <li>• 支持多种时间范围切换</li>
                <li>• 自动刷新确保数据实时性</li>
                <li>• 响应式设计适配移动设备</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}