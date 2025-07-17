"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { useGeoDistribution, useGeoDistributionRaw, useStatsLoading, useStatsError } from "@/lib/store/stats";
import { Globe, Users, MapPin, Map as MapIcon, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Flag from "react-world-flags";
import "leaflet/dist/leaflet.css";

// 动态加载地图组件，避免 SSR 问题
const GeoMap = dynamic(() => import("./geo-map"), {
  ssr: false,
  loading: () => (
    <div className="h-64 md:h-80 bg-muted rounded flex items-center justify-center">
      <div className="text-muted-foreground">加载地图中...</div>
    </div>
  ),
});

const chartConfig = {
  visits: {
    label: "访问量",
    color: "hsl(var(--chart-1))",
  },
};

// 国家代码映射 (ISO 3166-1 alpha-2)
const countryCodeMap: Record<string, string> = {
  "中国": "CN",
  "美国": "US",
  "日本": "JP",
  "英国": "GB",
  "德国": "DE",
  "法国": "FR",
  "韩国": "KR",
  "加拿大": "CA",
  "澳大利亚": "AU",
  "俄罗斯": "RU",
  "印度": "IN",
  "巴西": "BR",
  "意大利": "IT",
  "西班牙": "ES",
  "荷兰": "NL",
  "瑞典": "SE",
  "挪威": "NO",
  "丹麦": "DK",
  "芬兰": "FI",
  "瑞士": "CH",
};

export function GeoAnalysis() {
  const geoData = useGeoDistribution();
  const geoRawData = useGeoDistributionRaw();
  const isLoading = useStatsLoading();
  const error = useStatsError();
  const [activeTab, setActiveTab] = useState("chart");

  // 处理地图标记数据
  const mapMarkers = useMemo(() => {
    if (!geoRawData?.locations) return [];
    
    return geoRawData.locations.map((location) => ({
      position: [location.latitude, location.longitude] as [number, number],
      popup: {
        country: location.country,
        city: location.city,
        ip: location.ip_address,
        countryCode: location.country_code,
      },
    }));
  }, [geoRawData?.locations]);

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

  if (error || !geoData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        <Card className="min-w-0">
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
    <div className="grid gap-4 md:grid-cols-2 lg:gap-6 overflow-hidden">
      {/* 地理分布可视化 */}
      <Card className="min-w-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>访问分布可视化</span>
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
              <TabsTrigger value="chart" className="flex items-center space-x-2">
                <BarChart className="h-4 w-4" />
                <span>图表视图</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center space-x-2">
                <MapIcon className="h-4 w-4" />
                <span>地图视图</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="mt-4">
              <ChartContainer config={chartConfig} className="h-64 md:h-80">
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
                        labelFormatter={(value) => value}
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
            </TabsContent>
            
            <TabsContent value="map" className="mt-4">
              <div className="h-64 md:h-80 rounded-lg overflow-hidden border">
                <GeoMap markers={mapMarkers} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 详细排行榜 */}
      <Card className="min-w-0">
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
              const countryCode = country.countryCode || countryCodeMap[country.country];
              
              return (
                <div key={country.country} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex items-center space-x-2">
                        {countryCode ? (
                          <Flag
                            code={countryCode}
                            className="w-6 h-4 rounded shadow-sm"
                            fallback={<span className="text-lg">🌍</span>}
                          />
                        ) : (
                          <span className="text-lg">🌍</span>
                        )}
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
            <div className="grid grid-cols-3 gap-4 text-center">
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
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {geoRawData?.locations?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">地理位置</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}