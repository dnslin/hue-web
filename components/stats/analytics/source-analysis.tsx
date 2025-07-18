"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  Cell, 
  Pie, 
  PieChart, 
  Bar, 
  BarChart, 
  XAxis, 
  YAxis, 
  CartesianGrid
} from "recharts";
import { useReferrerDistributionRaw, useStatsLoading, useStatsError } from "@/lib/store/stats";
import { 
  Share2, 
  Search, 
  Link, 
  Users, 
  Globe,
  MessageSquare,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sourceChartConfig = {
  count: {
    label: "访问次数",
    color: "#91caff",
  },
};

const typeChartConfig = {
  direct: {
    label: "直接访问",
    color: "hsl(220 45% 60%)", // 柔和的蓝色
  },
  search: {
    label: "搜索引擎",
    color: "hsl(142 70% 60%)", 
  },
  social: {
    label: "社交媒体",
    color: "hsl(262 70% 60%)",
  },
  referral: {
    label: "外部链接",
    color: "hsl(32 70% 60%)",
  },
  other: {
    label: "其他",
    color: "hsl(342 70% 60%)",
  },
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
  const referrerData = useReferrerDistributionRaw();
  const isLoading = useStatsLoading();
  const error = useStatsError();
  const [activeTab, setActiveTab] = useState("sources");

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

  const totalVisitors = referrerData.sources?.reduce((sum, source) => sum + source.count, 0) || 0;
  const topSources = referrerData.sources?.slice(0, 6) || [];

  // 准备来源柱状图数据
  const sourceBarData = topSources.map((source) => ({
    source: source.source.length > 15 ? `${source.source.substring(0, 15)}...` : source.source,
    fullSource: source.source,
    count: source.count,
    percentage: totalVisitors > 0 ? (source.count / totalVisitors) * 100 : 0,
  }));

  // 准备类型饼图数据 - 后端返回的是小数，需要转换为百分比
  const typePieData = (referrerData.typePercentage || []).map((type, index) => ({
    name: typeChartConfig[type.type as keyof typeof typeChartConfig]?.label || type.type,
    value: type.percentage * 100, // 转换为百分比
    type: type.type,
    color: typeChartConfig[type.type as keyof typeof typeChartConfig]?.color || `hsl(var(--chart-${index + 1}))`,
  }));


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:gap-6 items-start overflow-hidden">
      {/* 来源分析可视化 */}
      <Card className="min-w-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Share2 className="h-5 w-5" />
              <span>来源分析</span>
            </CardTitle>
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {totalVisitors.toLocaleString()} 访问
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sources" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>来源排行</span>
              </TabsTrigger>
              <TabsTrigger value="types-pie" className="flex items-center space-x-2">
                <PieChartIcon className="h-4 w-4" />
                <span>类型分布</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sources" className="mt-4">
              <div className="w-full overflow-hidden">
                <ChartContainer config={sourceChartConfig} className="h-80 md:h-96 w-full">
                  <BarChart 
                    data={sourceBarData} 
                    layout="vertical" 
                    margin={{ top: 5, right: 8, left: 5, bottom: 5 }}
                    barCategoryGap={3}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} />
                    <XAxis 
                      type="number" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => {
                        if (value >= 1000000) {
                          return `${(value / 1000000).toFixed(1)}M`;
                        } else if (value >= 1000) {
                          return `${(value / 1000).toFixed(1)}K`;
                        }
                        return value.toString();
                      }}
                    />
                    <YAxis 
                      dataKey="source" 
                      type="category" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      width={70}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value, payload) => {
                            const item = payload?.[0]?.payload;
                            return item?.fullSource || value;
                          }}
                          formatter={(value) => [value.toLocaleString(), "访问次数"]}
                        />
                      }
                    />
                    <Bar
                      dataKey="count"
                      fill={sourceChartConfig.count.color}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="types-pie" className="mt-4">
              <div className="w-full h-80 md:h-96 flex flex-col items-center justify-center space-y-4">
                <ChartContainer config={typeChartConfig} className="w-full max-w-sm md:max-w-md lg:max-w-lg">
                  <PieChart>
                    <Pie
                      data={typePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {typePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [
                            `${Number(value).toFixed(1)}%`,
                            "占比",
                          ]}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
                {/* 自定义图例 */}
                <div className="flex flex-wrap justify-center gap-4 text-sm">
                  {typePieData.map((entry) => (
                    <div key={entry.type} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
          </Tabs>
        </CardContent>
      </Card>

      {/* 详细来源列表 */}
      <Card className="min-w-0">
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
              const percentage = totalVisitors > 0 ? (source.count / totalVisitors) * 100 : 0;
              const SourceIcon = detailSourceIcons[source.source] || Users;
              
              return (
                <div key={source.source} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex items-center space-x-2">
                        <SourceIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{source.source}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{source.count.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2 bg-secondary" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}