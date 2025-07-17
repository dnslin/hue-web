"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGeoDistribution, useGeoDistributionRaw, useStatsLoading, useStatsError } from "@/lib/store/stats";
import { Globe, Users, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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


export function GeoAnalysis() {
  const geoData = useGeoDistribution();
  const geoRawData = useGeoDistributionRaw();
  const isLoading = useStatsLoading();
  const error = useStatsError();

  // 处理地图标记数据
  const mapMarkers = useMemo(() => {
    if (!geoRawData?.locations) return [];
    
    return geoRawData.locations.map((location) => ({
      position: [location.latitude, location.longitude] as [number, number],
      popup: {
        country: location.country,
        city: location.city,
        ip: location.ipAddress,
        countryCode: location.countryCode,
      },
    }));
  }, [geoRawData?.locations]);

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <Card className="animate-pulse min-w-0 lg:col-span-1">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32" />
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80 md:h-96 bg-muted rounded" />
          </CardContent>
        </Card>
        <Card className="animate-pulse min-w-0 lg:col-span-1">
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
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <Card className="min-w-0 lg:col-span-2">
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
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6 overflow-hidden">
      {/* 地理分布可视化 */}
      <Card className="min-w-0 lg:col-span-1">
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
        <CardContent className="pb-4">
          <div className="rounded-lg overflow-hidden border h-64 sm:h-80 md:h-[450]">
            <GeoMap markers={mapMarkers} />
          </div>
        </CardContent>
      </Card>

      {/* 详细排行榜 */}
      <Card className="min-w-0 lg:col-span-1">
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
              const countryCode = country.countryCode;
              
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
                  <Progress 
                    value={percentage} 
                    className="h-2 [&>div]:bg-[#81d8e7]" 
                  />
                </div>
              );
            })}
          </div>
          
          {/* 统计汇总 */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
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