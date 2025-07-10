"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { useGeoDistribution, useStatsLoading, useStatsError } from "@/lib/store/stats";
import { Globe, Users, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const chartConfig = {
  visits: {
    label: "访问量",
    color: "hsl(var(--chart-1))",
  },
};

// 国家旗帜 emoji 映射
const countryFlags: Record<string, string> = {
  "中国": "🇨🇳",
  "美国": "🇺🇸", 
  "日本": "🇯🇵",
  "英国": "🇬🇧",
  "德国": "🇩🇪",
  "法国": "🇫🇷",
  "韩国": "🇰🇷",
  "加拿大": "🇨🇦",
  "澳大利亚": "🇦🇺",
  "其他": "🌍",
};

export function GeoAnalysis() {
  const geoData = useGeoDistribution();
  const isLoading = useStatsLoading();
  const error = useStatsError();

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32" />
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-muted rounded" />
          </CardContent>
        </Card>
        <Card className="animate-pulse">
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

  if (error || !geoData) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              无法加载地理分布数据
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalVisitors = geoData.data?.reduce((sum, country) => sum + country.visits, 0) || 0;
  const topCountries = geoData.data?.slice(0, 5) || [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 地理分布图表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>访问量分布</span>
            </CardTitle>
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              {totalVisitors.toLocaleString()} 访问
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <BarChart data={geoData.data || []} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
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
                  dataKey="country"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  width={80}
                  tickFormatter={(value) => {
                    return value.length > 8 ? `${value.substring(0, 8)}...` : value;
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => `${countryFlags[value] || "🌍"} ${value}`}
                      formatter={(value) => [value.toLocaleString(), "访问量"]}
                    />
                  }
                />
                <Bar
                  dataKey="visits"
                  fill={chartConfig.visits.color}
                  radius={[0, 4, 4, 0]}
                />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 详细排行榜 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>国家排行榜</span>
            </CardTitle>
            <Badge variant="secondary">前 {topCountries.length} 名</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCountries.map((country, index) => {
              const percentage = (country.visits / totalVisitors) * 100;
              const flag = countryFlags[country.country] || "🌍";
              
              return (
                <div key={country.country} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{flag}</span>
                        <span className="font-medium">{country.country}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{country.visits.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
          
          {/* 统计汇总 */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {geoData.data?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">覆盖国家</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {((topCountries.reduce((sum, c) => sum + c.visits, 0) / totalVisitors) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">前5国家占比</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}