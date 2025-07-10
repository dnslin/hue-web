"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Cell, Pie, PieChart, Legend } from "recharts";
import { useReferrerDistribution, useStatsLoading, useStatsError } from "@/lib/store/stats";
import { 
  Share2, 
  Search, 
  Link, 
  Users, 
  Globe,
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const chartConfig = {
  direct: {
    label: "直接访问",
    color: "hsl(var(--chart-1))",
  },
  search: {
    label: "搜索引擎",
    color: "hsl(var(--chart-2))",
  },
  social: {
    label: "社交媒体",
    color: "hsl(var(--chart-3))",
  },
  referral: {
    label: "外部链接",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "其他",
    color: "hsl(var(--chart-5))",
  },
};

// 来源类型图标映射
const sourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "直接访问": Link,
  "搜索引擎": Search,
  "社交媒体": Share2,
  "外部链接": Users,
  "其他": MessageSquare,
};

// 详细来源图标映射
const detailSourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Google": Search,
  "百度": Search,
  "必应": Search,
  "Facebook": Globe,
  "Twitter": Globe,
  "Instagram": Globe,
  "微博": MessageSquare,
  "微信": MessageSquare,
  "QQ": MessageSquare,
  "直接访问": Link,
  "其他": Users,
};

export function SourceAnalysis() {
  const referrerData = useReferrerDistribution();
  const isLoading = useStatsLoading();
  const error = useStatsError();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        <Card className="animate-pulse min-w-0">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32" />
          </CardHeader>
          <CardContent>
            <div className="h-64 md:h-80 bg-muted rounded" />
          </CardContent>
        </Card>
        <Card className="animate-pulse min-w-0">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !referrerData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        <Card className="min-w-0">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              无法加载来源分布数据
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalVisitors = referrerData.data?.reduce((sum, source) => sum + source.visits, 0) || 0;
  const topSources = referrerData.data?.slice(0, 5) || [];

  // 准备饼图数据
  const pieData = (referrerData.data || []).map((source, index) => ({
    name: source.domain,
    value: source.visits,
    color: Object.values(chartConfig)[index % Object.values(chartConfig).length].color,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:gap-6 overflow-hidden">
      {/* 来源分布饼图 */}
      <Card className="min-w-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Share2 className="h-5 w-5" />
              <span>来源分布</span>
            </CardTitle>
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {totalVisitors.toLocaleString()} 访问
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        value.toLocaleString(),
                        name,
                      ]}
                    />
                  }
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => value}
                />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 详细来源列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Link className="h-5 w-5" />
              <span>来源详情</span>
            </CardTitle>
            <Badge variant="secondary">前 {topSources.length} 名</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topSources.map((source, index) => {
              const percentage = (source.visits / totalVisitors) * 100;
              const SourceIcon = sourceIcons[source.domain] || detailSourceIcons[source.domain] || Users;
              
              return (
                <div key={source.domain} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex items-center space-x-2">
                        <SourceIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{source.domain}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{source.visits.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
          
          {/* 类型统计 */}
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-3">来源类型统计</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(chartConfig).map(([key, config]) => {
                const sourceCount = (referrerData.data || []).filter(s => {
                  if (key === "direct") return s.type === "direct";
                  if (key === "search") return s.type === "search";
                  if (key === "social") return s.type === "social";
                  if (key === "referral") return s.type === "referral";
                  return s.type === "other";
                }).reduce((sum, s) => sum + s.visits, 0);
                
                const percentage = totalVisitors > 0 ? (sourceCount / totalVisitors) * 100 : 0;
                
                return (
                  <div key={key} className="text-center">
                    <div className="text-lg font-bold" style={{ color: config.color }}>
                      {percentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">{config.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}